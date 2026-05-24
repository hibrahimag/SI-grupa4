export const APPLICATION_STATUS = {
  WAITING_COORDINATOR: 'CEKA_KOORDINATORA',
  WAITING_COMPANY: 'CEKA_KOMPANIJU',
  SHORTLISTED: 'U_RAZMATRANJU',
  APPROVED: 'ODOBRENA',
  REJECTED_COORDINATOR: 'ODBIJENA_KOORDINATOR',
  REJECTED_COMPANY: 'ODBIJENA_KOMPANIJA',
  WITHDRAWN: 'ODUSTAO',
  LEGACY_SUBMITTED: 'PODNESENA',
  LEGACY_REJECTED: 'ODBIJENA',
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.WAITING_COORDINATOR]: 'Čeka odobrenje koordinatora',
  [APPLICATION_STATUS.WAITING_COMPANY]: 'Čeka odgovor kompanije',
  [APPLICATION_STATUS.SHORTLISTED]: 'Uži krug',
  [APPLICATION_STATUS.APPROVED]: 'Praksa odobrena',
  [APPLICATION_STATUS.REJECTED_COORDINATOR]: 'Odbijeno od koordinatora',
  [APPLICATION_STATUS.REJECTED_COMPANY]: 'Odbijeno od kompanije',
  [APPLICATION_STATUS.WITHDRAWN]: 'Odustao',
  [APPLICATION_STATUS.LEGACY_SUBMITTED]: 'Čeka odobrenje koordinatora',
  [APPLICATION_STATUS.LEGACY_REJECTED]: 'Odbijeno',
};

export const ACTIVE_APPLICATION_STATUSES = [
  APPLICATION_STATUS.WAITING_COORDINATOR,
  APPLICATION_STATUS.WAITING_COMPANY,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.LEGACY_SUBMITTED,
];

export function applicationStatusLabel(status) {
  return APPLICATION_STATUS_LABELS[status] || status || 'Čeka odobrenje koordinatora';
}

export function applicationStatusTone(status) {
  if (status === APPLICATION_STATUS.APPROVED) return 'success';
  if (
    status === APPLICATION_STATUS.REJECTED_COORDINATOR ||
    status === APPLICATION_STATUS.REJECTED_COMPANY ||
    status === APPLICATION_STATUS.LEGACY_REJECTED ||
    status === APPLICATION_STATUS.WITHDRAWN
  ) return 'error';
  return 'info';
}

export function isActiveApplicationStatus(status) {
  return ACTIVE_APPLICATION_STATUSES.includes(status);
}

export function applicationStageSteps(application) {
  const status = application?.status;
  const coordinatorRejected =
    status === APPLICATION_STATUS.REJECTED_COORDINATOR ||
    status === APPLICATION_STATUS.LEGACY_REJECTED;
  const companyRejected = status === APPLICATION_STATUS.REJECTED_COMPANY;
  const companyReached = [
    APPLICATION_STATUS.WAITING_COMPANY,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.APPROVED,
    APPLICATION_STATUS.REJECTED_COMPANY,
  ].includes(status);
  const finalReached = [
    APPLICATION_STATUS.APPROVED,
    APPLICATION_STATUS.REJECTED_COORDINATOR,
    APPLICATION_STATUS.REJECTED_COMPANY,
    APPLICATION_STATUS.LEGACY_REJECTED,
    APPLICATION_STATUS.WITHDRAWN,
  ].includes(status);

  return [
    { label: 'Prijava podnesena', state: 'complete' },
    {
      label: 'Koordinator',
      state: coordinatorRejected ? 'error' : companyReached || finalReached ? 'complete' : 'current',
    },
    {
      label: 'Kompanija',
      state: coordinatorRejected
        ? 'pending'
        : companyRejected
          ? 'error'
          : status === APPLICATION_STATUS.APPROVED
            ? 'complete'
            : companyReached
              ? 'current'
              : 'pending',
    },
    {
      label: 'Konačan ishod',
      state: finalReached
        ? (coordinatorRejected || companyRejected ? 'error' : 'complete')
        : 'pending',
    },
  ];
}
