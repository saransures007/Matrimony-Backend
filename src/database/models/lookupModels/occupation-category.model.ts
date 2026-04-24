import { Sequelize, DataTypes, Model, Optional, HasManyGetAssociationsMixin, Association } from 'sequelize';
import { OccupationRoleModel } from './occupation-role.model'; // import the Model class

export interface IOccupationCategory {
  id: number;
  sector_id: number;
  name: string;
}

export type OccupationCategoryCreationAttributes = Optional<IOccupationCategory, 'id'>;

export class OccupationCategoryModel extends Model<IOccupationCategory, OccupationCategoryCreationAttributes> implements IOccupationCategory {
  public id!: number;
  public sector_id!: number;
  public name!: string;

  // Association mixin
  public getRoles!: HasManyGetAssociationsMixin<OccupationRoleModel>;
  public readonly roles?: OccupationRoleModel[];

  public static associations: {
    roles: Association<OccupationCategoryModel, OccupationRoleModel>;
  };
}

export default function (sequelize: Sequelize): typeof OccupationCategoryModel {
  OccupationCategoryModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      sector_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(100), allowNull: false },
    },
    {
      sequelize,
      tableName: 'occupation_category_lookup',
      timestamps: false,
    }
  );

  // Don't define associations here
  return OccupationCategoryModel;
}
