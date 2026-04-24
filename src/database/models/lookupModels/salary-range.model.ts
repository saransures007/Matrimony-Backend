import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface ISalaryRange {
  id: number;
  min_salary: number;
  max_salary: number;
  label: string;
  min_label: string;
  max_label: string;
  min_abs_val: number;
  max_abs_val: number;
  sortby: number;
}

export type SalaryRangeCreationAttributes = Optional<
  ISalaryRange,
  'id' | 'min_label' | 'max_label' | 'min_abs_val' | 'max_abs_val' | 'sortby'
>;

export class SalaryRangeModel extends Model<ISalaryRange, SalaryRangeCreationAttributes> implements ISalaryRange {
  public id!: number;
  public min_salary!: number;
  public max_salary!: number;
  public label!: string;
  public min_label!: string;
  public max_label!: string;
  public min_abs_val!: number;
  public max_abs_val!: number;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof SalaryRangeModel {
  SalaryRangeModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      min_salary: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      max_salary: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
      label: { type: DataTypes.STRING(50), allowNull: false },
      min_label: { type: DataTypes.STRING(50), allowNull: true },
      max_label: { type: DataTypes.STRING(50), allowNull: true },
      min_abs_val: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
      max_abs_val: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      tableName: 'salary_range_lookup',
      timestamps: false,
    }
  );
  return SalaryRangeModel;
}
