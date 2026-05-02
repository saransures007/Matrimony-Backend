import { Sequelize, DataTypes, Model } from 'sequelize';

export interface IProfileSettings {
  profileId: string;
  allowMessagesFrom?: 'Everyone' | 'Connections' | 'PremiumOnly' | 'NoOne';
  showAge?: boolean;
  showHeight?: boolean;
  showContactToMatchesOnly?: boolean;
  timezone?: string;
  languagePref?: string;
  preferences?: object;
  modePreferences?: object;
}

export class ProfileSettingsModel extends Model<IProfileSettings> implements IProfileSettings {
  public profileId!: string;
  public allowMessagesFrom?: 'Everyone' | 'Connections' | 'PremiumOnly' | 'NoOne';
  public showAge?: boolean;
  public showHeight?: boolean;
  public showContactToMatchesOnly?: boolean;
  public timezone?: string;
  public languagePref?: string;
  public preferences?: object;
  public modePreferences?: object;
}

export default function (sequelize: Sequelize): typeof ProfileSettingsModel {
  ProfileSettingsModel.init(
    {
      profileId: { type: DataTypes.UUID, primaryKey: true },
      allowMessagesFrom: { type: DataTypes.ENUM('Everyone','Connections','PremiumOnly','NoOne'), defaultValue: 'Connections' },
      showAge: { type: DataTypes.BOOLEAN, defaultValue: true },
      showHeight: { type: DataTypes.BOOLEAN, defaultValue: true },
      showContactToMatchesOnly: { type: DataTypes.BOOLEAN, defaultValue: true },
      timezone: { type: DataTypes.STRING(100) },
      languagePref: { type: DataTypes.STRING(50) },
      preferences: { type: DataTypes.JSON },
      modePreferences: { type: DataTypes.JSON, field: 'mode_preferences' },
    },
    { sequelize, tableName: 'profile_settings', timestamps: false }
  );
  return ProfileSettingsModel;
}
