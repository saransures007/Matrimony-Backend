import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface ICountryLookup {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numeric_code: string | null;
  isd_code: string | null;
  timezone: string | null;
  is_imp: boolean;
  group_name: string | null;
  group_sortby: number;
  sortby: number;
}

export type CountryLookupCreationAttributes = Optional<
  ICountryLookup,
  'id' | 'numeric_code' | 'isd_code' | 'timezone' | 'group_name' | 'group_sortby' | 'sortby' | 'is_imp'
>;

export class CountryLookupModel
  extends Model<ICountryLookup, CountryLookupCreationAttributes>
  implements ICountryLookup
{
  declare id: number;
  declare name: string;
  declare iso2: string;
  declare iso3: string;
  declare numeric_code: string | null;
  declare isd_code: string | null;
  declare timezone: string | null;
  declare is_imp: boolean;
  declare group_name: string | null;
  declare group_sortby: number;
  declare sortby: number;
}

export default function (sequelize: Sequelize): typeof CountryLookupModel {
  CountryLookupModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      iso2: { type: DataTypes.STRING(2), allowNull: false },
      iso3: { type: DataTypes.STRING(3), allowNull: false },
      numeric_code: { type: DataTypes.STRING(3), allowNull: true },
      isd_code: { type: DataTypes.STRING(10), allowNull: true },
      timezone: { type: DataTypes.STRING(100), allowNull: true },
      is_imp: { type: DataTypes.BOOLEAN, defaultValue: false },
      group_name: { type: DataTypes.STRING(50), allowNull: true },
      group_sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      tableName: 'country_lookup',
      timestamps: false,
    }
  );
  return CountryLookupModel;
}
