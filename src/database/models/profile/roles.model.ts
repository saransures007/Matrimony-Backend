import { Model, DataTypes } from 'sequelize';

export class RoleModel extends Model {
  public roleId!: number;
  public name!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: any): typeof RoleModel {
  RoleModel.init(
    {
      roleId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, field: 'role_id' },
      name: { type: DataTypes.STRING(50), unique: true, allowNull: false },
      description: { type: DataTypes.STRING(255) },
    },
    {
      sequelize,
      tableName: 'roles',
      timestamps: true,
      createdAt: 'created_at', // map to DB column
      updatedAt: 'updated_at',
    }
  );

  return RoleModel;
}
