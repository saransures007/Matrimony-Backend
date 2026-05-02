'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profile_picture', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      profile_id: { type: Sequelize.UUID, allowNull: false },
      storage_key: { type: Sequelize.STRING(700), allowNull: true, unique: true },
      filename: { type: Sequelize.STRING(255), allowNull: true },
      content_type: { type: Sequelize.STRING(100), allowNull: true },
      size_bytes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      url: { type: Sequelize.STRING(500), allowNull: true },
      is_profile_pic: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_approved: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      upload_status: { type: Sequelize.ENUM('pending', 'uploaded', 'failed'), allowNull: false, defaultValue: 'uploaded' },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    }).catch(() => undefined);

    const profilePictureColumns = await queryInterface.describeTable('profile_picture');
    const addColumnIfMissing = (name, definition) => {
      if (profilePictureColumns[name]) return Promise.resolve();
      return queryInterface.addColumn('profile_picture', name, definition);
    };
    await addColumnIfMissing('storage_key', { type: Sequelize.STRING(700), allowNull: true, unique: true });
    await addColumnIfMissing('content_type', { type: Sequelize.STRING(100), allowNull: true });
    await addColumnIfMissing('size_bytes', { type: Sequelize.INTEGER.UNSIGNED, allowNull: true });
    await addColumnIfMissing('upload_status', { type: Sequelize.ENUM('pending', 'uploaded', 'failed'), allowNull: false, defaultValue: 'uploaded' });
    await addColumnIfMissing('sort_order', { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 });

    await queryInterface.createTable('profile_likes', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      liker_profile_id: { type: Sequelize.UUID, allowNull: false },
      liked_profile_id: { type: Sequelize.UUID, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'accepted', 'rejected'), allowNull: false, defaultValue: 'pending' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('matches', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      profile_a_id: { type: Sequelize.UUID, allowNull: false },
      profile_b_id: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('swipe_history', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      actor_profile_id: { type: Sequelize.UUID, allowNull: false },
      target_profile_id: { type: Sequelize.UUID, allowNull: false },
      action: { type: Sequelize.ENUM('like', 'reject'), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('profile_blocks', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      blocker_profile_id: { type: Sequelize.UUID, allowNull: false },
      blocked_profile_id: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('profile_picture', ['profile_id', 'sort_order'], { name: 'idx_profile_picture_profile_sort' }).catch(() => undefined);
    await queryInterface.addIndex('profile_picture', ['profile_id', 'is_profile_pic'], { name: 'idx_profile_picture_profile_primary' }).catch(() => undefined);
    await queryInterface.addIndex('profile_likes', ['liker_profile_id', 'liked_profile_id'], { unique: true, name: 'uq_profile_likes_pair' });
    await queryInterface.addIndex('profile_likes', ['liked_profile_id', 'status', 'created_at'], { name: 'idx_profile_likes_received' });
    await queryInterface.addIndex('profile_likes', ['liker_profile_id', 'status', 'created_at'], { name: 'idx_profile_likes_sent' });
    await queryInterface.addIndex('matches', ['profile_a_id', 'profile_b_id'], { unique: true, name: 'uq_matches_pair' });
    await queryInterface.addIndex('matches', ['profile_a_id', 'created_at'], { name: 'idx_matches_a' });
    await queryInterface.addIndex('matches', ['profile_b_id', 'created_at'], { name: 'idx_matches_b' });
    await queryInterface.addIndex('swipe_history', ['actor_profile_id', 'target_profile_id'], { unique: true, name: 'uq_swipe_history_pair' });
    await queryInterface.addIndex('swipe_history', ['actor_profile_id', 'created_at'], { name: 'idx_swipe_history_actor' });
    await queryInterface.addIndex('profile_blocks', ['blocker_profile_id', 'blocked_profile_id'], { unique: true, name: 'uq_profile_blocks_pair' });
    await queryInterface.addIndex('profile_blocks', ['blocked_profile_id'], { name: 'idx_profile_blocks_blocked' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('profile_blocks');
    await queryInterface.dropTable('swipe_history');
    await queryInterface.dropTable('matches');
    await queryInterface.dropTable('profile_likes');
    await queryInterface.dropTable('profile_picture').catch(() => undefined);
  },
};
