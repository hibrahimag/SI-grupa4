'use strict';

jest.mock('../../src/business/services/prakse.service');

const prakseService = require('../../src/business/services/prakse.service');
const { generateContract } = require('../../src/business/controllers/prakse.controller');

function makeReq(overrides = {}) {
  return { user: { id: 1, role: 'STUDENT' }, params: { id: '7' }, ...overrides };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('generateContract', () => {
  test('201 - vraća novogenerisani ugovor', async () => {
    const result = { created: true, ugovor: { id: 1 }, sadrzaj: 'UGOVOR' };
    const res = makeRes();
    prakseService.getPracticeContract.mockResolvedValue(result);

    await generateContract(makeReq(), res);

    expect(prakseService.getPracticeContract).toHaveBeenCalledWith(1, 'STUDENT', '7');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  test('200 - vraća ranije generisani ugovor', async () => {
    const result = { created: false, ugovor: { id: 1 }, sadrzaj: 'UGOVOR' };
    const res = makeRes();
    prakseService.getPracticeContract.mockResolvedValue(result);

    await generateContract(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  test('404 - prosljeđuje grešku kada praksa nije dostupna', async () => {
    const error = new Error('Praksa nije pronađena.');
    error.status = 404;
    const res = makeRes();
    prakseService.getPracticeContract.mockRejectedValue(error);

    await generateContract(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Praksa nije pronađena.' });
  });
});
