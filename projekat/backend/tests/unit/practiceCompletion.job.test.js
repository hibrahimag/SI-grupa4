'use strict';

jest.mock('../../src/business/services/prakse.service', () => ({
  completeExpiredPractices: jest.fn(),
}));

const prakseService = require('../../src/business/services/prakse.service');
const { runPracticeCompletionJob } = require('../../src/jobs/practiceCompletion.job');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe('runPracticeCompletionJob', () => {
  test('poziva completeExpiredPractices i logira broj obrađenih praksi', async () => {
    prakseService.completeExpiredPractices.mockResolvedValue({ processed: 2, errors: [] });

    await runPracticeCompletionJob();

    expect(prakseService.completeExpiredPractices).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('[practiceCompletion] Obaviješteno o završetku: 2 praksi');
  });

  test('ne logira kada nema novih završetaka', async () => {
    prakseService.completeExpiredPractices.mockResolvedValue({ processed: 0, errors: [] });

    await runPracticeCompletionJob();

    expect(console.log).not.toHaveBeenCalled();
  });

  test('hvata neočekivane greške bez rušenja procesa', async () => {
    prakseService.completeExpiredPractices.mockRejectedValue(new Error('DB nedostupna'));

    await runPracticeCompletionJob();

    expect(console.error).toHaveBeenCalledWith('[practiceCompletion] Greška:', 'DB nedostupna');
  });
});
