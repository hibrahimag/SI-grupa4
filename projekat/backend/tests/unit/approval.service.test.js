'use strict';

jest.useFakeTimers().setSystemTime(new Date('2026-05-07T12:00:00.000Z'));

jest.mock('../../src/infrastructure/database/models', () => ({
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendAccountApprovedEmail: jest.fn().mockResolvedValue(undefined),
  sendAccountRejectedEmail: jest.fn().mockResolvedValue(undefined),
}));

const { User } = require('../../src/infrastructure/database/models');
const {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
} = require('../../src/business/services/email.service');
const {
  getUserApprovalRequests,
  getUserApprovalRequestById,
  approveUserRequest,
  rejectUserRequest,
} = require('../../src/business/services/approval.service');

function makeApprovalUser(overrides = {}) {
  return {
    id: 1,
    ime: 'Haris',
    prezime: 'Husic',
    email: 'haris@test.com',
    role: 'STUDENT',
    status: 'PENDING',
    approvalStatus: 'PENDING_APPROVAL',
    approvalRequestedAt: new Date('2026-05-06T11:00:00.000Z'),
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    emailVerifikovan: true,
    created_at: new Date('2026-05-06T10:00:00.000Z'),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());
afterAll(() => jest.useRealTimers());

describe('getUserApprovalRequests', () => {
  test('vraca mapirane pending zahtjeve i oznacava overdue zahtjev', async () => {
    const overdueUser = makeApprovalUser({
      approvalRequestedAt: new Date('2026-05-05T10:00:00.000Z'),
    });
    const currentUser = makeApprovalUser({ id: 2, email: 'ana@test.com' });
    User.findAll.mockResolvedValue([overdueUser, currentUser]);

    const result = await getUserApprovalRequests();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 1,
      email: 'haris@test.com',
      approvalStatus: 'PENDING_APPROVAL',
      overdue: true,
    });
    expect(result[1].overdue).toBe(false);
    expect(User.findAll).toHaveBeenCalledWith({
      where: { approvalStatus: 'PENDING_APPROVAL', emailVerifikovan: true },
      order: [['approvalRequestedAt', 'ASC'], ['created_at', 'ASC']],
    });
  });

  test('koristi created_at kao fallback za approvalRequestedAt', async () => {
    User.findAll.mockResolvedValue([
      makeApprovalUser({
        approvalRequestedAt: null,
        created_at: new Date('2026-05-05T10:00:00.000Z'),
      }),
    ]);

    const [result] = await getUserApprovalRequests();

    expect(result.approvalRequestedAt).toEqual(new Date('2026-05-05T10:00:00.000Z'));
    expect(result.overdue).toBe(true);
  });
});

describe('getUserApprovalRequestById', () => {
  test('vraca mapiran zahtjev za validnog pending korisnika', async () => {
    User.findByPk.mockResolvedValue(makeApprovalUser());

    const result = await getUserApprovalRequestById(1);

    expect(result).toMatchObject({
      id: 1,
      ime: 'Haris',
      email: 'haris@test.com',
      overdue: false,
    });
  });

  test('baca 404 ako korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(getUserApprovalRequestById(999)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 400 ako email nije verifikovan', async () => {
    User.findByPk.mockResolvedValue(makeApprovalUser({ emailVerifikovan: false }));

    await expect(getUserApprovalRequestById(1)).rejects.toMatchObject({ status: 400 });
  });

  test('baca 409 ako zahtjev vise nije na cekanju', async () => {
    User.findByPk.mockResolvedValue(makeApprovalUser({ approvalStatus: 'APPROVED' }));

    await expect(getUserApprovalRequestById(1)).rejects.toMatchObject({ status: 409 });
  });
});

describe('approveUserRequest', () => {
  test('baca 400 za rolu koja se ne smije dodijeliti', async () => {
    await expect(approveUserRequest(1, 'ADMIN', 9)).rejects.toMatchObject({ status: 400 });
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test('baca 404 ako korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(approveUserRequest(999, 'STUDENT', 9)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 409 ako zahtjev vise nije pending', async () => {
    User.findByPk.mockResolvedValue(makeApprovalUser({ approvalStatus: 'APPROVED' }));

    await expect(approveUserRequest(1, 'STUDENT', 9)).rejects.toMatchObject({ status: 409 });
  });

  test('baca 403 ako korisnik odobrava vlastiti racun', async () => {
    User.findByPk.mockResolvedValue(makeApprovalUser({ id: 9 }));

    await expect(approveUserRequest(9, 'STUDENT', 9)).rejects.toMatchObject({ status: 403 });
  });

  test('odobri zahtjev, sacuva korisnika i posalje email', async () => {
    const user = makeApprovalUser({
      rejectedBy: 2,
      rejectedAt: new Date('2026-05-06T10:00:00.000Z'),
      rejectionReason: 'Nije kompletno',
    });
    User.findByPk.mockResolvedValue(user);

    const result = await approveUserRequest(1, 'COORDINATOR', 9);

    expect(user.role).toBe('COORDINATOR');
    expect(user.status).toBe('ACTIVE');
    expect(user.approvalStatus).toBe('APPROVED');
    expect(user.approvedBy).toBe(9);
    expect(user.approvedAt).toBeInstanceOf(Date);
    expect(user.rejectedBy).toBeNull();
    expect(user.rejectedAt).toBeNull();
    expect(user.rejectionReason).toBeNull();
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(sendAccountApprovedEmail).toHaveBeenCalledWith('haris@test.com', 'COORDINATOR');
    expect(result).toMatchObject({ role: 'COORDINATOR', status: 'ACTIVE' });
  });
});

describe('rejectUserRequest', () => {
  test('baca 400 ako razlog nije proslijedjen', async () => {
    await expect(rejectUserRequest(1, '   ', 9)).rejects.toMatchObject({ status: 400 });
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  test('baca 404 ako korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(rejectUserRequest(999, 'Nije kompletno', 9)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 403 ako korisnik odbija vlastiti racun', async () => {
    User.findByPk.mockResolvedValue(makeApprovalUser({ id: 9 }));

    await expect(rejectUserRequest(9, 'Nije kompletno', 9)).rejects.toMatchObject({ status: 403 });
  });

  test('odbije zahtjev, trimuje razlog i posalje email', async () => {
    const user = makeApprovalUser({
      approvedBy: 2,
      approvedAt: new Date('2026-05-06T10:00:00.000Z'),
    });
    User.findByPk.mockResolvedValue(user);

    const result = await rejectUserRequest(1, '  Nedostaju dokumenti  ', 9);

    expect(user.status).toBe('DEACTIVATED');
    expect(user.approvalStatus).toBe('REJECTED');
    expect(user.rejectedBy).toBe(9);
    expect(user.rejectedAt).toBeInstanceOf(Date);
    expect(user.rejectionReason).toBe('Nedostaju dokumenti');
    expect(user.approvedBy).toBeNull();
    expect(user.approvedAt).toBeNull();
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(sendAccountRejectedEmail).toHaveBeenCalledWith('haris@test.com', 'Nedostaju dokumenti');
    expect(result).toMatchObject({
      status: 'DEACTIVATED',
      approvalStatus: 'REJECTED',
      rejectionReason: 'Nedostaju dokumenti',
    });
  });
});
