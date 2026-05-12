# AI Usage Log — Sprint 7

## Unos 1 — Implementacija koordinatorskog dashboarda (US-08)

| Polje | Sadržaj |
|---|---|
| **Datum** | 09.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija kompletnog koordinatorskog dashboarda - frontend i backend |

**Kratak opis upita:**

> Implementirati pristup koordinatora. Koordinator treba imati detaljan uvid u cijeli tok i napredak prakse kod studenta. Na dashboardu trebaju biti sve potrebne funkcionalnosti. CSS stil treba biti usklađen s dosadašnjim. Ispoštovati sve što se tiče user storija.

**Šta je AI predložio ili generisao:**

- `KoordinatorDashboard.jsx` - dashboard s tab navigacijom (Prijave na čekanju, Sve prijave, Aktivne prakse, Studenti, Odobravanje naloga), statistikama u karticama, tamnim režimom i navbarom s logom
- `KoordinatorDashboard.css` - kompletni stilovi usklađeni s postojećim CSS varijablama i design tokenima projekta, uključujući dark mode override-e, responsive grid za statistike, tab navigaciju, tabele, modalne prozore i toast notifikacije
- `PrijavePregled.jsx` - modul za pregled prijava s filterom po statusu, paginacijom i modalnim prozorom za odobravanje/odbijanje s unosom razloga
- `PraksePregled.jsx` - modul za pregled aktivnih i završenih praksi
- `StudentListaPregled.jsx` - modul za pregled studenata s istog fakulteta s pretragom po imenu, bočnim panelom s detaljima studenta i prikazom historije prijava
- `OdobravanjePregled.jsx` - modul za odobravanje/odbijanje studentskih naloga koji čekaju odobrenje
- `koordinatorService.js` - frontend servis s API pozivima za sve koordinatorske endpointe
- Backend: `koordinator.service.js`, `koordinator.controller.js`, `koordinator.routes.js` - servis, kontroler i rute za sve koordinatorske endpointe (`/dashboard`, `/prijave`, `/prijave/:id`, `/studenti`, `/prakse`, `/zahtjevi`, `/studenti/:id/odobri`, `/studenti/:id/odbij`)
- `approval.service.js` dopuna - funkcija `getStudentApprovalRequestsForKoordinator` koja filtrira zahtjeve po `fakultetID` koordinatora
- Responsive CSS pravila za tablet i mobilne uređaje

**Šta je tim prihvatio:**
- Kompletnu arhitekturu koordinatorskog dashboarda (frontend + backend)
- Filtriranje podataka po fakultetu koordinatora na svim endpointima (prijave, studenti, prakse, zahtjevi)
- Workflow odobravanja/odbijanja studentskih naloga s email obavijestima
- Tab navigaciju i statističke kartice
- Responsive dizajn

**Šta je tim izmijenio:**
- Uklonjen filter po smjeru (odsjeku) - koordinator vidi sve studente s istog fakulteta bez obzira na smjer
- Stilizacija nekih UI elemenata (ikonice, chip za rolu) usklađena s postojećim dizajnom
- Redoslijed i nazivi tabova prilagođeni zahtjevima
- `approvalStatus` pri registraciji promijenjen iz `'APPROVED'` u `'PENDING_APPROVAL'` kako bi korisnici ispravno čekali odobrenje

**Šta je tim odbacio:**
- Prijedlog automatskog odobravanja studenata odmah pri verifikaciji emaila

**Rizici, problemi ili greške:**
- Inicijalno je koordinator vidio studente s drugog fakulteta - uzrok je bio pogrešan endpoint u frontend servisu koji je pozivao admin rutu umjesto koordinatorske; riješeno preusmjeravanjem na `/api/koordinator/zahtjevi`
- Filtriranje po `fakultetID` u `getPrijave`, `getPrijavaById` i `getPrakse` dodato naknadno jer inicijalno nije bilo implementirano - koordinator je vidio sve prijave bez obzira na fakultet

---

## Unos 2 — Backend testovi za koordinatorski modul

| Polje | Sadržaj |
|---|---|
| **Datum** | 11.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Pisanje unit i integracionih testova za koordinatorski modul |

**Kratak opis upita:**

> Napisati backend testove koji se tiču koordinator.service, koordinatorService, koordinator Controller, koordinator.routes. Po uzoru na postojeće testove (admin.routes.test.js, admin.routes.integration.js, approval.service.test.js).

**Šta je AI predložio ili generisao:**

- `koordinator.routes.test.js` - unit testovi za sve koordinatorske rute s mockiranim middleware-om, modelima i servisima (28 testova): dashboard statistike, lista prijava s filterom, detalji prijave, odluka o prijavi, lista studenata s pretragom, odobravanje/odbijanje studenta, lista zahtjeva, lista praksi
- `koordinator.routes.integration.test.js` - integracijski testovi s pravom bazom podataka (24 testa): kreiranje testnih korisnika u `beforeAll`, provjera filtriranja po fakultetu u stvarnim DB upitima, provjera promjena statusa u bazi nakon odobravanja/odbijanja
- `koordinator.service.test.js` - unit testovi za sve servisne funkcije (32 testa): `getDashboardStats`, `getPrijave`, `getPrijavaById`, `odluciOPrijavi`, `getStudenti`, `getPrakse`, `approveStudent`, `rejectStudent`
- Dopuna `approval.service.test.js` - 5 novih testova za `getStudentApprovalRequestsForKoordinator`

**Šta je tim prihvatio:**
- Kompletnu strukturu unit i integracionih testova po uzoru na postojeće
- Sve mock funkcije i helper funkcije (`makeMockUser`, `makeMockKoordinator`, `makeMockStudent`, `makeMockPrijava`)
- Integracijske testove koji kreiraju stvarne zapise u test bazi i provjeravaju filtriranje po fakultetu

**Šta je tim izmijenio:**
- Putanje za `require` mock-ova ispravljene (`../src/` → `../../src/`) jer je fajl smješten u `tests/unit/` podfolder
- Mock `Koordinator.findOne` dodan u sve testove koji pozivaju `getPrijave`, `getPrijavaById` i `getPrakse` - naknadno dodato jer je `koordinatorUserId` parametar dodan u te funkcije
- Identifikacija studenata u integracionim testovima promjenjena s `userID` na `User.email` jer model vraća ugniježđeni `User` objekat bez `id` polja na vrhu
- `getStudentApprovalRequestsForKoordinator` describe blok izvučen iz `rejectUserRequest` bloka - bio pogrešno ugniježđen

**Šta je tim odbacio:**
- Redundantni test slučajevi koji su pokrivali iste scenarije različitim formulacijama

**Rizici, problemi ili greške:**
- Unit test za pretragu studenata jednom riječju (`Op.or` filter) koristio `expect.any(Symbol)` s `toHaveProperty` što nije podržano - riješeno s `Object.getOwnPropertySymbols()`