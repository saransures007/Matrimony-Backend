import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IMotherTongue {
  id: number;
  name: string;
  region: string;
  sort_by: number;
}

export type MotherTongueCreationAttributes = Optional<IMotherTongue, 'id' | 'region' | 'sort_by'>;

export class MotherTongueModel extends Model<IMotherTongue, MotherTongueCreationAttributes> implements IMotherTongue {
  public id!: number;
  public name!: string;
  public region!: string;
  public sort_by!: number;
}

export default function (sequelize: Sequelize): typeof MotherTongueModel {
  MotherTongueModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      region: { type: DataTypes.STRING(50), allowNull: true },
      sort_by: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'mother_tongue', timestamps: false }
  );
  return MotherTongueModel;
}
