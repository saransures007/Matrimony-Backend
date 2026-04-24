import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IWellKnownCollege {
  id: number;
  label: string;
  sortby: number;
}

export type WellKnownCollegeCreationAttributes = Optional<IWellKnownCollege, 'id' | 'sortby'>;

export class WellKnownCollegeModel extends Model<IWellKnownCollege, WellKnownCollegeCreationAttributes> implements IWellKnownCollege {
  public id!: number;
  public label!: string;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof WellKnownCollegeModel {
  WellKnownCollegeModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: DataTypes.STRING(200), allowNull: false },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'well_known_college', timestamps: false }
  );
  return WellKnownCollegeModel;
}
