'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  Notifikacija: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  },
  Student: {
    findOne: jest.fn(),
  },
}));

const db = require('../../src/infrastructure/database/models');
const {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../../src/business/services/notifications.service');

beforeEach(() => jest.clearAllMocks());

// ── createNotification ────────────────────────────────────────────────────────
describe('createNotification', () => {
  // Testira: kreira novu notifikaciju kada ne postoji duplikat
  // Ulaz: studentId=1, prijavaId=10, tip='PRIJAVA_PROSLIJEDJENA_KOMPANIJI'
  // Očekivani izlaz: Notifikacija.create pozvan, vraća kreiran objekt
  test('kreira notifikaciju kada nema duplikata', async () => {
    db.Notifikacija.findOne.mockResolvedValue(null);
    const mockNotif = { id: 1, naslov: 'Test' };
    db.Notifikacija.create.mockResolvedValue(mockNotif);

    const result = await createNotification(1, 10, 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI', 'Test', 'Poruka');

    expect(db.Notifikacija.findOne).toHaveBeenCalledWith({
      where: { student_id: 1, prijava_id: 10, tip: 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI' },
    });
    expect(db.Notifikacija.create).toHaveBeenCalled();
    expect(result).toBe(mockNotif);
  });

  // Testira: ne kreira duplikat notifikacije za isti student+prijava+tip
  // Ulaz: duplikat već postoji u bazi
  // Očekivani izlaz: vraća null, Notifikacija.create se ne poziva
  test('vraća null i ne kreira kada duplikat postoji', async () => {
    db.Notifikacija.findOne.mockResolvedValue({ id: 99 });

    const result = await createNotification(1, 10, 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI', 'Test', 'Poruka');

    expect(result).toBeNull();
    expect(db.Notifikacija.create).not.toHaveBeenCalled();
  });

  // Testira: kada nema prijavaId, preskače provjeru duplikata
  // Ulaz: prijavaId=null
  // Očekivani izlaz: Notifikacija.findOne se ne poziva, direktno kreira
  test('bez prijavaId preskače provjeru duplikata i direktno kreira', async () => {
    const mockNotif = { id: 2, naslov: 'Test bez prijave' };
    db.Notifikacija.create.mockResolvedValue(mockNotif);

    const result = await createNotification(1, null, 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI', 'Test', 'Poruka');

    expect(db.Notifikacija.findOne).not.toHaveBeenCalled();
    expect(db.Notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: 1, prijava_id: null, procitana: false })
    );
    expect(result).toBe(mockNotif);
  });

  // Testira: create se poziva s ispravnim podacima
  test('create se poziva s ispravnim podacima', async () => {
    db.Notifikacija.findOne.mockResolvedValue(null);
    db.Notifikacija.create.mockResolvedValue({});

    await createNotification(5, 20, 'PRIJAVA_ODBIJENA', 'Odbijena', 'Vaša prijava je odbijena.');

    expect(db.Notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 5,
        prijava_id: 20,
        tip: 'PRIJAVA_ODBIJENA',
        naslov: 'Odbijena',
        poruka: 'Vaša prijava je odbijena.',
        procitana: false,
      })
    );
  });
});

// ── getMyNotifications ────────────────────────────────────────────────────────
describe('getMyNotifications', () => {
  // Testira: vraća notifikacije studenta kada Student postoji
  // Ulaz: userId=5, student s id=20, Notifikacija.findAll vraća 2 notifikacije
  // Očekivani izlaz: niz s 2 notifikacije
  test('vraća notifikacije kada student postoji', async () => {
    db.Student.findOne.mockResolvedValue({ id: 20 });
    const mockNotifs = [{ id: 1 }, { id: 2 }];
    db.Notifikacija.findAll.mockResolvedValue(mockNotifs);

    const result = await getMyNotifications(5);

    expect(db.Student.findOne).toHaveBeenCalledWith({ where: { userID: 5 } });
    expect(db.Notifikacija.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { student_id: 20 } })
    );
    expect(result).toBe(mockNotifs);
  });

  // Testira: vraća prazan niz kada Student ne postoji
  // Ulaz: userId=999, Student.findOne vraća null
  // Očekivani izlaz: []
  test('vraća prazan niz kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);

    const result = await getMyNotifications(999);

    expect(result).toEqual([]);
    expect(db.Notifikacija.findAll).not.toHaveBeenCalled();
  });

  // Testira: sortira po created_at DESC i ograničava na 50
  test('sortira notifikacije po created_at DESC s limitom 50', async () => {
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Notifikacija.findAll.mockResolvedValue([]);

    await getMyNotifications(5);

    expect(db.Notifikacija.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        order: [['created_at', 'DESC']],
        limit: 50,
      })
    );
  });
});

// ── markAsRead ────────────────────────────────────────────────────────────────
describe('markAsRead', () => {
  // Testira: označava notifikaciju kao pročitanu s ispravnim where klauzulama
  // Ulaz: id='42', userId=5, student.id=20
  // Očekivani izlaz: Notifikacija.update pozvan s procitana=true, id='42', student_id=20
  test('označava notifikaciju s ispravnim where klauzulama', async () => {
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Notifikacija.update.mockResolvedValue([1]);

    await markAsRead('42', 5);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { id: '42', student_id: 20 } }
    );
  });

  // Testira: ne poziva update kada student ne postoji
  // Ulaz: userId=999, Student.findOne vraća null
  // Očekivani izlaz: Notifikacija.update se ne poziva
  test('ne poziva update kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);

    await markAsRead('42', 999);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });
});

// ── markAllAsRead ─────────────────────────────────────────────────────────────
describe('markAllAsRead', () => {
  // Testira: označava sve nepročitane notifikacije studenta kao pročitane
  // Ulaz: userId=5, student.id=20
  // Očekivani izlaz: Notifikacija.update pozvan s procitana=false filter
  test('označava sve nepročitane notifikacije', async () => {
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Notifikacija.update.mockResolvedValue([3]);

    await markAllAsRead(5);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { student_id: 20, procitana: false } }
    );
  });

  // Testira: ne poziva update kada student ne postoji
  test('ne poziva update kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);

    await markAllAsRead(999);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });
});
