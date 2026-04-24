-- create database matrimonialDBtest;

-- use matrimonialDBtest;

-- ===============================================
-- MATRIMONY APP DATABASE SCHEMA
-- ===============================================

-- 1. Height Lookup
CREATE TABLE HeightLookup (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(50) NOT NULL,       -- e.g., "6' 0\" (1.83 m)"
    feet INT NOT NULL,
    inches INT NOT NULL,
    meters DECIMAL(4,2) NOT NULL
);

-- 2. Location Hierarchy (Country -> State -> District)
CREATE TABLE Country (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE State (
    id INT AUTO_INCREMENT PRIMARY KEY,
    countryId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (countryId) REFERENCES Country(id)
);

CREATE TABLE District (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stateId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (stateId) REFERENCES State(id)
);

-- 3. Education Lookup
CREATE TABLE EducationCategory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL    -- e.g., "Engineering", "Finance"
);

CREATE TABLE EducationDegree (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoryId INT NOT NULL,
    degreeName VARCHAR(100) NOT NULL,  -- e.g., "B.E/B.Tech"
    FOREIGN KEY (categoryId) REFERENCES EducationCategory(id)
);

-- 4. Occupation Lookup
CREATE TABLE OccupationSector (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL   -- e.g., "Private Sector", "Government"
);

CREATE TABLE OccupationCategory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sectorId INT NOT NULL,
    name VARCHAR(100) NOT NULL,  -- e.g., "Administration"
    FOREIGN KEY (sectorId) REFERENCES OccupationSector(id)
);

CREATE TABLE OccupationRole (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoryId INT NOT NULL,
    roleName VARCHAR(100) NOT NULL,  -- e.g., "Clerk", "Analyst"
    FOREIGN KEY (categoryId) REFERENCES OccupationCategory(id)
);

-- 5. Salary Range
CREATE TABLE SalaryRange (
    id INT AUTO_INCREMENT PRIMARY KEY,
    minSalary DECIMAL(10,2) NOT NULL,
    maxSalary DECIMAL(10,2) NOT NULL,
    label VARCHAR(50) NOT NULL       -- e.g., "0–5 LPA"
);

-- 6. Religion
CREATE TABLE Religion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL        -- e.g., "Hindu", "Muslim", "Christian"
);

-- 7. Hindu Caste
CREATE TABLE HinduCaste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    religionId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (religionId) REFERENCES Religion(id)
);

CREATE TABLE HinduSubCaste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    casteId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (casteId) REFERENCES HinduCaste(id)
);

CREATE TABLE HinduKulam (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subCasteId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (subCasteId) REFERENCES HinduSubCaste(id)
);

-- 8. Muslim Sect & Caste
CREATE TABLE MuslimSect (
    id INT AUTO_INCREMENT PRIMARY KEY,
    religionId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (religionId) REFERENCES Religion(id)
);

CREATE TABLE MuslimCaste (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sectId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (sectId) REFERENCES MuslimSect(id)
);

-- 9. Christian Sect
CREATE TABLE ChristianSect (
    id INT AUTO_INCREMENT PRIMARY KEY,
    religionId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (religionId) REFERENCES Religion(id)
);

-- 10. Reservation Categories
CREATE TABLE ReservationCategory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL  -- e.g., "General", "OBC", "MBC", "SC", "ST"
);

-- 11. Caste to Reservation Mapping
CREATE TABLE CasteReservationMapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    casteId INT NOT NULL,
    stateId INT NOT NULL,
    reservationCategoryId INT NOT NULL,
    FOREIGN KEY (casteId) REFERENCES HinduCaste(id),
    FOREIGN KEY (stateId) REFERENCES State(id),
    FOREIGN KEY (reservationCategoryId) REFERENCES ReservationCategory(id)
);

-- 12. Users Table
CREATE TABLE Users (
    userId CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    fullname VARCHAR(50),
    email VARCHAR(50) NOT NULL UNIQUE,
    phoneNumber VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profileCreatedFor VARCHAR(50) NOT NULL,
    dateOfBirth DATE,
    gender ENUM('Male','Female'),
    martialStatus ENUM('Single','Divorced','Separated','Widowed') DEFAULT 'Single',
    religionId INT,
    casteId INT,
    subCasteId INT,
    kulamId INT,
    accountActive BOOLEAN DEFAULT FALSE,
    isOnboarded BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (religionId) REFERENCES Religion(id),
    FOREIGN KEY (casteId) REFERENCES HinduCaste(id),
    FOREIGN KEY (subCasteId) REFERENCES HinduSubCaste(id),
    FOREIGN KEY (kulamId) REFERENCES HinduKulam(id)
);

-- 13. Family Details
CREATE TABLE FamilyDetail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    fatherName VARCHAR(50),
    fatherOccupation VARCHAR(100),
    motherName VARCHAR(50),
    motherOccupation VARCHAR(100),
    noOfBrothers INT,
    noOfSisters INT,
    familyStatus VARCHAR(50),
    familyValues VARCHAR(50),
    ancestralOrigin VARCHAR(100),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- 14. LifeStyle
CREATE TABLE LifeStyle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    heightId INT,
    weight FLOAT,
    bloodGroup VARCHAR(5),
    dressStyle VARCHAR(50),
    bodyShape VARCHAR(50),
    skinComplexion VARCHAR(50),
    diet VARCHAR(50),
    drinkingHabits VARCHAR(50),
    smokingHabits VARCHAR(50),
    sportsFitness VARCHAR(50),
    anyChildren BOOLEAN,
    dateOfMarriage DATE,
    dateDivorced DATE,
    isDivorced BOOLEAN,
    reasonForDivorced VARCHAR(255),
    haveAnyDiseases BOOLEAN,
    descriptionOfDiseases TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (heightId) REFERENCES HeightLookup(id)
);

-- 15. Uploaded Documents
CREATE TABLE UploadedDocument (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    type VARCHAR(50),
    filename VARCHAR(255),
    url VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- 16. Preferred Partner Choice
CREATE TABLE PrefferedPartnerChoice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    minHeightId INT,
    maxHeightId INT,
    minAge INT,
    maxAge INT,
    expectedSalaryId INT,
    salaryType VARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (minHeightId) REFERENCES HeightLookup(id),
    FOREIGN KEY (maxHeightId) REFERENCES HeightLookup(id),
    FOREIGN KEY (expectedSalaryId) REFERENCES SalaryRange(id)
);

-- 17. Profile Pictures
CREATE TABLE ProfilePicture (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    filename VARCHAR(255),
    isProfilePic BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- 18. Relative Contacts
CREATE TABLE RelativeContact (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,
    type VARCHAR(50),
    fullname VARCHAR(50),
    phoneNumber VARCHAR(15),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

-- 19. Favourite Person
CREATE TABLE FavouritePerson (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId CHAR(36) NOT NULL,                 -- owner
    favouritePersonId CHAR(36) NOT NULL,     -- who is favorited
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (favouritePersonId) REFERENCES Users(userId)
);


