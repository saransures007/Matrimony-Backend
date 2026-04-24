import { Sequelize, DataTypes, Model, Optional, HasManyGetAssociationsMixin, Association } from 'sequelize';
import type { EducationDegreeModel } from './education-degree.model';

export interface IEducationCategory {
  id: number;
  name: string;
}

export type EducationCategoryCreationAttributes = Optional<IEducationCategory, 'id'>;

export class EducationCategoryModel extends Model<IEducationCategory, EducationCategoryCreationAttributes>
  implements IEducationCategory {
  public id!: number;
  public name!: string;

  // mixins
  public getDegrees!: HasManyGetAssociationsMixin<EducationDegreeModel>;
  public readonly degrees?: EducationDegreeModel[];

  public static associations: {
    degrees: Association<EducationCategoryModel, EducationDegreeModel>;
  };
}

export default function (sequelize: Sequelize): typeof EducationCategoryModel {
  EducationCategoryModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
    },
    {
      sequelize,
      tableName: 'education_category_lookup',
      timestamps: false,
    }
  );

  return EducationCategoryModel;
}
