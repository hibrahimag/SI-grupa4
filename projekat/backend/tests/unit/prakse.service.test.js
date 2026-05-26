'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findByPk: jest.fn() },
  Student: { findOne: jest.fn() },
  Kompanija: { findOne: jest.fn() },
  Fakultet: {},
  Odsjek: {},
  Oglas: {},
  PrijavaNaPraksu: { findAll: jest.fn() },
  Praksa: { findOne: jest.fn(), findAll: jest.fn(), create: jest.fn() },
}));

jest.mock('../../src/business/services/coordinatorProfile.service', () => ({
  resolveCoordinatorProfile: jest.fn(),
}));

const db = require('../../src/infrastructure/database/models');
const {
  calculatePracticeDates,
  practiceLifecycleStatus,
  ensurePracticeForApplication,
  getStudentPractices,
} = require('../../src/business/services/prakse.service');

beforeEach(() => jest.clearAllMocks());

// ── calculatePracticeDates ────────────────────────────────────────────────────
describe('calculatePracticeDates', () => {
  // Testira: trajanje predstavlja inkluzivni broj kalendarskih mjeseci
  // Ulaz: početak 01.06.2026. i trajanje 1 mjesec
  // Očekivani izlaz: završetak 30.06.2026.
  test('računa inkluzivan kraj kalendarskog mjeseca', () => {
    const result = calculatePracticeDates('2026-06-01', 1);
    expect(result.datumPocetka).toBe('2026-06-01');
    expect(result.datumKraja).toBe('2026-06-30');
  });

  // Testira: helper ne prelazi u naredni mjesec kod kraćeg mjeseca
  // Ulaz: početak 31.01.2026. i trajanje 1 mjesec
  // Očekivani izlaz: završetak posljednji dan februara
  test('sigurno obrađuje kraj kraćeg mjeseca', () => {
    expect(calculatePracticeDates('2026-01-31', 1).datumKraja).toBe('2026-02-28');
  });

  test('baca jasnu grešku za nevažeće trajanje', () => {
    expect(() => calculatePracticeDates('2026-06-01', 0))
      .toThrow('Nije moguće odrediti datum završetka prakse iz unesenog trajanja.');
  });
});

// ── practiceLifecycleStatus ───────────────────────────────────────────────────
describe('practiceLifecycleStatus', () => {
  test('praksa koja počinje ili završava danas je aktivna', () => {
    expect(practiceLifecycleStatus(
      { datumPocetka: '2026-05-26', datumKraja: '2026-05-26' },
      '2026-05-26'
    )).toBe('AKTIVNA');
  });

  test('odustajanje ima prednost nad datumskim stanjem', () => {
    expect(practiceLifecycleStatus(
      { datumPocetka: '2026-05-01', datumKraja: '2026-06-01', datumOdustajanja: '2026-05-10' },
      '2026-05-26'
    )).toBe('ODUSTAO');
  });
});

// ── ensurePracticeForApplication ──────────────────────────────────────────────
describe('ensurePracticeForApplication', () => {
  test('koristi postojeću praksu bez kreiranja duplikata', async () => {
    const existing = { id: 7, prijavaID: 9 };
    db.Praksa.findOne.mockResolvedValue(existing);

    const result = await ensurePracticeForApplication(
      { id: 9 },
      { datumPocetka: null, trajanje: null }
    );

    expect(result).toBe(existing);
    expect(db.Praksa.create).not.toHaveBeenCalled();
  });

  test('kreira praksu s datumima oglasa kada praksa ne postoji', async () => {
    db.Praksa.findOne.mockResolvedValue(null);
    db.Praksa.create.mockImplementation(async (data) => data);

    await ensurePracticeForApplication(
      { id: 9 },
      { datumPocetka: '2026-06-01', trajanje: 1 }
    );

    expect(db.Praksa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        prijavaID: 9,
        datumPocetka: new Date('2026-06-01T00:00:00.000Z'),
        datumKraja: new Date('2026-06-30T00:00:00.000Z'),
      }),
      { transaction: undefined }
    );
  });
});

// ── getStudentPractices ───────────────────────────────────────────────────────
describe('getStudentPractices', () => {
  // Testira regresiju: Sequelize pripadajući oglas mapira kao Ogla
  // Ulaz: praksa čija prijava nosi Ogla.Kompanija relaciju
  // Očekivani izlaz: DTO s stvarnim nazivom oglasa i kompanije
  test('mapira Ogla alias u stvarne detalje oglasa i kompanije', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([{
      id: 1,
      prijavaID: 100,
      datumPocetka: new Date('2026-06-01T00:00:00.000Z'),
      datumKraja: new Date('2026-06-30T00:00:00.000Z'),
      datumOdustajanja: null,
      PrijavaNaPraksu: {
        status: 'ODOBRENA',
        koordinatorStatus: 'ODOBRENO',
        kompanijaStatus: 'ODOBRENO',
        studentStatus: 'PRIHVACENO',
        Student: {
          id: 20,
          index_number: 'IB210001',
          User: { ime: 'Amina', prezime: 'Begić' },
          Fakultet: { naziv: 'ETF' },
          Odsjek: { naziv: 'RI' },
        },
        Ogla: {
          id: 10,
          naziv: 'Backend praksa',
          Kompanija: { id: 5, naziv: 'Firma d.o.o.' },
        },
      },
    }]);

    const result = await getStudentPractices(1, 'all');

    expect(result.prakse[0]).toMatchObject({
      oglas: { id: 10, naziv: 'Backend praksa' },
      kompanija: { id: 5, naziv: 'Firma d.o.o.' },
      student: { ime: 'Amina', prezime: 'Begić' },
    });
  });
});
