# AI Usage Log — Sprint 9

---

## Unos 1 — Ispravka dokumenta prijave, migracija na Supabase Storage i notifikacije (US-37)

| Polje | Sadržaj |
|---|---|
| **Datum** | 21.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Dijagnoza i ispravka null vrijednosti dokumenta u prijavi, migracija upload-a dokumenata na Supabase Storage, implementacija US-37 — notifikacije o statusu prijave na praksu |

**Kratak opis upita:**

> Dokumenti priloženi uz prijavu na praksu (CV, motivaciono pismo) su null u `prijave_na_praksu` tabeli. Na `/profile` stranici se prikazuju samo nazivi dokumenata bez mogućnosti preuzimanja. Zatražena je dijagnoza problema, ispravka arhitekturalne nekonzistentnosti između `dokumenti` tabele i `cv`/`motivacionoPismo` kolona, migracija uploada sa lokalnog diska na Supabase Storage s limitom od 150KB, te implementacija notifikacija o statusu prakse: email obavijesti pri prijavi/odobravanju/odbijanju i in-app zvono ikonica na student dashboardu.

**Šta je AI predložio ili generisao:**

- Dijagnoza: `dokumenti.prijava_id` polje nikad nije bilo postavljano; `cv` i `motivacionoPismo` u `prijave_na_praksu` nikad nisu popunjavani — dva paralelna sistema nikad spojena
- Ispravka `applications.service.js` — nakon `PrijavaNaPraksu.create()` automatski ažurira `dokumenti` zapise s `prijava_id`, te popunjava `cv` i `motivacionoPismo` kolone putanjama pronađenih dokumenata
- Ispravka `dokument.routes.js` (`/attach` endpoint) — prihvata opcioni `prijava_id` parametar
- Migracija `upload.middleware.js` — zamjena `multer.diskStorage` s `multer.memoryStorage()`, limit smanjen na 150 KB
- Kreiranje `backend/src/infrastructure/supabase.js` — inicijalizacija Supabase klijenta (`createClient`)
- Izmjena `dokument.routes.js` — upload buffer-a u Supabase Storage bucket `dokumenti` (putanja: `{student_id}/{timestamp}{ext}`), brisanje iz bucketa pri DELETE, novi `GET /:id/download` endpoint koji generiše signed URL
- Izmjena `ProfilePage.jsx` — dugme za preuzimanje poziva `/api/dokumenti/:id/download` s JWT tokenom u headeru umjesto direktne `/uploads/` putanje
- Ispravka destructuriranja `{ student, user }` u `createApplication` (bio samo `{ student }`, uzrokovalo 500 grešku)
- `Notifikacija.js` model — tabela `notifikacije` (student_id, prijava_id, tip, naslov, poruka, procitana, created_at)
- Ažuriranje `models/index.js` — registracija modela i asocijacije
- `notifications.service.js` — funkcije `createNotification` (s dedup-om po `student_id + prijava_id + tip`), `getMyNotifications`, `markAsRead`, `markAllAsRead`
- `notifications.routes.js` — `GET /`, `PATCH /:id/read`, `PATCH /read-all`
- Dvije nove email funkcije u `email.service.js`: `sendPrijavaPodnesenaEmail` i `sendPrijavaStatusEmail` (HTML template usklađen s postojećim)
- `applications.service.js` — šalje in-app notifikaciju i email studentu pri podnesnoj prijavi
- `koordinator.service.js` (`odluciOPrijavi`) — šalje in-app notifikaciju i email studentu pri odobravanju/odbijanju, dohvata Student/User/Oglas/Kompanija u jednom upitu
- `api.js` (frontend) — `getNotifications`, `markNotificationRead`, `markAllNotificationsRead`
- `StudentDashboard.jsx` — zvono ikonica u navbaru s crvenim badge-om za nepročitane, dropdown panel s listom notifikacija, klik označava pročitanom, "Označi sve" dugme, useEffect za dohvat pri mount-u, zatvaranje klikom van
- `StudentDashboard.css` — kompletni stilovi za `.sd-notif-wrap`, `.sd-notif-btn`, `.sd-notif-badge`, `.sd-notif-dropdown`, `.sd-notif-item`, dark mode varijante

**Šta je tim prihvatio:**
- Dijagnozu arhitekturalne nekonzistentnosti i pristup rješavanja putem `prijava_id`
- Migraciju na Supabase Storage s 150 KB limitom
- Potpunu implementaciju in-app notifikacija i email obavijesti za US-37
- Zvono ikonicu u navbaru s badge-om i dropdown panelom

**Šta je tim izmijenio:**
- Ništa strukturalno — implementacija prihvaćena kako je generisana

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**
- `user` nije bio destructuriran iz `resolveStudentFromUser` u `createApplication` — uzrokovalo 500 grešku pri prvoj prijavi; otkriveno i ispravljeno odmah
- Supabase Storage bucket `dokumenti` i tabela `notifikacije` moraju biti kreirani ručno u Supabase dashboardu (SQL Editor) — nije automatizirano
- Download link kao `<a href>` nije slao JWT token — zamijenjeno s programskim `fetch` + `window.open`

---

## Unos 2 — Implementacija pregleda zatvorenih oglasa (US-57)

| Polje | Sadržaj |
|---|---|
| **Datum** | 22.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija US-57 - pregled zatvorenih oglasa za studente i kompanije |

**Kratak opis upita:**

> Implementirati pregled zatvorenih (isteklih) oglasa za studenta u novom tabu "Zatvoreni" unutar StudentDashboard-a. Svaki zatvoreni oglas treba biti klikabilan i otvarati modal s detaljima, ali bez mogućnosti prijave. Klikom na ime firme otvoriti profil kompanije, s mogućnošću povratka na zatvorene oglase (ne na sve oglase). Kompanija treba imati isti pregled za vlastite zatvorene oglase.

**Šta je AI predložio ili generisao:**

- `getClosedListings` i `getClosedListingsByCompany` funkcije u `listings.service.js` - Sequelize query s `Op.or` koji hvata oglase s `status !== 'AKTIVAN'` ili `rokPrijave <= new Date()`
- `getClosedListings` i `getClosedListingsByCompany` handlere u `listings.controller.js`
- Dvije nove rute u `listings.routes.js`: `GET /closed` (za studente) i `GET /company/closed` (za kompanije, zaštićeno `authorize('COMPANY')`)
- `getClosedListings` i `getCompanyClosedListings` u frontend `listingsService.js`
- `ClosedListingsPanel` komponentu u `StudentDashboard.jsx` - lista zatvorenih oglasa s `sd-card-wrap--closed` klasom za hover animaciju identičnu aktivnim oglasima
- `ClosedOglasModal` komponentu u `StudentDashboard.jsx` - modal s detaljima zatvorenog oglasa, obavijesti da je oglas zatvoren, klikom na ime firme proslijeđuje `state={{ from: 'zatvoreni' }}`
- Novi tab "Zatvoreni oglasi" u sidebaru `StudentDashboard.jsx` sa stilom identičnim tabu "Moje prijave"
- `ClosedListingsShell` komponentu u `KompanijaDashboard.jsx` - prikaz kompanijin zatvorenih oglasa, nova navigacijska stavka "Zatvoreni oglasi"
- `CompanyProfilePage.jsx` izmjena - `useLocation` za čitanje `state.from`, dugme "Nazad" navigira na odgovarajući tab (`zatvoreni` ili default), tekst se mijenja ovisno o porijeklu
- `StudentDashboard.jsx` izmjena `useEffect` za `location.state` - obrađuje novi `openTab` parametar za povratak na zatvoreni tab
- Ispravka `getCompanyPublicProfile` servisa - dodavanje `rokPrijave: { [Op.gt]: new Date() }` filtera da aktivni oglasi na profilu kompanije ne uključuju istekle
- Prikaz statusa oglasa u `KompanijaDashboard.jsx` - frontend logika koja prikazuje "ISTEKAO" umjesto "AKTIVAN" za oglase kojima je istekao rok
- Ispravka brojača "Aktivni oglasi" u `DashboardShell` - filtrira po roku prijave, ne samo po statusu
- CSS za `sd-card-wrap--closed` i `ClosedOglasModal` dodat na kraj `StudentDashboard.css`

**Šta je tim prihvatio:**
- Kompletnu backend arhitekturu za pregled zatvorenih oglasa
- Lazy loading zatvorenih oglasa (učitavaju se tek pri prvom kliknu na tab)
- Frontend-only rješenje za prikaz isteklih oglasa kao "ISTEKAO" u kompanijinom dashboardu (bez cron joba)
- Animaciju hover efekta na zatvorenim karticama identičnu aktivnim oglasima (`sd-card-wrap--closed`)
- Navigacijsku logiku povratka s profila kompanije na odgovarajući tab

**Šta je tim izmijenio:**
- Import u `KompanijaDashboard.jsx` je greškom ostao `getClosedListings` umjesto `getCompanyClosedListings` - ispravljeno

**Šta je tim odbacio:**
- Ništa

**Rizici, problemi ili greške:**
- `getCompanyPublicProfile` nije filtrirao po `rokPrijave` - ispravljeno tek kad je primijećeno da istekli oglasi prikazuju kao aktivni na profilu kompanije

---

## Unos 3 — Implementacija ograničenja broja prijava po studentu (US-53)

| Polje | Sadržaj |
|---|---|
| **Datum** | 22.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija US-53 - ograničenje broja aktivnih prijava po studentu koje postavlja koordinator |

**Kratak opis upita:**

> Implementirati ograničenje broja aktivnih prijava po studentu koje koordinator može podesiti putem KoordinatorDashboard-a. Kada student dostigne limit, dugme "Prijavi se" treba biti onemogućeno s porukom objašnjenja.

**Šta je AI predložio ili generisao:**

- `SystemSetting.js` - novi Sequelize model za pohranu globalnih podešavanja sistema (key/value tabela `system_settings`)
- `application_limit.service.js` - funkcije `getApplicationLimit`, `setApplicationLimit`, `checkStudentApplicationLimit` s podrazumijevanim limitom od 5
- `application_limit.controller.js` - `getLimitController` i `setLimitController`
- Dvije nove rute u `koordinator.routes.js`: `GET /application-limit` i `PUT /application-limit`
- `useApplicationLimit.js` - React hook koji dohvata limit s backenda i računa `isAtLimit` flag na osnovu broja aktivnih prijava studenta
- `KoordinatorLimitPanel.jsx` - panel za koordinatora s prikazom trenutnog limita i formom za promjenu; integrisan u `KoordinatorDashboard.jsx` kao nova stavka navigacije "Limit prijava"
- CSS za `KoordinatorLimitPanel` dodat na kraj `KoordinatorDashboard.css`
- Limit bar u sidebaru `StudentDashboard.jsx` - prikazuje se samo ako je limit postavljen, mijenja boju u crvenu pri dostizanju limita
- `PraksaModal` izmjena - dugme "Prijavi se" onemogućeno kad student dostigne limit, s porukom objašnjenja

**Šta je tim prihvatio:**
- Kompletnu backend arhitekturu za ograničenje prijava
- `SystemSetting` model s `findOrCreate` pristupom (bez zasebne migracije, oslanjanje na `sync({ alter: true })`)
- Prikaz progres bara u sidebaru s promjenom boje pri dostizanju limita

**Šta je tim izmijenio:**
- Inicijalno je `AdminApplicationLimitPanel` bio kreiran za admin dashboard - tim je ispravno uočio da limit postavlja koordinator (fakultet), ne administrator, pa je panel preseljen u `KoordinatorDashboard`

**Šta je tim odbacio:**
- `AdminApplicationLimitPanel.jsx` i `AdminApplicationLimitPanel.css` - zamijenjeni s `KoordinatorLimitPanel.jsx` zbog pogrešno identificirane uloge

**Rizici, problemi ili greške:**
- Vrijednost limita nema gornju granicu validacije - koordinator može unijeti npr. 99, što je funkcionalno ali možda nepraktično
- AI je inicijalno pogrešno identificirao administratora kao korisnika koji postavlja limit, umjesto koordinatora - korekcija zahtijevala dodatni krug komunikacije

---

## Unos 4 — Implementacija javne stranice za pregled praksi (US-11)

| Polje | Sadržaj |
|---|---|
| **Datum** | 23.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Osposobljavanje dugmeta "Pregledaj prakse" na landing page-u - javna stranica za pregled aktivnih oglasa bez prijave |

**Kratak opis upita:**

> Osposobiti dugme "Pregledaj prakse" na landing page-u tako da vodi na novu javnu stranicu gdje neprijavljeni korisnici mogu pregledati sve aktivne prakse i filtrirati ih, ali se ne mogu prijaviti. Svako dugme "Prijavi se" na kartici oglasa otvara modal koji poziva korisnika na registraciju ili prijavu.

**Šta je AI predložio ili generisao:**

- Uklanjanje `authenticate` middlewarea s `GET /listings/active` rute u `listings.router.js` - ruta postaje javno dostupna bez JWT tokena; sve ostale rute ostaju zaštićene
- `PublicListingsPage.jsx` - nova stranica s fiksnim sidebarom (Oblast, Tip prakse, Naknada filteri s radio buttons), search inputom, prikazom kartica oglasa i bottom CTA stripom; koristi `apiRequest` iz postojećeg `services/api.js` umjesto direktnog `fetch` poziva
- `PublicListingsPage.css` - CSS koji koristi iste `sd-*` CSS varijable i klase kao ostatak aplikacije, sa zasebnim `pl-*` prefiksima za nove komponente; sadrži responzivne breakpointe za 900px, 768px i 480px
- `LoginPromptModal` komponentu unutar `PublicListingsPage.jsx` - modal koji se prikazuje pri kliknu na "Prijavi se" dugme, nudi linkove na `/auth` i `/register`
- Novu rutu `/listings/public` u `routes_index.jsx`
- Izmjenu linka "Pregledaj prakse" na `LandingPage.jsx` - `to="/listings/public"` umjesto `to="/listings"`
- `useEffect` koji automatski preusmjerava već prijavljenog korisnika na `/listings`

**Šta je tim prihvatio:**
- Uklanjanje `authenticate` s `/active` rute kao ispravno rješenje - ruta vraća samo javne podatke oglasa, bez osjetljivih informacija
- Korištenje `apiRequest` iz `services/api.js` umjesto direktnog `fetch` - konzistentno s ostatkom aplikacije i koristi Vite proxy konfiguraciju
- Dizajn s fiksnim sidebarom i karticama koje nasljeđuju `sd-card-wrap` stilove
- Modal za neprijavljene korisnike umjesto direktnog blokiranja pregleda

**Šta je tim izmijenio:**
- Inicijalna implementacija koristila je direktan `fetch` s `import.meta.env.VITE_API_URL` - zamijenjena s `apiRequest` nakon što se pokazalo da `VITE_API_URL` nije postavljen u frontend `.env` fajlu, pa je fetch odlazio na Vite dev server umjesto na backend

**Šta je tim odbacio:**
- Ništa

**Rizici, problemi ili greške:**
- `GET /listings/active` je sada javna ruta - ako endpoint u budućnosti počne vraćati osjetljive podatke (npr. podaci o prijavama), treba ponovo dodati `authenticate`
- Inicijalni `fetch` poziv vraćao je HTML umjesto JSON-a jer `VITE_API_URL` nije bio definisan u frontend okruženju - riješeno prelaskom na `apiRequest` koji koristi Vite proxy (`/api` fallback)
- React StrictMode u development modu poziva `useEffect` dvaput, što je uzrokovalo dvostruke API pozive - nije kritičan problem u produkciji

---
## Unos 5 — Implementacija podešavanja tipova notifikacija (US-55)

| Polje | Sadržaj |
|---|---|
| **Datum** | 23.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | ChatGPT (GPT-5.5) |
| **Ko je koristio** | Irma Lemeš |
| **Svrha korištenja** | Implementacija US-55 — podešavanje tipova notifikacija za studente |

**Kratak opis upita:**

> Implementirati mogućnost da student bira koje vrste notifikacija želi primati (email i in-app) za podnesenu, odobrenu i odbijenu prijavu na praksu.

**Šta je AI predložio ili generisao:**

- `notification_preferences` tabelu i `NotificationPreference.js` Sequelize model
- `notificationPreferences.service.js` i `notificationPreferences.routes.js`
- API rute:
  - `GET /api/notification-preferences`
  - `PUT /api/notification-preferences`
- Helper funkcije:
  - `canSendInApp`
  - `canSendEmail`
- Integraciju preferenci u:
  - `applications.service.js`
  - `koordinator.service.js`
- Frontend API funkcije:
  - `getNotificationPreferences`
  - `updateNotificationPreferences`
- `NotificationPreferencesSection` komponentu unutar `ProfilePage.jsx`
- Checkbox UI za uključivanje/isključivanje email i in-app notifikacija

**Šta je tim prihvatio:**
- Kompletnu backend i frontend implementaciju
- Razdvajanje email i in-app preferenci
- Immediate apply logiku bez potrebe za reloginom

**Šta je tim izmijenio:**
- `canSendInApp` i `canSendEmail` helperi su premješteni iz routes fajla u service sloj

**Šta je tim odbacio:**
- JSON kolonu za preference — korištene su eksplicitne boolean kolone

**Rizici, problemi ili greške:**
- `401 Unauthorized` pri testiranju zbog isteklog JWT tokena — riješeno novim loginom

---

## Unos 6 — Dvostepeno odobravanje prijave na praksu

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Codex (GPT-5) |
| **Ko je koristio** | haristucakovic |
| **Svrha korištenja** | Refaktorisanje toka prijave tako da koordinator prvo proslijedi prijavu kompaniji, a konačno odobrenje daje kompanija |

**Kratak opis upita:**

> Potrebno je razdvojiti odluku koordinatora od konačne odluke kompanije, sakriti prijave od kompanije dok ih koordinator ne odobri i jasno prikazati fazu prijave studentu.

**Šta je AI predložio ili generisao:**

- Dodani su statusi koordinatora i kompanije uz zadržavanje postojećeg ukupnog statusa prijave
- Prilagođene su akcije koordinatora, kompanije i filtriranje vidljivih prijava
- Dodane su company akcije za uži krug, odobravanje i odbijanje kandidata
- Ažurirani su statusi i prikaz faza na student dashboardu te detalji prijave za koordinatora
- Usklađene su notifikacije i pristup dokumentima sa novim tokom odobravanja

**Šta je tim prihvatio:**
- Dvostepeni tok odobravanja i jasne Bosnian statusne poruke u interfejsu

**Šta je tim izmijenio:**
- Uklonjeni su interni tekstovi o sprintovima iz korisničkog interfejsa i stabilizovan je raspored filter kartica u pregledu prijava

**Šta je tim odbacio:**
- Nije dodavana nova funkcionalnost izvan toka prijave i potrebnih UI korekcija

**Rizici, problemi ili greške:**
- Postojeće prijave zahtijevaju backfill statusa pri pokretanju aplikacije kako bi se pravilno uklopile u novi tok

---

## Unos 7 — Implementacija logike zatvaranja i arhiviranja oglasa i pripadajućih UI komponenti

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Gemini (gemini-pro) |
| **Ko je koristio** | hibrahimag1 |
| **Svrha korištenja** | Implementacija i povezivanje akcija za ručno/automatsko zatvaranje oglasa, arhiviranje zatvorenih oglasa, te rješavanje kaskadnih validacija na backendu i frontend UI konzistentnosti. |

**Kratak opis problema i zahtjeva**
Unutar upravljačke ploče za kompanije (`KompanijaDashboard.jsx`), bilo je potrebno omogućiti kompanijama puni životni ciklus oglasa za prakse kroz dvije ključne akcije:
1. Zatvaranje oglasa: Prekidanje aktivnog oglasa (bilo ručno, bilo automatski prepoznavanjem isteklog roka prijave) čime oglas prestaje biti aplicirljiv za studente.
2. Arhiviranje oglasa: Sklanjanje već zatvorenog oglasa iz primarnih tabova u historijsku arhivu. 

Glavni izazov bio je rigidni uslov na backendu: oglas se **ne može** direktno arhivirati ako je u bazi podataka još uvijek u stanju `AKTIVAN`, čak i ako je njegov `rokPrijave` hronološki prošao. Pokušaj arhiviranja takvog oglasa bacao je sistemsku grešku. Takođe, bilo je potrebno osigurati sigurne potvrde akcija od strane korisnika bez korištenja ružnih nativnih browser prozora.

---

**Šta je predloženo i implementirano**

A. Ulančana logika "Zatvori pa arhiviraj" (Chain-Action Workflow)
Kako bi se izbjegao prekid u radu i padanje backend validacije za oglase kojima je istekao rok, a vode se kao aktivni, na frontendu je implementiran pametni asinhroni lanac akcija:
- Kada korisnik klikne na **"Arhiviraj"**, sistem prvo provjerava trenutno stanje i rok oglasa.
- Ako je oglas istekli `AKTIVAN`, aplikacija pod haubom automatski prvo šalje tihi zahtjev na API endpoint za zatvaranje oglasa (`closeListing`).
- Tek nakon što stigne uspješan odgovor (`200 OK`) i status u bazi pređe u `ZATVOREN`, skripta u istom koraku automatski šalje drugi zahtjev za arhiviranje (`archiveListing`).
- Na ovaj način korisnik završava kompletan posao jednim klikom, a backend pravila su u potpunosti ispoštovana.

B. Integracija `CustomConfirmModal` komponente
Za eliminaciju nativnog `window.confirm()` dijaloga, implementiran je prilagođeni modalni prozor integrisan u React stanje dashboarda:
- Prije izvršavanja funkcije `handleCloseListing` ili `handleArchiveListing`, aktivira se modal koji prima tekstualno upozorenje prilagođeno specifičnoj akciji (npr. *"Jeste li sigurni da želite zatvoriti ovaj oglas? Ova akcija je nepovratna."*).
- Modal koristi `danger` stilske klase za destruktivne akcije (zatvaranje) i `warning` klase za premještanje podataka (arhiviranje), prateći cjelokupni vizuelni identitet i tamnu temu (dark mode) aplikacije.

C. Unifikacija CSS-a za akciona dugmad (`.cd-listing-actions-wrapper`)
Uklonjeni su svi nekonzistentni inline stilovi sa dugmadi unutar kartica oglasa. 
- U `KompanijaDashboard.css` kreirana je nova klasa `.cd-listing-actions-wrapper`.
- Ova klasa postavlja standardizovani flexbox raspored sa predefinisanim razmacima (`gap`) i fiksnom visinom elemenata (38px).
- Time je osigurano da dugmad "Zatvori oglas", "Arhiviraj" i "Vrati iz arhive" imaju identične dimenzije, poravnanje i efekte prelaza (`transition`), bez obzira na to u kojem se tabu kartica oglas nalazi.

**Prihvaćena rješenja i ishodi**
- **Potpuno prihvaćeno:** Automatsko ulančavanje API poziva koje sprječava greške pri arhiviranju isteklih oglasa.
- **Poboljšan UX:** Zamjena nativnih pop-up prozora elegantnim i sigurnim modalima.
- **Čistiji kod:** Izbacivanje inline stilova iz JSX-a i centralizacija CSS pravila za upravljačke elemente oglasa.

**Rizici i napomene za stabilnost**
- **Rizik od prekida mrežnog lanca:** Ako prvi API poziv (zatvaranje) uspije, a drugi (arhiviranje) padne uslijed mrežne greške, oglas će ostati u stanju `ZATVOREN` ali neće biti arhiviran. UI je osiguran tako da u tom slučaju ispravno osvježi stanje i ostavi oglas u tabu za zatvorene oglase, odakle ga korisnik može ponovo ručno arhivirati.