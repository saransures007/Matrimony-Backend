import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

export interface ICasteHierarchy {
  id: number;
  name: string;
  parent_id?: number | null;
  description?: string | null;
  sortby?: number;
  level: 'Religion' | 'Sect' | 'Caste' | 'Subcaste' | 'Kulam';
}

export type CasteHierarchyCreationAttributes = Optional<ICasteHierarchy, 'id' | 'parent_id' | 'description' | 'sortby'>;

export class CasteHierarchyModel
  extends Model<ICasteHierarchy, CasteHierarchyCreationAttributes>
  implements ICasteHierarchy {
  public id!: number;
  public name!: string;
  public parent_id!: number | null;
  public description!: string | null;
  public sortby!: number;
  public level!: 'Religion' | 'Sect' | 'Caste' | 'Subcaste' | 'Kulam';
}

export default function (sequelize: Sequelize): typeof CasteHierarchyModel {
  CasteHierarchyModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(150), allowNull: false },
      parent_id: { type: DataTypes.INTEGER, allowNull: true },
      description: { type: DataTypes.STRING(500), allowNull: true },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
      level: {
        type: DataTypes.ENUM('Religion', 'Sect', 'Caste', 'Subcaste', 'Kulam'),
        allowNull: false,
      },
    },
    { sequelize, tableName: 'caste_hierarchy', timestamps: false }
  );

  return CasteHierarchyModel;
}
