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
    CLIENT - Prezentacijski sloj : 
    Obuhvata sve ekrane i kontrole: dashborde po ulogama, forme za prijavu na praksu, pregled oglasa, praćenje statusa, upravljanje profilom i notifikacije. Svaka korisnička uloga dobija prilagođen prikaz prema svojim ovlaštenjima.              

    SERVER - Sloj poslovne logike: 
    Odvijaju se sva pravila i procesi: provjera identiteta i ovlaštenja korisnika, upravljanje tokom prijave na praksu, generisanje ugovora, slanje notifikacija i kontrola pristupa podacima.                

    BAZA PODATAKA - Infrastrukturni sloj: 
     Skladištenje svih informacija sistema: korisnici, oglasi, prijave, dokumenti, evaluacije i historija aktivnosti.

Komponente su organizovane u sljedeće module:

**Frontend moduli :**
- Auth modul (registracija, prijava, verifikacija)
- Oglas modul (pregled, detalji, filtriranje, pretraga)
- Prijava modul (prijava na praksu, status, odustajanje)
- Dashboard modul (student dashboard, notifikacije)
- Profil modul (profil studenta, profil kompanije)
- Tok prakse modul (ugovor, evidencija, evaluacija)
- Admin/Koordinator modul (odobravanje, upravljanje)

**Backend moduli :**
- Auth modul (JWT autentifikacija, verifikacija emaila)
- Oglas modul (CRUD oglasa, filtriranje, pretraga)
- Prijava modul (upravljanje prijavama, statusima)
- Korisnik modul (upravljanje profilima i rolama)
- Notifikacija modul (slanje email i in-app notifikacija)
- Ugovor modul (generisanje i preuzimanje ugovora)
- Evaluacija modul (evaluacija studenta i kompanije)

---

## 3. Odgovornosti komponenti

| Modul | Odgovornost |
|-------|-------------|
| Auth modul | Registracija novih korisnika, prijava u sistem i verifikacija identiteta putem emaila |
| Oglas modul | Prikaz liste oglasa za praksu, pregled detalja, filtriranje po kategorijama i pretraga |
| Prijava modul | Slanje prijave na praksu, praćenje statusa prijave i odustajanje od prijave |
| Dashboard modul | Personalizovani pregled aktivnosti i primanje in-app notifikacija prema ulozi korisnika |
| Profil modul | Pregled i uređivanje profila studenta ili kompanije, upload CV-a i motivacionog pisma |
| Tok prakse modul | Upravljanje ugovorom, vođenje evidencije sati i unos evaluacija po završetku prakse |
| Admin/Koordinator modul | Odobravanje oglasa i prijava, upravljanje korisnicima i nadzor nad tokom praksi |
| Auth modul | Provjera identiteta i role korisnika, izdavanje tokena i verifikacija emaila |
| Oglas modul | Kreiranje, izmjena i brisanje oglasa, obrada upita za filtriranje i pretragu |
| Prijava modul | Kreiranje i ažuriranje prijava, upravljanje statusima kroz tok odobrenja |
| Korisnik modul | Upravljanje korisničkim profilima, podacima i rolama u sistemu |
| Notifikacija modul | Slanje emailova i in-app notifikacija pri promjenama statusa i važnim događajima |
| Ugovor modul | Automatsko generisanje ugovora o praksi i omogućavanje preuzimanja u PDF formatu |
| Evaluacija modul | Prikupljanje i čuvanje obostrane evaluacije studenta i kompanije po završetku prakse |

---

## 4. Tok podataka i interakcija

Korisnički zahtjev → Provjera identiteta i role → Obrada poslovne logike → Pristup podacima → Odgovor korisniku

Korisnik inicira akciju kroz interfejs, sistem provjerava njegov identitet i ovlaštenja, zatim se izvršava odgovarajuća poslovna logika uz pristup podacima, te se rezultat prikazuje korisniku.

### Tok komunijacije između modula

Primjer toka prijave na praksu:

1. Auth modul potvrđuje identitet korisnika putem Auth servisa  
2. Oglas modul dohvaća podatke o oglasu putem Oglas servisa  
3. Prijava modul šalje zahtjev za prijavu na praksu Prijava servisu  
4. Prijava servis koristi Oglas servis za provjeru validnosti oglasa  
5. Prijava servis koristi Korisnik servis za provjeru korisnika  
6. Prijava servis kreira prijavu i postavlja početni status  
7. Notifikacija servis šalje obavještenje kompaniji o novoj prijavi  
8. Dashboard modul prikazuje ažuriran status korisniku   

---

## 5. Ključne tehničke odluke

| Odluka | Odabrano rješenje | Razlog |
|--------|-------------------|--------|
| Autentifikacija | Token-based | Stateless provjera identiteta, nosi informaciju o roli korisnika |
| Autorizacija | Upravljanje pristupom na osnovu uloge | Sistem ima 4 jasno definirane uloge: student, kompanija, koordinator, admin |
| Upload dokumenata | Samo PDF format | Validacija formata na serverskoj strani |
| Email notifikacije | Eksterni email servis | Slanje verifikacionih emailova, reset lozinke i notifikacija |
| Hashovanje lozinki | Industrijski standard | Sigurno čuvanje korisničkih lozinki |

---

## 6. Ograničenja i rizici arhitekture

**Ograničenja:**
- Skalabilnost je ograničena monolitnom strukturom poslovnog sloja — pri velikom broju korisnika može biti potrebno horizontalno skaliranje
- Sva poslovna logika je centralizovana na jednom mjestu, što znači da kvar tog dijela onesposobljava cijeli sistem
- Promjene u modelu podataka zahtijevaju pažljivo upravljanje strukturom baze

**Rizici:**
- Sesije korisnika se ne mogu trenutno prekinuti — potrebno implementirati mehanizam invalidacije pri odjavi
- Upload dokumenata bez antivirusne provjere predstavlja potencijalni sigurnosni rizik
- Slanje emailova ovisi o eksternom servisu — kvar blokira verifikaciju i notifikacije
- Privatnost studentskih podataka zahtijeva pažljivu implementaciju kontrole pristupa

---

## 7. Otvorena pitanja

- Koji email servis koristiti za produkcijsko slanje emailova? 
- Da li implementirati mehanizam obnavljanja sesije ili koristiti kratke sesije sa čestim ponovnim prijavama?
- Koja strategija upravljanja promjenama strukture baze podataka će se koristiti?