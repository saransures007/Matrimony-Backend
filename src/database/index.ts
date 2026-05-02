import logger from '@/utils/logger';
import Sequelize from 'sequelize';
import MotherTongueModel from './models/lookupModels/mother-tongue.model';
import CountryLookupModel from './models/lookupModels/country-lookup.model';
import StateLookupModel from './models/lookupModels/state-lookup.model';
import CityLookupModel from './models/lookupModels/city-lookup.model';
import HeightLookupModel from './models/lookupModels/height-lookup.model';
import SalaryRangeModel from './models/lookupModels/salary-range.model';
import CountryWithStatesModel from './models/lookupModels/country-with-states.model';
import OccupationRoleModel from './models/lookupModels/occupation-role.model';
import ReligionModel from './models/lookupModels/religion-lookup.model';
import HobbyModel from './models/lookupModels/hobby_lookup-model';
import WellKnownCollegeModel from './models/lookupModels/well_known_college.model';
import EmployedInModel from './models/lookupModels/employedin_lookup.model';
import OccupationGroupingModel from './models/lookupModels/occupation_grouping.model';
import EmployedInOccMappingModel from './models/lookupModels/employedin_occ_mapping.model';
import EducationDegreeModel from './models/lookupModels/education-degree.model';
import OccupationCategoryModel from './models/lookupModels/occupation-category.model';
import EducationCategoryModel from './models/lookupModels/education-category.model'; 
import CasteHierarchyModel from './models/lookupModels/caste_hierarchy.model';
import StateCasteReservationMappingModel from './models/lookupModels/state_caste_reservation_mapping.model';
import MatrimonyModeModel from './models/lookupModels/matrimony-mode.model';
import Accounts from './models/profile/account.model';
import AccountRolesModel from './models/profile/account_roles.model';
import RolesModel from './models/profile/roles.model';
import profileModel from './models/profile/profiles.model';
import profilePictureModel from './models/profile/profile_picture.model';
import otpVerificationModel, { OtpVerificationModel } from './models/profile/otp_verification.model';
import profileLikeModel from './models/matches/profile_like.model';
import matchModel from './models/matches/match.model';
import swipeHistoryModel from './models/matches/swipe_history.model';
import {
  DB_DIALECT,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
  NODE_ENV,
} from '@/config';
import { profile } from 'console';

const sequelize = new Sequelize.Sequelize(
  DB_NAME as string,
  DB_USERNAME as string,
  DB_PASSWORD,
  {
    dialect: (DB_DIALECT as Sequelize.Dialect) || 'postgres',
    host: DB_HOST,
    port: parseInt(DB_PORT as string, 10),
    timezone: '+09:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      underscored: true,
      freezeTableName: true,
    },
    pool: { min: 0, max: 5 },
    logQueryParameters: NODE_ENV === 'development',
    logging: (query, time) => {
      logger.info(time + 'ms' + ' ' + query);
    },
    benchmark: true,
  },
);

sequelize.authenticate();

const OccupationCategory = OccupationCategoryModel(sequelize);
const OccupationRole = OccupationRoleModel(sequelize);

OccupationRole.belongsTo(OccupationCategory, { foreignKey: 'category_id', as: 'category' });
OccupationCategory.hasMany(OccupationRole, { foreignKey: 'category_id', as: 'roles' });

const EducationCategory = EducationCategoryModel(sequelize);
const EducationDegree = EducationDegreeModel(sequelize);

// Each degree belongs to a category
EducationDegree.belongsTo(EducationCategory, { foreignKey: 'category_id', as: 'category' });
EducationCategory.hasMany(EducationDegree, { foreignKey: 'category_id', as: 'degrees' });


// ------------------ Caste Models ------------------
const CasteHierarchy = CasteHierarchyModel(sequelize);
const StateCasteReservationMapping = StateCasteReservationMappingModel(sequelize);


export const DB = {

  //Profile Models
  accounts: Accounts(sequelize),
  account_roles: AccountRolesModel(sequelize),
  roles: RolesModel(sequelize),
  profiles: profileModel(sequelize),
  profile_picture: profilePictureModel(sequelize),
  otp_verification: otpVerificationModel(sequelize),
  profile_likes: profileLikeModel(sequelize),
  matches: matchModel(sequelize),
  swipe_history: swipeHistoryModel(sequelize),
  // profiles: profileModel(sequelize),
  // Users: userModel(sequelize),
  mother_tongue: MotherTongueModel(sequelize),
  country_lookup: CountryLookupModel(sequelize),
  state_lookup: StateLookupModel(sequelize),
  city_lookup: CityLookupModel(sequelize),
  height_lookup: HeightLookupModel(sequelize),
  salary_range_lookup: SalaryRangeModel(sequelize),
  country_with_states: CountryWithStatesModel(sequelize),
  religion_lookup: ReligionModel(sequelize),

  hobby_lookup: HobbyModel(sequelize),
  well_known_college: WellKnownCollegeModel(sequelize),
  employedin_lookup: EmployedInModel(sequelize),
  occupation_grouping: OccupationGroupingModel(sequelize),
  employedin_occ_mapping: EmployedInOccMappingModel(sequelize),

  occupation_category_lookup: OccupationCategory,
  occupation_role_lookup: OccupationRole,

  education_category_lookup: EducationCategory,
  education_degree_lookup: EducationDegree,


    // ✅ Caste-related models
  caste_hierarchy: CasteHierarchy,
  state_caste_reservation_mapping: StateCasteReservationMapping,

  // ✅ Matrimony mode
  matrimony_modes: MatrimonyModeModel(sequelize),

  sequelize, // connection instance (RAW queries)
  Sequelize, // library
  
};
// Optional: associations
// e.g., caste belongs to religion
// CasteHierarchy.belongsTo(DB.religion_lookup, { foreignKey: 'religion_id', as: 'religion' });
// DB.religion_lookup.hasMany(CasteHierarchy, { foreignKey: 'religion_id', as: 'castes' });


//--------------- Profile -------------
// In your DB init
DB.accounts.belongsToMany(DB.roles, {
  through: DB.account_roles,
  foreignKey: 'accountId',
  otherKey: 'roleId',
  as: 'roles', // now mapping is easier
});


DB.roles.belongsToMany(DB.accounts, {
  through: DB.account_roles,
  foreignKey: 'roleId',
  otherKey: 'accountId',
  as: 'AccountModels', // optional, used if you query roles → accounts
});


// ------------------ Location Models Associations ------------------

// Country → State
DB.country_lookup.hasMany(DB.state_lookup, {
  foreignKey: 'country_id',
  as: 'states',
});
DB.state_lookup.belongsTo(DB.country_lookup, {
  foreignKey: 'country_id',
  as: 'country',
});

// State → City
DB.state_lookup.hasMany(DB.city_lookup, {
  foreignKey: 'state_id',
  as: 'cities',
});
DB.city_lookup.belongsTo(DB.state_lookup, {
  foreignKey: 'state_id',
  as: 'state',
});
