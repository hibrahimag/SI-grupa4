# AI Usage Log — Sprint 4

## Unos 1 — Inicijalna implementacija Admin Dashboard (US-9)

| Polje | Sadržaj |
|---|---|
| **Datum** | 26.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Implementacija US-9 — admin dashboard |

**Kratak opis upita:**

# Implementacija US-9 — Admin Dashboard


Implementiraj Admin dashboard
Stack: React (frontend) + Node.js/Express (backend) + PostgreSQL (`pg`).  
Autentifikacija i JWT se **ne implementiraju** u ovom koraku.

---

## Baza podataka

Kreirati tabelu `users` sa sljedećim poljima:

| Polje | Tip | Napomena |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(150) | NOT NULL UNIQUE |
| `role` | ENUM | STUDENT, COMPANY, COORDINATOR, ADMIN |
| `status` | ENUM | PENDING, ACTIVE, DEACTIVATED |
| `institution` | VARCHAR(150) | nullable |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

Dodati seed podatke koji pokrivaju sve kombinacije rola i statusa.

---

## Backend

### Rute

**`GET /api/admin/users`**  
Vraća sve korisnike. Podržava opcionalni query param `?status=pending` za filtriranje.

**`PATCH /api/admin/users/:id/role`**  
Mijenja role korisnika. Body: `{ "role": "COORDINATOR" }`. Validira da je proslijeđeni role jedna od dozvoljenih enum vrijednosti.

**`PATCH PATCH /api/admin/users/:id/status`**
Promijeni status korisnika `(ACTIVE / DEACTIVATED)`

---

## Frontend

Kreirati `AdminDashboard.jsx` i `AdminDashboard.css` sa sljedećim elementima:

- **Sidebar navigacija** sa stavkama: Pregled, Korisnici, Odobravanje, Audit log, Statistike
- **Tablica korisnika** — kolone: ime, email, role, status, institucija, datum registracije, dropdown za promjenu role
- **Filter** — dropdown za filtriranje tablice po statusu (svi / pending / active / deactivated)
- **Pending odobravanje** — lista korisnika sa statusom PENDING, dugmad Odobri / Odbij po redu
- **Audit log** — statični mock podaci, funkcionalna logika dolazi u Sprint 9 (US #51)
- **Dodjela admin pristupa** — forma s poljem za email i dugmetom za dodjelu ADMIN role
- Toast notifikacija nakon svake akcije (uspjeh / greška)
- Loading state dok se podaci učitavaju
**Šta je AI predložio ili generisao:**
- Backend: `admin.controller.js`, `admin.service.js`, `admin.routes.js`, `User.js` model, konekcija na bazu
- Frontend: kompletni `AdminDashboard.jsx` (464 linije) i `AdminDashboard.css` (528 linija) sa sidebar navigacijom, tablicom korisnika, pending odobravanjem, audit logom i mock podacima

**Šta je tim prihvatio:**
Prihvaćeni su dizajn layouta, karitca i sidebara

**Šta je tim izmijenio:**
Raspored kartica (zauzimaju sav slobodan prstor) i usklađen css sa već posotjećim (nijanse i boje)

**Šta je tim odbacio:**


**Rizici, problemi ili greške:**
privremeno se koriste mock podaci pošto je audit log odvojeni US


---

## Unos 2 — Popravka admin dashboard logike

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Ispravka grešaka u toku odobravanja admin korisnika |

**Kratak opis upita:**

> Admin korisnici koji imaju PENDING status pojavljuju se u listi koordinatora na čekanju. Forma za dodjelu admin role šalje samo toast poruku bez pozivanja API-ja, pa korisnik ostaje PENDING. Traži se uklanjanje admina iz pending liste i funkcionalna forma za dodjelu role.

**Šta je AI predložio ili generisao:**
- Filtriranje `role !== 'ADMIN'` pri učitavanju pending korisnika (`AdminDashboard.jsx`, linija 92)
- Novu funkciju `handleAssignAdmin(email)` koja dohvata sve korisnike, pronalazi korisnika po emailu, poziva `updateUserRole(id, 'ADMIN')` i `updateUserStatus(id, 'ACTIVE')`, te uklanja korisnika iz pending liste
- Inicijalno je predložio i brisanje sekcije "Dodjela admin pristupa" iz UI-ja

**Šta je tim prihvatio:**
- Filtriranje ADMIN korisnika iz pending liste
- Funkcionalnu `handleAssignAdmin` funkciju koja stvarno poziva API

**Šta je tim izmijenio:**
- Ništa — logika prihvaćena kako je generisana

**Šta je tim odbacio:**
- Brisanje sekcije "Dodjela admin pristupa" (forme za unos emaila) — tim želi zadržati UI element za dodjelu admin role

**Rizici, problemi ili greške:**
- AI je inicijalno pogrešno interpretirao zahtjev i uklonio formu koju korisnik želi zadržati — korekcija zahtijevala dodatni krug komunikacije
- `handleAssignAdmin` dohvata sve korisnike kako bi pronašao korisnika po emailu — efikasnije bi bilo imati dedicated backend endpoint koji prima email direktno (tehnički dug)

---

## Unos 3 — Implementacija pravne dokumentacije (Privacy Policy, Terms & Conditions, Cookie Policy)

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | ChatGPT (GPT‑5, OpenAI) |
| **Ko je koristio** | zpandza1 |
| **Svrha korištenja** | Generisanje i strukturisanje pravne dokumentacije za aplikaciju |

**Kratak opis upita:**

> Potrebno je generisati inicijalne verzije dokumenata Privacy Policy, Terms & Conditions i Cookie Policy za web aplikaciju. Dokumenti trebaju sadržavati standardne pravne sekcije (obrada podataka, prava korisnika, odgovornosti, ograničenje odgovornosti, kolačići, izmjene uslova itd.) i biti povezani sa landing page-om.

---

**Šta je AI predložio ili generisao:**
- Kompletan nacrt Privacy Policy dokumenta sa standardnim sekcijama (prikupljanje podataka, svrha obrade, prava korisnika, sigurnost podataka)
- Kompletan nacrt Terms & Conditions dokumenta (prava i obaveze korisnika, ograničenje odgovornosti, izmjene uslova)
- Kompletan nacrt Cookie Policy dokumenta (tipovi kolačića, svrha korištenja, upravljanje kolačićima)
- Prijedlog strukture stranica i način povezivanja dokumenata sa landing page-om
- Inicijalni frontend prikaz dokumenata

---

**Šta je tim prihvatio:**
- Tekstualni sadržaj i strukturu svih dokumenata
- Organizaciju sekcija i pravni stil pisanja
- Način povezivanja dokumenata sa landing page-om

---

**Šta je tim izmijenio:**
- Prilagodio specifične informacije vezane za projekat (naziv aplikacije, tip podataka koji se prikupljaju, kontakt podaci)
- Poboljšao frontend izgled jer predloženi dizajn nije bio estetski usklađen sa ostatkom aplikacije
- Uskladio CSS (boje, nijanse, spacing, raspored sekcija) sa postojećim vizuelnim identitetom sistema

---

**Šta je tim odbacio:**
- Originalni vizuelni prijedlog prikaza dokumenata koji se nije uklapao u postojeći UI dizajn
- Generičke formulacije koje nisu bile relevantne za stvarne funkcionalnosti aplikacije

---

**Rizici, problemi ili greške:**
- Potencijalna generičnost pravnih formulacija
- Rizik od pravno nedovoljno preciznih izraza — svi dokumenti su ručno pregledani i prilagođeni prije implementacije
- AI dizajn prijedlog nije bio u skladu sa postojećim frontend stilom, što je zahtijevalo dodatno ručno prilagođavanje

---

## Unos 4 — Inicijalna implementacija Landing page (US-41)

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija US-41 — početna stranica (Landing page) |

**Kratak opis upita:**

> Implementirati landing page za sistem za upravljanje studentskim praksama. Stack: React frontend sa React Router DOM. Stranica treba biti edukativnog karaktera, s plavo-bijelom temom. Navigacijska traka treba sadržavati logo, navigacijske linkove, ikonicu za tamni režim te dugmad za prijavu i registraciju. Sekcije: hero, kako funkcioniše, za studente, za kompanije, pregled uloga (student, kompanija, koordinator, administrator) i footer. Sve ikone trebaju biti outline/stroke stil.

---

**Šta je AI predložio ili generisao:**
- Kompletan `LandingPage.jsx` s inline stilovima (bez zasebnog CSS fajla)
- Fiksni navbar s blur efektom pri scrollovanju, smooth scroll na sekcije, placeholder dugme za tamni režim i search bar
- Hero sekcija s gradijentnim naslovom, dva CTA dugmeta i karticom desno 
- Sekcija "Kako funkcioniše" s 4 koraka (01–04)
- Sekcija "Za studente" s listom funkcionalnosti i 4 feature kartice
- Sekcija "Za kompanije" s 4 value prop kartice
- Sekcija "Ko koristi platformu" s karticama po ulogama (Student, Kompanija, Koordinator, Administrator)
- CTA sekcija i footer s kolonama linkova
- Sve SVG ikone kao inline React komponente (outline stil)

---

**Šta je tim prihvatio:**
- Cjelokupnu strukturu i raspored sekcija
- Dizajn navbara, footer i sekcija
- Inline SVG ikone outline stila
- Plavo-bijelu temu s ljubičastim akcentima

---

**Šta je tim izmijenio:**
- Dodan vlastiti logo umjesto generiranog logotipa
- Promijenjeni pojedini tekstovi i opisi sekcija
- Sitne korekcije boja i razmaka
- Stavljena fiksna boja navbar-a

---

**Šta je tim odbacio:**
- Prva verzija kartice u hero sekciji prikazivala je konkretan mock oglas ("Frontend Developer Praksa, TechCorp") - odbačeno jer oglasi još nisu implementirani
- Footer je inicijalno sadržavao FAQ i Kontakt linkove - odbačeno jer te stranice nisu planirane u user storyjima

---

**Rizici, problemi ili greške:**
- Browser defaultni `margin: 8px` na `<body>` uzrokovao bijeli prostor oko rubova - riješeno dodavanjem CSS reseta u `index.html`
- Potrebno je dodati `box-sizing: border-box` i `overflow-x: hidden` globalno

---

## Unos 5 — Iterativne izmjene Landing page dizajna

| Polje | Sadržaj |
|---|---|
| **Datum** | 27.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Poboljšanje i korekcija landing page komponenti |

**Kratak opis upita:**

> Niz iterativnih izmjena na landing pageu: ukloniti konkretni mock oglas iz hero kartice, ukloniti search bar iz navbara, zamijeniti sve emoji ikone s outline SVG ikonama, ukloniti mock dashboard kompanije, popraviti navigacijske linkove da koriste smooth scroll, zamijeniti `<a href>` s `<Link>` iz react-router-dom, promijeniti hero karticu u areas carousel.

---

**Šta je AI predložio ili generisao:**
- Uklanjanje search bara iz navbara, predloženo stavljane na ListingsPage
- Redesign hero kartice: areas carousel s 6 oblasti
- Areas carousel komponenta (`AreasCarousel`) s auto-advance svakih 3s, fade/slide animacijom, dot indikatorima i prev/next strelicama
- Oblasti: Programiranje & IT, Medicina, Biznis & Marketing, Inženjering, Dizajn & Kreativa, Pravo & Uprava - svaka s ikonom, bojom i primjerima pozicija
- Zamjena svih `<a href>` linkova s `<Link to>` iz react-router-dom
- Fluid width: `maxWidth: "min(1320px, 92vw)"` umjesto fiksnog `1100px`
- Administrator kartica bez CTA dugmeta ("Interno kreiranje naloga")

---

**Šta je tim prihvatio:**
- Areas carousel kao finalno rješenje za hero karticu
- Fluid width za sve sekcije
- `<Link>` umjesto `<a href>` za sve interne rute
- Administrator kartica bez dugmeta za registraciju

---

**Šta je tim izmijenio:**
- Rute promijenjene iz `/oglasi` u `/listings` radi usklađivanja s postojećim `App.jsx` rutama

---

**Šta je tim odbacio:**
- Status tracker mock (zamijenjen carousel-om)
- "Zašto PraksaHub?" lista u hero kartici

---

**Rizici, problemi ili greške:**
- `maxWidth: 1100` ostavljao previše bijelog prostora na velikim monitorima - riješeno fluid width pristupom

---

## Unos 6 — Korekcije footera i navbara

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Usklađivanje redosljeda navigacije i footer linkova |

**Kratak opis upita:**

> Uskladiti redosljed linkova u navbaru s redoslijedom sekcija na stranici. Footer linkove koji vode na sekcije pretvoriti u scroll dugmad umjesto `<Link>` komponenti. Pravno sekcija treba voditi na `/terms`, `/privacy`, `/cookies`.

---

**Šta je AI predložio ili generisao:**
- Novi redosljed `NAV_LINKS`: Kako funkcioniše → Za studente → Za kompanije → O platformi
- Footer refaktor: novi format linkova s `type: "scroll"` i `type: "route"` distinkcijom
- Scroll linkovi rendiraju se kao `<button onClick={() => scrollToSection(target)}>` 
- Route linkovi rendiraju se kao `<Link to={target}>`

---

**Šta je tim prihvatio:**
- Novi redosljed navbara
- Distinkcija scroll vs route linkova u footeru

---

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**
- Miješanje starog formata `[label, to]` i novog formata `{ label, type, target }` u footer `.map()` uzrokovalo `TypeError: object is not iterable` - riješeno kompletnom zamjenom bloka koda

---

## Unos 7 — Responzivnost landing pagea za mobilne uređaje

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Prilagodba landing pagea za mobilne i tablet uređaje |

**Kratak opis upita:**

> Implementirati responzivnost landing pagea za manje uređaje. Navbar treba imati hamburger meni koji otvara/zatvara navigacijski drawer. Sve sekcije trebaju biti raspoređene vertikalno (jedno ispod drugog) umjesto grid layouta. Sekcija "Za kompanije" na landing page-u treba imati "invisible badge" koji je vidljiv samo u mobilnoj verziji na vrhu kartice. Carousel oblasti treba ispravno funkcionirati na touch uređajima.

---

**Šta je AI predložio ili generisao:**
- Hamburger ikonica u navbaru koja se prikazuje na manjim ekranima, zamjenjuje desktop navigacijske linkove
- Mobile drawer navigacija s overlay-om koji se zatvara klikom izvan menija
- CSS media queries (ili inline `window.innerWidth` provjere) za prelaz iz grid u flex/column layout
- Sve sekcije (hero, za studente, za kompanije, uloge) prelaze na jednu kolonu na mobilnom
- "Invisible badge" za kompaniju - vidljiv samo na mobilnoj verziji iznad kartice Za kompanije sekcije
- Prilagodba paddinga za manje ekrane

---

**Šta je tim prihvatio:**
- Hamburger meni i mobile drawer navigacija
- Vertikalni raspored svih sekcija na mobilnom
- Mobile badge za kompaniju

---

**Šta je tim izmijenio:**
- Vizuelne korekcije drawer menija

---

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

---

## Unos 8 — Dark mode za AdminDashboard i pravne stranice; ikonica za tamni režim

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Proširenje dark mode podrške na AdminDashboard i pravne stranice; zamjena placeholder dugmeta za tamni režim ikonom sunca/mjeseca |

**Kratak opis upita:**

> Implementirati dark mode na `AdminDashboard` stranici koji se sinkronizira s landing pageom putem `ThemeContext` - promjena teme na jednoj stranici treba biti vidljiva i na drugoj, a stanje se čuva u `localStorage`. Pored toga, uskladiti CSS dizajn pravnih stranica (`PrivacyPolicy`, `TermsAndConditions`, `CookiesPolicy`) s dizajnom landing pagea (font, boje, razmaci). Pored ikonice mjeseca (tamni režim) dodati i ikonicu sunca (svijetli režim).

---

**Šta je AI predložio ili generisao:**
- Upute za import `useTheme` hooka iz `ThemeContext` u `AdminDashboard.jsx`
- Dodavanje `darkMode` varijable i primjena `dark` CSS klase na root `div` element dashboarda
- Kompletne dark mode CSS varijable za `AdminDashboard.css` - sidebar, navbar, kartice, tabele, dugmad, badge-ovi, audit log, inputi, filteri
- Konzistentni dizajn tamne teme s landing pageom (iste boje)
- Inline SVG ikona sunca za svjetli režim u navbaru landing pagea

---

**Šta je tim prihvatio:**
- Sinkronizaciju teme između stranica putem `ThemeContext` i `localStorage`
- Dark mode CSS varijable za AdminDashboard
- SVG ikonice sunca/mjeseca u navbaru

---

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**
- `useState` nije bio importan u `AdminDashboard.jsx` nakon dodavanja `sidebarOpen` stanja - uzrokovalo `ReferenceError: useState is not defined` i bijeli ekran; riješeno dodavanjem `useState` u import iz Reacta

---
# AI Usage Log — Sprint 6

## Unos 9 — Implementacija Password Reset funkcionalnosti

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | tvoje_korisnicko_ime |
| **Svrha korištenja** | Implementacija funkcionalnosti obnavljanja lozinke |

**Kratak opis upita:**

> Potrebno je implementirati kompletan password reset flow za autentifikaciju korisnika. Funkcionalnost treba uključivati backend endpointe za zahtjev resetovanja lozinke i postavljanje nove lozinke, generisanje sigurnosnog tokena sa istekom važenja, slanje reset emaila putem Gmail SMTP servera, te frontend stranice za unos email adrese i postavljanje nove lozinke. Dizajn frontend stranica mora biti usklađen sa postojećim AuthPage izgledom i styling sistemom aplikacije.

---

**Šta je AI predložio ili generisao:**
- Backend implementaciju `forgotPasswordService` i `resetPasswordService`
- Generisanje reset tokena korištenjem `crypto.randomBytes`
- Logiku za expiry tokena (`passwordResetExpires`)
- Integraciju Gmail SMTP servera preko `nodemailer`
- `email.service.js` za slanje reset emailova
- Nove backend rute:
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
- Frontend stranice:
  - `ForgotPasswordPage.jsx`
  - `ResetPasswordPage.jsx`

---

**Šta je tim prihvatio:**
- Kompletnu backend logiku za password reset
- Token-based reset pristup
- Gmail SMTP integraciju

---

**Šta je tim izmijenio:**
- Prilagođene poruke grešaka i validacije na bosanskom jeziku
- Usklađen frontend spacing i positioning sa postojećim `AuthPage.css`
- Refaktorisani frontend servisi da koriste postojeći `apiRequest` helper

---

**Šta je tim odbacio:**
- Direktno otkrivanje da li email postoji u sistemu (iz sigurnosnih razloga)
- Korištenje obične Gmail lozinke umjesto App Password pristupa

---

**Rizici, problemi ili greške:**
- Gmail SMTP autentifikacija inicijalno nije radila zbog potrebe za Google App Password konfiguracijom
- Merge konflikti nakon spajanja sa `develop` branchom zahtijevali ručno spajanje auth controller/service fajlova
- Potrebno ručno dodavanje novih kolona u Supabase bazu:
  - `passwordResetToken`
  - `passwordResetExpires`
- Reset token mora biti pravilno invalidiran nakon uspješne promjene lozinke

## Unos 10 — Implementacija registracije korisnika i upravljanja fakultetima

| Polje | Sadržaj |
|---|---|
| **Datum** | 06.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija registracije za studente, koordinatore i kompanije, te CRUD upravljanje fakultetima u admin panelu |

**Kratak opis upita:**

> Implementirati registraciju korisnika s tri tipa naloga: Student, Koordinator i Kompanija. Registracija treba biti u više koraka — odabir uloge, popunjavanje forme, opcionalni korak za opis kompanije. Forma treba imati validaciju, provjeru dostupnosti korisničkog imena i emaila u realnom vremenu, dropdown za odabir fakulteta, prihvatanje uslova korištenja i success korak s auto-redirectom. Backend treba kreirati korisnika i odgovarajući profil u transakciji. Admin panel treba dobiti sekciju za upravljanje fakultetima (dodaj, uredi, obriši).

**Šta je AI predložio ili generisao:**
- Kompletni `RegisterPage.jsx` — forma s komponentama `RoleSelect`, `FormStep`, `OpisStep`, `SuccessStep`; realno-vremenski `checkAvailability` s debounce od 500ms i vizuelnim indikatorima (spinner, checkmark, X); dropdown za fakultet; validacija svih polja; checkbox za uslove korištenja; auto-redirect nakon uspješne registracije
- Kompletni `RegisterPage.css` — dizajn forme, kartica uloga, polja s greškama, availability indikatora, success ekrana
- Backend `auth.service.js` — `register` funkcija koja pokriva sve tri uloge; transakcije za kreiranje `User` + `Student`/`Koordinator`/`Kompanija`; hashiranje lozinke; validacija emaila, lozinke, godine studija; provjera jedinstvenosti korisničkog imena i emaila; `checkAvailability` i `getPublicFaculties` funkcije
- Backend `auth.controller.js` i `auth.routes.js` — endpoint za registraciju, provjeru dostupnosti i dohvat fakulteta
- Frontend `auth.service.js` — `register`, `getPublicFaculties`, `checkAvailability` API pozivi
- Frontend `adminService.js` — `getFaculties`, `createFaculty`, `updateFaculty`, `deleteFaculty`
- Proširenje `AdminDashboard.jsx` — nova sekcija `FacultiesView` s formom za dodavanje fakulteta, tablicom s inline editovanjem i brisanjem
- Backend admin service/controller/routes — `getFaculties`, `createFaculty`, `updateFaculty`, `deleteFaculty` s validacijom i zaštitom od brisanja fakulteta koji ima vezane studente ili koordinatore

**Šta je tim prihvatio:**
- Cjelokupnu strukturu registracije
- Realno-vremensku provjeru dostupnosti s debounce logikom
- Transakcijsko kreiranje korisnika i profila na backendu
- Zaštitu od brisanja fakulteta koji ima vezane korisnike
- Dizajn i raspored `RegisterPage`

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

---

## Unos 11 — Dodavanje odsjeka, kontakt osobe i upravljanja odsjecima (fix/missing-profile-fields)

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Dodavanje polja `odsjek` za studente i koordinatore, `kontaktOsoba` za kompanije, kreiranje `Odsjek` tabele i upravljanja odsjecima u admin panelu |

**Kratak opis upita:**

> Dodati polje `odsjek` (odsjek fakulteta) za studente i koordinatore, te polje `kontaktOsoba` za kompanije. Odsjek treba biti posebna tabela vezana za fakultet, a student/koordinator bira odsjek putem dropdowna pri registraciji. Dropdown se učitava dinamički nakon odabira fakulteta i nije obavezan. Admin treba moći upravljati odsjecima unutar upravljanja fakultetima. Polje `kontaktOsoba` je opcionalno tekstualno polje s italic placeholderom "Ime i prezime".

**Šta je AI predložio ili generisao:**
- Novi model `Odsjek.js` — tabela `odsjeci` s poljima `id`, `naziv`, `fakultetID`
- Dodavanje nullable kolone `odsjekID` (FK) u modele `Student` i `Koordinator`
- Dodavanje nullable kolone `kontaktOsoba` VARCHAR(150) u model `Kompanija`
- Ažuriranje `index.js` — registracija modela, 4 nove asocijacije (`Fakultet→Odsjek`, `Odsjek→Student`, `Odsjek→Koordinator`), eksport `Odsjek`
- Backend admin: `getOdsjeci`, `createOdsjek`, `deleteOdsjek` u service/controller/routes
- Backend public endpoint `GET /api/auth/faculties/:id/odsjeci` za dohvat odsjeka pri registraciji
- Ažuriranje `auth.service.js` — registracija studenta/koordinatora sada prima `odsjekID`, registracija kompanije prima `kontaktOsoba`
- Frontend `RegisterPage.jsx` — dropdown za odsjek koji se učitava nakon odabira fakulteta, poruka "Odsjeci još nisu dodani" ako fakultet nema odsjeka, polje `kontaktOsoba` s italic placeholderom
- Frontend `AdminDashboard.jsx` — `OdsjekPanel` komponenta unutar upravljanja fakultetima: expandabilni panel po redu, lista odsjeka s brisanjem, forma za dodavanje, dugme "Završi dodavanje"

**Šta je tim prihvatio:**
- Kompletnu arhitekturu `Odsjek` tabele vezane za `Fakultet`
- `odsjekID` kao nullable FK na `Student` i `Koordinator` (ne briše postojeće podatke)
- `kontaktOsoba` kao nullable polje na `Kompanija`
- Odluku da se `fakultetID` zadrži na `Student` i `Koordinator` radi kompatibilnosti s postojećim kodom
- Odsjek dropdown kao opcionalan u registraciji
- UX odluku da odsjeci budu upravljani unutar admin panela za fakultete, a ne kao zasebna sekcija

**Šta je tim izmijenio:**

**Šta je tim odbacio:**
- Inicijalni prijedlog jednostavnog VARCHAR polja za odsjek — odbačeno jer ne omogućava konzistentnost između studenata i koordinatora istog odsjeka

**Rizici, problemi ili greške:**
- `getPublicOdsjeci` funkcija dodana u `auth.service.js` ali zaboravljena u `module.exports` — uhvaćeno tokom provjere prije pokretanja, riješeno odmah
- `ECONNRESET` greška pri prvom pokretanju servera — Supabase je prekinuo konekciju tokom `sync({ alter: true })` koji izvršava više `ALTER TABLE` naredbi zaredom; riješeno ponovnim pokretanjem

## Unos 12 — Implementacija test suite-a za backend

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Pisanje unit, mock i integracijskih testova za auth i admin module |

**Kratak opis upita:**

> Napisati kompletni test suite za backend koristeći Jest i Supertest. Pokriti auth i admin module sa tri nivoa testiranja: unit testovi za middleware i service funkcije, mock testovi za route/controller sloj (bez prave baze), i integracijski testovi koji koriste pravu Supabase bazu.

npr.
PATCH /api/admin/users/:id/role (body: role)
- 200: findByPk vraća korisnika, body { role:'COORDINATOR' } → status 200, res.body.user.role='COORDINATOR', save() pozvan
- 200: body { role:'admin' } → res.body.user.role='ADMIN'
- 400: body {} → status 400, message matcha /role/i
- 400: body { role:'SUPERADMIN' } → status 400
- 400: id='abc' → status 400
- 400: id=-1 → status 400
- 404: findByPk vraća null → status 404, message matcha /not found/i


loginService(identifier, password):
- throws: findOne vraća null → 'Pogrešno korisničko ime/e-mail ili lozinka.'
- throws: user.status='DEACTIVATED' → 'Vaš nalog je deaktiviran...'
- throws: user.status='PENDING' → 'Vaš nalog još nije aktivan...'
- throws: bcrypt.compare=false → 'Pogrešno korisničko ime/e-mail ili lozinka.'
- OK: bcrypt.compare=true, jwt.sign='mocked.jwt.token' → { token, user bez passwordHash }
- OK: jwt.sign pozvan s { id:42, role:'ADMIN' } i 'test-secret'
- DEACTIVATED provjera PRIJE bcrypt → bcrypt.compare nije pozvan
- PENDING provjera PRIJE bcrypt → bcrypt.compare nije pozvan

**Šta je AI predložio ili generisao:**
- 8 test fajlova: `auth.middleware.test.js`, `rbac.middleware.test.js`, `auth.service.test.js`, `admin.service.test.js`, `auth.routes.test.js`, `admin.routes.test.js`, `auth.routes.integration.test.js`, `admin.routes.integration.test.js`
- `jest.config.js` i konfiguraciju `package.json` s dva odvojena skripta: `npm test` (bez baze) i `npm run test:integration` (s bazom)
- Ukupno 143 testa

**Šta je tim prihvatio:**
- Kompletnu strukturu testova i podjelu na mock/unit/integration
- Sve test fajlove bez izmjena

**Šta je tim izmijenio:**
- Ništa strukturalno — samo ispravke mock helpera (`emailVerifikovan`, `approvalStatus`) nakon što je tim dodao nova polja u servise

**Šta je tim odbacio:**
- Nekoliko redundantnih testova u `admin.service.test.js` koji su bili pokriveni i u route testovima

**Rizici, problemi ili greške:**
- Nakon dva git pull-a tim je dodao nove provjere (`emailVerifikovan`, `approvalStatus`) u servise, što je srušilo 6-7 testova — zahtijevalo ažuriranje mock helpera
- Integracijski testovi zahtijevaju `.env` s DB kredencijalima — ne mogu ih pokrenuti svi članovi tima

## Unos 13 — Implementacija login funkcionalnosti (frontend + backend)

| Polje | Sadržaj |
|---|---|
| **Datum** | 03.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hibrahimag1 |
| **Svrha korištenja** | Implementacija kompletne login funkcionalnosti za četiri korisničke uloge (STUDENT, COMPANY, COORDINATOR, ADMIN) — login stranica, validacija kredencijala, JWT autentifikacija, RBAC middleware, preusmjeravanje prema ulozi |

**Kratak opis upita:**

> Implementirati login funkcionalnost za web aplikaciju PraksaHub. Potrebno je kreirati jedinstvenu login stranicu s koje se svi korisnici prijavljuju, implementirati validaciju kredencijala koja sprječava neispravne podatke, te preusmjeriti korisnike na odgovarajuće dashboarde prema njihovoj ulozi. Dashboardi koji još nisu implementirani zamjenjuju se privremenim (dummy) stranicama. Uz to, uspostaviti dijeljeni CSS sistem tokena (design tokens) za konzistentnost dizajna, te implementirati backend autentifikaciju putem JWT tokena i RBAC middleware.

---

**Šta je AI predložio ili generisao:**

- `frontend/src/styles/variables.css` — dijeljeni CSS design tokens (boje, fontovi, razmaci, sjene, radijusi) izvučeni iz postojećeg `AdminDashboard.css` radi konzistentnosti
- `frontend/src/pages/AuthPage.jsx` — login stranica s dvopanelnim layoutom (branding panel + forma), SVG ikonama, validacijom, spinner animacijom, prikazom grešaka i role chip indikatorima
- `frontend/src/pages/AuthPage.css` — stilovi za login stranicu koji koriste CSS varijable iz `variables.css`
- `frontend/src/context/AuthContext.jsx` — proširenje konteksta s `login()` i `logout()` funkcijama, čuvanje sesije u `sessionStorage`
- `frontend/src/services/auth.service.js` — fetch wrapper za `POST /api/auth/login` s bosanskim porukama greške
- `frontend/src/routes/index.jsx` — dodavanje ruta za dashboarde po ulozi (`/dashboard/student`, `/dashboard/company`, `/dashboard/coordinator`)
- `frontend/src/pages/StudentDashboard.jsx`, `KompanijaDashboard.jsx`, `KoordinatorDashboard.jsx` — privremene dummy stranice
- `frontend/src/modules/auth/ProtectedRoute.jsx` — komponenta za zaštitu ruta prema ulozi; neautentificirani korisnici se preusmjeravaju na `/auth`, korisnici s pogrešnom ulogom na `/`
- `backend/src/business/services/auth.service.js` — poslovna logika prijave: pretraga korisnika po usernamu ili emailu, provjera statusa naloga, bcrypt verifikacija lozinke, potpisivanje JWT tokena
- `backend/src/business/controllers/auth.controller.js` — HTTP sloj: validacija tijela zahtjeva, poziv servisa, mapiranje grešaka na HTTP statuse
- `backend/src/middleware/auth.middleware.js` — `authenticate` middleware: verifikacija Bearer tokena, postavljanje `req.user`
- `backend/src/middleware/rbac.middleware.js` — `authorize(...roles)` middleware: provjera uloge prijavljenog korisnika
- `backend/src/presentation/routes/auth.routes.js` — `POST /api/auth/login` ruta
- Upute za CommonJS konverziju svih generisanih fajlova (projekat ne koristi ES Module sintaksu)
- Upute za ispravku `admin.routes.js` — destrukturiranje `{ authenticate }` i `{ authorize }` umjesto importa cijelog modula
- Izmjene u `LandingPage.jsx` — prikaz imena korisnika i dugmeta "Odjavi se" u navbaru kada postoji aktivna sesija, sa preusmjeravanjem na odgovarajući dashboard

---

**Šta je tim prihvatio:**

- Kompletnu arhitekturu login toka (frontend + backend)
- Dijeljeni `variables.css` sistem tokena
- `AuthContext` s `sessionStorage` persistencijom
- JWT autentifikaciju i RBAC middleware
- `ProtectedRoute` komponentu smještenu u `modules/auth/`
- Bosanske poruke grešaka na svim slojevima
- Prikaz korisničkog imena i dugmeta "Odjavi se" u navbaru landing pagea

---

**Šta je tim izmijenio:**

- Pozicioniranje `ROLE_ROUTES` konstante premješteno na nivo modula u `LandingPage.jsx` (bilo greškom definirano unutar `AreasCarousel` komponente što je uzrokovalo bijeli ekran)
- Stilizacija dugmeta "Odjavi se" usklađena s postojećim `btnOutline` stilom iz landing pagea

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**

- `Failed to fetch` greška u browseru uzrokovana nepokrenuti backend serverom — nije bila greška u kodu
- `DB_URL undefined` greška pri pokretanju — `dotenv.config()` nije bio pozvan prije učitavanja `db.js`; riješeno premještanjem `require('dotenv').config()` na vrh `app.js`
- `Router.use() requires a middleware function` greška u `admin.routes.js` — stari placeholder middleware exportovao je funkciju direktno, dok novi exportuje named export; riješeno destrukturiranjem `{ authenticate }` i `{ authorize }` pri importu
- `bcrypt` modul nije bio instaliran — riješeno pokretanjem `npm install bcrypt@5 jsonwebtoken` u `backend/` direktoriju
- `ROLE_ROUTES` nedostupan u scope-u `LandingPage` komponente jer je bio definisan unutar `AreasCarousel` — uzrokovalo bijeli ekran; riješeno izvlačenjem na nivo modula


---

## Unos 14 — Dopuna postojećeg backend test suite-a nedostajućim unit i route testovima

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Codex / ChatGPT |
| **Ko je koristio** | haristucakovic |
| **Svrha korištenja** | Dopuna postojećeg backend test suite-a nedostajućim unit i route testovima |

**Kratak opis upita:**

> Potrebno je dopuniti postojeći backend test suite bez izmjene produkcijskog koda. Fokus je na dodavanju nedostajućih testova za auth rute i servise, approval workflow rute i servise, te placeholder endpoint. Testovi trebaju pokriti public odsjek endpoint, email verification, resend verification email funkcionalnost, approval tok i placeholder rutu.

**Šta je AI predložio ili generisao:**
- Dopunu `auth.routes.test.js` testovima za:
  - public odsjek endpoint
  - verify-email endpoint
  - resend-verification-email endpoint
- Dopunu `auth.service.test.js` testovima za:
  - public odsjek servisnu logiku
  - email verification servisnu logiku
  - resend verification email servisnu logiku
- Nove/dopunjene testove za approval workflow u:
  - `approval.routes.test.js`
  - `approval.service.test.js`
- Dopunu `placeholder.routes.test.js` testovima za placeholder endpoint

**Šta je tim prihvatio:**
- Dodavanje nedostajućih auth route i service testova
- Dodavanje approval workflow route i service testova
- Dodavanje placeholder endpoint testova

**Šta je tim izmijenio:**
- Ručno su dorađene poruke i očekivani rezultati u testovima radi usklađivanja sa stvarnim ponašanjem aplikacije

**Šta je tim odbacio:**
- Redundantne test slučajeve koji nisu potrebni za konkretan test slučaj

**Rizici, problemi ili greške:**
- Promjene su ograničene na testove, tako da nije bilo rizika za produkcijsku logiku.

  ---
  ## Unos 15 — Implementacija email verifikacije i odobravanja korisnika

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | ChatGPT (GPT-5, OpenAI) i Cursor|
| **Ko je koristio** | aglamoc1 |
| **Svrha korištenja** | Implementacija email verifikacije i odobravanja korisničkih računa |

### Kratak opis upita

> Potrebno je implementirati email verifikaciju nakon registracije korisnika i sistem odobravanja korisničkih računa od strane admina. Korisnik nakon registracije treba potvrditi email adresu putem verifikacijskog linka, nakon čega prelazi u PENDING status i ne može se prijaviti dok račun ne bude odobren. Admin dashboard treba sadržavati sekciju za pregled zahtjeva, detalje korisnika i approve/reject akcije sa slanjem email obavijesti.

---

### Šta je AI predložio ili generisao

- Generisanje verifikacionog tokena za email i slanje verifikacionog linka korisniku
- Backend logiku za verifikaciju email adrese i prelazak korisnika u fazu čekanja odobrenja
- Status-based autentifikaciju korisnika (blokada prijave dok email nije verifikovan i nalog nije odobren)
- Approve/reject workflow za administratore, sa evidencijom ko je i kada izvršio akciju
- Slanje email obavještenja korisniku nakon odobrenja ili odbijanja zahtjeva
- Admin dashboard funkcionalnosti za pregled i obradu zahtjeva korisnika

---

### Šta je tim prihvatio

- Kompletnu logiku verifikacije email adrese
- Workflow odobravanja/odbijanja korisnika nakon verifikacije
- Statusnu kontrolu prijave korisnika
- Email notifikacije za ključne promjene statusa naloga

---

### Šta je tim izmijenio

- Poruke grešaka i statusa lokalizovane na bosanski jezik
- UI prikaz pending i overdue korisnika u admin panelu
- Frontend API pozive refaktorisao tako da koriste postojeće servisne metode i strukturu projekta

---

### Šta je tim odbacio

- Automatsko odobravanje korisnika odmah nakon verifikacije emaila
- Mogućnost prijave korisnika dok je nalog u `PENDING` stanju

---

### Rizici, problemi ili greške

- Povremeni problemi sa SMTP konfiguracijom i isporukom verifikacionih emailova
- Merge konflikti prilikom integracije auth i admin funkcionalnosti
- Potreba za migracijama baze zbog novih polja za verifikaciju i odobravanje korisnika
- Moguć dupli poziv verifikacije, što može dati poruku “neispravan token” iako je prvi poziv uspio

---
