import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IOccupationGrouping {
  id: number;
  label: string;
  on_top: number;
  sortby: number;
}

export type OccupationGroupingCreationAttributes = Optional<IOccupationGrouping, 'id' | 'sortby' | 'on_top'>;

export class OccupationGroupingModel extends Model<IOccupationGrouping, OccupationGroupingCreationAttributes> implements IOccupationGrouping {
  public id!: number;
  public label!: string;
  public on_top!: number;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof OccupationGroupingModel {
  OccupationGroupingModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: DataTypes.STRING(150), allowNull: false },
      on_top: { type: DataTypes.INTEGER, defaultValue: 0 },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'occupation_grouping', timestamps: false }
  );
  return OccupationGroupingModel;
}
