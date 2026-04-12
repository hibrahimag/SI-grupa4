# Architecture Overview
## Sistem za upravljanje studentskim praksama

---

## 1. Kratak opis arhitektonskog pristupa

Sistem koristi **Client-Server arhitekturu** organizovanu u tri sloja 
(Layered / N-tier), gdje React klijent komunicira sa Express/Node.js 
serverom putem REST API-ja, a server upravlja podacima kroz PostgreSQL 
bazu podataka.

Arhitektonski pristup je odabran jer:
- Jasno razdvaja odgovornosti između prezentacijskog, 
  poslovnog i podatkovnog sloja
- Omogućava paralelni razvoj frontenda i backenda
- Odgovara prirodi sistema koji ima više korisničkih rola 
  (student, kompanija, koordinator, administrator)

---

## 2. Glavne komponente sistema
    CLIENT (React) - Prezentacijski sloj                 

    SERVER (Node.js + Express) - Sloj poslovne logike                

    BAZA PODATAKA (PostgreSQL) - Infrastrukturni sloj

Komponente su organizovane u sljedeće module:

**Frontend moduli (React):**
- Auth modul (registracija, prijava, verifikacija)
- Oglas modul (pregled, detalji, filtriranje, pretraga)
- Prijava modul (prijava na praksu, status, odustajanje)
- Dashboard modul (student dashboard, notifikacije)
- Profil modul (profil studenta, profil kompanije)
- Tok prakse modul (ugovor, evidencija, evaluacija)
- Admin/Koordinator modul (odobravanje, upravljanje)

**Backend moduli (Express):**
- Auth servis (JWT autentifikacija, verifikacija emaila)
- Oglas servis (CRUD oglasa, filtriranje, pretraga)
- Prijava servis (upravljanje prijavama, statusima)
- Korisnik servis (upravljanje profilima i rolama)
- Notifikacija servis (slanje email i in-app notifikacija)
- Ugovor servis (generisanje i preuzimanje ugovora)
- Evaluacija servis (evaluacija studenta i kompanije)

---

## 3. Odgovornosti komponenti

| Komponenta | Odgovornost |
|------------|-------------|
| React (Frontend) | Prikaz korisničkog interfejsa, upravljanje stanjem, slanje HTTP zahtjeva prema API-ju |
| Fetch API | HTTP komunikacija između Reacta i Express API-ja |
| Express (Backend) | Obrada API zahtjeva, poslovna logika, autorizacija, validacija |
| JWT Middleware | Provjera identiteta i role korisnika na svakom zaštićenom endpointu |
| PostgreSQL | Trajno skladištenje svih podataka sistema |
| Nodemailer | Slanje emailova (verifikacija, reset lozinke, notifikacije) |
| Multer | Upload i validacija PDF dokumenata (CV, motivaciono pismo) |

---

## 4. Tok podataka i interakcija

React komponenta -> Fetch API -> Express Router -> JWT Middleware -> Controller -> Service -> PostgreSQL -> Service -> Controller -> React komponenta

- React komponenta inicira HTTP zahtjev putem Fetch API-ja prema Express Routeru koji prosljeđuje zahtjev JWT Middlewareu na provjeru tokena i role. Nakon uspješne provjere, Controller validira podatke i poziva Service koji izvršava poslovnu logiku i SQL upit prema PostgreSQL bazi. Baza vraća podatke nazad kroz Service i Controller koji šalje JSON odgovor, a React komponenta ažurira stanje i renderuje UI.

---
**Primjer konkretnog toka — Student se prijavljuje na praksu:**
1. Student klikne "Prijavi se" na oglasu u Reactu
2. Fetch šalje `POST zahtjev` sa JWT tokenom u headeru
3. JWT middleware provjeri token i potvrdi da je korisnik student
4. PrijavaController validira podatke (oglas aktivan, student nije već prijavljen)
5. PrijavaService kreira zapis u bazi, postavlja status "na čekanju"
6. NotifikacijaService šalje email kompaniji o novoj prijavi
7. Server vraća `201 Created` sa podacima prijave
8. React ažurira dashboard studenta sa novim statusom

---
## 5. Ključne tehničke odluke

| Odluka | Odabrano rješenje | Razlog |
|--------|-------------------|--------|
| Frontend framework | React | Komponentna arhitektura pogodna za višerolni sistem, veliki ekosistem |
| Backend framework | Node.js + Express | JavaScript na oba kraja, bogat npm ekosistem, lagan REST API razvoj |
| Baza podataka | PostgreSQL | Relacijska struktura prirodno odgovara vezama student→prijava→oglas→kompanija |
| Autentifikacija | JWT (JSON Web Token) | Stateless autentifikacija, pogodan za REST API, nosi informaciju o roli |
| Autorizacija | Role-based (RBAC) | Sistem ima 4 jasno definirane role: student, kompanija, koordinator, admin |
| File upload | Multer (PDF only) | Validacija formata fajla na serverskoj strani (US-14, US-7) |
| Email servis | Nodemailer | Slanje verifikacionih emailova, reset lozinke i notifikacija (US-34, US-37, US-38) |
| Password hashing | bcrypt | Industrijski standard za sigurno hashovanje lozinki |

---

## 6. Ograničenja i rizici arhitekture

**Ograničenja:**
- Skalabilnost je ograničena monolitnom strukturom backenda —
  pri velikom broju korisnika može biti potrebno horizontalno skaliranje
- Sva poslovna logika je centralizovana na jednom Express serveru,
  što znači da kvar servera onesposobljava cijeli sistem
- PostgreSQL zahtijeva upravljanje shemom kroz migracije
  što povećava složenost pri promjenama modela podataka

**Rizici:**
- JWT tokeni se ne mogu invalidirati prije isteka — 
  potrebno implementirati blacklist mehanizam pri odjavi
- Upload PDF dokumenata bez antivirusne provjere 
  predstavlja potencijalni sigurnosni rizik
- Slanje emailova ovisi o eksternom SMTP serveru — 
  kvar servera blokira verifikaciju i notifikacije
- Privatnost studentskih podataka zahtijeva pažljivu 
  implementaciju autorizacije (student ne smije vidjeti tuđe prijave)

---

## 7. Otvorena pitanja

- Koji SMTP servis koristiti za produkcijsko slanje emailova 
  (SendGrid, Mailgun, Gmail SMTP)? //moja preporuka je gmail smtp    besplatan do 500 mailova dnevno
- Da li implementirati refresh token mehanizam uz JWT 
  ili koristiti kratke tokene sa čestim ponovnim prijavama?
- Koja strategija migracije baze podataka će se koristiti 
  (custom SQL skripte)?