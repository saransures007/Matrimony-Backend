
export interface IUser {
  userId: string;
  username: string;
  fullname?: string;
  email: string;
  phoneNumber: string;
  password: string;
  profileCreatedFor: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female';
  maritalStatus?: 'Single' | 'Divorced' | 'Separated' | 'Widowed';
  religionId?: number;
  accountActive: boolean;
  isOnboarded: boolean;
  lastSeen?: Date;
}
// Religion Interface
export interface IReligion {
  id: number;
  name: string;
}

// Hindu Caste Mapping
export interface IUserHinduCasteMapping {
  userId: string;
  casteId: number;
  subCasteId?: number;
}

// Muslim Caste Mapping
export interface IUserMuslimCasteMapping {
  userId: string;
  sectId: number;
  casteId?: number;
}

// Christian Sect Mapping
export interface IUserChristianSectMapping {
  userId: string;
  sectId: number;
}

// Lifestyle
export interface ILifestyle {
  userId: string;
  heightId?: number;
  weight?: number;
  bloodGroup?: string;
  diet?: string;
  smokingHabits?: string;
  drinkingHabits?: string;
  sportsFitness?: string;
  anyChildren?: boolean;
  dateOfMarriage?: Date;
  dateDivorced?: Date;
  isDivorced?: boolean;
  reasonForDivorced?: string;
  haveAnyDiseases?: boolean;
  descriptionOfDiseases?: string;
}



// // user.interface.ts

// export interface IUser {
//   // Basic Account Details
//   userId?: string;                
//   fullname?: string;
//   email: string;                  
//   phoneNumber: string;            
//   password: string;               

//   // Basic Details
//   profileCreatedFor?: string;  
//   dateOfBirth?: Date;
//   gender?: 'Male' | 'Female';
//   maritalStatus?: 'Single' | 'Divorced' | 'Separated' | 'Widowed';

//   // Physical Details
//   heightId?: number;         // HeightLookup
//   weight?: number;
//   skinTone?: string;
//   bloodGroup?: string;

//   // Social / Education / Occupation
//   religionId?: number;       
//   casteId?: number;          
//   subCasteId?: number;       
//   kulamOrSectId?: number;    

//   educationId?: number;      
//   occupationRoleId?: number; 
//   salaryRangeId?: number;    

//   // Location
//   countryId?: number;
//   stateId?: number;
//   districtId?: number;

//   // Account Status
//   accountActive?: boolean;
//   isOnboarded?: boolean;

//   // Extended Info
//   fathersName?: string;
//   mothersName?: string;
//   LifeStyle?: ILifeStyle;
//   UploadedDocument?: IUploadedDocument[];
//   PrefferedPartnerChoice?: IPrefferedPartnerChoice;
//   FamilyDetail?: IFamilyDetail;
//   ProfilePictures?: IProfilePicture[];
//   RelativeContacts?: IRelativeContact[];
//   FavouritePersons?: IFavouritePerson[];
//   PersonWhoFavouritedYous?: IFavouritePerson[];

//   createdAt?: Date;
//   updatedAt?: Date;
// }


// export interface IUser {
//   // Basic Account Details
//   userId?: string;
//   username: string;
//   fullname?: string;
//   email: string;
//   phoneNumber: string;
//   password: string;

//   // Basic Details
//   profileCreatedFor: string;
//   dateOfBirth?: Date;
//   gender?: 'Male' | 'Female';
//   maritalStatus?: 'Single' | 'Divorced' | 'Separated' | 'Widowed';

//   // Religion / Caste
//   religionId?: number;
//   casteId?: number;       // For Hindu users
//   subCasteId?: number;    // Hindu Sub-caste
//   sectId?: number;        // Muslim/Christian sect
//   muslimCasteId?: number; // For Muslim users

//   // Account Status
//   accountActive?: boolean;
//   isOnboarded?: boolean;
//   lastSeen?: Date;


//   // Extended Info
//   fathersName?: string;
//   mothersName?: string;
//   LifeStyle?: ILifeStyle;
//   UploadedDocument?: IUploadedDocument[];
//   PrefferedPartnerChoice?: IPrefferedPartnerChoice;
//   FamilyDetail?: IFamilyDetail;
//   ProfilePictures?: IProfilePicture[];
//   RelativeContacts?: IRelativeContact[];
//   FavouritePersons?: IFavouritePerson[];
//   PersonWhoFavouritedYous?: IFavouritePerson[];

//   createdAt?: Date;
//   updatedAt?: Date;
// }


// // Lifestyle
// export interface ILifeStyle {
//   id?: string;
//   userId?: string;
//   dressStyle?: string;
//   bodyShape?: string;
//   skinComplextion?: string;
//   diet?: string;
//   drinkingHabits?: string;
//   smokingHabits?: string;
//   sportsFitness?: string;
//   anyChildren?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Uploaded Documents
// export interface IUploadedDocument {
//   id?: string;
//   userId: string;
//   type: string;          // Passport, Aadhar, etc.
//   fileUrl: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Preferred Partner Choice
// export interface IPrefferedPartnerChoice {
//   id?: string;
//   userId: string;
//   minHeightId?: number;
//   maxHeightId?: number;
//   minAge?: number;
//   maxAge?: number;
//   expectedSalaryId?: number;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Family Details
// export interface IFamilyDetail {
//   id?: string;
//   userId: string;
//   fatherName?: string;
//   fatherOccupation?: string;
//   motherName?: string;
//   motherOccupation?: string;
//   noOfBrothers?: number;
//   noOfSisters?: number;
//   familyStatus?: string;    
//   familyValues?: string;    
//   ancestralOrigin?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Profile Pictures
// export interface IProfilePicture {
//   id?: string;
//   userId: string;
//   filename: string;
//   isPrimary?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Relative Contacts
// export interface IRelativeContact {
//   id?: string;
//   userId: string;
//   type?: string;             
//   fullname?: string;
//   phoneNumber?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Favorites
// export interface IFavouritePerson {
//   id?: string;
//   userId: string;              
//   favouritePersonId?: string;  
//   personWhoFavoritedYouID?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Address
// export interface IAddress {
//   id?: string;
//   userId?: string;
//   city?: string;
//   district?: string;
//   country?: string;
//   zipCode?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Caste
// export interface ICaste {
//   id?: string;
//   userId?: string;
//   caste?: string;
//   subCaste?: string;
//   interCasteMarriage?: boolean;
//   preferredCaste?: string;
//   kulam?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Education
// export interface IEducation {
//   id?: string;
//   userId?: string;
//   type?: string;
//   degree?: string;
//   institutionName?: string;
//   specializationIn?: string;
//   passoutYear?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Occupation
// export interface IOccupation {
//   id?: string;
//   userId?: string;
//   type?: string;
//   currentCompanyName?: string;
//   salary?: number;
//   isSelfEmployeed?: boolean;
//   createdAt?: Date;
//   updatedAt?: Date;
// }


