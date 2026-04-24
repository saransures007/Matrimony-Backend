import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IReligion {
  id: number;
  name: string;
  sortby: number;
}

export type ReligionCreationAttributes = Optional<IReligion, 'id' | 'sortby'>;

export class ReligionModel extends Model<IReligion, ReligionCreationAttributes> implements IReligion {
  public id!: number;
  public name!: string;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof ReligionModel {
  ReligionModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'religion_lookup', timestamps: false }
  );
  return ReligionModel;
}
