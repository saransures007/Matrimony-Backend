// // Height
// const HeightLookup = sequelize.define('HeightLookup', {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   label: DataTypes.STRING,
//   feet: DataTypes.INTEGER,
//   inches: DataTypes.INTEGER,
//   meters: DataTypes.DECIMAL(4,2),
// });

// // Country → State → District
// const Country = sequelize.define('Country', { name: DataTypes.STRING });
// const State = sequelize.define('State', { name: DataTypes.STRING });
// const District = sequelize.define('District', { name: DataTypes.STRING });

// Country.hasMany(State);
// State.belongsTo(Country);
// State.hasMany(District);
// District.belongsTo(State);

// // Education
// const EducationCategory = sequelize.define('EducationCategory', { name: DataTypes.STRING });
// const EducationDegree = sequelize.define('EducationDegree', { degreeName: DataTypes.STRING });
// EducationCategory.hasMany(EducationDegree);
// EducationDegree.belongsTo(EducationCategory);

// // Occupation
// const OccupationSector = sequelize.define('OccupationSector', { name: DataTypes.STRING });
// const OccupationCategory = sequelize.define('OccupationCategory', { name: DataTypes.STRING });
// const OccupationRole = sequelize.define('OccupationRole', { roleName: DataTypes.STRING });

// OccupationSector.hasMany(OccupationCategory);
// OccupationCategory.belongsTo(OccupationSector);
// OccupationCategory.hasMany(OccupationRole);
// OccupationRole.belongsTo(OccupationCategory);

// // Religion + caste trees
// const Religion = sequelize.define('Religion', { name: DataTypes.STRING });
// const HinduCaste = sequelize.define('HinduCaste', { name: DataTypes.STRING });
// const HinduSubCaste = sequelize.define('HinduSubCaste', { name: DataTypes.STRING });
// const HinduKulam = sequelize.define('HinduKulam', { name: DataTypes.STRING });

// Religion.hasMany(HinduCaste);
// HinduCaste.belongsTo(Religion);
// HinduCaste.hasMany(HinduSubCaste);
// HinduSubCaste.belongsTo(HinduCaste);
// HinduSubCaste.hasMany(HinduKulam);
// HinduKulam.belongsTo(HinduSubCaste);
