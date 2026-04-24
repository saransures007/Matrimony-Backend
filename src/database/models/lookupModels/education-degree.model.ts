import { Sequelize, DataTypes, Model, Optional, BelongsToGetAssociationMixin, Association } from 'sequelize';
import type { EducationCategoryModel } from './education-category.model';

export interface IEducationDegree {
  id: number;
  degree_name: string;
  category_id: number;
  full_form: string | null;
  display_module: string | null;
  is_most_common: string | null;
  education_type: string | null;
  sortby: number;
}

export type EducationDegreeCreationAttributes = Optional<IEducationDegree, 'id'>;

export class EducationDegreeModel extends Model<IEducationDegree, EducationDegreeCreationAttributes>
  implements IEducationDegree {
  public id!: number;
  public degree_name!: string;
  public category_id!: number;
  public full_form!: string | null;
  public display_module!: string | null;
  public is_most_common!: string | null;
  public education_type!: string | null;
  public sortby!: number;

  // mixins
  public getCategory!: BelongsToGetAssociationMixin<EducationCategoryModel>;
  public readonly category?: EducationCategoryModel;

  public static associations: {
    category: Association<EducationDegreeModel, EducationCategoryModel>;
  };
}

export default function (sequelize: Sequelize): typeof EducationDegreeModel {
  EducationDegreeModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      degree_name: { type: DataTypes.STRING(100), allowNull: false },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      full_form: { type: DataTypes.STRING(255), allowNull: true },
      display_module: { type: DataTypes.JSON, allowNull: true },
      is_most_common: { type: DataTypes.CHAR(1), allowNull: true },
      education_type: { type: DataTypes.STRING(10), allowNull: true },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      tableName: 'education_degree_lookup',
      timestamps: false,
    }
  );

  return EducationDegreeModel;
}
