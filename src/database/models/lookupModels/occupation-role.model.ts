import { Sequelize, DataTypes, Model, Optional, BelongsToGetAssociationMixin, Association } from 'sequelize';

export interface IOccupationRole {
  id: number;
  role_name: string;
  category_id: number;
  sortby: number;
}

export type OccupationRoleCreationAttributes = Optional<IOccupationRole, 'id' | 'sortby'>;

export class OccupationRoleModel extends Model<IOccupationRole, OccupationRoleCreationAttributes> implements IOccupationRole {
  public id!: number;
  public role_name!: string;
  public category_id!: number;
  public sortby!: number;

  // Association mixin
  public getCategory!: BelongsToGetAssociationMixin<any>;
  public readonly category?: any;

  public static associations: {
    category: Association<OccupationRoleModel, any>;
  };
}

export default function (sequelize: Sequelize): typeof OccupationRoleModel {
  OccupationRoleModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      role_name: { type: DataTypes.STRING(150), allowNull: false },
      category_id: { type: DataTypes.INTEGER, allowNull: false },
      sortby: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      tableName: 'occupation_role_lookup',
      timestamps: false,
    }
  );

  // DO NOT define associations here
  return OccupationRoleModel;
}
