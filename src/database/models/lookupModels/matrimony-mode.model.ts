// src/database/models/lookupModels/matrimony-mode.model.ts
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface IMatrimonyMode {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

export type MatrimonyModeCreationAttributes = Optional<
  IMatrimonyMode,
  'id' | 'description' | 'is_active' | 'sort_order' | 'created_at' | 'updated_at'
>;

export class MatrimonyModeModel extends Model<IMatrimonyMode, MatrimonyModeCreationAttributes>
  implements IMatrimonyMode {
  public id!: number;
  public name!: string;
  public display_name!: string;
  public description?: string;
  public is_active!: boolean;
  public sort_order!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

export default function (sequelize: Sequelize): typeof MatrimonyModeModel {
  MatrimonyModeModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      display_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'matrimony_modes',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MatrimonyModeModel;
}