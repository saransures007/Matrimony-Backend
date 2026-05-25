'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profile_preferences', {
      profile_id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'profiles',
          key: 'profile_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      min_age: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 18,
      },
      max_age: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60,
      },
      min_height_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'height_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      max_height_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'height_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      min_salary_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'salary_range_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      max_salary_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'salary_range_lookup',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },

      preferred_religion_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_caste_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_subcaste_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_kulam_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_mother_tongue_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_country_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_state_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_city_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_education_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_occupation_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_employed_in_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_diet_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_drinking_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_smoking_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_marital_status_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_rasi_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_nakshatra_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_manglik_status_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      preferred_profile_posted_by_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      excluded_caste_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      excluded_occupation_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      excluded_city_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      excluded_dosha_ids: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      prefer_same_religion: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prefer_same_caste: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prefer_same_subcaste: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prefer_same_state: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prefer_same_city: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      prefer_same_mother_tongue: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      require_horoscope_match: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      require_photo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      require_phone_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      accept_partner_with_children: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      prefer_no_children: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      max_days_inactive: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      min_profile_completion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('profile_preferences');
  },
};
