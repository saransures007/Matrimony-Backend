import { Sequelize, DataTypes, Model } from 'sequelize';

export interface IAccountRole {
  accountId: string;
  roleId: number;
}

export class AccountRoleModel extends Model<IAccountRole> implements IAccountRole {
  public accountId!: string;
  public roleId!: number;
}

export default function (sequelize: Sequelize): typeof AccountRoleModel {
  AccountRoleModel.init(
    {
      accountId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        field: 'account_id',
      },
      roleId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'role_id',
      },
    },
    { sequelize, tableName: 'account_roles', timestamps: false }
  );

  return AccountRoleModel;
}
