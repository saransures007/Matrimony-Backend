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
  declare id: number;
  declare min_salary: number;
  declare max_salary: number;
  declare label: string;
  declare min_label: string;
  declare max_label: string;
  declare min_abs_val: number;
  declare max_abs_val: number;
  declare sortby: number;
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
