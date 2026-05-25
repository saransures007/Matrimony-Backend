import { DB } from '@/database';
import logger from '@/utils/logger';
import { invalidatePattern } from '@/utils/redis';
import { QueryTypes, Transaction } from 'sequelize';

export interface DeletionResult {
  success: boolean;
  deletedProfileIds: string[];
  errors: Array<{ step: string; message: string; profileId?: string }>;
  anonymizedCounts: { transactions: number; auditLogs: number };
}

type DeleteOptions = {
  dryRun?: boolean;
  batchSize?: number;
};

type ReferenceColumn = {
  columnName: string;
  referencedTable: 'accounts' | 'profiles';
};

type BatchRow = { id: string };
type NamedRow = Record<string, unknown>;

const DEFAULT_BATCH_SIZE = 1000;
const LARGE_BATCH_TABLES = new Set(['messages', 'swipe_history']);
const ANONYMIZE_TABLES = ['audit_logs', 'transactions'];

const TABLE_DELETE_ORDER = [
  'horoscope_match_result',
  'horoscope_match_request',
  'horoscope_computation',
  'horoscope_birth_details',
  'swipe_history',
  'profile_likes',
  'matches',
  'messages',
  'contact_request',
  'favourite_person',
  'blocked_profiles',
  'profile_views',
  'notifications',
  'support_ticket',
  'relative_contact',
  'lifestyle',
  'preferred_partner_choice',
  'profile_preferences',
  'profile_settings',
  'profile_picture',
  'uploaded_document',
  'profile_verification',
  'profile_stats',
  'profile_subscriptions',
  'otp_verification',
  'account_sessions',
  'account_roles',
  'profiles',
  'accounts',
] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string): boolean => UUID_REGEX.test(value);

const quoteIdentifier = (value: string): string => `\`${value.replace(/`/g, '``')}\``;

const safeString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;

const logError = (accountId: string, step: string, error: unknown, profileId?: string): void => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error({ accountId, step, profileId, message, type: 'account_deletion_error' });
};

const tableExists = async (tableName: string, transaction: Transaction): Promise<boolean> => {
  const rows = await DB.sequelize.query<{ count: number }>(
    'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :tableName',
    {
      replacements: { tableName },
      transaction,
      type: QueryTypes.SELECT,
    },
  );

  return Number(rows[0]?.count ?? 0) > 0;
};

const columnExists = async (tableName: string, columnName: string, transaction: Transaction): Promise<boolean> => {
  const rows = await DB.sequelize.query<{ count: number }>(
    'SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = :tableName AND column_name = :columnName',
    {
      replacements: { tableName, columnName },
      transaction,
      type: QueryTypes.SELECT,
    },
  );

  return Number(rows[0]?.count ?? 0) > 0;
};

const getPrimaryKeyColumn = async (tableName: string, transaction: Transaction): Promise<string | null> => {
  const rows = await DB.sequelize.query<{ column_name: string }>(
    'SELECT COLUMN_NAME AS column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = :tableName AND column_key = \'PRI\' ORDER BY ordinal_position ASC LIMIT 1',
    {
      replacements: { tableName },
      transaction,
      type: QueryTypes.SELECT,
    },
  );

  return rows[0]?.column_name ?? null;
};

const getReferenceColumns = async (tableName: string, transaction: Transaction): Promise<ReferenceColumn[]> => {
  const constrainedRows = await DB.sequelize.query<{ columnName: string; referencedTable: 'accounts' | 'profiles' }>(
    'SELECT column_name AS columnName, referenced_table_name AS referencedTable FROM information_schema.key_column_usage WHERE table_schema = DATABASE() AND table_name = :tableName AND referenced_table_name IN (\'accounts\', \'profiles\')',
    {
      replacements: { tableName },
      transaction,
      type: QueryTypes.SELECT,
    },
  );

  if (constrainedRows.length > 0) {
    return constrainedRows;
  }

  const heuristicRows = await DB.sequelize.query<{ columnName: string }>(
    'SELECT column_name AS columnName FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = :tableName AND (column_name IN (\'account_id\', \'accountId\', \'profile_id\', \'profileId\', \'user_id\') OR column_name REGEXP \'(^|_)(account|profile|user)_id$\')',
    {
      replacements: { tableName },
      transaction,
      type: QueryTypes.SELECT,
    },
  );

  return heuristicRows.map((row) => ({
    columnName: row.columnName,
    referencedTable: row.columnName.toLowerCase().includes('account') ? 'accounts' : 'profiles',
  }));
};

const buildWhereSql = (
  referenceColumns: ReferenceColumn[],
  accountId: string,
  profileIds: string[],
): { sql: string; replacements: Record<string, unknown> } | null => {
  const parts: string[] = [];
  const replacements: Record<string, unknown> = { accountId, profileIds };

  const accountColumns = referenceColumns.filter((column) => column.referencedTable === 'accounts');
  const profileColumns = profileIds.length > 0
    ? referenceColumns.filter((column) => column.referencedTable === 'profiles')
    : [];

  for (const column of accountColumns) {
    parts.push(`${quoteIdentifier(column.columnName)} = :accountId`);
  }

  for (const column of profileColumns) {
    parts.push(`${quoteIdentifier(column.columnName)} IN (:profileIds)`);
  }

  if (parts.length === 0) {
    return null;
  }

  return {
    sql: parts.length === 1 ? parts[0] : `(${parts.join(' OR ')})`,
    replacements,
  };
};

const countRows = async (
  tableName: string,
  whereSql: string,
  replacements: Record<string, unknown>,
  transaction: Transaction,
): Promise<number> => {
  const rows = await DB.sequelize.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM ${quoteIdentifier(tableName)} WHERE ${whereSql}`,
    {
      replacements,
      transaction,
      type: QueryTypes.SELECT,
    },
  );

  return Number(rows[0]?.count ?? 0);
};

const deleteInBatches = async (
  tableName: string,
  whereSql: string,
  replacements: Record<string, unknown>,
  batchSize: number,
  transaction: Transaction,
): Promise<number> => {
  const pkColumn = await getPrimaryKeyColumn(tableName, transaction);
  if (!pkColumn) {
    return 0;
  }

  let deleted = 0;

  while (true) {
    const batchRows = await DB.sequelize.query<BatchRow>(
      `SELECT ${quoteIdentifier(pkColumn)} AS id FROM ${quoteIdentifier(tableName)} WHERE ${whereSql} LIMIT :limit`,
      {
        replacements: { ...replacements, limit: batchSize },
        transaction,
        type: QueryTypes.SELECT,
      },
    );

    if (batchRows.length === 0) {
      break;
    }

    const ids = batchRows.map((row) => row.id).filter(Boolean);
    if (ids.length === 0) {
      break;
    }

    await DB.sequelize.query(`DELETE FROM ${quoteIdentifier(tableName)} WHERE ${quoteIdentifier(pkColumn)} IN (:ids)`, {
      replacements: { ids },
      transaction,
    });

    deleted += ids.length;
  }

  return deleted;
};

const deleteAllMatching = async (
  tableName: string,
  accountId: string,
  profileIds: string[],
  batchSize: number,
  transaction: Transaction,
): Promise<number> => {
  if (!(await tableExists(tableName, transaction))) {
    return 0;
  }

  const references = await getReferenceColumns(tableName, transaction);
  const where = buildWhereSql(references, accountId, profileIds);

  if (!where) {
    return 0;
  }

  if (LARGE_BATCH_TABLES.has(tableName)) {
    return deleteInBatches(tableName, where.sql, where.replacements, batchSize, transaction);
  }

  const total = await countRows(tableName, where.sql, where.replacements, transaction);
  await DB.sequelize.query(`DELETE FROM ${quoteIdentifier(tableName)} WHERE ${where.sql}`, {
    replacements: where.replacements,
    transaction,
  });

  return total;
};

const anonymizeTable = async (
  tableName: string,
  accountId: string,
  profileIds: string[],
  transaction: Transaction,
): Promise<number> => {
  if (!(await tableExists(tableName, transaction))) {
    return 0;
  }

  const accountColumnCandidates = ['account_id', 'accountId', 'user_id'];
  const profileColumnCandidates = ['profile_id', 'profileId', 'user_id'];

  const updateParts: string[] = [];

  for (const column of accountColumnCandidates) {
    if (await columnExists(tableName, column, transaction)) {
      updateParts.push(`${quoteIdentifier(column)} = NULL`);
      break;
    }
  }

  for (const column of profileColumnCandidates) {
    if (await columnExists(tableName, column, transaction)) {
      updateParts.push(`${quoteIdentifier(column)} = NULL`);
      break;
    }
  }

  if (updateParts.length === 0) {
    return 0;
  }

  const references = await getReferenceColumns(tableName, transaction);
  const where = buildWhereSql(references, accountId, profileIds);

  if (!where) {
    return 0;
  }

  const total = await countRows(tableName, where.sql, where.replacements, transaction);
  await DB.sequelize.query(
    `UPDATE ${quoteIdentifier(tableName)} SET ${updateParts.join(', ')} WHERE ${where.sql}`,
    {
      replacements: where.replacements,
      transaction,
    },
  );

  return total;
};

const cancelActiveSubscriptions = async (
  accountId: string,
  profileIds: string[],
  transaction: Transaction,
  errors: Array<{ step: string; message: string; profileId?: string }>,
): Promise<number> => {
  if (!(await tableExists('profile_subscriptions', transaction))) {
    return 0;
  }

  const hasAccountId = await columnExists('profile_subscriptions', 'account_id', transaction);
  const hasProfileId = profileIds.length > 0 && await columnExists('profile_subscriptions', 'profile_id', transaction);
  const hasUserId = await columnExists('profile_subscriptions', 'user_id', transaction);
  const whereParts: string[] = [];
  const replacements: Record<string, unknown> = { accountId, profileIds };

  if (hasAccountId) {
    whereParts.push('`account_id` = :accountId');
  }
  if (hasUserId) {
    whereParts.push('`user_id` = :accountId');
  }
  if (hasProfileId) {
    whereParts.push('`profile_id` IN (:profileIds)');
  }

  if (whereParts.length === 0) {
    return 0;
  }

  const subscriptions = await DB.sequelize.query<NamedRow>(
    `SELECT * FROM \`profile_subscriptions\` WHERE ${whereParts.join(' OR ')}`,
    {
      replacements,
      transaction,
      type: QueryTypes.SELECT,
    },
  );

  const activeSubscriptions = subscriptions.filter((subscription) => {
    const status = String(
      subscription.status ??
        subscription.subscription_status ??
        subscription.payment_status ??
        subscription.state ??
        '',
    ).toLowerCase();

    return ['active', 'trialing', 'running', 'pending'].includes(status);
  });

  if (activeSubscriptions.length === 0) {
    return 0;
  }

  const cancelEndpoint = safeString(process.env.PAYMENT_CANCEL_URL);
  if (!cancelEndpoint) {
    logger.warn({ accountId, step: 'cancel_subscriptions', count: activeSubscriptions.length, type: 'payment_endpoint_missing' });
    return activeSubscriptions.length;
  }

  let cancelled = 0;

  for (const subscription of activeSubscriptions) {
    const subscriptionId =
      safeString(subscription.subscription_id) ??
      safeString(subscription.provider_subscription_id) ??
      safeString(subscription.external_subscription_id) ??
      safeString(subscription.razorpay_subscription_id) ??
      safeString(subscription.gateway_subscription_id);

    if (!subscriptionId) {
      continue;
    }

    try {
      const response = await fetch(cancelEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          accountId,
          profileIds,
          subscriptionId,
          metadata: subscription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment API responded with ${response.status}`);
      }

      cancelled += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ step: 'cancel_active_subscription', message, profileId: safeString(subscription.profile_id) });
      logError(accountId, 'cancel_active_subscription', error, safeString(subscription.profile_id));
    }
  }

  return cancelled;
};

const performDeletion = async (
  accountId: string,
  profileIds: string[],
  batchSize: number,
  transaction: Transaction,
  errors: Array<{ step: string; message: string; profileId?: string }>,
): Promise<{ anonymizedCounts: { transactions: number; auditLogs: number } }> => {
  const anonymizedCounts = { transactions: 0, auditLogs: 0 };

  for (const tableName of ANONYMIZE_TABLES) {
    const step = `anonymize_${tableName}`;
    try {
      const count = await anonymizeTable(tableName, accountId, profileIds, transaction);
      if (tableName === 'transactions') {
        anonymizedCounts.transactions = count;
      }
      if (tableName === 'audit_logs') {
        anonymizedCounts.auditLogs = count;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ step, message });
      logError(accountId, step, error);
    }
  }

  for (const tableName of TABLE_DELETE_ORDER) {
    if (tableName === 'accounts' || tableName === 'profiles') {
      continue;
    }

    const step = `delete_${tableName}`;
    try {
      await deleteAllMatching(tableName, accountId, profileIds, batchSize, transaction);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ step, message });
      logError(accountId, step, error);
    }
  }

  return { anonymizedCounts };
};

const clearCaches = async (accountId: string, profileIds: string[]): Promise<void> => {
  const patterns = new Set<string>();

  patterns.add(`account:${accountId}*`);
  patterns.add(`account:${accountId}:*`);

  for (const profileId of profileIds) {
    patterns.add(`profile:${profileId}*`);
    patterns.add(`profile:${profileId}:*`);
    patterns.add(`match:${profileId}*`);
    patterns.add(`match:${profileId}:*`);
    patterns.add(`account:${profileId}*`);
  }

  for (const pattern of patterns) {
    try {
      await invalidatePattern(pattern);
    } catch (error) {
      logger.warn({ accountId, pattern, error, type: 'redis_invalidation_failed' });
    }
  }
};

const queueConfirmationEmail = (accountId: string, profileIds: string[]): void => {
  const emailWebhook = safeString(process.env.EMAIL_CONFIRMATION_WEBHOOK_URL);
  if (!emailWebhook) {
    logger.info({ accountId, profileIds, type: 'deletion_email_skipped' });
    return;
  }

  void fetch(emailWebhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      accountId,
      profileIds,
      subject: 'Your account has been deleted',
      template: 'account-deleted',
    }),
  }).catch((error) => {
    logger.error({ accountId, error, type: 'deletion_email_failed' });
  });
};

export async function deleteUserAccount(
  accountId: string,
  options?: DeleteOptions,
): Promise<DeletionResult> {
  const result: DeletionResult = {
    success: false,
    deletedProfileIds: [],
    errors: [],
    anonymizedCounts: { transactions: 0, auditLogs: 0 },
  };

  if (!isUuid(accountId)) {
    result.errors.push({ step: 'validate_input', message: 'accountId must be a valid UUID' });
    return result;
  }

  const batchSize = Math.max(1, options?.batchSize ?? DEFAULT_BATCH_SIZE);
  const dryRun = options?.dryRun ?? false;

  const transaction = await DB.sequelize.transaction();
  try {
    if (DB.sequelize.getDialect() === 'mysql' || DB.sequelize.getDialect() === 'mariadb') {
      await DB.sequelize.query('SET SESSION innodb_lock_wait_timeout = 60', { transaction });
    }

    const lockedAccount = await DB.sequelize.query<{ account_id: string }>(
      'SELECT account_id FROM accounts WHERE account_id = :accountId FOR UPDATE',
      {
        replacements: { accountId },
        transaction,
        type: QueryTypes.SELECT,
      },
    );

    if (lockedAccount.length === 0) {
      await transaction.commit();
      result.success = true;
      queueConfirmationEmail(accountId, []);
      return result;
    }

    const profiles = await DB.sequelize.query<{ profile_id: string }>(
      'SELECT profile_id FROM profiles WHERE account_id = :accountId',
      {
        replacements: { accountId },
        transaction,
        type: QueryTypes.SELECT,
      },
    );

    const profileIds = profiles.map((row) => row.profile_id).filter(Boolean);
    result.deletedProfileIds = profileIds;

    if (dryRun) {
      await transaction.rollback();
      result.success = true;
      return result;
    }

    if (profileIds.length > 0) {
      const cancelled = await cancelActiveSubscriptions(accountId, profileIds, transaction, result.errors);
      logger.info({ accountId, cancelled, profileCount: profileIds.length, type: 'subscriptions_cancelled' });
    }

    const deletionOutcome = await performDeletion(accountId, profileIds, batchSize, transaction, result.errors);
    result.anonymizedCounts = deletionOutcome.anonymizedCounts;

    if (result.errors.length > 0) {
      throw new Error('One or more deletion steps failed');
    }

    await DB.sequelize.query('DELETE FROM profiles WHERE account_id = :accountId', {
      replacements: { accountId },
      transaction,
    });

    await DB.sequelize.query('DELETE FROM accounts WHERE account_id = :accountId', {
      replacements: { accountId },
      transaction,
    });

    await transaction.commit();

    result.success = true;
    queueConfirmationEmail(accountId, profileIds);
    void clearCaches(accountId, profileIds);
    return result;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      logError(accountId, 'rollback', rollbackError);
    }

    const message = error instanceof Error ? error.message : String(error);
    if (result.errors.length === 0) {
      result.errors.push({ step: 'delete_user_account', message });
    }

    logError(accountId, 'delete_user_account', error);
    result.success = false;
    return result;
  }
}
