-- 1. Height Lookup
HeightLookup (
  id INT PK,
  label VARCHAR(50),      -- e.g., "6' 0\" (1.83 m)"
  feet INT,
  inches INT,
  meters DECIMAL(4,2)
)

-- 2. Location Hierarchy (India → State → District)

Country (
  id INT PK,
  name VARCHAR(100)       -- e.g., "India"
)

State (
  id INT PK,
  countryId INT FK,
  name VARCHAR(100)       -- e.g., "Tamil Nadu"
)

District (
  id INT PK,
  stateId INT FK,
  name VARCHAR(100)       -- e.g., "Chennai"
)

-- 3. Education Lookup Tables

EducationCategory (
  id INT PK,
  name VARCHAR(100)       -- e.g., "Engineering", "Finance", "Medicine"
)

EducationDegree (
  id INT PK,
  categoryId INT FK,
  degreeName VARCHAR(100) -- e.g., "B.E / B.Tech", "B.Com", "MBBS"
)

-- 4. Occupation Lookup Tables

OccupationSector (
  id INT PK,
  name VARCHAR(100)       -- e.g., "Private Sector", "Government Sector", "Civil Services", "Defence"
)

OccupationCategory (
  id INT PK,
  sectorId INT FK,
  name VARCHAR(100)       -- e.g., "Administration", "Corporate Management"
)

OccupationRole (
  id INT PK,
  categoryId INT FK,
  roleName VARCHAR(100)   -- e.g., "Clerk", "Admin", "Analyst", "HR"
)

-- 5. Salary Range Lookup

SalaryRange (
  id INT PK,
  minSalary DECIMAL(10,2),  -- store yearly INR
  maxSalary DECIMAL(10,2),
  label VARCHAR(50)         -- e.g., "0 – 5 LPA"
)


-- 6. Religion → Caste/Subcaste/Kulam
Religion (
  id INT PK,
  name VARCHAR(50)         -- e.g., "Hindu", "Muslim", "Christian"
)


-- 7. Hindu → Caste → Subcaste → Kulam
HinduCaste (
  id INT PK,
  religionId INT FK,       -- points to Religion.id = Hindu
  name VARCHAR(100)        -- e.g., "Brahmin"
)

HinduSubCaste (
  id INT PK,
  casteId INT FK,
  name VARCHAR(100)        -- e.g., "Iyer", "Iyengar"
)

HinduKulam (
  id INT PK,
  subCasteId INT FK,
  name VARCHAR(100)        -- e.g., "Vadama", "Brahacharanam"
)

-- 9. Muslim → Sect → Caste
MuslimSect (
  id INT PK,
  religionId INT FK,       -- points to Religion.id = Muslim
  name VARCHAR(100)        -- e.g., "Sunni", "Shia"
)

MuslimCaste (
  id INT PK,
  sectId INT FK,
  name VARCHAR(100)        -- e.g., "Ansari", "Syed"
)


-- 10. Christian → Sect → Caste
ChristianSect (
  id INT PK,
  religionId INT FK,       -- points to Religion.id = Christian
  name VARCHAR(100)        -- e.g., "Catholic", "Protestant"
)


-- 11. Reservation Categories
ReservationCategory (
  id INT PK,
  name VARCHAR(50)      -- e.g., "General", "OBC", "BC", "MBC", "SC", "ST"
)


-- 12. Caste to Reservation Category Mapping
CasteReservationMapping (
  id INT PK,
  casteId INT FK,        -- links to HinduCaste/MuslimCaste/etc.
  stateId INT FK,        -- since category can vary by state
  reservationCategoryId INT FK
)
