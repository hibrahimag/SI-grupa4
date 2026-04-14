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


---

## 2. Glavne komponente sistema

**CLIENT (React) - Prezentacijski sloj**
Obuhvata sve ekrane i kontrole: dashborde po ulogama, forme za prijavu na praksu, pregled oglasa, praćenje statusa, upravljanje profilom i notifikacije. Svaka korisnička uloga dobija prilagođen prikaz prema svojim ovlaštenjima.

**SERVER (Node.js + Express) - Sloj poslovne logike**
Odvijaju se sva pravila i procesi: provjera identiteta i ovlaštenja korisnika, upravljanje tokom prijave na praksu, generisanje ugovora, slanje notifikacija i kontrola pristupa podacima.

**BAZA PODATAKA (PostgreSQL) - Infrastrukturni sloj**
Skladištenje svih informacija sistema: korisnici, oglasi, prijave, dokumenti, evaluacije i historija aktivnosti.

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
- Auth modul (JWT autentifikacija, verifikacija emaila)
- Oglas modul (CRUD oglasa, filtriranje, pretraga)
- Prijava modul (upravljanje prijavama, statusima)
- Korisnik modul (upravljanje profilima i rolama)
- Notifikacija modul (slanje email i in-app notifikacija)
- Ugovor modul (generisanje i preuzimanje ugovora)
- Evaluacija modul (evaluacija studenta i kompanije)

---

![alt text](<Untitled Diagram.drawio.png>)

---

## 3. Odgovornosti komponenti

| Komponenta | Tehnologija | Odgovornost |
|------------|-------------|-------------|
| React (Frontend) | React.js | Prikaz korisničkog interfejsa, upravljanje stanjem, slanje HTTP zahtjeva prema API-ju |
| HTTP komunikacija | Fetch API | HTTP komunikacija između Reacta i Express API-ja, ugrađen u browser bez vanjskih zavisnosti |
| Express (Backend) | Node.js + Express | Obrada API zahtjeva, poslovna logika, autorizacija, validacija |
| JWT Middleware | jsonwebtoken | Provjera identiteta i role korisnika na svakom zaštićenom endpointu |
| Baza podataka | PostgreSQL | Trajno skladištenje svih podataka sistema |
| Email servis | Nodemailer + Gmail SMTP | Slanje emailova (verifikacija, reset lozinke, notifikacije) |
| File upload | Multer | Upload i validacija PDF dokumenata (CV, motivaciono pismo) |
| Hashovanje lozinki | bcrypt | Sigurno čuvanje korisničkih lozinki |

---

## 4. Tok podataka i interakcija

React komponenta -> Fetch API -> Express Router -> JWT Middleware -> Controller -> Service -> PostgreSQL -> Service -> Controller -> React komponenta

React komponenta inicira HTTP zahtjev putem Fetch API-ja prema Express Routeru koji prosljeđuje zahtjev JWT Middlewareu na provjeru tokena i role. Nakon uspješne provjere, Controller validira podatke i poziva Service koji izvršava poslovnu logiku i SQL upit prema PostgreSQL bazi. Baza vraća podatke nazad kroz Service i Controller koji šalje JSON odgovor, a React komponenta ažurira stanje i renderuje UI.

### Tok komunikacije između modula

Primjer toka prijave na praksu:

1. Auth modul potvrđuje identitet korisnika putem JWT tokena
2. Oglas modul dohvaća podatke o oglasu putem Oglas servisa
3. Prijava modul šalje zahtjev za prijavu na praksu Prijava servisu
4. Prijava modul koristi Oglas modul za provjeru validnosti oglasa
5. Prijava modul koristi Korisnik modul za provjeru korisnika
6. Prijava modul kreira prijavu i postavlja početni status "na čekanju"
7. Notifikacija modul šalje email kompaniji o novoj prijavi putem Nodemailer + Gmail SMTP
8. Dashboard modul prikazuje ažuriran status korisniku

---

## 5. Ključne tehničke odluke

| Odluka | Odabrano rješenje | Razlog |
|--------|-------------------|--------|
| Frontend framework | React | Komponentna arhitektura pogodna za višerolni sistem, veliki ekosistem |
| Backend framework | Node.js + Express | JavaScript na oba kraja, lagan REST API razvoj |
| Baza podataka | PostgreSQL | Relacijska struktura  |
| HTTP komunikacija | Fetch API | Ugrađen u browser, bez vanjskih zavisnosti, dovoljno za potrebe projekta |
| Autentifikacija | JWT (JSON Web Token) | Stateless autentifikacija, pogodan za REST API, nosi informaciju o roli |
| Autorizacija | Role-based  | Sistem ima 4 jasno definirane role: student, kompanija, koordinator, admin |
| File upload | Multer (PDF only) | Validacija formata fajla na serverskoj strani |
| Email servis | Nodemailer + Gmail SMTP | Slanje verifikacionih emailova, reset lozinke i notifikacija, besplatan do 500 emailova dnevno |
| Password hashing | bcrypt | Industrijski standard za sigurno hashovanje lozinki |

---

## 6. Ograničenja i rizici arhitekture

**Ograničenja:**
- Skalabilnost je ograničena monolitnom strukturom poslovnog sloja —
  pri velikom broju korisnika može biti potrebno horizontalno skaliranje
- Sva poslovna logika je centralizovana na jednom Express serveru,
  što znači da kvar servera onesposobljava cijeli sistem
- Promjene u modelu podataka zahtijevaju pažljivo upravljanje 
  strukturom baze kroz migracije

**Rizici:**
- JWT tokeni se ne mogu invalidirati prije isteka —
  potrebno implementirati blacklist mehanizam pri odjavi
- Upload PDF dokumenata bez antivirusne provjere
  predstavlja potencijalni sigurnosni rizik
- Slanje emailova ovisi o eksternom Gmail SMTP serveru —
  kvar ili prekoračenje dnevnog limita blokira verifikaciju i notifikacije
- Privatnost studentskih podataka zahtijeva pažljivu
  implementaciju kontrole pristupa (student ne smije vidjeti tuđe prijave)

---

## 7. Otvorena pitanja

- Da li implementirati refresh token mehanizam uz JWT
  ili koristiti kratke tokene sa čestim ponovnim prijavama?
