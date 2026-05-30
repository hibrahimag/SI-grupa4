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
  Ugovor: { findOne: jest.fn(), create: jest.fn() },
}));

jest.mock('../../src/business/services/coordinatorProfile.service', () => ({
  resolveCoordinatorProfile: jest.fn(),
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotification: jest.fn(),
}));

jest.mock('../../src/business/services/notificationPreferences.service', () => ({
  getOrCreatePreferences: jest.fn(),
  canSendInApp: jest.fn(),
  canSendEmail: jest.fn(),
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendPraksaZavrsenaStudentEmail: jest.fn(),
  sendPraksaZavrsenaCompanyEmail: jest.fn(),
}));

const db = require('../../src/infrastructure/database/models');
const notifications = require('../../src/business/services/notifications.service');
const notificationPreferences = require('../../src/business/services/notificationPreferences.service');
const emailService = require('../../src/business/services/email.service');
const {
  calculatePracticeDates,
  practiceLifecycleStatus,
  ensurePracticeForApplication,
  completeExpiredPractices,
  getStudentPractices,
  getPracticeContract,
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

  test('praksa čiji je kraj jučer je završena', () => {
    expect(practiceLifecycleStatus(
      { datumPocetka: '2026-05-01', datumKraja: '2026-05-25' },
      '2026-05-26'
    )).toBe('ZAVRSENA');
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

function makeExpiredPracticeRow(overrides = {}) {
  return {
    id: 1,
    prijavaID: 100,
    datumPocetka: new Date('2026-05-01T00:00:00.000Z'),
    datumKraja: new Date('2026-05-25T00:00:00.000Z'),
    datumOdustajanja: null,
    datumObavijestiZavrsetka: null,
    update: jest.fn().mockResolvedValue(undefined),
    PrijavaNaPraksu: {
      id: 100,
      status: 'ODOBRENA',
      koordinatorStatus: 'ODOBRENO',
      kompanijaStatus: 'ODOBRENO',
      studentStatus: 'PRIHVACENO',
      Student: {
        id: 20,
        User: { id: 3, ime: 'Amina', prezime: 'Begić', email: 'student@test.com' },
      },
      Oglas: {
        id: 10,
        naziv: 'Backend praksa',
        Kompanija: {
          id: 5,
          naziv: 'Firma d.o.o.',
          User: { email: 'company@test.com' },
        },
      },
    },
    ...overrides,
  };
}

// ── completeExpiredPractices ──────────────────────────────────────────────────
describe('completeExpiredPractices', () => {
  beforeEach(() => {
    notificationPreferences.getOrCreatePreferences.mockResolvedValue({});
    notificationPreferences.canSendInApp.mockReturnValue(true);
    notificationPreferences.canSendEmail.mockReturnValue(true);
    notifications.createNotification.mockResolvedValue({});
    emailService.sendPraksaZavrsenaStudentEmail.mockResolvedValue(undefined);
    emailService.sendPraksaZavrsenaCompanyEmail.mockResolvedValue(undefined);
  });

  test('šalje obavijesti i označava praksu kao obaviještenu', async () => {
    const row = makeExpiredPracticeRow();
    db.Praksa.findAll.mockResolvedValue([row]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result).toEqual({ processed: 1, errors: [] });
    expect(notifications.createNotification).toHaveBeenCalledWith(
      20,
      100,
      'PRAKSA_ZAVRSENA',
      'Praksa je završena',
      expect.stringContaining('Backend praksa')
    );
    expect(emailService.sendPraksaZavrsenaStudentEmail).toHaveBeenCalledWith(
      'student@test.com',
      'Backend praksa',
      'Firma d.o.o.',
      '25.05.2026.'
    );
    expect(emailService.sendPraksaZavrsenaCompanyEmail).toHaveBeenCalledWith(
      'company@test.com',
      'Amina Begić',
      'Backend praksa',
      '25.05.2026.'
    );
    expect(row.update).toHaveBeenCalledWith({ datumObavijestiZavrsetka: expect.any(Date) });
  });

  test('ne obrađuje praksu kada nema isteklih zapisa', async () => {
    db.Praksa.findAll.mockResolvedValue([]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result).toEqual({ processed: 0, errors: [] });
    expect(notifications.createNotification).not.toHaveBeenCalled();
    expect(emailService.sendPraksaZavrsenaStudentEmail).not.toHaveBeenCalled();
  });

  test('preskače praksu koja još nije završena prema lifecycle statusu', async () => {
    const row = makeExpiredPracticeRow({
      datumKraja: new Date('2026-05-26T00:00:00.000Z'),
    });
    db.Praksa.findAll.mockResolvedValue([row]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result).toEqual({ processed: 0, errors: [] });
    expect(row.update).not.toHaveBeenCalled();
  });

  test('vraća grešku bez prekida ostalih praksi', async () => {
    const failingRow = makeExpiredPracticeRow({ id: 1 });
    const successRow = makeExpiredPracticeRow({ id: 2 });
    failingRow.update.mockRejectedValue(new Error('DB greška'));
    db.Praksa.findAll.mockResolvedValue([failingRow, successRow]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result.processed).toBe(1);
    expect(result.errors).toEqual([{ praksaId: 1, message: 'DB greška' }]);
    expect(successRow.update).toHaveBeenCalled();
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

function makeConfirmedPracticeRow() {
  return {
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
  };
}

// ── getPracticeContract ──────────────────────────────────────────────────────
describe('getPracticeContract', () => {
  test('studentu generiše bosanski ugovor za potvrđenu praksu', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Ugovor.findOne.mockResolvedValue(null);
    db.Ugovor.create.mockResolvedValue({
      id: 31,
      praksaID: 1,
      status: 'KREIRAN',
      datumKreiranja: new Date('2026-05-26T00:00:00.000Z'),
    });

    const result = await getPracticeContract(1, 'STUDENT', '1');

    expect(db.Ugovor.create).toHaveBeenCalledWith({
      praksaID: 1,
      status: 'KREIRAN',
      dokumentUrl: null,
    });
    expect(result.created).toBe(true);
    expect(result.ugovor.broj).toBe('UG-31');
    expect(result.sadrzaj).toContain('UGOVOR O OBAVLJANJU STRUČNE PRAKSE');
    expect(result.sadrzaj).toContain('Student: Amina Begić');
    expect(result.sadrzaj).toContain('Kompanija: Firma d.o.o.');
    expect(result.sadrzaj).toContain('sistema PraksaHub');
  });

  test('kompaniji vraća već kreiran ugovor bez duplikata', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Ugovor.findOne.mockResolvedValue({
      id: 31,
      praksaID: 1,
      status: 'KREIRAN',
      datumKreiranja: new Date('2026-05-26T00:00:00.000Z'),
    });

    const result = await getPracticeContract(2, 'COMPANY', 1);

    expect(result.created).toBe(false);
    expect(db.Ugovor.create).not.toHaveBeenCalled();
    expect(result.sadrzaj).toContain('Predmet ovog ugovora je obavljanje stručne prakse');
  });

  test('ne generiše ugovor za praksu koja nije dostupna korisniku', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([]);

    await expect(getPracticeContract(1, 'STUDENT', 99))
      .rejects.toMatchObject({ message: 'Praksa nije pronađena.', status: 404 });
    expect(db.Ugovor.findOne).not.toHaveBeenCalled();
  });
});
