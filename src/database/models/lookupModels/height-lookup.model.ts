import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IHeightLookup {
  id: number;
  label: string;
  feet: number;
  inches: number;
  meters: number;
  sortby: number;
}

export type HeightLookupCreationAttributes = Optional<IHeightLookup, 'id' | 'sortby'>;

export class HeightLookupModel extends Model<IHeightLookup, HeightLookupCreationAttributes> implements IHeightLookup {
  public id!: number;
  public label!: string;
  public feet!: number;
  public inches!: number;
  public meters!: number;
  public sortby!: number;
}

export default function (sequelize: Sequelize): typeof HeightLookupModel {
  HeightLookupModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      label: { type: DataTypes.STRING(50), allowNull: false },
      feet: { type: DataTypes.INTEGER, allowNull: false },
      inches: { type: DataTypes.INTEGER, allowNull: false },
      meters: { type: DataTypes.DECIMAL(4,2), allowNull: false },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, tableName: 'height_lookup', timestamps: false }
  );
  return HeightLookupModel;
}
