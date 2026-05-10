'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  PrijavaNaPraksu: {
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Praksa: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
  Student: {
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
  Koordinator: {
    findOne: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  Oglas: {},
  Kompanija: {},
  Odsjek: {},
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendAccountApprovedEmail: jest.fn().mockResolvedValue(undefined),
  sendAccountRejectedEmail: jest.fn().mockResolvedValue(undefined),
}));

const db = require('../../src/infrastructure/database/models');
const {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
} = require('../../src/business/services/email.service');
const {
  getDashboardStats,
  getPrijave,
  getPrijavaById,
  odluciOPrijavi,
  getStudenti,
  getPrakse,
  approveStudent,
  rejectStudent,
} = require('../../src/business/services/koordinator.service');

// ── Helper funkcije ───────────────────────────────────────────────────────────
function makeMockUser(overrides = {}) {
  return {
    id: 10,
    ime: 'Amina',
    prezime: 'Begić',
    email: 'amina@test.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    approvalStatus: 'PENDING_APPROVAL',
    emailVerifikovan: true,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeMockKoordinator(overrides = {}) {
  return { id: 1, userID: 1, fakultetID: 5, ...overrides };
}

function makeMockStudent(overrides = {}) {
  return {
    id: 20,
    userID: 10,
    fakultetID: 5,
    index_number: 'IB210001',
    year_of_study: 3,
    odsjekID: 2,
    ...overrides,
  };
}

function makeMockPrijava(overrides = {}) {
  return {
    id: 100,
    status: 'PODNESENA',
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ── getDashboardStats ─────────────────────────────────────────────────────────
describe('getDashboardStats', () => {
  // Testira: funkcija agregira sve statistike iz baze i vraća ispravan objekat
  // Ulaz: svi count mockovi vraćaju brojeve
  // Očekivani izlaz: objekat s ukupno, podnesene, odobrene, odbijene, aktivnePrakse, zavrsene
  test('vraća ispravne statistike', async () => {
    db.PrijavaNaPraksu.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);
    db.Praksa.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1);

    const result = await getDashboardStats();

    expect(result).toEqual({
      ukupno: 10,
      podnesene: 3,
      odobrene: 5,
      odbijene: 2,
      aktivnePrakse: 4,
      zavrsene: 1,
    });
  });

  // Testira: funkcija poziva count sa ispravnim where filterima
  // Ulaz: svi count mockovi vraćaju 0
  // Očekivani izlaz: PrijavaNaPraksu.count pozvan 4 puta s ispravnim statusima
  test('poziva count s ispravnim where filterima', async () => {
    db.PrijavaNaPraksu.count.mockResolvedValue(0);
    db.Praksa.count.mockResolvedValue(0);

    await getDashboardStats();

    expect(db.PrijavaNaPraksu.count).toHaveBeenCalledTimes(4);
    expect(db.PrijavaNaPraksu.count).toHaveBeenCalledWith({ where: { status: 'PODNESENA' } });
    expect(db.PrijavaNaPraksu.count).toHaveBeenCalledWith({ where: { status: 'ODOBRENA' } });
    expect(db.PrijavaNaPraksu.count).toHaveBeenCalledWith({ where: { status: 'ODBIJENA' } });
  });

  // Testira: funkcija propagira grešku kada DB baci exception
  // Ulaz: PrijavaNaPraksu.count baca Error
  // Očekivani izlaz: getDashboardStats baca istu grešku
  test('propagira grešku iz baze', async () => {
    db.PrijavaNaPraksu.count.mockRejectedValue(new Error('DB error'));

    await expect(getDashboardStats()).rejects.toThrow('DB error');
  });
});

// ── getPrijave ────────────────────────────────────────────────────────────────
describe('getPrijave', () => {
  // Testira: funkcija vraća paginiran rezultat s ispravnim metapodacima
  // Ulaz: { stranica: 1, limit: 15 }, findAndCountAll vraća count=20 i 15 redova
  // Očekivani izlaz: objekat s prijave, ukupno=20, stranice=2, trenutnaStranica=1
  test('vraća paginiran rezultat s ispravnim metapodacima', async () => {
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({
      count: 20,
      rows: Array(15).fill(makeMockPrijava()),
    });

    const result = await getPrijave({ stranica: 1, limit: 15 });

    expect(result.ukupno).toBe(20);
    expect(result.stranice).toBe(2);
    expect(result.trenutnaStranica).toBe(1);
    expect(result.prijave).toHaveLength(15);
  });

  // Testira: funkcija prosljeđuje status filter u where klauzulu
  // Ulaz: { status: 'PODNESENA', stranica: 1, limit: 15 }
  // Očekivani izlaz: findAndCountAll pozvan s where: { status: 'PODNESENA' }
  test('prosljeđuje status filter u where klauzulu', async () => {
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await getPrijave({ status: 'PODNESENA', stranica: 1, limit: 15 });

    expect(db.PrijavaNaPraksu.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PODNESENA' } })
    );
  });

  // Testira: funkcija ne dodaje where filter kada status nije proslijeđen
  // Ulaz: { stranica: 1, limit: 15 } bez statusa
  // Očekivani izlaz: findAndCountAll pozvan s where: {}
  test('ne filtrira po statusu kada nije proslijeđen', async () => {
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await getPrijave({ stranica: 1, limit: 15 });

    expect(db.PrijavaNaPraksu.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  // Testira: ispravno računa offset za drugu stranicu
  // Ulaz: { stranica: 2, limit: 10 }
  // Očekivani izlaz: findAndCountAll pozvan s offset: 10
  test('ispravno računa offset za drugu stranicu', async () => {
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await getPrijave({ stranica: 2, limit: 10 });

    expect(db.PrijavaNaPraksu.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10, limit: 10 })
    );
  });
});

// ── getPrijavaById ────────────────────────────────────────────────────────────
describe('getPrijavaById', () => {
  // Testira: funkcija vraća prijavu kada postoji u bazi
  // Ulaz: id=100, findByPk vraća prijavu
  // Očekivani izlaz: objekat prijave s id=100
  test('vraća prijavu kada postoji', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makeMockPrijava());

    const result = await getPrijavaById(100);

    expect(result.id).toBe(100);
  });

  // Testira: funkcija baca NOT_FOUND grešku kada prijava ne postoji
  // Ulaz: id=999, findByPk vraća null
  // Očekivani izlaz: baca Error s porukom 'NOT_FOUND'
  test('baca NOT_FOUND kada prijava ne postoji', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);

    await expect(getPrijavaById(999)).rejects.toThrow('NOT_FOUND');
  });
});

// ── odluciOPrijavi ────────────────────────────────────────────────────────────
describe('odluciOPrijavi', () => {
  // Testira: funkcija postavlja status ODOBRENA i poziva update
  // Ulaz: id=100, odluka='odobrena', razlog='', koordinatorUserId=1
  // Očekivani izlaz: { id: 100, status: 'ODOBRENA' }, update pozvan s ispravnim podacima
  test('odobrava prijavu i postavlja status ODOBRENA', async () => {
    const prijava = makeMockPrijava();
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    const result = await odluciOPrijavi(100, 'odobrena', '', 1);

    expect(result).toEqual({ id: 100, status: 'ODOBRENA' });
    expect(prijava.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ODOBRENA', razlogOdbijanja: null })
    );
  });

  // Testira: funkcija postavlja status ODBIJENA i čuva razlog
  // Ulaz: id=100, odluka='odbijena', razlog='Nepotpuna dokumentacija'
  // Očekivani izlaz: { id: 100, status: 'ODBIJENA' }, update pozvan s razlogom
  test('odbija prijavu i čuva razlog odbijanja', async () => {
    const prijava = makeMockPrijava();
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    const result = await odluciOPrijavi(100, 'odbijena', 'Nepotpuna dokumentacija', 1);

    expect(result).toEqual({ id: 100, status: 'ODBIJENA' });
    expect(prijava.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ODBIJENA',
        razlogOdbijanja: 'Nepotpuna dokumentacija',
      })
    );
  });

  // Testira: funkcija baca NOT_FOUND kada prijava ne postoji
  // Ulaz: findByPk vraća null
  // Očekivani izlaz: baca Error s porukom 'NOT_FOUND'
  test('baca NOT_FOUND kada prijava ne postoji', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);

    await expect(odluciOPrijavi(999, 'odobrena', '', 1)).rejects.toThrow('NOT_FOUND');
  });

  // Testira: funkcija baca INVALID_STATUS kada prijava ima finalni status
  // Ulaz: prijava s statusom 'ODOBRENA' (već finalizirana)
  // Očekivani izlaz: baca Error s porukom 'INVALID_STATUS'
  test('baca INVALID_STATUS kada prijava već ima finalni status', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makeMockPrijava({ status: 'ODOBRENA' }));

    await expect(odluciOPrijavi(100, 'odobrena', '', 1)).rejects.toThrow('INVALID_STATUS');
  });

  // Testira: funkcija prihvata prijavu sa statusom U_RAZMATRANJU
  // Ulaz: prijava s statusom 'U_RAZMATRANJU'
  // Očekivani izlaz: uspješno ažurira bez greške
  test('prihvata prijavu sa statusom U_RAZMATRANJU', async () => {
    const prijava = makeMockPrijava({ status: 'U_RAZMATRANJU' });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    const result = await odluciOPrijavi(100, 'odobrena', '', 1);

    expect(result.status).toBe('ODOBRENA');
  });
});

// ── getStudenti ───────────────────────────────────────────────────────────────
describe('getStudenti', () => {
  // Testira: funkcija filtrira studente po fakultetID koordinatora
  // Ulaz: koordinatorUserId=1, koordinator ima fakultetID=5
  // Očekivani izlaz: Student.findAll pozvan s where: { fakultetID: 5 }
  test('filtrira studente po fakultetID koordinatora', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([makeMockStudent()]);

    await getStudenti(1);

    expect(db.Student.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { fakultetID: 5 } })
    );
  });

  // Testira: funkcija baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji
  // Ulaz: koordinatorUserId=999, Koordinator.findOne vraća null
  // Očekivani izlaz: baca Error s porukom 'KOORDINATOR_NOT_FOUND'
  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(getStudenti(999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.Student.findAll).not.toHaveBeenCalled();
  });

  // Testira: funkcija vraća prazan niz kada nema studenata na fakultetu
  // Ulaz: koordinatorUserId=1, Student.findAll vraća []
  // Očekivani izlaz: []
  test('vraća prazan niz kada nema studenata', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([]);

    const result = await getStudenti(1);

    expect(result).toEqual([]);
  });

  // Testira: pretraga jednom riječju dodaje Op.or filter na ime i prezime
  // Ulaz: koordinatorUserId=1, pretraga='Amina'
  // Očekivani izlaz: Student.findAll pozvan s include koji sadrži where s Op.or
  test('pretraga jednom riječju dodaje filter na ime i prezime', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([]);

    await getStudenti(1, 'Amina');

    const call = db.Student.findAll.mock.calls[0][0];
    const userInclude = call.include.find(i => i.model === db.User);
    const whereKeys = Object.getOwnPropertySymbols(userInclude.where);
    expect(whereKeys.length).toBeGreaterThan(0);
  });
});

// ── getPrakse ─────────────────────────────────────────────────────────────────
describe('getPrakse', () => {
  // Testira: funkcija vraća sve prakse bez filtera kada status nije proslijeđen
  // Ulaz: status='' (prazan string)
  // Očekivani izlaz: Praksa.findAll pozvan s where: {}
  test('vraća sve prakse bez filtera kada status nije proslijeđen', async () => {
    db.Praksa.findAll.mockResolvedValue([]);

    await getPrakse('');

    expect(db.Praksa.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  // Testira: funkcija filtrira prakse po statusu i konvertuje u uppercase
  // Ulaz: status='aktivna' (lowercase)
  // Očekivani izlaz: Praksa.findAll pozvan s where: { status: 'AKTIVNA' }
  test('filtrira prakse po statusu i konvertuje u uppercase', async () => {
    db.Praksa.findAll.mockResolvedValue([]);

    await getPrakse('aktivna');

    expect(db.Praksa.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'AKTIVNA' } })
    );
  });

  // Testira: funkcija vraća prazan niz kada nema praksi
  // Ulaz: Praksa.findAll vraća []
  // Očekivani izlaz: []
  test('vraća prazan niz kada nema praksi', async () => {
    db.Praksa.findAll.mockResolvedValue([]);

    const result = await getPrakse();

    expect(result).toEqual([]);
  });
});

// ── approveStudent ────────────────────────────────────────────────────────────
describe('approveStudent', () => {
  // Testira: funkcija uspješno odobrava studenta i šalje email
  // Ulaz: studentUserId=10, koordinatorUserId=1, sve provjere prolaze
  // Očekivani izlaz: { id: 10, approvalStatus: 'APPROVED' }, save() i email pozvan
  test('uspješno odobrava studenta i šalje email', async () => {
    const user = makeMockUser();
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(user);

    const result = await approveStudent(10, 1);

    expect(user.approvalStatus).toBe('APPROVED');
    expect(user.status).toBe('ACTIVE');
    expect(user.approvedBy).toBe(1);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(sendAccountApprovedEmail).toHaveBeenCalledWith('amina@test.com', 'STUDENT');
    expect(result).toEqual({ id: 10, approvalStatus: 'APPROVED' });
  });

  // Testira: funkcija baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji
  // Ulaz: Koordinator.findOne vraća null
  // Očekivani izlaz: baca Error s porukom 'KOORDINATOR_NOT_FOUND'
  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(approveStudent(10, 999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.Student.findOne).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca STUDENT_NOT_FOUND_OR_WRONG_FACULTY kada student nije s istog fakulteta
  // Ulaz: Student.findOne vraća null (student s drugog fakulteta ili ne postoji)
  // Očekivani izlaz: baca Error s porukom 'STUDENT_NOT_FOUND_OR_WRONG_FACULTY'
  test('baca STUDENT_NOT_FOUND_OR_WRONG_FACULTY za studenta s drugog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(null);

    await expect(approveStudent(10, 1)).rejects.toThrow('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');
    expect(db.User.findByPk).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca EMAIL_NOT_VERIFIED kada student nije verifikovao email
  // Ulaz: user.emailVerifikovan = false
  // Očekivani izlaz: baca Error s porukom 'EMAIL_NOT_VERIFIED'
  test('baca EMAIL_NOT_VERIFIED kada student nije verifikovao email', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ emailVerifikovan: false }));

    await expect(approveStudent(10, 1)).rejects.toThrow('EMAIL_NOT_VERIFIED');
    expect(sendAccountApprovedEmail).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca INVALID_STATUS kada student već nije PENDING_APPROVAL
  // Ulaz: user.approvalStatus = 'APPROVED'
  // Očekivani izlaz: baca Error s porukom 'INVALID_STATUS'
  test('baca INVALID_STATUS kada student već nije PENDING_APPROVAL', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'APPROVED' }));

    await expect(approveStudent(10, 1)).rejects.toThrow('INVALID_STATUS');
    expect(sendAccountApprovedEmail).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca NOT_FOUND kada user nije pronađen ili nije STUDENT
  // Ulaz: User.findByPk vraća null
  // Očekivani izlaz: baca Error s porukom 'NOT_FOUND'
  test('baca NOT_FOUND kada user ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(null);

    await expect(approveStudent(10, 1)).rejects.toThrow('NOT_FOUND');
  });
});

// ── rejectStudent ─────────────────────────────────────────────────────────────
describe('rejectStudent', () => {
  // Testira: funkcija uspješno odbija studenta s razlogom i šalje email
  // Ulaz: studentUserId=10, razlog='Nepotpuna dokumentacija', koordinatorUserId=1
  // Očekivani izlaz: { id: 10, approvalStatus: 'REJECTED' }, save() i email pozvan
  test('uspješno odbija studenta i šalje email', async () => {
    const user = makeMockUser();
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(user);

    const result = await rejectStudent(10, 'Nepotpuna dokumentacija', 1);

    expect(user.approvalStatus).toBe('REJECTED');
    expect(user.status).toBe('DEACTIVATED');
    expect(user.rejectedBy).toBe(1);
    expect(user.rejectionReason).toBe('Nepotpuna dokumentacija');
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(sendAccountRejectedEmail).toHaveBeenCalledWith('amina@test.com', 'Nepotpuna dokumentacija');
    expect(result).toEqual({ id: 10, approvalStatus: 'REJECTED' });
  });

  // Testira: funkcija baca RAZLOG_REQUIRED kada razlog nije proslijeđen
  // Ulaz: razlog=undefined
  // Očekivani izlaz: baca Error s porukom 'RAZLOG_REQUIRED'
  test('baca RAZLOG_REQUIRED kada razlog nije proslijeđen', async () => {
    await expect(rejectStudent(10, undefined, 1)).rejects.toThrow('RAZLOG_REQUIRED');
    expect(db.Koordinator.findOne).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca RAZLOG_REQUIRED kada je razlog prazan string
  // Ulaz: razlog='   ' (samo razmaci)
  // Očekivani izlaz: baca Error s porukom 'RAZLOG_REQUIRED'
  test('baca RAZLOG_REQUIRED kada je razlog prazan string', async () => {
    await expect(rejectStudent(10, '   ', 1)).rejects.toThrow('RAZLOG_REQUIRED');
    expect(db.Koordinator.findOne).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji
  // Ulaz: Koordinator.findOne vraća null
  // Očekivani izlaz: baca Error s porukom 'KOORDINATOR_NOT_FOUND'
  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(rejectStudent(10, 'Razlog', 999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.Student.findOne).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca STUDENT_NOT_FOUND_OR_WRONG_FACULTY za studenta s drugog fakulteta
  // Ulaz: Student.findOne vraća null
  // Očekivani izlaz: baca Error s porukom 'STUDENT_NOT_FOUND_OR_WRONG_FACULTY'
  test('baca STUDENT_NOT_FOUND_OR_WRONG_FACULTY za studenta s drugog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(null);

    await expect(rejectStudent(10, 'Razlog', 1)).rejects.toThrow('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');
    expect(db.User.findByPk).not.toHaveBeenCalled();
  });

  // Testira: funkcija baca INVALID_STATUS kada student već nije PENDING_APPROVAL
  // Ulaz: user.approvalStatus = 'REJECTED'
  // Očekivani izlaz: baca Error s porukom 'INVALID_STATUS'
  test('baca INVALID_STATUS kada student već nije PENDING_APPROVAL', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'REJECTED' }));

    await expect(rejectStudent(10, 'Razlog', 1)).rejects.toThrow('INVALID_STATUS');
    expect(sendAccountRejectedEmail).not.toHaveBeenCalled();
  });
});