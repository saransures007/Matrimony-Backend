import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
// Add the following import or definition for RoleType:
type RoleType = 'USER' | 'ADMIN' | 'STAFF';

export interface IAccount {
  accountId: string;
  primaryEmail?: string;
  primaryPhone?: string;
  passwordHash: string;
  displayName?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  roles?: RoleType[];
}

export type AccountCreationAttributes = Optional<
  IAccount,
  'accountId' | 'isEmailVerified' | 'isPhoneVerified' | 'isActive'
>;

export class AccountModel extends Model<IAccount, AccountCreationAttributes> implements IAccount {
  public accountId!: string;
  public primaryEmail?: string;
  public primaryPhone?: string;
  public passwordHash!: string;
  public displayName?: string;
  public isEmailVerified!: boolean;
  public isPhoneVerified!: boolean;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public roles?: RoleType[];
}

export default function (sequelize: Sequelize): typeof AccountModel {
  AccountModel.init(
    {
      accountId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        field: 'account_id',
      },
      primaryEmail: { type: DataTypes.STRING(150), unique: true, field: 'primary_email' },
      primaryPhone: { type: DataTypes.STRING(20), unique: true, field: 'primary_phone' },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
      displayName: { type: DataTypes.STRING(100), field: 'display_name' },
      isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_email_verified' },
      isPhoneVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_phone_verified' },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    },
    {
        sequelize,
        tableName: 'accounts',
        timestamps: true,
        createdAt: 'created_at', // maps Sequelize createdAt → DB created_at
        updatedAt: 'updated_at', // maps Sequelize updatedAt → DB updated_at
        underscored: true,        // optional, good for auto-converting other fields
    }
  );

  return AccountModel;
}
