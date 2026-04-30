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
