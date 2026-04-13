# Test Strategy
## Sistem za upravljanje studentskim praksama


## 1. Cilj testiranja

Cilj testiranja sistema za upravljanje studentskim praksama je osigurati da aplikacija funkcioniše pouzdano, sigurno i u skladu sa definisanim funkcionalnim i nefunkcionalnim zahtjevima. Testiranjem omogućavamo rano otkrivanje greške, te minimizaciju rizika prije produkcije. 

Pored funkcionalne ispravnosti, cilj testiranja je i validacija integracije između različitih komponenti sistema (arhitecture_overview), kako bi se osigurala konzistentnost podataka kroz cijeli sistem. Također, testiranje ima za cilj procjenu performansi, sigurnosti i upotrebljivosti sistema, kako bi se obezbijedilo kvalitetno i stabilno korisničko iskustvo za sve tipove korisnika (studenti, koordinatori i  kompanije) uz osiguranu tačnost podataka, te pouzdanu prijavu i praćenje praksi.

Konačno, cilj testiranja je pravovremeno otkrivanje i otklanjanje grešaka, kao i verifikacija da sistem ispunjava definisane acceptance kriterije i poslovne potrebe.

---

## 2. Nivoi testiranja

Testna strategija je organizovana po nivoima testiranja, gdje svaki nivo pokriva određeni aspekt sistema. U okviru strategije definisani su:
 - unit, 
 - integraciono, 
 - sistemsko i 
 - prihvatno testiranje. 
 
 Za svaki nivo testiranja definisano je šta se testira, koji tipovi testova se primjenjuju, kao i ko je odgovoran za njihovu realizaciju. Također je uspostavljena veza između definisanih acceptance kriterija i odgovarajućih nivoa testiranja, pri čemu su acceptance kriteriji raspoređeni po nivoima čime se osigurava efikasna pokrivenost funkcionalnih i nefunkcionalnih zahtjeva sistema.

Testiranje će se provoditi iterativno kroz razvojne sprintove, pri čemu će se unit i integraciono testiranje izvršavati tokom implementacije, dok će se sistemsko i prihvatno testiranje provoditi nakon implementacije funkcionalnosti.

### UNIT Testiranje

Unit testiranje se koristi za testiranje najmanjih logičkih jedinica sistema, prvenstveno backend poslovne logike i validacija koje su definisane kroz acceptance kriterije. Fokus je na validaciji unosa podataka, pravilima sistema i ograničenjima.

Na ovom nivou testira se:
- validacija registracije korisnika (ime, email format, lozinka, indeks, odsjek) 
- provjera jedinstvenosti email adrese u sistemu 
- validacija obaveznih polja u svim formama 
- logika verifikacije email adrese i isteka tokena 
- autentikacija korisnika i provjera kredencijala 
- autorizacija pristupa po rolama (student, kompanija, koordinator, admin) 
- pravila workflow sistema (dozvoljeni prijelazi statusa prijave) 
- logika ograničenja (npr. zabrana duple prijave, limit prijava po studentu) 
- validacija datuma i rokova (rok prijave u budućnosti) 
- validacija upload dokumenata (PDF format CV-a i motivacionog pisma) 
- logika resetovanja lozinke i generisanja tokena 

Testiranje se izvodi automatski korištenjem odgovarajućih alata, a odgovorna osoba je developer.

### Integraciono testiranje

Integraciono testiranje provjerava interakciju između modula sistema, uključujući frontend, backend, bazu podataka i vanjske servise.

Na ovom nivou testira se:
- komunikacija frontend backend pri registraciji i login-u 
- upis i čitanje korisnika iz baze podataka 
- rad sistema prijava na praksu (kreiranje, spremanje i dohvat prijava) 
- povezivanje oglasa sa kompanijama i studentima 
- integracija email servisa (verifikacija, reset lozinke, notifikacije) 
- upload i preuzimanje dokumenata (CV, ugovori)
- historija aktivnosti svih kritičnih akcija
- upravljanje statusima prijave 
- slanje i prikaz notifikacija korisnicima 
- filtriranje i pretraga oglasa kroz API 

Testiranje se izvodi kombinacijom automatskih i ručnih testova, a odgovorna osoba je QA tim uz podršku developera.

### Sistemsko testiranje

Sistemsko testiranje obuhvata testiranje kompletnog sistema kao cjeline kroz realne korisničke scenarije (end-to-end).

Na ovom nivou testira se:
- kompletan proces registracije, verifikacije i prijave korisnika 
- login i pristup sistemu po korisničkim ulogama 
- pregled, filtriranje i pretraga oglasa za praksu 
- proces prijave studenta na praksu od početka do kraja 
- selekcija kandidata od strane kompanije 
- odobravanje i odbijanje prakse od strane koordinatora 
- kompletan workflow statusa prijave kroz sistem 
- generisanje, digitalno potpisivanje i preuzimanje ugovora 
- evidencija aktivnosti tokom prakse i završetak prakse 
- evaluacija studenta i kompanije nakon završetka prakse 
- prikaz dashboarda, profila i navigacije po ulozi 
- notifikacije o svim promjenama statusa 

Testiranje se vrši ručno i automatski (E2E testovi), a odgovorna osoba je QA tim.

### UAT testiranje

Prihvatno testiranje se provodi kako bi se provjerilo da li sistem u potpunosti zadovoljava poslovne zahtjeve krajnjih korisnika.

Na ovom nivou testira se:
- da li je proces registracije jasan i jednostavan za studente i kompanije 
- da li korisnici mogu bez poteškoća da se prijave i koriste sistem 
- da li student može lako pronaći i prijaviti se na praksu 
- da li workflow odobravanja prakse odgovara realnom procesu fakulteta i kompanije
- da li su notifikacije korisne i pravovremene 
- da li je korisničko iskustvo (dashboard, navigacija, profili) intuitivno 
- da li sistem u praksi podržava stvarni proces upravljanja studentskim praksama 

Testiranje se izvodi ručno od strane stakeholdera i krajnjih korisnika.

---

## 3. Načini evidencije rezultata testiranja

Rezultati testiranja će se sistematski evidentirati kako bi se omogućilo praćenje kvaliteta sistema, identifikacija grešaka i verifikacija ispunjenosti zahtjeva.

Za evidenciju rezultata testiranja koristit će se:
 - automatski izvještajti testiranja (automatizovane testove),
 - test case dokumenti,
 - sistem za praćenje grešaka ili evidenciju bugova (Jira)

Za svaki test case evidentiramo sljedeće informacije:
 - ID testa
 - opis testa
 - povezani acceptance kriterij
 - očekivani rezultat
 - stvarni rezultat
 - status testa (PASS / FAIL)
 - datum izvršenja
 - odgovorna osoba
 - napomene/prijavljeni bug

 Na ovaj način omogućava se konzistenstnost između zahtjeva, testnih slučajeva i rezultata testiranja, kao i efikasno upravljanje kvalitetom sistema.

 ---

 ## 4. Glavni rizici kvaliteta

U nastavku su definisani rizici koji mogu uticati na kvalitet, potpunost i pouzdanost samog procesa testiranja, te samim tim i na sposobnost otkrivanja grešaka u sistemu.

1. Nedovoljna pokrivenost testova

- Opis: Neki dijelovi sistema mogu ostati netestirani, što povećava rizik od neotkrivenih grešaka.
- Mitigacija: 

2. Neadekvatno definisani test slučajevi

- Opis: Testovi ne pokrivaju realne korisničke scenarije ili acceptance kriterije.
- Mitigacija: Korištenje user stories i acceptance kriterija pri definisanju testova.
 
3. Ljudske greške u ručnom testiranju

- Opis: Manualno testiranje može dovesti do propuštanja bugova ili nekonzistentnih rezultata.
- Mitigacija: Automatizacija ključnih testova i ponavljanje testnih scenarija.

4. Nedostatak automatizacije testiranja

- Opis: Previše ručnog testiranja povećava vrijeme i smanjuje efikasnost.
- Mitigacija: Korištenje unit i integration automatizovanih testova.

5. Nejasni ili nepotpuni acceptance kriteriji

- Opis: Bez jasnih kriterija testiranje može biti subjektivno i neprecizno.
- Mitigacija: Jasno definisanje acceptance kriterija u user story-ima.

6. Nedovoljna regresiona provjera

- Opis: Promjene u sistemu mogu narušiti već ispravne funkcionalnosti.
- Mitigacija: Redovno izvođenje regresionih testova nakon svake izmjene.

7. Ograničeno testiranje edge case scenarija

- Opis: Ekstremni i neobični scenariji mogu ostati neotkriveni.
- Mitigacija: Dizajn testova koji uključuju negativne i boundary slučajeve.

8. Nedovoljno testiranje integracije sistema

- Opis: Greške u komunikaciji između modula mogu ostati neotkrivene.
- Mitigacija: Integraciono testiranje API-ja i servisa.

9. Ograničeno testiranje performansi

- Opis: Sistem može raditi ispravno u malom obimu, ali padati pod opterećenjem.
- Mitigacija: Load i stress testiranje.

10. Neadekvatno testiranje sigurnosti

- Opis: Mogu postojati neotkrivene ranjivosti u autentifikaciji i pristupu podacima.
- Mitigacija: Sigurnosno i penetracijsko testiranje
---


# Acceptance Criteria   

---

# 1. Registracija korisnika

## AC-01 Registracija studenta

### Scenario: Uspješna registracija

```gherkin
Given korisnik nije registrovan u sistemu
When unese validno ime, prezime, email, broj indeksa, odsjek i lozinku (minimum 8 karaktera)
Then sistem kreira korisnički nalog sa statusom "Neverifikovan"
And sistem šalje verifikacioni email
```

### Scenario: Registracija sa postojećim emailom

```gherkin
Given email već postoji u sistemu
When korisnik pokuša izvršiti registraciju
Then sistem prikazuje poruku o grešci
And nalog se ne kreira
```

---

## AC-02 Verifikacija email adrese

```gherkin
Given korisnik ima status "Neverifikovan"
When klikne na validan verifikacioni link
Then status korisnika prelazi u "Aktivan"
And korisnik može pristupiti sistemu
```

```gherkin
Given verifikacioni link je istekao
When korisnik pokuša potvrditi email
Then sistem prikazuje poruku da je link istekao
And omogućava ponovno slanje verifikacionog linka
```

---

# 2. Login i autorizacija

## AC-03 Uspješna prijava

```gherkin
Given korisnik ima aktivan nalog
When unese tačan email i lozinku
Then sistem omogućava pristup
And preusmjerava korisnika na dashboard prema njegovoj roli
```

## AC-04 Neispravni kredencijali

```gherkin
Given korisnik unese pogrešnu lozinku ili email
When pokuša prijavu
Then sistem prikazuje poruku "Neispravni podaci"
And ne otkriva da li email postoji u sistemu
```

---

# 3. Kreiranje oglasa

## AC-05 Kreiranje oglasa od strane kompanije

```gherkin
Given korisnik ima rolu "Kompanija"
When unese naziv, opis, trajanje, broj mjesta i rok prijave
Then oglas se kreira sa statusom "Aktivan"
And oglas je vidljiv studentima
```

```gherkin
Given rok prijave je u prošlosti
When kompanija pokuša kreirati oglas
Then sistem prikazuje poruku o grešci
And oglas se ne kreira
```

---

# 4. Prijava studenta na praksu

## AC-06 Uspješna prijava

```gherkin
Given student je prijavljen u sistem
And oglas je aktivan
When student pošalje prijavu sa CV-om i motivacionim pismom u PDF formatu
Then prijava se kreira sa statusom "Na čekanju"
And kompanija dobija notifikaciju
```

## AC-07 Dupla prijava

```gherkin
Given student je već prijavljen na isti oglas
When pokuša ponovo poslati prijavu
Then sistem blokira prijavu
And prikazuje odgovarajuću poruku o grešci
```

---

# 5. Workflow odobravanja

## AC-08 Selekcija kandidata

```gherkin
Given prijava ima status "Na čekanju"
When kompanija označi prijavu kao prihvaćenu
Then status prelazi u "Predložena"
And koordinator dobija notifikaciju
```

## AC-09 Odluka koordinatora

```gherkin
Given prijava ima status "Predložena"
When koordinator odobri praksu
Then status prelazi u "Odobrena"
And student i kompanija dobijaju notifikaciju
```

```gherkin
Given prijava ima status "Predložena"
When koordinator odbije praksu
Then status prelazi u "Odbijena"
And student dobija obavještenje
```

---

# 6. Generisanje i potpisivanje ugovora

## AC-10 Generisanje ugovora

```gherkin
Given praksa ima status "Odobrena"
When student potvrdi učešće
Then sistem generiše ugovor u PDF formatu
And dokument je dostupan studentu i kompaniji
```

## AC-11 Digitalni potpis

```gherkin
Given ugovor je generisan
When student i kompanija digitalno potpišu dokument
Then status ugovora prelazi u "Potpisan"
And dokument postaje neizmjenjiv
```

---

# 7. Evidencija aktivnosti

## AC-12 Unos aktivnosti

```gherkin
Given praksa je aktivna
When student unese dnevne ili sedmične aktivnosti
Then sistem čuva unesene podatke
And kompanija i koordinator imaju uvid
```

---

# 8. Završetak prakse

## AC-13 Automatski završetak

```gherkin
Given trajanje prakse je isteklo
When sistem izvrši dnevnu provjeru
Then status prakse prelazi u "Završena"
And korisnici dobijaju notifikaciju
```

---

# 9. Evaluacija

## AC-14 Evaluacija studenta

```gherkin
Given praksa je završena
When kompanija popuni evaluacioni formular
Then evaluacija se čuva u sistemu
And student ima pregled evaluacije
```

## AC-15 Evaluacija kompanije

```gherkin
Given praksa je završena
When student popuni evaluaciju kompanije
Then evaluacija se čuva
And kompanija ima uvid
```

---

# 10. Sigurnosni kriteriji

## AC-16 Autorizacija po rolama

```gherkin
Given korisnik ima rolu "Student"
When pokuša pristupiti administratorskoj stranici
Then sistem zabranjuje pristup
And vraća HTTP status 403
```

---

# 11. Performanse

## AC-17 Vrijeme odgovora sistema

```gherkin
Given korisnik šalje zahtjev ka API-ju
When sistem obradi zahtjev
Then vrijeme odgovora ne prelazi 2 sekunde u najmanje 95% slučajeva
```

---

# 12. Notifikacije

## AC-18 Promjena statusa prijave

```gherkin
Given status prijave se promijeni
When promjena bude evidentirana u sistemu
Then sistem šalje notifikaciju relevantnim korisnicima
And notifikacija je vidljiva na dashboardu
```

---

# 13. Reset lozinke

## AC-19 Reset lozinke

```gherkin
Given korisnik zatraži reset lozinke
When unese validan email
Then sistem šalje reset link
And link ističe nakon definisanog vremenskog perioda
```

---

# 14. Audit log

## AC-20 Evidencija kritičnih akcija

```gherkin
Given korisnik izvrši kritičnu akciju (kreiranje oglasa, promjena statusa, odobravanje prakse)
When akcija bude izvršena
Then sistem evidentira korisnika, vrijeme i tip akcije
And samo administrator ima pristup audit logu
```

---
