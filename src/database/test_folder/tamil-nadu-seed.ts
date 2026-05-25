import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { DB } from "@/database";
import { QueryTypes, Transaction } from "sequelize";

type TableRow = Record<string, unknown>;

type WeightedOption<T> = { value: T; weight: number };

interface SeedOptions {
  accountCount?: number;
  batchSize?: number;
}

interface SeedSummary {
  accounts: number;
  profiles: number;
  profilePictures: number;
  profileSettings: number;
  profilePreferences: number;
  lifestyles: number;
  preferredPartnerChoices: number;
}

interface CleanupResult {
  accounts: number;
  profiles: number;
  profile_picture: number;
  profile_settings: number;
  profile_preferences: number;
  lifestyle: number;
  preferred_partner_choice: number;
  totalDeleted: number;
}

interface LookupRow {
  id: number;
  name?: string;
  label?: string;
  role_name?: string;
  degree_name?: string;
  level?: string;
  parent_id?: number | null;
  country_id?: number | null;
  state_id?: number | null;
  min_salary?: number | string | null;
  max_salary?: number | string | null;
  feet?: number | string | null;
  inches?: number | string | null;
  is_active?: boolean | number | string | null;
}

interface GeneratedProfile {
  profileId: string;
  accountId: string;
  fullname: string;
  profileCreatedFor: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  maritalStatus: "Single" | "Divorced" | "Separated" | "Widowed";
  religionId: number;
  sectId: number | null;
  casteId: number | null;
  subcasteId: number | null;
  kulamId: number | null;
  motherTongueId: number;
  countryId: number;
  stateId: number;
  cityId: number;
  heightId: number | null;
  weight: number | null;
  educationDegreeId: number | null;
  occupationRoleId: number | null;
  expectedSalaryId: number | null;
  matrimonyModeId: number | null;
  modeSelectedAt: Date | null;
  aboutMe: string;
  profileStatus: "Active" | "Inactive";
  isSearchable: boolean;
  visibility: "Public" | "Private";
  profileCompletePercent: number;
  lastSeen: Date;
}

interface GeneratedProfileSettings {
  profileId: string;
  allowMessagesFrom: "Everyone" | "Connections" | "PremiumOnly" | "NoOne";
  showAge: boolean;
  showHeight: boolean;
  showContactToMatchesOnly: boolean;
  timezone: string;
  languagePref: string;
}

interface GeneratedProfilePreferences {
  profileId: string;
  minAge: number;
  maxAge: number;
  minHeightId: number | null;
  maxHeightId: number | null;
  minSalaryId: number | null;
  maxSalaryId: number | null;
  preferredReligionIds: number[];
  preferredCasteIds: number[];
  preferredSubcasteIds: number[];
  preferredKulamIds: number[];
  preferredMotherTongueIds: number[];
  preferredCountryIds: number[];
  preferredStateIds: number[];
  preferredCityIds: number[];
  preferredEducationIds: number[];
  preferredOccupationIds: number[];
  preferredEmployedInIds: number[];
  preferredDietIds: string[];
  preferredDrinkingIds: string[];
  preferredSmokingIds: string[];
  preferredMaritalStatusIds: string[];
  preferredRasiIds: string[];
  preferredNakshatraIds: string[];
  preferredManglikStatusIds: string[];
  preferredProfilePostedByIds: string[];
  excludedCasteIds: number[];
  excludedOccupationIds: number[];
  excludedCityIds: number[];
  excludedDoshaIds: string[];
  preferSameReligion: boolean;
  preferSameCaste: boolean;
  preferSameSubcaste: boolean;
  preferSameState: boolean;
  preferSameCity: boolean;
  preferSameMotherTongue: boolean;
  requireHoroscopeMatch: boolean;
  requirePhoto: boolean;
  requirePhoneVerified: boolean;
  acceptPartnerWithChildren: boolean;
  preferNoChildren: boolean;
  maxDaysInactive: number;
  minProfileCompletion: number;
}

interface GeneratedLifestyle {
  profileId: string;
  dressStyle: "Traditional" | "Western" | "Both";
  bodyShape: "Slim" | "Average" | "Athletic" | "Heavy";
  skinComplexion: "Fair" | "Wheatish" | "Dusky" | "Dark";
  diet: "Vegetarian" | "Non-Vegetarian" | "Vegan" | "Eggetarian";
  drinkingHabits: "None" | "Occasionally" | "Regularly";
  smokingHabits: "None" | "Occasionally" | "Regularly";
  sportsFitness: string | null;
  anyChildren: boolean | null;
  dateOfMarriage: Date | null;
  isDivorced: boolean | null;
  reasonForDivorced: string | null;
  haveAnyDiseases: boolean | null;
  descriptionOfDiseases: string | null;
}

interface GeneratedPartnerChoice {
  profileId: string;
  minHeightId: number | null;
  maxHeightId: number | null;
  minAge: number;
  maxAge: number;
  expectedSalaryId: number | null;
  salaryType: "Annual" | "Monthly";
}

interface GeneratedPicture {
  profileId: string;
  filename: string;
  url: string;
  isProfilePic: boolean;
  isApproved: boolean;
  displayOrder: number;
}

interface HinduSubCasteChoice {
  id: number;
  name: string;
  kulams?: Array<{ id: number; name: string }>;
}

const HINDU_KULAMS = [{ id: 3205, name: "Morur Kannan Kulam" }, { id: 3206, name: "Molasi Kannangulam" }];

interface HinduCasteChoice {
  casteId: number;
  name: string;
  subcastes?: HinduSubCasteChoice[];
}

const DEFAULT_ACCOUNT_COUNT = 1000;
const DEFAULT_BATCH_SIZE = 250;
const DEFAULT_PASSWORD = "TamilNadu@123";

const MALE_IMAGES = [
  "https://pub-202bbdc208f34a0baee60bc260c3a718.r2.dev/images.jpeg",
  "https://pub-202bbdc208f34a0baee60bc260c3a718.r2.dev/young-indian-man-dressed-trendy-outfit-monitoring-information-from-social-networks_231208-2766.avif",
  "https://pub-202bbdc208f34a0baee60bc260c3a718.r2.dev/WhatsApp%20Image%202026-03-07%20at%2017.21.35.jpeg",
];

const FEMALE_IMAGES = [
  "https://pub-202bbdc208f34a0baee60bc260c3a718.r2.dev/Screenshot%202026-05-10%20at%202.03.13%E2%80%AFAM.png",
  "https://pub-202bbdc208f34a0baee60bc260c3a718.r2.dev/Screenshot%202026-05-10%20at%202.23.59%E2%80%AFAM.png",
];

const TN_CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Tirunelveli",
  "Salem",
  "Erode",
  "Vellore",
  "Thoothukkudi",
  "Dindigul",
  "Thanjavur",
  "Kanchipuram",
  "Tiruppur",
  "Nagapattinam",
  "Cuddalore",
  "Sivagangai",
  "Ramanathapuram",
  "Virudhunagar",
  "Krishnagiri",
  "Dharmapuri",
  "Namakkal",
  "Karur",
  "Perambalur",
  "Ariyalur",
  "Pudukkottai",
  "Theni",
  "Kanyakumari",
  "Nilgiris",
] as const;

const RELIGION_WEIGHTS: ReadonlyArray<WeightedOption<"Hindu" | "Muslim" | "Christian" | "Jain" | "Other">> = [
  { value: "Hindu", weight: 75 },
  { value: "Muslim", weight: 12 },
  { value: "Christian", weight: 10 },
  { value: "Jain", weight: 2 },
  { value: "Other", weight: 1 },
];

const GENDER_WEIGHTS: ReadonlyArray<WeightedOption<"Male" | "Female" | "Other">> = [
  { value: "Male", weight: 52 },
  { value: "Female", weight: 47 },
  { value: "Other", weight: 1 },
];

const AGE_BUCKETS: ReadonlyArray<WeightedOption<{ min: number; max: number }>> = [
  { value: { min: 21, max: 25 }, weight: 20 },
  { value: { min: 26, max: 30 }, weight: 40 },
  { value: { min: 31, max: 35 }, weight: 25 },
  { value: { min: 36, max: 40 }, weight: 10 },
  { value: { min: 41, max: 50 }, weight: 5 },
];

const MARITAL_WEIGHTS: ReadonlyArray<WeightedOption<"Single" | "Divorced" | "Separated" | "Widowed">> = [
  { value: "Single", weight: 75 },
  { value: "Divorced", weight: 12 },
  { value: "Widowed", weight: 8 },
  { value: "Separated", weight: 5 },
];

const PROFILE_STATUS_WEIGHTS: ReadonlyArray<WeightedOption<"Active">> = [
  { value: "Active", weight: 100 },
];

const SEARCHABLE_WEIGHTS: ReadonlyArray<WeightedOption<boolean>> = [
  { value: true, weight: 85 },
  { value: false, weight: 15 },
];

const PROFILE_FOR_WEIGHTS: ReadonlyArray<WeightedOption<string>> = [
  { value: "Self", weight: 70 },
  { value: "Son", weight: 9 },
  { value: "Daughter", weight: 9 },
  { value: "Brother", weight: 4 },
  { value: "Sister", weight: 4 },
  { value: "Relative", weight: 2 },
  { value: "Friend", weight: 2 },
];

const DIET_WEIGHTS: ReadonlyArray<WeightedOption<"Vegetarian" | "Non-Vegetarian" | "Vegan" | "Eggetarian">> = [
  { value: "Vegetarian", weight: 25 },
  { value: "Non-Vegetarian", weight: 70 },
  { value: "Vegan", weight: 3 },
  { value: "Eggetarian", weight: 2 },
];

const DRINKING_WEIGHTS: ReadonlyArray<WeightedOption<"None" | "Occasionally" | "Regularly">> = [
  { value: "None", weight: 75 },
  { value: "Occasionally", weight: 20 },
  { value: "Regularly", weight: 5 },
];

const SMOKING_WEIGHTS: ReadonlyArray<WeightedOption<"None" | "Occasionally" | "Regularly">> = [
  { value: "None", weight: 85 },
  { value: "Occasionally", weight: 10 },
  { value: "Regularly", weight: 5 },
];

const DRESS_STYLE_WEIGHTS: ReadonlyArray<WeightedOption<"Traditional" | "Western" | "Both">> = [
  { value: "Traditional", weight: 30 },
  { value: "Western", weight: 25 },
  { value: "Both", weight: 45 },
];

const BODY_SHAPE_WEIGHTS: ReadonlyArray<WeightedOption<"Slim" | "Average" | "Athletic" | "Heavy">> = [
  { value: "Slim", weight: 30 },
  { value: "Average", weight: 45 },
  { value: "Athletic", weight: 15 },
  { value: "Heavy", weight: 10 },
];

const COMPLEXION_WEIGHTS: ReadonlyArray<WeightedOption<"Fair" | "Wheatish" | "Dusky" | "Dark">> = [
  { value: "Fair", weight: 20 },
  { value: "Wheatish", weight: 50 },
  { value: "Dusky", weight: 25 },
  { value: "Dark", weight: 5 },
];

const HINDU_CASTES: HinduCasteChoice[] = [
  {
    casteId: 61,
    name: "Gounder",
    subcastes: [
      { id: 2530, name: "Kongu Vellala Gounder" },
      { id: 2727, name: "Nattu Gounder", kulams: HINDU_KULAMS },
      { id: 3115, name: "Urali Gounder" },
      { id: 3180, name: "Vettuva Gounder" },
      { id: 3156, name: "Vanniya Kula Kshatriyar" },
    ],
  },
  {
    casteId: 504,
    name: "Mudaliar",
    subcastes: [
      { id: 2682, name: "Arcot Mudaliar" },
      { id: 2683, name: "Saiva Mudaliar" },
      { id: 2684, name: "Senguntha Mudaliar" },
      { id: 2685, name: "Thondai Mandala Mudaliar" },
      { id: 2019, name: "Agamudayar Mudaliar" },
    ],
  },
  {
    casteId: 119,
    name: "Reddy",
    subcastes: [
      { id: 2204, name: "Chowdary Reddy" },
      { id: 2299, name: "Gandla Reddy" },
      { id: 2450, name: "Kapu Reddy" },
      { id: 2903, name: "Reddiar" },
      { id: 2140, name: "Bhoomanchi Reddy" },
    ],
  },
  {
    casteId: 500,
    name: "Brahmin",
    subcastes: [
      { id: 2377, name: "Iyengar" },
      { id: 2378, name: "Iyer" },
      { id: 2310, name: "Gaud Saraswat" },
      { id: 2630, name: "Maithil Brahmin" },
      { id: 2198, name: "Chitpavan Kokanastha" },
    ],
  },
  {
    casteId: 146,
    name: "Yadav",
    subcastes: [
      { id: 2032, name: "Aheer / Ahir" },
      { id: 2328, name: "Golla" },
      { id: 2527, name: "Konar" },
      { id: 3196, name: "Yadav Golla" },
      { id: 3198, name: "Yaduvanshi" },
    ],
  },
  { casteId: 54, name: "Chettiar", subcastes: [{ id: 2010, name: "Aaru Nattu Vellala" }] },
  { casteId: 101, name: "Nadar" },
  { casteId: 130, name: "Thevar Mukkulathor" },
  { casteId: 48, name: "Adi Dravida" },
  { casteId: 183, name: "Arunthathiyar" },
];

const MUSLIM_SECTS = [
  { sectId: 152, name: "Sunni" },
  { sectId: 151, name: "Shia" },
];

const CHRISTIAN_SECTS = [
  { sectId: 12, name: "CSI" },
  { sectId: 34, name: "Catholic" },
];

const HINDU_MALE_NAMES = [
  "Arun",
  "Karthik",
  "Prakash",
  "Ramesh",
  "Vignesh",
  "Harish",
  "Saravanan",
  "Naveen",
  "Sivakumar",
  "Senthil",
  "Mohan",
  "Bala",
  "Murugan",
  "Gokul",
  "Ajith",
  "Pranesh",
  "Sathish",
  "Manikandan",
  "Kavin",
  "Velmurugan",
];
const HINDU_FEMALE_NAMES = [
  "Anitha",
  "Priya",
  "Sowmya",
  "Divya",
  "Lakshmi",
  "Kavya",
  "Revathi",
  "Meena",
  "Nandhini",
  "Aarthi",
  "Deepa",
  "Shalini",
  "Selvi",
  "Swathi",
  "Monisha",
  "Harini",
  "Rajalakshmi",
  "Viji",
  "Pavithra",
  "Keerthana",
];
const MUSLIM_MALE_NAMES = [
  "Mohammed Ali",
  "Abdul Rahman",
  "Syed Irfan",
  "Ahamed",
  "Sameer",
  "Shafiq",
  "Ameer",
  "Faisal",
  "Rashid",
  "Nizam",
  "Nasser",
  "Mubarak",
];
const MUSLIM_FEMALE_NAMES = [
  "Ayesha",
  "Fathima",
  "Hameeda",
  "Nafisa",
  "Sameera",
  "Shabana",
  "Zainab",
  "Rukaiya",
  "Asiya",
  "Maryam",
];
const CHRISTIAN_MALE_NAMES = ["John", "Joseph", "Thomas", "Peter", "David", "Daniel", "Samuel", "Paul", "Michael", "Jabez"];
const CHRISTIAN_FEMALE_NAMES = ["Mary", "Anita", "Beulah", "Ruth", "Esther", "Angela", "Grace", "Lydia", "Rachel", "Miriam"];
const JAIN_NAMES = ["Aakash", "Arvind", "Bhavesh", "Chetan", "Deepak", "Kavya", "Mehul", "Nikita", "Nilesh", "Pooja"];
const OTHER_NAMES = ["Aarav", "Ananya", "Aditya", "Aditi", "Harsha", "Keerthi", "Kiran", "Madhan", "Nisha", "Riya"];

const CASTE_FALLBACK_NAMES = [
  "Iyer",
  "Iyengar",
  "Mudaliar",
  "Gounder",
  "Nadar",
  "Thevar",
  "Chettiar",
  "Pillai",
  "Vanniyar",
  "Vellalar",
  "Devendrakula Vellalar",
  "Paraiyar",
  "Pallar",
  "Arunthathiyar",
  "Marakkayar",
  "Rowther",
  "Labbai",
  "Kayalar",
  "Nadar Christian",
  "Paravar",
  "Latin Catholic",
  "CSI",
];

const DEFAULT_SALARY_TARGETS = [240000, 450000, 800000, 1200000, 1800000, 3000000, 0];

const describeColumnsCache = new Map<string, Set<string>>();
const allRowsCache = new Map<string, LookupRow[]>();

const randomInt = (min: number, max: number): number => {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
};

const weightedPick = <T>(items: ReadonlyArray<WeightedOption<T>>): T => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) {
      return item.value;
    }
  }

  return items[items.length - 1]!.value;
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.+/g, ".");

const normalize = (value: unknown): string => String(value ?? "").trim().toLowerCase();

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const tableExists = async (tableName: string): Promise<boolean> => {
  const rows = await DB.sequelize.query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :tableName",
    { replacements: { tableName }, type: QueryTypes.SELECT },
  );

  return Number(rows[0]?.count ?? 0) > 0;
};

const getColumns = async (tableName: string): Promise<Set<string>> => {
  const cached = describeColumnsCache.get(tableName);
  if (cached) {
    return cached;
  }

  const description = await DB.sequelize.getQueryInterface().describeTable(tableName);
  const columns = new Set(Object.keys(description));
  describeColumnsCache.set(tableName, columns);
  return columns;
};

const filterRow = async (tableName: string, row: TableRow): Promise<TableRow> => {
  const columns = await getColumns(tableName);
  const filtered: TableRow = {};

  for (const [key, value] of Object.entries(row)) {
    if (columns.has(key) && value !== undefined) {
      filtered[key] = value;
    }
  }

  return filtered;
};

const insertRow = async (tableName: string, row: TableRow, transaction: Transaction): Promise<void> => {
  const filtered = await filterRow(tableName, row);
  if (Object.keys(filtered).length === 0) {
    return;
  }

  await DB.sequelize.getQueryInterface().bulkInsert(tableName, [filtered], { transaction });
};

const countRows = async (tableName: string): Promise<number> => {
  const [result] = await DB.sequelize.query<{ count: number }>(`SELECT COUNT(*) AS count FROM \`${tableName}\``, {
    type: QueryTypes.SELECT,
  });

  return Number(result?.count ?? 0);
};

const loadAllRows = async (tableName: string): Promise<LookupRow[]> => {
  const cached = allRowsCache.get(tableName);
  if (cached) {
    return cached;
  }

  const rows = (await DB.sequelize.query(`SELECT * FROM \`${tableName}\``, { type: QueryTypes.SELECT })) as LookupRow[];
  allRowsCache.set(tableName, rows);
  return rows;
};

const pickByName = (rows: LookupRow[], candidates: string[]): LookupRow | undefined => {
  const normalizedCandidates = candidates.map(normalize);
  return rows.find((row) => {
    const value = normalize(row.name ?? row.label);
    return normalizedCandidates.some((candidate) => value === candidate || value.includes(candidate));
  });
};

const pickId = (row: LookupRow | undefined): number | null => (row ? toNumber(row.id) : null);

const assertExists = async (tableName: string, id: number, label: string, whereClause?: string): Promise<void> => {
  const sql = whereClause
    ? `SELECT id FROM \`${tableName}\` WHERE id = :id AND ${whereClause} LIMIT 1`
    : `SELECT id FROM \`${tableName}\` WHERE id = :id LIMIT 1`;

  const rows = await DB.sequelize.query<{ id: number }>(sql, {
    replacements: { id },
    type: QueryTypes.SELECT,
  });

  if (rows.length === 0) {
    throw new Error(`${label} ID ${id} not found`);
  }
};

const validateBeforeInsert = async (profile: GeneratedProfile): Promise<void> => {
  const failures: string[] = [];

  try {
    await assertExists("religion_lookup", profile.religionId, "Religion");
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  if (profile.casteId !== null) {
    try {
      await assertExists("caste_hierarchy", profile.casteId, "Caste", `level = 'Caste'`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (profile.subcasteId !== null) {
    try {
      await assertExists("caste_hierarchy", profile.subcasteId, "Subcaste", `level = 'Subcaste'`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (profile.kulamId !== null) {
    try {
      await assertExists("caste_hierarchy", profile.kulamId, "Kulam", `level = 'Kulam'`);
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  try {
    await assertExists("mother_tongue", profile.motherTongueId, "Mother tongue");
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  try {
    await assertExists("country_lookup", profile.countryId, "Country");
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  try {
    await assertExists("state_lookup", profile.stateId, "State");
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  try {
    await assertExists("city_lookup", profile.cityId, "City");
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }

  if (profile.heightId !== null) {
    try {
      await assertExists("height_lookup", profile.heightId, "Height");
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (profile.educationDegreeId !== null) {
    try {
      await assertExists("education_degree_lookup", profile.educationDegreeId, "Education degree");
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (profile.occupationRoleId !== null) {
    try {
      await assertExists("occupation_role_lookup", profile.occupationRoleId, "Occupation role");
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (profile.expectedSalaryId !== null) {
    try {
      await assertExists("salary_range_lookup", profile.expectedSalaryId, "Salary range");
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (failures.length > 0) {
    throw new Error(`Validation failed: ${failures.join("; ")}`);
  }
};

const pickCountryId = async (): Promise<number> => {
  const rows = await loadAllRows("country_lookup");
  const match = pickByName(rows, ["India"]);
  const id = pickId(match ?? rows[0]);
  if (id === null) {
    throw new Error("country_lookup is missing India");
  }
  return id;
};

const pickStateId = async (countryId: number): Promise<number> => {
  const rows = await loadAllRows("state_lookup");
  const match =
    rows.find((row) => normalize(row.name) === "tamil nadu" && toNumber(row.country_id) === countryId) ??
    rows.find((row) => normalize(row.name).includes("tamil nadu")) ??
    rows[0];
  const id = pickId(match);
  if (id === null) {
    throw new Error("state_lookup is missing Tamil Nadu");
  }
  return id;
};

const pickCityId = async (): Promise<number> => {
  const rows = await loadAllRows("city_lookup");
  const match = pickByName(rows, [...TN_CITIES]);
  const id = pickId(match ?? rows[0]);
  if (id === null) {
    throw new Error("city_lookup is missing a Tamil Nadu city");
  }
  return id;
};

const pickMotherTongueId = async (name: string): Promise<number> => {
  const rows = await loadAllRows("mother_tongue");
  const match = pickByName(rows, [name]);
  const id = pickId(match ?? rows[0]);
  if (id === null) {
    throw new Error(`mother_tongue is missing ${name}`);
  }
  return id;
};

const pickReligionId = async (name: string): Promise<number> => {
  const rows = await loadAllRows("religion_lookup");
  const match = pickByName(rows, [name]);
  const id = pickId(match ?? rows[0]);
  if (id === null) {
    throw new Error(`religion_lookup is missing ${name}`);
  }
  return id;
};

const pickOccupationRoleId = async (names: string[]): Promise<number | null> => {
  const rows = await loadAllRows("occupation_role_lookup");
  const match = pickByName(rows, names) ?? rows[0];
  return pickId(match);
};

const pickEducationDegreeId = async (names: string[]): Promise<number | null> => {
  const rows = await loadAllRows("education_degree_lookup");
  const match = pickByName(rows, names) ?? rows[0];
  return pickId(match);
};

const pickHeightId = async (targetFeet: number, targetInches: number): Promise<number | null> => {
  const rows = await loadAllRows("height_lookup");
  const scored = rows
    .map((row) => ({
      row,
      diff: Math.abs((toNumber(row.feet) ?? 0) * 12 + (toNumber(row.inches) ?? 0) - (targetFeet * 12 + targetInches)),
    }))
    .sort((a, b) => a.diff - b.diff);
  return pickId(scored[0]?.row);
};

const pickSalaryRangeId = async (annualSalary: number): Promise<number | null> => {
  const rows = await loadAllRows("salary_range_lookup");
  const scored = rows
    .map((row) => ({
      row,
      min: toNumber(row.min_salary) ?? 0,
      max: toNumber(row.max_salary) ?? 0,
      label: normalize(row.label),
    }))
    .sort((a, b) => a.min - b.min);

  const match =
    scored.find((entry) => annualSalary >= entry.min && annualSalary <= entry.max) ??
    scored.find((entry) => entry.label.includes("not disclosed")) ??
    scored[0];

  return pickId(match?.row);
};

const pickMatrimonyModeId = async (profile: Pick<GeneratedProfile, "maritalStatus" | "casteId" | "religionId" | "occupationRoleId">): Promise<number | null> => {
  const rows = await loadAllRows("matrimony_modes");
  const activeRows = rows.filter((row) => row.is_active === true || row.is_active === 1 || row.is_active === "1");
  const modes = activeRows.length > 0 ? activeRows : rows;

  const occupationRows = await loadAllRows("occupation_role_lookup");
  const occupation = occupationRows.find((row) => toNumber(row.id) === profile.occupationRoleId);
  const occupationName = normalize(occupation?.role_name ?? occupation?.name ?? occupation?.label);

  let preferredModeName = "no_caste";

  if (profile.maritalStatus === "Divorced" || profile.maritalStatus === "Widowed") {
    preferredModeName = "widow_divorcee";
  } else if (occupationName.includes("doctor") || occupationName.includes("engineer")) {
    preferredModeName = "doctor_engineer";
  } else if (occupationName.includes("software") || occupationName.includes("it")) {
    preferredModeName = "it_professional";
  } else if (profile.casteId !== null && profile.religionId !== null) {
    preferredModeName = "caste";
  }

  const preferred = modes.find((row) => normalize(row.name) === preferredModeName);
  return pickId(preferred ?? modes[0]);
};

const buildNamePools = (religion: string, gender: "Male" | "Female" | "Other"): string[] => {
  if (religion === "Muslim") {
    return gender === "Female" ? MUSLIM_FEMALE_NAMES : MUSLIM_MALE_NAMES;
  }

  if (religion === "Christian") {
    return gender === "Female" ? CHRISTIAN_FEMALE_NAMES : CHRISTIAN_MALE_NAMES;
  }

  if (religion === "Jain") {
    return JAIN_NAMES;
  }

  if (religion === "Other") {
    return OTHER_NAMES;
  }

  return gender === "Female" ? HINDU_FEMALE_NAMES : HINDU_MALE_NAMES;
};

const buildSurnamePools = (religion: string): string[] => {
  if (religion === "Muslim") {
    return ["Khan", "Basha", "Ali", "Rahman", "Ahmed", "Syed", "Ansari", "Rowther"];
  }

  if (religion === "Christian") {
    return ["Thomas", "Joseph", "Peter", "Paul", "David", "John", "Michael", "Grace"];
  }

  return CASTE_FALLBACK_NAMES;
};

const buildFullName = (religion: string, gender: "Male" | "Female" | "Other", casteLabel: string | null, index: number): string => {
  const firstNames = buildNamePools(religion, gender);
  const surnames = buildSurnamePools(religion);
  const first = firstNames[index % firstNames.length] ?? `${religion}${index}`;
  const last = casteLabel ?? surnames[(index * 7) % surnames.length] ?? "Kumar";
  return `${first} ${last}`.trim();
};

const buildDateOfBirth = (age: number): Date => {
  const now = new Date();
  const year = now.getFullYear() - age;
  return new Date(year, randomInt(0, 11), randomInt(1, 27), randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
};

const buildProfileImages = (gender: "Male" | "Female" | "Other", imageCount: number): string[] => {
  const sourceImages = gender === "Female" ? FEMALE_IMAGES : MALE_IMAGES;
  return Array.from({ length: imageCount }, (_, index) => sourceImages[index % sourceImages.length] ?? sourceImages[0]!);
};

const buildHinduProfile = async (profileIndex: number, slotIndex: number): Promise<Pick<GeneratedProfile, "casteId" | "subcasteId" | "kulamId" | "sectId">> => {
  const choice = HINDU_CASTES[(profileIndex + slotIndex) % HINDU_CASTES.length] ?? HINDU_CASTES[0]!;
  const subcastes = choice.subcastes ?? [];
  const subcaste = subcastes[(profileIndex + slotIndex) % (subcastes.length || 1)] ?? subcastes[0];
  const kulam = subcaste?.id === 2727 ? subcaste.kulams?.[(profileIndex + slotIndex) % (subcaste.kulams?.length || 1)] ?? subcaste.kulams?.[0] ?? null : null;

  return {
    casteId: choice.casteId,
    subcasteId: subcaste?.id ?? null,
    kulamId: kulam?.id ?? null,
    sectId: null,
  };
};

const buildMuslimProfile = async (profileIndex: number): Promise<Pick<GeneratedProfile, "casteId" | "subcasteId" | "kulamId" | "sectId">> => {
  const sect = MUSLIM_SECTS[profileIndex % MUSLIM_SECTS.length] ?? MUSLIM_SECTS[0]!;
  return {
    casteId: null,
    subcasteId: null,
    kulamId: null,
    sectId: sect.sectId,
  };
};

const buildChristianProfile = async (profileIndex: number): Promise<Pick<GeneratedProfile, "casteId" | "subcasteId" | "kulamId" | "sectId">> => {
  const sect = CHRISTIAN_SECTS[profileIndex % CHRISTIAN_SECTS.length] ?? CHRISTIAN_SECTS[0]!;
  return {
    casteId: null,
    subcasteId: null,
    kulamId: null,
    sectId: sect.sectId,
  };
};

const buildGeneratedProfile = async (
  accountId: string,
  profileIndex: number,
  slotIndex: number,
): Promise<GeneratedProfile> => {
  const gender = weightedPick(GENDER_WEIGHTS);
  const religion = weightedPick(RELIGION_WEIGHTS);
  const ageBucket = weightedPick(AGE_BUCKETS);
  const age = randomInt(ageBucket.min, ageBucket.max);
  const countryId = await pickCountryId();
  const stateId = await pickStateId(countryId);
  const cityId = await pickCityId();

  const motherTongueCandidates =
    religion === "Muslim"
      ? ["Urdu", "Tamil"]
      : religion === "Christian"
        ? ["Tamil", "Malayalam"]
        : religion === "Other"
          ? ["Tamil", "Telugu", "Kannada"]
          : ["Tamil", "Telugu", "Malayalam"];

  const motherTongueId = await pickMotherTongueId(motherTongueCandidates[slotIndex % motherTongueCandidates.length]!);

  let casteId: number | null = null;
  let subcasteId: number | null = null;
  let kulamId: number | null = null;
  let sectId: number | null = null;
  let casteLabel: string | null = null;

  if (religion === "Hindu") {
    const hindu = await buildHinduProfile(profileIndex, slotIndex);
    casteId = hindu.casteId;
    subcasteId = hindu.subcasteId;
    kulamId = hindu.kulamId;
    sectId = hindu.sectId;

    const caste = HINDU_CASTES.find((item) => item.casteId === casteId);
    casteLabel = caste?.name ?? null;
  } else if (religion === "Muslim") {
    const muslim = await buildMuslimProfile(profileIndex);
    sectId = muslim.sectId;
    casteId = muslim.casteId;
    subcasteId = muslim.subcasteId;
    kulamId = muslim.kulamId;
  } else if (religion === "Christian") {
    const christian = await buildChristianProfile(profileIndex);
    sectId = christian.sectId;
    casteId = christian.casteId;
    subcasteId = christian.subcasteId;
    kulamId = christian.kulamId;
  }

  const fullname = buildFullName(religion, gender, casteLabel, profileIndex + slotIndex);
  const heightId = await pickHeightId(gender === "Male" ? 5 : gender === "Female" ? 5 : 5, gender === "Male" ? 7 : gender === "Female" ? 3 : 5);
  const weight = heightId ? randomInt(gender === "Male" ? 52 : 45, gender === "Male" ? 90 : 82) : null;
  const educationDegreeId = await pickEducationDegreeId(["B.E", "B.Tech", "M.E", "M.Tech", "MBBS", "MD", "B.Com", "M.Com", "B.Sc", "M.Sc", "B.A", "M.A", "MBA", "PhD", "Diploma"]);
  const occupationRoleId = await pickOccupationRoleId(["Software Engineer", "Government Employee", "Teacher", "Doctor", "Nurse", "Business Owner", "Farmer", "Textile Engineer", "Automobile Engineer", "Accountant", "Lawyer", "Homemaker", "Student"]);
  const expectedSalaryId = await pickSalaryRangeId(DEFAULT_SALARY_TARGETS[profileIndex % DEFAULT_SALARY_TARGETS.length]!);
  const maritalStatus = weightedPick(MARITAL_WEIGHTS);
  const profileStatus = weightedPick(PROFILE_STATUS_WEIGHTS);
  const isSearchable = weightedPick(SEARCHABLE_WEIGHTS);

  return {
    profileId: randomUUID(),
    accountId,
    fullname,
    profileCreatedFor: weightedPick(PROFILE_FOR_WEIGHTS),
    dateOfBirth: buildDateOfBirth(age),
    gender,
    maritalStatus,
    religionId: await pickReligionId(religion),
    sectId,
    casteId,
    subcasteId,
    kulamId,
    motherTongueId,
    countryId,
    stateId,
    cityId,
    heightId,
    weight,
    educationDegreeId,
    occupationRoleId,
    expectedSalaryId,
    matrimonyModeId: await pickMatrimonyModeId({
      maritalStatus,
      casteId,
      religionId: await pickReligionId(religion),
      occupationRoleId,
    }),
    modeSelectedAt: new Date(),
    aboutMe: `Tamil Nadu profile generated for ${fullname} from ${TN_CITIES[slotIndex % TN_CITIES.length] ?? "Tamil Nadu"}.`,
    profileStatus,
    isSearchable,
    visibility: isSearchable ? "Public" : "Private",
    profileCompletePercent: isSearchable ? 90 : 75,
    lastSeen: new Date(),
  };
};

const buildProfileSettings = (profile: GeneratedProfile): GeneratedProfileSettings => ({
  profileId: profile.profileId,
  allowMessagesFrom: weightedPick([
    { value: "Everyone", weight: 35 },
    { value: "Connections", weight: 45 },
    { value: "PremiumOnly", weight: 15 },
    { value: "NoOne", weight: 5 },
  ]),
  showAge: true,
  showHeight: true,
  showContactToMatchesOnly: true,
  timezone: "Asia/Kolkata",
  languagePref: weightedPick([
    { value: "ta", weight: 92 },
    { value: "en", weight: 8 },
  ]),
});

const buildProfilePreferences = (profile: GeneratedProfile, partnerChoice: GeneratedPartnerChoice): GeneratedProfilePreferences => {
  const isHindu = profile.religionId === 1;
  const isFamilyCreatedProfile = ["Son", "Daughter", "Brother", "Sister", "Relative", "Friend"].includes(profile.profileCreatedFor);

  return {
    profileId: profile.profileId,
    minAge: partnerChoice.minAge,
    maxAge: partnerChoice.maxAge,
    minHeightId: partnerChoice.minHeightId,
    maxHeightId: partnerChoice.maxHeightId,
    minSalaryId: profile.expectedSalaryId ?? partnerChoice.expectedSalaryId,
    maxSalaryId: profile.expectedSalaryId ?? partnerChoice.expectedSalaryId,
    preferredReligionIds: [profile.religionId],
    preferredCasteIds: profile.casteId !== null ? [profile.casteId] : [],
    preferredSubcasteIds: profile.subcasteId !== null ? [profile.subcasteId] : [],
    preferredKulamIds: profile.kulamId !== null ? [profile.kulamId] : [],
    preferredMotherTongueIds: [profile.motherTongueId],
    preferredCountryIds: [profile.countryId],
    preferredStateIds: [profile.stateId],
    preferredCityIds: [profile.cityId],
    preferredEducationIds: profile.educationDegreeId !== null ? [profile.educationDegreeId] : [],
    preferredOccupationIds: profile.occupationRoleId !== null ? [profile.occupationRoleId] : [],
    preferredEmployedInIds: [],
    preferredDietIds: ["Vegetarian", "Non-Vegetarian"],
    preferredDrinkingIds: ["None", "Occasionally"],
    preferredSmokingIds: ["None"],
    preferredMaritalStatusIds: profile.maritalStatus === "Single" ? ["Single"] : ["Single", "Divorced", "Widowed"],
    preferredRasiIds: [],
    preferredNakshatraIds: [],
    preferredManglikStatusIds: [],
    preferredProfilePostedByIds: isFamilyCreatedProfile ? [profile.profileCreatedFor] : ["Self"],
    excludedCasteIds: [],
    excludedOccupationIds: [],
    excludedCityIds: [],
    excludedDoshaIds: [],
    preferSameReligion: isHindu || profile.religionId === 2 || profile.religionId === 3,
    preferSameCaste: isHindu && profile.casteId !== null,
    preferSameSubcaste: isHindu && profile.subcasteId !== null,
    preferSameState: true,
    preferSameCity: false,
    preferSameMotherTongue: true,
    requireHoroscopeMatch: isHindu,
    requirePhoto: true,
    requirePhoneVerified: true,
    acceptPartnerWithChildren: profile.maritalStatus !== "Single",
    preferNoChildren: profile.maritalStatus === "Single",
    maxDaysInactive: 30,
    minProfileCompletion: 70,
  };
};

const buildLifestyle = (profile: GeneratedProfile): GeneratedLifestyle => ({
  profileId: profile.profileId,
  dressStyle: weightedPick(DRESS_STYLE_WEIGHTS),
  bodyShape: weightedPick(BODY_SHAPE_WEIGHTS),
  skinComplexion: weightedPick(COMPLEXION_WEIGHTS),
  diet: weightedPick(DIET_WEIGHTS),
  drinkingHabits: weightedPick(DRINKING_WEIGHTS),
  smokingHabits: weightedPick(SMOKING_WEIGHTS),
  sportsFitness: weightedPick([
    { value: "Walking", weight: 35 },
    { value: "Yoga", weight: 20 },
    { value: "Gym", weight: 15 },
    { value: "Cricket", weight: 15 },
    { value: "Badminton", weight: 15 },
  ]),
  anyChildren: weightedPick([
    { value: false, weight: 90 },
    { value: true, weight: 10 },
  ]),
  dateOfMarriage: profile.maritalStatus === "Single" ? null : new Date(profile.dateOfBirth.getFullYear() + 20, 0, 1),
  isDivorced: profile.maritalStatus === "Divorced",
  reasonForDivorced: profile.maritalStatus === "Divorced" ? "Mutual differences" : null,
  haveAnyDiseases: weightedPick([
    { value: false, weight: 92 },
    { value: true, weight: 8 },
  ]),
  descriptionOfDiseases: null,
});

const buildPartnerChoice = async (profile: GeneratedProfile): Promise<GeneratedPartnerChoice> => {
  const currentAge = Math.max(21, new Date().getFullYear() - profile.dateOfBirth.getFullYear());
  const minAge = Math.max(21, currentAge - randomInt(2, 5));
  const maxAge = Math.min(50, currentAge + randomInt(2, 7));
  const expectedSalaryId = profile.expectedSalaryId ?? (await pickSalaryRangeId(Math.max(0, currentAge * 85000)));

  return {
    profileId: profile.profileId,
    minHeightId: profile.heightId,
    maxHeightId: profile.heightId,
    minAge,
    maxAge,
    expectedSalaryId,
    salaryType: "Annual",
  };
};

const buildPictureRows = (profile: GeneratedProfile): GeneratedPicture[] => {
  const imageCount = Math.random() < 0.4 ? 3 : 2;
  const urls = buildProfileImages(profile.gender, imageCount);

  return urls.map((url, index) => ({
    profileId: profile.profileId,
    filename: decodeURIComponent(url.substring(url.lastIndexOf("/") + 1) || "profile-image").replace(/\s+/g, "-"),
    url,
    isProfilePic: index === 0,
    isApproved: true,
    displayOrder: index,
  }));
};

const buildAccount = async (index: number, profiles: GeneratedProfile[]) => {
  const firstProfile = profiles[0];
  const displayName = firstProfile?.fullname ?? `Tamil Nadu User ${index}`;
  const accountId = randomUUID();
  const accountSeed = accountId.replace(/-/g, "");
  const phoneSeed = accountSeed
    .split("")
    .map((char) => (/[0-9]/.test(char) ? char : String(char.charCodeAt(0) % 10)))
    .join("")
    .slice(0, 9)
    .padEnd(9, "0");
  return {
    accountId,
    displayName,
    primaryEmail: `tn.${index}.${accountSeed.slice(0, 12)}.${slugify(displayName)}@example.com`,
    primaryPhone: `9${phoneSeed}`,
    passwordHash: await bcrypt.hash(DEFAULT_PASSWORD, 10),
  };
};

const buildDiagnosticsSql = (): string => `
-- 1) Verify lookup data exists
SELECT 'religion_lookup' AS table_name, COUNT(*) AS count FROM religion_lookup
UNION ALL SELECT 'caste_hierarchy', COUNT(*) FROM caste_hierarchy
UNION ALL SELECT 'mother_tongue', COUNT(*) FROM mother_tongue
UNION ALL SELECT 'country_lookup', COUNT(*) FROM country_lookup
UNION ALL SELECT 'state_lookup', COUNT(*) FROM state_lookup
UNION ALL SELECT 'city_lookup', COUNT(*) FROM city_lookup
UNION ALL SELECT 'height_lookup', COUNT(*) FROM height_lookup;

-- 2) Check for specific required IDs
SELECT
  CASE WHEN EXISTS(SELECT 1 FROM religion_lookup WHERE id = 1) THEN 'YES' ELSE 'NO' END AS hindu_exists,
  CASE WHEN EXISTS(SELECT 1 FROM caste_hierarchy WHERE id = 61 AND level = 'Caste') THEN 'YES' ELSE 'NO' END AS gounder_exists,
  CASE WHEN EXISTS(SELECT 1 FROM mother_tongue WHERE id = 31) THEN 'YES' ELSE 'NO' END AS tamil_exists,
  CASE WHEN EXISTS(SELECT 1 FROM country_lookup WHERE id = 101) THEN 'YES' ELSE 'NO' END AS india_exists,
  CASE WHEN EXISTS(SELECT 1 FROM state_lookup WHERE id = 4035) THEN 'YES' ELSE 'NO' END AS tn_exists,
  CASE WHEN EXISTS(SELECT 1 FROM city_lookup WHERE id = 131517) THEN 'YES' ELSE 'NO' END AS chennai_exists,
  CASE WHEN EXISTS(SELECT 1 FROM height_lookup WHERE id = 20) THEN 'YES' ELSE 'NO' END AS height_exists;

-- 3) Show actual column names for problematic tables
SHOW COLUMNS FROM lifestyle;
SHOW COLUMNS FROM preferred_partner_choice;
SHOW COLUMNS FROM profile_picture;
SHOW COLUMNS FROM profile_settings;
`;

const logProgress = (message: string): void => {
  console.log(`[tn-seed] ${message}`);
};

const seedRows = async (accountCount: number, batchSize: number): Promise<SeedSummary> => {
  const summary: SeedSummary = {
    accounts: 0,
    profiles: 0,
    profilePictures: 0,
    profileSettings: 0,
    profilePreferences: 0,
    lifestyles: 0,
    preferredPartnerChoices: 0,
  };

  const transaction = await DB.sequelize.transaction();
  try {
    if (DB.sequelize.getDialect() === "mysql" || DB.sequelize.getDialect() === "mariadb") {
      await DB.sequelize.query("SET SESSION innodb_lock_wait_timeout = 60", { transaction });
    }

    for (let accountIndex = 0; accountIndex < accountCount; accountIndex += 1) {
      const profileCount = weightedPick([
        { value: 1, weight: 80 },
        { value: 2, weight: 15 },
        { value: 3, weight: 5 },
      ]);

      logProgress(`generating account ${accountIndex + 1}/${accountCount} with ${profileCount} profile(s)`);

      const generatedProfiles: GeneratedProfile[] = [];
      for (let slotIndex = 0; slotIndex < profileCount; slotIndex += 1) {
        const profile = await buildGeneratedProfile(randomUUID(), accountIndex * 10 + slotIndex, slotIndex);
        await validateBeforeInsert(profile);
        generatedProfiles.push(profile);
        logProgress(`validated profile ${slotIndex + 1}/${profileCount} for account ${accountIndex + 1}/${accountCount}`);
      }

      const account = await buildAccount(accountIndex, generatedProfiles);
      for (const profile of generatedProfiles) {
        profile.accountId = account.accountId;
      }

      const now = new Date();

      await insertRow(
        "accounts",
        {
          account_id: account.accountId,
          primary_email: account.primaryEmail,
          primary_phone: account.primaryPhone,
          password_hash: account.passwordHash,
          display_name: account.displayName,
          is_email_verified: true,
          is_phone_verified: true,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        transaction,
      );
      summary.accounts += 1;
      logProgress(`inserted account ${summary.accounts}/${accountCount}`);

      for (let profileIndex = 0; profileIndex < generatedProfiles.length; profileIndex += 1) {
        const profile = generatedProfiles[profileIndex]!;
        const settings = buildProfileSettings(profile);
        const partnerChoice = await buildPartnerChoice(profile);
        const preferences = buildProfilePreferences(profile, partnerChoice);
        const lifestyle = buildLifestyle(profile);
        const pictures = buildPictureRows(profile);

        await insertRow(
          "profiles",
          {
            profile_id: profile.profileId,
            account_id: profile.accountId,
            fullname: profile.fullname,
            profile_created_for: profile.profileCreatedFor,
            date_of_birth: profile.dateOfBirth,
            gender: profile.gender,
            marital_status: profile.maritalStatus,
            religion_id: profile.religionId,
            sect_id: profile.sectId,
            caste_id: profile.casteId,
            subcaste_id: profile.subcasteId,
            kulam_id: profile.kulamId,
            mother_tongue_id: profile.motherTongueId,
            country_id: profile.countryId,
            state_id: profile.stateId,
            city_id: profile.cityId,
            height_id: profile.heightId,
            weight: profile.weight,
            education_degree_id: profile.educationDegreeId,
            occupation_role_id: profile.occupationRoleId,
            expected_salary_id: profile.expectedSalaryId,
            matrimony_mode_id: profile.matrimonyModeId,
            mode_selected_at: profile.modeSelectedAt,
            about_me: profile.aboutMe,
            profile_status: profile.profileStatus,
            is_searchable: profile.isSearchable,
            visibility: profile.visibility,
            profile_complete_percent: profile.profileCompletePercent,
            last_seen: profile.lastSeen,
            created_at: now,
            updated_at: now,
          },
          transaction,
        );
        summary.profiles += 1;
        logProgress(`inserted profile ${summary.profiles} for account ${summary.accounts}`);

        await insertRow(
          "profile_settings",
          {
            profile_id: settings.profileId,
            allow_messages_from: settings.allowMessagesFrom,
            show_age: settings.showAge,
            show_height: settings.showHeight,
            show_contact_to_matches_only: settings.showContactToMatchesOnly,
            timezone: settings.timezone,
            language_pref: settings.languagePref,
          },
          transaction,
        );
        summary.profileSettings += 1;

        await insertRow(
          "profile_preferences",
          {
            profile_id: preferences.profileId,
            min_age: preferences.minAge,
            max_age: preferences.maxAge,
            min_height_id: preferences.minHeightId,
            max_height_id: preferences.maxHeightId,
            min_salary_id: preferences.minSalaryId,
            max_salary_id: preferences.maxSalaryId,
            preferred_religion_ids: JSON.stringify(preferences.preferredReligionIds),
            preferred_caste_ids: JSON.stringify(preferences.preferredCasteIds),
            preferred_subcaste_ids: JSON.stringify(preferences.preferredSubcasteIds),
            preferred_kulam_ids: JSON.stringify(preferences.preferredKulamIds),
            preferred_mother_tongue_ids: JSON.stringify(preferences.preferredMotherTongueIds),
            preferred_country_ids: JSON.stringify(preferences.preferredCountryIds),
            preferred_state_ids: JSON.stringify(preferences.preferredStateIds),
            preferred_city_ids: JSON.stringify(preferences.preferredCityIds),
            preferred_education_ids: JSON.stringify(preferences.preferredEducationIds),
            preferred_occupation_ids: JSON.stringify(preferences.preferredOccupationIds),
            preferred_employed_in_ids: JSON.stringify(preferences.preferredEmployedInIds),
            preferred_diet_ids: JSON.stringify(preferences.preferredDietIds),
            preferred_drinking_ids: JSON.stringify(preferences.preferredDrinkingIds),
            preferred_smoking_ids: JSON.stringify(preferences.preferredSmokingIds),
            preferred_marital_status_ids: JSON.stringify(preferences.preferredMaritalStatusIds),
            preferred_rasi_ids: JSON.stringify(preferences.preferredRasiIds),
            preferred_nakshatra_ids: JSON.stringify(preferences.preferredNakshatraIds),
            preferred_manglik_status_ids: JSON.stringify(preferences.preferredManglikStatusIds),
            preferred_profile_posted_by_ids: JSON.stringify(preferences.preferredProfilePostedByIds),
            excluded_caste_ids: JSON.stringify(preferences.excludedCasteIds),
            excluded_occupation_ids: JSON.stringify(preferences.excludedOccupationIds),
            excluded_city_ids: JSON.stringify(preferences.excludedCityIds),
            excluded_dosha_ids: JSON.stringify(preferences.excludedDoshaIds),
            prefer_same_religion: preferences.preferSameReligion,
            prefer_same_caste: preferences.preferSameCaste,
            prefer_same_subcaste: preferences.preferSameSubcaste,
            prefer_same_state: preferences.preferSameState,
            prefer_same_city: preferences.preferSameCity,
            prefer_same_mother_tongue: preferences.preferSameMotherTongue,
            require_horoscope_match: preferences.requireHoroscopeMatch,
            require_photo: preferences.requirePhoto,
            require_phone_verified: preferences.requirePhoneVerified,
            accept_partner_with_children: preferences.acceptPartnerWithChildren,
            prefer_no_children: preferences.preferNoChildren,
            max_days_inactive: preferences.maxDaysInactive,
            min_profile_completion: preferences.minProfileCompletion,
            created_at: now,
            updated_at: now,
          },
          transaction,
        );
        summary.profilePreferences += 1;

        await insertRow(
          "lifestyle",
          {
            profile_id: lifestyle.profileId,
            dress_style: lifestyle.dressStyle,
            body_shape: lifestyle.bodyShape,
            skin_complexion: lifestyle.skinComplexion,
            diet: lifestyle.diet,
            drinking_habits: lifestyle.drinkingHabits,
            smoking_habits: lifestyle.smokingHabits,
            sports_fitness: lifestyle.sportsFitness,
            any_children: lifestyle.anyChildren,
            date_of_marriage: lifestyle.dateOfMarriage,
            is_divorced: lifestyle.isDivorced,
            reason_for_divorced: lifestyle.reasonForDivorced,
            have_any_diseases: lifestyle.haveAnyDiseases,
            description_of_diseases: lifestyle.descriptionOfDiseases,
            created_at: now,
            updated_at: now,
          },
          transaction,
        );
        summary.lifestyles += 1;

        await insertRow(
          "preferred_partner_choice",
          {
            profile_id: partnerChoice.profileId,
            min_height_id: partnerChoice.minHeightId,
            max_height_id: partnerChoice.maxHeightId,
            min_age: partnerChoice.minAge,
            max_age: partnerChoice.maxAge,
            expected_salary_id: partnerChoice.expectedSalaryId,
            salary_type: partnerChoice.salaryType,
            created_at: now,
            updated_at: now,
          },
          transaction,
        );
        summary.preferredPartnerChoices += 1;

        const imageLimit = Math.min(pictures.length, batchSize > 0 ? pictures.length : pictures.length);
        for (let pictureIndex = 0; pictureIndex < imageLimit; pictureIndex += 1) {
          const picture = pictures[pictureIndex]!;
          await insertRow(
            "profile_picture",
            {
              profile_id: picture.profileId,
              filename: picture.filename,
              url: picture.url,
              is_profile_pic: picture.isProfilePic,
              is_approved: picture.isApproved,
              display_order: picture.displayOrder,
              created_at: now,
              updated_at: now,
            },
            transaction,
          );
          summary.profilePictures += 1;
          logProgress(`inserted picture ${summary.profilePictures} for profile ${profile.profileId}`);
        }
      }
    }

    await transaction.commit();
    logProgress(`seed completed: ${summary.accounts} accounts, ${summary.profiles} profiles`);
    return summary;
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      logProgress(`rollback error: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`);
    }

    throw error;
  }
};

export const generateTamilNaduSeedData = async (options: SeedOptions = {}): Promise<SeedSummary> => {
  const accountCount = Math.max(1, options.accountCount ?? Number(process.env.TN_SEED_USER_COUNT ?? DEFAULT_ACCOUNT_COUNT));
  const batchSize = Math.max(1, options.batchSize ?? DEFAULT_BATCH_SIZE);
  return seedRows(accountCount, batchSize);
};

export const cleanUserData = async (): Promise<CleanupResult> => {
  const tables = [
    "profile_picture",
    "preferred_partner_choice",
    "profile_preferences",
    "lifestyle",
    "profile_settings",
    "profiles",
    "accounts",
  ] as const;

  const result: CleanupResult = {
    accounts: 0,
    profiles: 0,
    profile_picture: 0,
    profile_settings: 0,
    profile_preferences: 0,
    lifestyle: 0,
    preferred_partner_choice: 0,
    totalDeleted: 0,
  };

  await DB.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  try {
    for (const tableName of tables) {
      if (!(await tableExists(tableName))) {
        continue;
      }

      const currentCount = await countRows(tableName);
      await DB.sequelize.query(`TRUNCATE TABLE \`${tableName}\``);
      if (tableName === "profile_picture") result.profile_picture = currentCount;
      if (tableName === "preferred_partner_choice") result.preferred_partner_choice = currentCount;
      if (tableName === "profile_preferences") result.profile_preferences = currentCount;
      if (tableName === "lifestyle") result.lifestyle = currentCount;
      if (tableName === "profile_settings") result.profile_settings = currentCount;
      if (tableName === "profiles") result.profiles = currentCount;
      if (tableName === "accounts") result.accounts = currentCount;
      result.totalDeleted += currentCount;
      logProgress(`cleaned ${tableName}: ${currentCount} rows`);
    }
  } finally {
    await DB.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }

  return result;
};

const parseArgs = (argv: string[]): { clean: boolean; diagnose: boolean; accountCount?: number; batchSize?: number } => {
  const parsed: { clean: boolean; diagnose: boolean; accountCount?: number; batchSize?: number } = {
    clean: false,
    diagnose: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token) {
      continue;
    }

    if (token === "--clean") {
      parsed.clean = true;
      continue;
    }

    if (token === "--diagnose") {
      parsed.diagnose = true;
      continue;
    }

    if (token.startsWith("--count=")) {
      parsed.accountCount = Number(token.split("=")[1]);
      continue;
    }

    if (token === "--count" && argv[index + 1]) {
      parsed.accountCount = Number(argv[index + 1]);
      index += 1;
      continue;
    }

    if (token.startsWith("--batchSize=")) {
      parsed.batchSize = Number(token.split("=")[1]);
      continue;
    }

    if (token === "--batchSize" && argv[index + 1]) {
      parsed.batchSize = Number(argv[index + 1]);
      index += 1;
    }
  }

  return parsed;
};

const main = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2));

  if (args.diagnose) {
    console.log(buildDiagnosticsSql().trim());
    return;
  }

  if (args.clean) {
    const result = await cleanUserData();
    console.log(JSON.stringify({ action: "clean", result }, null, 2));
    return;
  }

  const summary = await generateTamilNaduSeedData({
    accountCount: args.accountCount,
    batchSize: args.batchSize,
  });

  console.log(JSON.stringify({ action: "seed", summary }, null, 2));
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
