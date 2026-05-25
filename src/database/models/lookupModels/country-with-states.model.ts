import { Sequelize, DataTypes, Model } from 'sequelize';

export interface ICountryWithStates {
  country_id: number;
  state_id: number;
}

export class CountryWithStatesModel extends Model<ICountryWithStates> implements ICountryWithStates {
  declare country_id: number;
  declare state_id: number;
}

export default function (sequelize: Sequelize): typeof CountryWithStatesModel {
  CountryWithStatesModel.init(
    {
      country_id: { type: DataTypes.INTEGER, primaryKey: true },
      state_id: { type: DataTypes.INTEGER, primaryKey: true },
    },
    {
      sequelize,
      tableName: 'country_with_states',
      timestamps: false,
    }
  );
  return CountryWithStatesModel;
}
