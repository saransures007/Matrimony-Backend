import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IStateLookup {
  id: number;
  country_id: number;
  name: string;
  code: string;
  iso_code: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  sortby: number;
}

export type StateLookupCreationAttributes = Optional<
  IStateLookup,
  'id' | 'iso_code' | 'latitude' | 'longitude' | 'timezone' | 'sortby'
>;

export class StateLookupModel
  extends Model<IStateLookup, StateLookupCreationAttributes>
  implements IStateLookup
{
  public id!: number;
  public country_id!: number;
  public name!: string;
  public code!: string;
  public iso_code!: string | null;
  public latitude!: number | null;
  public longitude!: number | null;
  public timezone!: string | null;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof StateLookupModel {
  StateLookupModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      country_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(10), allowNull: false },
      iso_code: { type: DataTypes.STRING(10), allowNull: true },
      latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: true },
      longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: true },
      timezone: { type: DataTypes.STRING(100), allowNull: true },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'state_lookup', timestamps: false }
  );
  return StateLookupModel;
}
