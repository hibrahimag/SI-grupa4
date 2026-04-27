'use strict';

const sequelize = require('../db');
const UserModel = require('./User');
const StudentModel = require('./Student');
const KompanijaModel = require('./Kompanija');
const FakultetModel = require('./Fakultet');
const KoordinatorModel = require('./Koordinator');
const OglasModel = require('./Oglas');
const PrijavaNaPraksuModel = require('./PrijavaNaPraksu');
const PraksaModel = require('./Praksa');
const AktivnostModel = require('./Aktivnost');
const PrisustvoModel = require('./Prisustvo');
const EvaluacijaModel = require('./Evaluacija');
const UgovorModel = require('./Ugovor');
const IzvjestajModel = require('./Izvjestaj');

const User = UserModel(sequelize);
const Student = StudentModel(sequelize);
const Kompanija = KompanijaModel(sequelize);
const Fakultet = FakultetModel(sequelize);
const Koordinator = KoordinatorModel(sequelize);
const Oglas = OglasModel(sequelize);
const PrijavaNaPraksu = PrijavaNaPraksuModel(sequelize);
const Praksa = PraksaModel(sequelize);
const Aktivnost = AktivnostModel(sequelize);
const Prisustvo = PrisustvoModel(sequelize);
const Evaluacija = EvaluacijaModel(sequelize);
const Ugovor = UgovorModel(sequelize);
const Izvjestaj = IzvjestajModel(sequelize);

//relacije
User.hasOne(Student, { foreignKey: 'userID' });
Student.belongsTo(User, { foreignKey: 'userID' });

User.hasOne(Kompanija, { foreignKey: 'userID' });
Kompanija.belongsTo(User, { foreignKey: 'userID' });

User.hasOne(Koordinator, { foreignKey: 'userID' });
Koordinator.belongsTo(User, { foreignKey: 'userID' });

Fakultet.hasMany(Koordinator, { foreignKey: 'fakultetID' });
Koordinator.belongsTo(Fakultet, { foreignKey: 'fakultetID' });

Fakultet.hasMany(Student, { foreignKey: 'fakultetID' });
Student.belongsTo(Fakultet, { foreignKey: 'fakultetID' });

Kompanija.hasMany(Oglas, { foreignKey: 'kompanijaID' });
Oglas.belongsTo(Kompanija, { foreignKey: 'kompanijaID' });

Student.hasMany(PrijavaNaPraksu, { foreignKey: 'studentID' });
PrijavaNaPraksu.belongsTo(Student, { foreignKey: 'studentID' });

Oglas.hasMany(PrijavaNaPraksu, { foreignKey: 'oglasID' });
PrijavaNaPraksu.belongsTo(Oglas, { foreignKey: 'oglasID' });

Koordinator.hasMany(PrijavaNaPraksu, { foreignKey: 'koordinatorID' });
PrijavaNaPraksu.belongsTo(Koordinator, { foreignKey: 'koordinatorID' });

PrijavaNaPraksu.hasOne(Praksa, { foreignKey: 'prijavaID' });
Praksa.belongsTo(PrijavaNaPraksu, { foreignKey: 'prijavaID' });

Praksa.hasMany(Aktivnost, { foreignKey: 'praksaID' });
Aktivnost.belongsTo(Praksa, { foreignKey: 'praksaID' });


Praksa.hasMany(Prisustvo, { foreignKey: 'praksaID' });
Prisustvo.belongsTo(Praksa, { foreignKey: 'praksaID' });

Praksa.hasMany(Evaluacija, { foreignKey: 'praksaID' });
Evaluacija.belongsTo(Praksa, { foreignKey: 'praksaID' });

Praksa.hasOne(Ugovor, { foreignKey: 'praksaID' });
Ugovor.belongsTo(Praksa, { foreignKey: 'praksaID' });

Praksa.hasMany(Izvjestaj, { foreignKey: 'praksaID' });
Izvjestaj.belongsTo(Praksa, { foreignKey: 'praksaID' });

Koordinator.hasMany(Izvjestaj, { foreignKey: 'koordinatorID' });
Izvjestaj.belongsTo(Koordinator, { foreignKey: 'koordinatorID' });

//eksport
module.exports = { sequelize, User, Student, Kompanija, Fakultet, Koordinator, Oglas, PrijavaNaPraksu, Praksa,
     Aktivnost, Prisustvo, Evaluacija, Ugovor, Izvjestaj };
