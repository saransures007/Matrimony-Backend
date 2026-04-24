import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
export interface IEmployedInOccMapping {
  employedin_id: number;
  role_id: number;
}

export type EmployedInOccMappingCreationAttributes = IEmployedInOccMapping;

export class EmployedInOccMappingModel extends Model<IEmployedInOccMapping, EmployedInOccMappingCreationAttributes> implements IEmployedInOccMapping {
  public employedin_id!: number;
  public role_id!: number;
}

export default function (sequelize: Sequelize): typeof EmployedInOccMappingModel {
  EmployedInOccMappingModel.init(
    {
      employedin_id: { type: DataTypes.INTEGER, primaryKey: true },
      role_id: { type: DataTypes.INTEGER, primaryKey: true },
    },
    { sequelize, tableName: 'employedin_occ_mapping', timestamps: false }
  );
  return EmployedInOccMappingModel;
}
