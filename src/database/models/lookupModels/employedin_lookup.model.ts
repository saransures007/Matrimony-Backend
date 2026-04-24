import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IEmployedIn {
  id: number;
  label: string;
  show_field: string;
  sortby: number;
}

export type EmployedInCreationAttributes = Optional<IEmployedIn, 'id' | 'sortby'>;

export class EmployedInModel extends Model<IEmployedIn, EmployedInCreationAttributes> implements IEmployedIn {
  public id!: number;
  public label!: string;
  public show_field!: string;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof EmployedInModel {
  EmployedInModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: DataTypes.STRING(150), allowNull: false },
      show_field: { type: DataTypes.STRING(50), allowNull: false },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'employedin_lookup', timestamps: false }
  );
  return EmployedInModel;
}
