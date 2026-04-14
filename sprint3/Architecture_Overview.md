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

## 4. Tok podataka i interakcija (pregled)

React komponenta → REST API (Express Server) → PostgreSQL → REST API → React komponenta  

Korisnik komunicira sa sistemom putem frontend aplikacije (React), koja šalje HTTP zahtjeve prema backend serveru kroz REST API. Backend server predstavlja centralnu tačku sistema i obrađuje sve zahtjeve, vrši validaciju, primjenjuje poslovna pravila i komunicira s bazom podataka.

Svi zahtjevi prema zaštićenim resursima prolaze kroz JWT middleware koji validira identitet korisnika i njegovu ulogu (RBAC). Nakon uspješne autentifikacije i autorizacije, zahtjev se prosljeđuje odgovarajućem backend modulu koji izvršava poslovnu logiku i pristupa bazi podataka. Rezultat obrade se vraća klijentu u JSON formatu.

---

### Sinhrona i asinhrona komunikacija

**Sinhrona komunikacija (request-response):**
- registracija i prijava korisnika  
- pregled i filtriranje oglasa  
- slanje prijava  
- upravljanje profilom  

**Asinhrona komunikacija:**
- slanje email notifikacija  
- evidencija aktivnosti (audit log)  
- generisanje ugovora  
- pozadinski sistemski procesi (npr. automatsko zatvaranje oglasa)  

Asinhroni procesi se izvršavaju nakon glavne operacije i ne blokiraju odgovor korisniku.

---

## 4. Tok podataka (DFD + Activity pregled)

---

## 4.1 Identifikacija entiteta i skladišta podataka (DFD)

### Eksterni entiteti:
- Student
- Kompanija
- Koordinator
- Administrator
- Email servis (eksterni sistem)

### Sistemski procesi:
- Autentifikacija i autorizacija (Auth servis)
- Upravljanje korisnicima (Korisnik servis)
- Upravljanje oglasima (Oglas servis)
- Upravljanje prijavama (Prijava servis)
- Upravljanje dokumentima
- Notifikacija servis
- Ugovor servis
- Evaluacija servis
- Audit log sistem

### Skladišta podataka (Data Store):
- Baza korisnika
- Baza oglasa
- Baza prijava
- Baza dokumenata
- Baza evaluacija
- Audit log

---

## 4.2 Opšti tok podataka kroz sistem

1. Korisnik (Student/Kompanija/Koordinator/Admin) šalje zahtjev putem frontend aplikacije  
2. Frontend šalje HTTP zahtjev ka backend REST API  
3. Backend prolazi kroz:
   - autentifikaciju (JWT)
   - autorizaciju (RBAC)
   - validaciju podataka  
4. Zahtjev se prosljeđuje odgovarajućem servisu  
5. Servis komunicira sa bazom podataka  
6. Rezultat se vraća frontend aplikaciji  
7. (Opcionalno) pokreću se asinhroni procesi:
   - slanje emaila  
   - audit log zapis  

---

## 4.3 Ključni tokovi podataka (Activity + DFD)

---

### 4.3.1 Registracija korisnika

**Tok podataka:**
- Korisnik → registracijski podaci → Auth servis  
- Auth servis → validacija → Baza korisnika  
- Auth servis → verifikacioni token → Email servis  
- Email servis → verifikacioni email → Korisnik  

**Activity tok:**
1. Korisnik unosi podatke  
2. Sistem validira podatke  
3. [Ako email postoji] → vraća grešku  
4. [Ako validno] → kreira korisnika (neaktivan)  
5. Šalje verifikacioni email  
6. Korisnik potvrđuje email  
7. Sistem aktivira nalog  

---

### 4.3.2 Prijava (Login)

**Tok podataka:**
- Korisnik → email + lozinka → Auth servis  
- Auth servis → upit → Baza korisnika  
- Auth servis → JWT token → Frontend  

**Activity tok:**
1. Korisnik unosi kredencijale  
2. Sistem provjerava podatke  
3. [Ako pogrešni] → greška  
4. [Ako ispravni] → generiše JWT  
5. Korisnik dobija pristup  

---

### 4.3.3 Pregled i pretraga oglasa

**Tok podataka:**
- Frontend → filteri/pretraga → Oglas servis  
- Oglas servis → upit → Baza oglasa  
- Oglas servis → lista oglasa → Frontend  

**Activity tok:**
1. Korisnik bira filtere/pretragu  
2. Sistem dohvaća oglase  
3. Primjenjuje filtere  
4. Vraća rezultate  

---

### 4.3.4 Kreiranje oglasa

**Tok podataka:**
- Kompanija → podaci oglasa → Oglas servis  
- Oglas servis → upis → Baza oglasa  

**Activity tok:**
1. Kompanija unosi podatke  
2. Sistem validira unos  
3. [Ako nevalidno] → greška  
4. Sprema oglas  
5. Oglas postaje vidljiv  

---

### 4.3.5 Prijava na praksu

**Tok podataka:**
- Student → podaci prijave → Prijava servis  
- Prijava servis → provjera → Baza prijava  
- Prijava servis → upis → Baza prijava  
- Prijava servis → notifikacija → Email servis  

**Activity tok:**
1. Student pokreće prijavu  
2. Sistem validira korisnika  
3. Provjerava:
   - da li je već prijavljen  
   - limit prijava  
   - status oglasa  
4. [Ako nije validno] → greška  
5. Kreira prijavu (na čekanju)  
6. Šalje notifikaciju  

---

### 4.3.6 Upload dokumenata

**Tok podataka:**
- Student → dokument (PDF) → Backend  
- Backend → spremanje → Baza dokumenata  

**Activity tok:**
1. Student upload-a dokument  
2. Sistem validira format  
3. [Ako nije PDF] → greška  
4. Sprema dokument  
5. Omogućava pristup kompaniji  

---

### 4.3.7 Selekcija kandidata (Kompanija)

**Tok podataka:**
- Kompanija → odluka → Prijava servis  
- Prijava servis → update → Baza prijava  
- Prijava servis → notifikacija → Student  

**Activity tok:**
1. Kompanija pregleda prijave  
2. Bira kandidata  
3. Sistem ažurira status  
4. Šalje notifikaciju  

---

### 4.3.8 Odobravanje prakse (Koordinator)

**Tok podataka:**
- Koordinator → odluka → Prijava servis  
- Prijava servis → update → Baza prijava  

**Activity tok:**
1. Koordinator pregleda prijavu  
2. Donosi odluku  
3. Sistem ažurira status  
4. Šalje notifikacije  

---

### 4.3.9 Generisanje ugovora

**Tok podataka:**
- Backend → podaci → Ugovor servis  
- Ugovor servis → dokument → Baza dokumenata  

**Activity tok:**
1. Praksa odobrena  
2. Sistem generiše ugovor  
3. Sprema dokument  
4. Omogućava preuzimanje  

---

### 4.3.10 Evaluacija

**Tok podataka:**
- Student/Kompanija → evaluacija → Evaluacija servis  
- Evaluacija servis → upis → Baza evaluacija  

**Activity tok:**
1. Korisnici unose evaluaciju  
2. Sistem validira podatke  
3. Sprema evaluaciju  
4. Označava praksu kao završenu  

---

### 4.3.11 Reset lozinke

**Tok podataka:**
- Korisnik → email → Auth servis  
- Auth servis → token → Email servis  
- Email servis → link → Korisnik  

**Activity tok:**
1. Korisnik traži reset  
2. Sistem šalje email  
3. Korisnik unosi novu lozinku  
4. Sistem ažurira lozinku  

---

### 4.3.12 Notifikacije

**Tok podataka:**
- Backend → događaj → Notifikacija servis  
- Notifikacija servis → email/in-app → Korisnik  

**Activity tok:**
1. Događaj se desi (status promjena)  
2. Sistem generiše notifikaciju  
3. Šalje korisniku  

---

### 4.3.13 Brisanje/deaktivacija naloga

**Tok podataka:**
- Korisnik → zahtjev → Korisnik servis  
- Korisnik servis → update → Baza korisnika  

**Activity tok:**
1. Korisnik traži brisanje  
2. Sistem traži potvrdu  
3. Deaktivira nalog  
4. Šalje notifikacije  

---

### 4.3.14 Automatski procesi (background)

**Tokovi:**
- Sistem → provjera rokova → Baza oglasa  
- Sistem → zatvaranje oglasa  
- Sistem → završavanje prakse  

**Activity tok:**
1. Scheduler pokreće proces  
2. Provjerava uslove  
3. Ažurira status  
4. Šalje notifikacije 

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
