# Proof of Testing — Sprint 10

> Ovaj dokument predstavlja objedinjeni dokaz testiranja za Sprint 10 i obuhvata:
>
> - integracione testove za odbijanje prakse (US-18, realizovano u Sprintu 9),
> - unit testove za potvrdu studenta i studentsku odluku o praksi (US-19),
> - unit testove za generisanje ugovora o praksi,
> - unit testove za lifecycle logiku prakse,
> - unit testove za automatsko završavanje prakse i periodički job,
> - unit testove za evidenciju aktivnosti,
> - integracione testove za notifikacije o statusu prakse (US-37, realizovano u Sprintu 9),
> - unit testove za odustajanje od prakse (US-33),
> - RBAC i sigurnosne provjere,
> - ručno UI testiranje i coverage izvještaj.

---

# 1. Coverage Summary

Ukupna pokrivenost backend testovima ostvarena tokom Sprinta 10 (nakon implementiranih stavki):

| Metric | Coverage |
|---|---|
| Statements | **97%+** |
| Branches | **86%+** |
| Functions | **95%+** |
| Lines | **98%+** |

---

# 2. Ukupni rezultati testiranja

| Nivo | Modul | Alat | Broj testova | Rezultat |
| --- | --- | --- | --- | --- |
| Unit | Potvrda/odbijanje prakse od strane studenta | Jest | 4+ | PASS |
| Unit | Generisanje ugovora | Jest | 3+ | PASS |
| Unit | Lifecycle datuma prakse | Jest | 6+ | PASS |
| Unit | Automatsko završavanje prakse | Jest | 4+ | PASS |
| Unit | Periodički job završetka | Jest | 3 | PASS |
| Unit | Email obavijesti o završetku | Jest | 2+ | PASS |
| Unit | Odustajanje od prakse | Jest | 4+ | PASS |
| Ručno UI | Potvrda prakse i pregled „Moje prakse“ | Preglednik | — | PASS |
| Ručno UI | Pregled i preuzimanje ugovora | Preglednik | — | PASS |
| Ručno UI | Evidencija aktivnosti | Preglednik | — | PASS |
| Ručno UI | Automatsko završavanje i notifikacije | Preglednik | — | PASS |
| **Ukupno** | Sprint 10 (implementirane stavke) | Jest + Supertest + Sequelize | **26+ testova** | **PASS** |

---

# 3. Testirane funkcionalnosti

| Funkcionalnost | Tip testiranja | Šta je provjereno | Rezultat |
|---|---|---|---|
| Odbijanje prakse (US-18) | Integracijsko (Sprint 9) | Odbijanje od strane koordinatora, notifikacije | PASS |
| Potvrda studenta (US-19) | Unit | Prihvatanje odobrene prijave, kreiranje prakse, idempotentnost | PASS |
| Odbijanje prakse od strane studenta | Unit | Odbijanje odobrene prijave, ažuriranje studentStatus | PASS |
| Generisanje ugovora | Unit | Kreiranje ugovora, bosanski sadržaj, bez duplikata | PASS |
| Lifecycle prakse | Unit | Nadolazeća/aktivna/završena/odustao na osnovu datuma | PASS |
| Pregled praksi po roli | Unit + Ručno UI | Filtri na student/kompanija/koordinator dashboardu | PASS |
| Evidencija aktivnosti | Unit + Ručno UI | Unos samo tokom aktivne prakse, pregled svim rolama | PASS |
| Automatsko završavanje | Unit | Detekcija isteka, idempotentne obavijesti | PASS |
| Periodički job | Unit | Poziv servisa, logiranje, graceful error handling | PASS |
| Odustajanje od prakse (US-33) | Unit | Ažuriranje statusa, audit log zapis | PASS |
| Notifikacije o statusu prakse (US-37) | Integracijsko (Sprint 9) | In-app i email notifikacije, bez duplikata | PASS |
| RBAC zaštita | Unit | Role check na novim endpointima prakse | PASS |
| Regresijsko testiranje | Ručno UI | Nema regresija iz Sprinta 9 | PASS |

---

# 4. SB-58 — Odbijanje prakse (US-18)

> Testirano u Sprintu 9. Detalji u `sprint9/ProofOfTesting.md`, sekcija SB-18.

---

# 5. SB-59 — Potvrda studenta (US-19)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti studentu prihvatanje učešća na odobrenoj praksi | `acceptApplicationByStudent` — OK | PASS |
| Kada student prihvati praksu, sistem mora ažurirati status prijave | `studentStatus = PRIHVACENO` | PASS |
| Sistem mora kreirati zapis prakse nakon prihvatanja | `ensurePracticeForApplication` pozvan | PASS |
| Ponovljeni accept ne kreira duplikat prakse | Idempotentno ponašanje | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/applications.studentDecision.test.js
backend/tests/unit/prakse.service.test.js
```

### Primjeri testiranih scenarija

| Scenarij | Očekivani rezultat | Status |
|---|---|---|
| Student prihvata odobrenu prijavu | Praksa kreirana, studentStatus ažuriran | PASS |
| Student ponovo prihvata istu prijavu | Bez duplikata, postojeća praksa vraćena | PASS |
| Student odbija odobrenu prijavu | studentStatus = ODBIJENO | PASS |

---

# 6. SB-60 / SB-61 — Generisanje i preuzimanje ugovora (US-22, US-23)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti generisanje ugovora o praksi | `getPracticeContract` — created=true | PASS |
| Sistem mora omogućiti studentu i kompaniji uvid u ugovor | Role-based pristup STUDENT/COMPANY | PASS |
| Ugovor sadrži podatke o studentu i kompaniji | Sadržaj sadrži ime studenta i naziv kompanije | PASS |
| Već kreiran ugovor se ne duplicira | `created=false` na drugom pozivu | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/prakse.service.test.js
backend/tests/unit/prakse.controller.test.js
```

---

# 7. SB-62 — Evidencija aktivnosti (US-24)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti studentu evidentiranje aktivnosti | `POST /api/prakse/:id/aktivnosti` | PASS |
| Sistem mora omogućiti pregled aktivnosti kompaniji i koordinatoru | `GET /api/prakse/:id/aktivnosti` | PASS |
| Aktivnosti se mogu unositi samo tokom aktivne prakse | Validacija lifecycleStatus | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/prakse.service.test.js
backend/src/presentation/routes/prakse.routes.js
```

---

# 8. SB-67 — Odustajanje od prakse (US-33)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti studentu odustajanje od prakse | `users.service` — status WITHDRAWN | PASS |
| Sistem mora ažurirati status prijave | `datumOdustajanja` postavljen | PASS |
| Sistem mora bilježiti akciju u audit log | `INTERNSHIP_WITHDRAWN` action type | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/users.service.test.js
backend/tests/unit/audit.service.test.js
```

---

# 9. SB-68 — Notifikacije o statusu prakse (US-37)

> Testirano u Sprintu 9. Detalji u `sprint9/ProofOfTesting.md`, sekcija SB-37.

---

# 10. SB-69 — Automatsko završavanje prakse (US-54)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora pratiti datum početka i trajanje prakse | `calculatePracticeDates`, `practiceLifecycleStatus` | PASS |
| Po isteku trajanja status prelazi u „Završena“ | `lifecycleStatus = ZAVRSENA` kada datumKraja < danas | PASS |
| Sistem mora obavijestiti studenta i kompaniju | Email + in-app notifikacija | PASS |
| Sistem ne smije višestruko slati obavijest | `datumObavijestiZavrsetka` idempotentnost | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/prakse.service.test.js
backend/tests/unit/email.service.test.js
backend/tests/unit/practiceCompletion.job.test.js
```

### Primjeri testiranih scenarija

| Scenarij | Očekivani rezultat | Status |
|---|---|---|
| Job poziva `completeExpiredPractices` | Servis pozvan jednom | PASS |
| Nema novih završetaka | Bez log poruke | PASS |
| Neočekivana greška u jobu | Hvata se bez rušenja procesa | PASS |

---

# 11. Ručno UI testiranje

Ručno testiranje obuhvata sljedeće korisničke tokove:

- prihvatanje ili odbijanje odobrene prakse na student dashboardu,
- pregled potvrđenih praksi po lifecycle filterima (Sve / Aktivne / Nadolazeće / Završene),
- generisanje i preuzimanje ugovora o praksi (student i kompanija),
- unos i pregled aktivnosti na praksi (student, kompanija, koordinator),
- prikaz in-app notifikacije i email obavijesti o završetku prakse,
- odustajanje od prakse i ažuriranje statusa u pregledima,
- regresijsko testiranje funkcionalnosti Sprinta 9.

Tokom ručnog testiranja nisu pronađene kritične greške koje blokiraju implementirane funkcionalnosti Sprinta 10.

---

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-201 | Prihvatanje prakse | Praksa kreirana, prikaz u „Moje prakse“ | PASS |
| UI-202 | Odbijanje prakse | Status ažuriran, praksa nije kreirana | PASS |
| UI-203 | Pregled lifecycle filtera | Ispravni badge-ovi po datumu | PASS |
| UI-204 | Generisanje ugovora | Ugovor prikazan na bosanskom | PASS |
| UI-205 | Preuzimanje PDF ugovora | PDF preuzet uspješno | PASS |
| UI-206 | Unos aktivnosti | Aktivnost vidljiva kompaniji i koordinatoru | PASS |
| UI-207 | Automatsko završavanje | Badge „Završena praksa“, notifikacija poslana | PASS |
| UI-208 | Odustajanje od prakse | Status ODUSTAO u pregledima | PASS |
| UI-209 | Regresiono UI testiranje | Nema regresija iz Sprinta 9 | PASS |

---

# 12. Pokretanje testova

## Pokretanje svih testova

```bash
npm test
```

## Pokretanje testova za Sprint 10 module

```bash
npm test -- --testPathPattern="prakse.service|prakse.controller|applications.studentDecision|practiceCompletion.job|email.service"
```

## Coverage report

```bash
npm test -- --coverage
```

---

# 13. Zaključak

Sprint 10 backend i frontend funkcionalnosti (implementirane stavke) uspješno su pokrivene kombinacijom:

- unit testova,
- sigurnosnih/RBAC provjera,
- ručnog UI testiranja,
- regresionog testiranja.

Testirani su ključni korisnički tokovi planirani za Sprint 10:

- odbijanje prakse od strane koordinatora (US-18, Sprint 9),
- potvrda studenta i kreiranje prakse (US-19),
- generisanje i preuzimanje ugovora o praksi,
- lifecycle pregled praksi po datumu,
- evidencija aktivnosti tokom aktivne prakse,
- automatsko završavanje prakse s obavijestima,
- odustajanje od prakse s audit log zapisom (US-33),
- notifikacije o promjenama statusa prijave (US-37, Sprint 9).

Preostale stavke sprinta (US-25 praćenje prisustva, US-26 evaluacija studenta, US-27 evaluacija kompanije, US-28 izvještaji) planirane su za implementaciju i testiranje u narednoj fazi.

Sistem zadovoljava acceptance kriterije definirane za implementirane stavke Sprinta 10 i održava kompatibilnost s funkcionalnostima Sprintova 8 i 9.
