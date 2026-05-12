'use strict';

const { Op } = require('sequelize');
const { User, Student, Kompanija, Oglas, PrijavaNaPraksu, Koordinator } = require('../../infrastructure/database/models');
const { sendStudentDeactivationToCompany, sendStudentDeactivationToKoordinator } = require('./email.service');

async function checkDeactivation(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) return { canDeactivate: true, pendingApplications: [] };

  const applications = await PrijavaNaPraksu.findAll({
    where: {
      studentID: student.id,
      status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU', 'ODOBRENA'] },
    },
    include: [
      {
        model: Oglas,
        attributes: ['naziv'],
        include: [{ model: Kompanija, attributes: ['naziv'] }],
      },
    ],
  });

  const odobrene = applications.filter(a => a.status === 'ODOBRENA');
  if (odobrene.length > 0) {
    return {
      canDeactivate: false,
      reason: 'ODOBRENA_EXISTS',
      companies: odobrene.map(a => a.Oglas?.Kompanija?.naziv || 'N/A'),
    };
  }

  const pending = applications.filter(a => ['PODNESENA', 'U_RAZMATRANJU'].includes(a.status));
  return {
    canDeactivate: true,
    pendingApplications: pending.map(a => ({
      oglasNaziv: a.Oglas?.naziv || 'N/A',
      kompanijaNaziv: a.Oglas?.Kompanija?.naziv || 'N/A',
    })),
  };
}

async function deactivateMyAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
  if (user.status === 'DEACTIVATED') {
    const err = new Error('Nalog je već deaktiviran.');
    err.status = 400;
    throw err;
  }

  const student = await Student.findOne({ where: { userID: userId } });

  if (student) {
    const odobrena = await PrijavaNaPraksu.findOne({
      where: { studentID: student.id, status: 'ODOBRENA' },
    });
    if (odobrena) {
      const err = new Error('Imate odobrenu praksu. Morate se najprije odjaviti s prakse prije deaktivacije naloga.');
      err.status = 409;
      err.code = 'ODOBRENA_EXISTS';
      throw err;
    }

    const pending = await PrijavaNaPraksu.findAll({
      where: {
        studentID: student.id,
        status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU'] },
      },
      include: [
        {
          model: Oglas,
          attributes: ['naziv'],
          include: [
            {
              model: Kompanija,
              include: [{ model: User, attributes: ['email'] }],
            },
          ],
        },
        {
          model: Koordinator,
          include: [{ model: User, attributes: ['email'] }],
        },
      ],
    });

    if (pending.length > 0) {
      await PrijavaNaPraksu.update(
        { status: 'ODUSTAO', datumOdustajanja: new Date() },
        {
          where: {
            studentID: student.id,
            status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU'] },
          },
        }
      );

      const studentName = `${user.ime} ${user.prezime}`;
      const notifPromises = [];
      for (const prijava of pending) {
        const oglasNaziv = prijava.Oglas?.naziv || 'N/A';
        const companyEmail = prijava.Oglas?.Kompanija?.User?.email;
        if (companyEmail) {
          notifPromises.push(
            sendStudentDeactivationToCompany(companyEmail, studentName, oglasNaziv).catch(() => {})
          );
        }
        const koordinatorEmail = prijava.Koordinator?.User?.email;
        if (koordinatorEmail) {
          notifPromises.push(
            sendStudentDeactivationToKoordinator(koordinatorEmail, studentName, oglasNaziv).catch(() => {})
          );
        }
      }
      await Promise.all(notifPromises);
    }
  }

  user.status = 'DEACTIVATED';
  await user.save();
}

async function checkCompanyDeactivation(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  const company = await Kompanija.findOne({ where: { userID: userId } });
  if (!company) return { canDeactivate: true, oglasiToClose: [] };

  const aktivniOglasi = await Oglas.findAll({
    where: { kompanijaID: company.id, status: 'AKTIVAN' },
    include: [{
      model: PrijavaNaPraksu,
      where: { status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU'] } },
      required: false,
    }],
  });

  const blocked = aktivniOglasi.filter(o => o.PrijavaNaPraksus?.length > 0);
  if (blocked.length > 0) {
    return {
      canDeactivate: false,
      reason: 'AKTIVAN_SA_PRIJAVAMA',
      oglasi: blocked.map(o => o.naziv),
    };
  }

  return {
    canDeactivate: true,
    oglasiToClose: aktivniOglasi.map(o => o.naziv),
  };
}

async function deactivateCompanyAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
  if (user.status === 'DEACTIVATED') {
    const err = new Error('Nalog je već deaktiviran.');
    err.status = 400;
    throw err;
  }

  const company = await Kompanija.findOne({ where: { userID: userId } });

  if (company) {
    const blocked = await Oglas.findOne({
      where: { kompanijaID: company.id, status: 'AKTIVAN' },
      include: [{
        model: PrijavaNaPraksu,
        where: { status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU'] } },
        required: true,
      }],
    });
    if (blocked) {
      const err = new Error('Imate aktivne oglase sa prijavama. Zatvorite oglase prije deaktivacije naloga.');
      err.status = 409;
      err.code = 'AKTIVAN_SA_PRIJAVAMA';
      throw err;
    }

    await Oglas.update(
      { status: 'ZATVOREN' },
      { where: { kompanijaID: company.id, status: 'AKTIVAN' } }
    );
  }

  user.status = 'DEACTIVATED';
  await user.save();
}

async function checkCoordinatorDeactivation(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  const coordinator = await Koordinator.findOne({ where: { userID: userId } });
  if (!coordinator) return { canDeactivate: true, pendingCount: 0 };

  const odobrene = await PrijavaNaPraksu.findAll({
    where: { koordinatorID: coordinator.id, status: 'ODOBRENA' },
    include: [{ model: Student, include: [{ model: User, attributes: ['ime', 'prezime'] }] }],
  });

  if (odobrene.length > 0) {
    return {
      canDeactivate: false,
      reason: 'ODOBRENA_EXISTS',
      studenti: odobrene.map(a => {
        const u = a.Student?.User;
        return u ? `${u.ime} ${u.prezime}` : 'N/A';
      }),
    };
  }

  const pendingCount = await PrijavaNaPraksu.count({
    where: { koordinatorID: coordinator.id, status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU'] } },
  });

  return { canDeactivate: true, pendingCount };
}

async function deactivateCoordinatorAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }
  if (user.status === 'DEACTIVATED') {
    const err = new Error('Nalog je već deaktiviran.');
    err.status = 400;
    throw err;
  }

  const coordinator = await Koordinator.findOne({ where: { userID: userId } });

  if (coordinator) {
    const blocked = await PrijavaNaPraksu.findOne({
      where: { koordinatorID: coordinator.id, status: 'ODOBRENA' },
    });
    if (blocked) {
      const err = new Error('Imate aktivne prakse u toku. Riješite ih prije deaktivacije naloga.');
      err.status = 409;
      err.code = 'ODOBRENA_EXISTS';
      throw err;
    }

    await PrijavaNaPraksu.update(
      { koordinatorID: null },
      { where: { koordinatorID: coordinator.id, status: { [Op.in]: ['PODNESENA', 'U_RAZMATRANJU'] } } }
    );
  }

  user.status = 'DEACTIVATED';
  await user.save();
}

module.exports = { checkDeactivation, deactivateMyAccount, checkCompanyDeactivation, deactivateCompanyAccount, checkCoordinatorDeactivation, deactivateCoordinatorAccount };
