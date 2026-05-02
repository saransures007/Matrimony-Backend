// Matrimony-Backend/src/modules/common/static-data/static-data.repo.ts
import { DB } from '@/database';
import {
  IMotherTongue,
  ICountry,
  IState,
  ICity,
  IHeight,
  IIncome,
  IEducation,
  IOccupation,
  ICaste,
  ISubCaste,
  IKulam,
  IReligion,
  ISect,
  IHobby,
  IWellKnownCollege,
  IMatrimonyMode,
} from './static-data.interfaces';

// Define interface for repo
export interface IStaticDataRepo {
  getMotherTongues(): Promise<IMotherTongue[]>;
  getCountries(): Promise<ICountry[]>;
  getStates(): Promise<IState[]>;
  getCities(): Promise<ICity[]>;
  getCountryWithStates(): Promise<string[]>;
  getHeights(): Promise<IHeight[]>;
  getIncomeRanges(): Promise<IIncome[]>;
  getEducationDegrees(): Promise<IEducation[]>;
  getOccupations(): Promise<IOccupation[]>;
  getCasteGroups(): Promise<ICaste[]>;
  getCastes(): Promise<ICaste[]>;
  getSubCastes(): Promise<ISubCaste[]>;
  getKulams(): Promise<IKulam[]>;
  getReligions(): Promise<IReligion[]>;
  getSects(): Promise<ISect[]>;
  getHobbies(): Promise<IHobby[]>;
  getWellKnownColleges(): Promise<IWellKnownCollege[]>;
  getEmployedIn(): Promise<{ label: string; value: string; SHOW_FIELD: string; SORTBY: number }[]>;
  getOccupationGrouping(): Promise<{ label: string; value: string; onTop: number; SORTBY: number }[]>;
  getEmployedInOccMapping(): Promise<{ value: string; data: string[] }[]>;
  getTopCityIndia(): Promise<{ ID: string; VALUE: string; LABEL: string; SORTBY: number }[]>;
  getMatrimonyModes(): Promise<IMatrimonyMode[]>;
}

// Implement repo
export const repo: IStaticDataRepo = {
  getMotherTongues: async () => {
    const data = await DB.mother_tongue.findAll();
    return data.map((row: any) => ({
      id: row.id?.toString() ?? '',
      label: row.name ?? 'Unknown',
      value: row.id?.toString() ?? '',
      region: row.region ?? '',
      SORTBY: row.sort_by ?? 0,
    }));
  },

  getCountries: async () => {
    const data = await DB.country_lookup.findAll();
    return data.map((row: any) => ({
      id: row.id?.toString() ?? '',
      label: row.name ?? 'Unknown',
      value: row.id?.toString() ?? '',
      group_name: row.group_name ?? '',
      isd_code: row.isd_code ?? '',
      is_imp: row.is_imp ?? 0,
      GROUP_SORTBY: row.group_sortby ?? 0,
      SORTBY: row.sortby ?? 0,
    }));
  },
// Get States in India
getStates: async () => {
  // First fetch India from country_lookup (using iso2 or name)
  const india = await DB.country_lookup.findOne({
    where: { iso2: 'IN' }, // safer than using name
  });

  if (!india) return [];

  const data = await DB.state_lookup.findAll({
    where: { country_id: india.id },
  });

  return data.map((row: any) => ({
    ID: row.id?.toString() ?? '',
    VALUE: row.id?.toString() ?? '',
    LABEL: row.name ?? 'Unknown',
    COUNTRY_CODE: row.country_id?.toString() ?? '',
    SORTBY: row.sortby ?? 0,
  }));
},


// Get Cities in India
getCities: async () => {
  const india = await DB.country_lookup.findOne({
    where: { iso2: 'IN' },
  });

  if (!india) return [];

  // Join state_lookup (to filter by India) with city_lookup
  const data = await DB.city_lookup.findAll({
    include: [
      {
        model: DB.state_lookup,
        as: 'state',
        where: { country_id: india.id },
      },
    ],
  });

  return data.map((row: any) => ({
    id: row.id?.toString() ?? '',
    label: row.name ?? 'Unknown',
    value: row.id?.toString() ?? '',
    state: row.state_id?.toString() ?? '',
    country_code: india.id?.toString() ?? '',
    is_imp: row.is_imp ?? 0,
    imp_order: row.imp_order ?? 0,
    tier: row.tier ?? 0,
    SORTBY: row.sortby ?? 0,
  }));
},



    getCountryWithStates: async () => {
    const data = await DB.country_with_states.findAll({
        attributes: ['country_id', 'state_id'], // no Sequelize id here
    });
    return data.map((row: any) => row.country_id.toString());
    },

  getHeights: async () => {
    const data = await DB.height_lookup.findAll();
    return data.map((row: any) => ({
      id: row.id?.toString() ?? '',
      label: row.label ?? '',
      value: row.id?.toString() ?? '',
      cm_value: row.meters?.toString() ?? '0',
      SORTBY: row.sortby ?? 0,
    }));
  },

  getIncomeRanges: async () => {
    const data = await DB.salary_range_lookup.findAll();
    return data.map((row: any) => ({
      id: row.id?.toString() ?? '',
      label: row.label ?? '',
      value: row.id?.toString() ?? '',
      type: 'RUPEES',
      min_label: row.min_label ?? '0',
      max_label: row.max_label ?? '0',
      min_value: row.min_salary?.toString() ?? '0',
      max_value: row.max_salary?.toString() ?? '0',
      min_abs_val: row.min_abs_val?.toString() ?? '0',
      max_abs_val: row.max_abs_val?.toString() ?? '0',
      SORTBY: row.sortby ?? 0,
    }));
  },

    getEducationDegrees: async () => {
    const data = await DB.education_degree_lookup.findAll({
        include: [
        {
            model: DB.education_category_lookup,
            as: 'category',
            attributes: ['name'],
        },
        ],
    });

    return data.map((row: any) => ({
        id: row.id?.toString() ?? '',
        label: row.degree_name ?? 'Unknown',
        value: row.id?.toString() ?? '',
        group_name: row.category?.name ?? '',
        MOSTCOMMON_SORTBY: null, // you can adjust if you add this column later
        display_module: row.display_module ?? [],   // <-- no JSON.parse needed
        full_form: row.full_form ?? '',
        is_mostCommon: row.is_most_common ?? 'N',
        education_type: row.education_type ?? '',
        education_type_new: row.education_type ?? '', // duplicate for now
        SORTBY: row.sortby ?? 0,
    }));
    },

    getOccupations: async () => {
    const data = await DB.occupation_role_lookup.findAll({
        include: [
        {
            model: DB.occupation_category_lookup,
            as: 'category', // must match belongsTo
            attributes: ['id', 'name'],
        },
        ],
    });

    return data.map((row: any) => ({
        id: row.id?.toString() ?? '',
        label: row.role_name ?? 'Unknown',
        value: row.id?.toString() ?? '',
        group_name: row.category?.name ?? '', // fetched via association
        group_id: row.category_id?.toString() ?? '',
        SORTBY: row.sortby ?? 0,
    }));
    },


getCasteGroups: async () => {
  const data = await DB.caste_hierarchy.findAll();
  return data
    .filter((row: any) => row.level === 'Religion')
    .map((row: any) => ({
      value: row.id.toString(),
      parent: '',   // religions have no parent
      sortBy: row.sortby ?? 0,
      label: row.name,
      dependentCastes: data
        .filter((c: any) => c.parent_id === row.id && c.level === 'Caste')
        .map(c => c.id.toString()),
      dependentSubCastes: data
        .filter((c: any) => c.parent_id === row.id && c.level === 'Caste')
        .flatMap(c =>
          data.filter(s => s.parent_id === c.id && s.level === 'Subcaste')
              .map(s => s.id.toString())
        ),
    }));
},


getCastes: async (): Promise<ICaste[]> => {
  const castes = await DB.caste_hierarchy.findAll({
    where: { level: 'Caste' },
    order: [['sortby', 'ASC']],
  });

  return castes.map((row: any) => ({
    id: row.id,
    label: row.name,
    value: row.id.toString(),
    parent: row.parent_id?.toString() ?? '',   // use parent_id now
    sortBy: row.sortby ?? 0,
  }));
},


  // Fetch all subcastes (level = 'Subcaste')
getSubCastes: async (): Promise<ISubCaste[]> => {
  const subcastes = await DB.caste_hierarchy.findAll({
    where: { level: 'Subcaste' },
    order: [['sortby', 'ASC']],
  });

  return subcastes.map((row: any) => ({
    id: row.id,
    label: row.name,
    value: row.id.toString(),
    parent: row.parent_id?.toString() ?? '', // parent caste id
    SORTBY: row.sortby ?? 0, // <-- use the exact property name from interface
  }));
},

getSects: async (): Promise<ISect[]> => {
  const sects = await DB.caste_hierarchy.findAll({
    where: { level: 'Sect' },
    order: [['sortby', 'ASC']],
  });

  return sects.map((row: any) => ({
    id: row.id,
    label: row.name,
    value: row.id.toString(),
    parent: row.parent_id?.toString() ?? '',  // parent religion id
    SORTBY: row.sortby ?? 0,
  }));
},




  getKulams: async (): Promise<IKulam[]> => {
    const kulams = await DB.caste_hierarchy.findAll({
      where: { level: 'Kulam' },
      order: [['sortby', 'ASC']],
    });

    console.log("kulams",kulams)
    return kulams.map((row: any) => ({
      label: row.name,
      value: row.id.toString(),
      parent: row.parent_id?.toString() ?? '', // parent subcaste id
      SORTBY: row.sortby ?? 0,
    }));
  },

  getReligions: async () => {
    const data = await DB.religion_lookup.findAll();
    return data.map((row: any) => ({
      label: row.name ?? 'Unknown',
      value: row.id?.toString() ?? '',
      SORTBY: row.sortby ?? 0,
    }));
  },

  getHobbies: async () => {
    const data = await DB.hobby_lookup.findAll();
    return data.map((row: any) => ({
      label: row.label ?? 'Unknown',
      value: row.id?.toString() ?? '',
      type: row.type ?? '',
      SORTBY: row.sortby ?? 0,
    }));
  },

  getWellKnownColleges: async () => {
    const data = await DB.well_known_college.findAll();
    return data.map((row: any) => ({
      label: row.label ?? 'Unknown',
      value: row.id?.toString() ?? '',
      SORTBY: row.sortby ?? 0,
    }));
  },

  getEmployedIn: async () => {
    const data = await DB.employedin_lookup.findAll();
    return data.map((row: any) => ({
      label: row.label ?? 'Unknown',
      value: row.id?.toString() ?? '',
      SHOW_FIELD: row.show_field ?? '',
      SORTBY: row.sortby ?? 0,
    }));
  },

  getOccupationGrouping: async () => {
    const data = await DB.occupation_grouping.findAll();
    return data.map((row: any) => ({
      label: row.label ?? 'Unknown',
      value: row.id?.toString() ?? '',
      onTop: row.on_top ?? 0,
      SORTBY: row.sortby ?? 0,
    }));
  },

getEmployedInOccMapping: async () => {
  const rows = await DB.employedin_occ_mapping.findAll();

  // Group role_ids by employedin_id
  const grouped: Record<string, string[]> = {};
  rows.forEach((row: any) => {
    const empId = row.employedin_id?.toString() ?? '';
    if (!grouped[empId]) {
      grouped[empId] = [];
    }
    if (row.role_id) {
      grouped[empId].push(row.role_id.toString());
    }
  });

  // Convert grouped object back to expected array
  return Object.keys(grouped).map(empId => ({
    value: empId,
    data: grouped[empId],
  }));
},

  getTopCityIndia: async () => {
    const data = await DB.city_lookup.findAll({ where: { is_imp: true } });
    return data.map((row: any) => ({
      ID: row.id?.toString() ?? '',
      VALUE: row.id?.toString() ?? '',
      LABEL: row.name ?? 'Unknown',
      SORTBY: row.sortby ?? 0,
    }));
  },

getMatrimonyModes: async () => {
  const data = await DB.matrimony_modes.findAll({
    where: { is_active: true }, // Now using snake_case
    order: [['sort_order', 'ASC']], // Now using snake_case
  });
  
  return data.map((row: any) => ({
    id: row.id,
    name: row.name ?? '',
    displayName: row.display_name ?? row.name ?? '', // Map to camelCase for frontend
    description: row.description ?? '',
    isActive: row.is_active ?? true, // Map to camelCase for frontend
    sortOrder: row.sort_order ?? 0, // Map to camelCase for frontend
  }));
},
};
