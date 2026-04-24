import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface ICityLookup {
  id: number;
  state_id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  is_imp: boolean;
  is_top: boolean;
  imp_order: number;
  tier: number;
  sortby: number;
}

export type CityLookupCreationAttributes = Optional<
  ICityLookup,
  'id' | 'latitude' | 'longitude' | 'timezone' | 'is_imp' | 'is_top' | 'imp_order' | 'tier' | 'sortby'
>;

export class CityLookupModel
  extends Model<ICityLookup, CityLookupCreationAttributes>
  implements ICityLookup
{
  public id!: number;
  public state_id!: number;
  public name!: string;
  public latitude!: number | null;
  public longitude!: number | null;
  public timezone!: string | null;
  public is_imp!: boolean;
  public is_top!: boolean;
  public imp_order!: number;
  public tier!: number;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof CityLookupModel {
  CityLookupModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      state_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
      latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
      longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
      timezone: { type: DataTypes.STRING(100), allowNull: true },
      is_imp: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_top: { type: DataTypes.BOOLEAN, defaultValue: false },
      imp_order: { type: DataTypes.INTEGER, defaultValue: -1 },
      tier: { type: DataTypes.INTEGER, defaultValue: 0 },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'city_lookup', timestamps: false }
  );
  return CityLookupModel;
}
