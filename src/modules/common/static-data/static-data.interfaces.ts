// Matrimony-Backend/src/modules/common/static-data/static-data.interfaces.ts

export interface IMotherTongue {
  id: number;
  label: string;
  value: number;
  region: string;
  SORTBY: number;
}

export interface ICountry {
  id: number;
  label: string;
  value: number;
  group_name: string;
  isd_code: string;
  is_imp: boolean;
  GROUP_SORTBY: number;
  SORTBY: number;
}

export interface IState {
  ID: string;
  VALUE: string;
  LABEL: string;
  COUNTRY_CODE: string;
  SORTBY: number;
}

export interface ICity {
  id: string;
  label: string;
  value: string;
  state: string;
  country_code: string;
  is_imp: boolean;
  imp_order: number;
  tier: number;
  SORTBY: number;
}

export interface IHeight {
  id: number;
  label: string;
  value: number;
  cm_value: string;
  SORTBY: number;
}

export interface IIncome {
  id: number;
  label: string;
  value: number;
  type: string;
  min_label: string;
  max_label: string;
  min_value: string;
  max_value: string;
  min_abs_val: string;
  max_abs_val: string;
  SORTBY: number;
}

export interface IEducation {
  id: string;
  label: string;
  value: string;
  group_name: string;
  MOSTCOMMON_SORTBY: number | null;
  display_module: string[];
  full_form: string;
  is_mostCommon: string;
  education_type: string;
  education_type_new: string;
  SORTBY: number;
}

export interface IOccupation {
  id: string;
  label: string;
  value: string;
  group_name: string;
  group_id: string;
  SORTBY: number;
}

export interface ICaste {
  value: string;
  parent: string;
  sortBy: number;
  label: string;
  dependentCastes?: string[];
  dependentSubCastes?: string[];
}

export interface ISubCaste {
  label: string;
  value: string;
  parent: string;
  SORTBY: number;
}

export interface IReligion {
  label: string;
  value: string;
  SORTBY: number;
}

export interface ISect {
  label: string;
  value: string;
  parent: string;
  SORTBY: number;
}

export interface IKulam {
  label: string;
  value: string;
  parent: string;
  SORTBY: number;
}

export interface IHobby {
  label: string;
  value: string;
  type: 'H' | 'I';
  SORTBY: number;
}

export interface IWellKnownCollege {
  label: string;
  value: number;
  SORTBY: number;
}

export interface IMatrimonyMode {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface IStaticDataResponse {
  mtongue: IMotherTongue[];
  country: ICountry[];
  state: IState[];
  city: ICity[];
  countryWithStates: string[];
  height: IHeight[];
  income: IIncome[];
  education: IEducation[];
  occupation: IOccupation[];
  casteGroup: ICaste[];
  caste: ICaste[];
  subcaste: ISubCaste[];
  kulam: IKulam[];
  religion: IReligion[];
  sect: ISect[];
  hobby: IHobby[];
  wellKnownColleges: IWellKnownCollege[];
  employedIn: { label: string; value: string; SHOW_FIELD: string; SORTBY: number }[];
  occupation_grouping: { label: string; value: string; onTop: number; SORTBY: number }[];
  employedInOccMapping: { value: string; data: string[] }[];
  topCityIndia: { ID: string; VALUE: string; LABEL: string; SORTBY: number }[];
  matrimonyModes: IMatrimonyMode[];
}
