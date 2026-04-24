import { repo } from './static-data.repo';
import { IStaticDataResponse } from './static-data.interfaces';

export const getStaticDataService = async (): Promise<IStaticDataResponse> => {
  return {
    mtongue: await repo.getMotherTongues(),
    country: await repo.getCountries(),
    state: await repo.getStates(),
    city: await repo.getCities(),
    countryWithStates: await repo.getCountryWithStates(),
    height: await repo.getHeights(),
    income: await repo.getIncomeRanges(),
    education: await repo.getEducationDegrees(),
    occupation: await repo.getOccupations(),
    casteGroup: await repo.getCasteGroups(),
    caste: await repo.getCastes(),
    subcaste: await repo.getSubCastes(),
    kulam: await repo.getKulams(),
    religion: await repo.getReligions(),
    sect: await repo.getSects(),
    hobby: await repo.getHobbies(),
    wellKnownColleges: await repo.getWellKnownColleges(),
    employedIn: await repo.getEmployedIn(),
    occupation_grouping: await repo.getOccupationGrouping(),
    employedInOccMapping: await repo.getEmployedInOccMapping(),
    topCityIndia: await repo.getTopCityIndia(),
  };
};
