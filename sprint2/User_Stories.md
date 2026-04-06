# User Stories

---

## 1. Registracija studenta
- **Opis:** Kao student, želim da se registrujem u sistem kako bih kreirao svoj profil  
- **Poslovne vrijednosti:** Omogućava studentu pristup sistemu i njegovim osnovim funkcionalnostima  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Student posjeduje fakultetski email  
- **Veza sa drugim storijima ili zavisnostima:**  
- **Acceptance criteria:**
  - Sistem mora omogućiti unos podataka: ime, prezime, 
    email, lozinka, indeks, godina studija, odsjek
  - Kada student uspješno unese sve podatke, 
    korisnik treba dobiti potvrdu o registraciji na ekranu
  - Sistem ne smije dozvoliti registraciju 
    s već postojećim emailom
  - Sistem ne smije odobriti profil prije verifikacije od strane     
  fakulteta
  - Sistem ne smije dozvoliti završetak registracije 
    bez popunjenih obaveznih polja

---

## 2. Registracija koordinatora fakulteta
- **Opis:** Kao koordinator, želim da se registrujem u sistem s odgovarajućim privilegijama kako bih upravljao procesom odobravanja praksi  
- **Poslovne vrijednosti:** Omogućava koordinatoru pristup određenim privilegijama koje dolaze uz tu rolu  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je uposlenik fakulteta  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 9
- **Acceptance criteria:** 
  - Sistem mora omogućiti unos podataka: ime, prezime, 
    email, lozinka, institucija, odsjek
  - Kada koordinator unese podatke, sistem mora kreirati 
    profil i dodijeliti mu rolu koordinatora
  - Korisnik treba dobiti obavještenje da je registracija 
    na čekanju adminovog odobravanja
  - Sistem ne smije dozvoliti pristup privilegijama 
    dok admin ne odobri account
  - Sistem ne smije dozvoliti registraciju 
    s već postojećim emailom
---

## 3. Registracija kompanije
- **Opis:** Kao kompanija, želim da se registrujem u sistem s ciljem objavljivanja oglasa i povezivanja sa studentima  
- **Poslovne vrijednosti:** Objavljivanje oglasa za praksu u cilju pronalaska kvalitetne radne snage  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti odobrena od strane fakulteta  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 9
- **Acceptance criteria:**
  - Sistem mora omogućiti unos podataka: naziv kompanije, 
    email, lozinka, adresa, kontakt osoba
  - Kada kompanija unese podatke, sistem mora poslati 
    zahtjev adminu za odobravanje
  - Korisnik treba dobiti obavještenje da je registracija 
    na čekanju odobravanja
  - Sistem ne smije dozvoliti registraciju 
    s već postojećim emailom
---

## 4. Prijava studenata
- **Opis:** Kao student, želim da se prijavim u sistem kako bih pristupio objavljenim praksama i prijavio se na njih  
- **Poslovne vrijednosti:** Omogućava studentu siguran pristup već kreiranom profilu i konstantan uvid u objavljene prakse i stanje prijavljenih praksi  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Student se već registrovao u sistem  
- **Veza sa drugim storijima ili zavisnostima:**
  - 1(Registracija studenta)
- **Acceptance criteria:**
  - Kada student uspješno unese kredencijale(email, lozinka), 
    sistem ga  mora preusmjeriti na dashboard
  - Korisnik treba dobiti poruku greške 
    u slučaju pogrešnih kredencijala
  - Sistem ne smije dozvoliti pristup 
    bez verifikovanog accounta
  - Sistem ne smije dozvoliti prijavu 
    s nepostoječim emailom


---

## 5. Prijava koordinatora
- **Opis:** Kao koordinator, želim da se prijavim u sistem kako bih odobravao studentima prijavljene prakse i imao uvid u njih  
- **Poslovne vrijednosti:** Omogućava koordinatoru siguran pristup već kreiranom profilu i dalje odobravanje i evaluacije praksi  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je već odobren od strane administratora kao koordinator  
  - Kojim podacima studenata koordinator ima pristup?  
- **Veza sa drugim storijima ili zavisnostima:**
  - 2(Registracija koordinatora)
- **Acceptance criteria:**
- Kada koordinator uspješno unese kredencijale, 
    sistem ga mora preusmjeriti na koordinatorski dashboard
  - Sistem mora omogućiti pristup samo 
    odobrenim koordinatorskim accountima
  - Korisnik treba dobiti poruku greške 
    u slučaju pogrešnih kredencijala
  - Sistem ne smije dozvoliti pristup 
    neodobrenom koordinatoru

---

## 6. Prijava kompanija
- **Opis:** Kao kompanija želim da se prijavim u sistem u cilju nastavka upravljanja i objavljivanja oglasa  
- **Poslovne vrijednosti:** Omogućava kompaniji siguran pristup već kreiranom profilu i nastavak upravljanja oglasima i prijavama  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija je već registrovana u sistem  
- **Veza sa drugim storijima ili zavisnostima:** 
  - U zavisnosti od 3(Registracija kompanija)
- **Acceptance criteria:**
 - Kada kompanija uspješno unese kredencijale, 
    sistem mora preusmjeriti je na dashboard kompanije
  - Sistem mora omogućiti pristup samo 
    odobrenim kompanijskim accountima
  - Korisnik treba dobiti poruku greške 
    u slučaju pogrešnih kredencijala
  - Sistem ne smije dozvoliti pristup 
    neodobrenoj kompaniji

---

## 7. Uređivanje profila studenta
- **Opis:** Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)  
- **Poslovne vrijednosti:** Student ima mogućnost održavanja profila ažurnim u cilju povećanja šansi sticanja prakse  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Korisnik mora biti prijavljen da bi mogao uređivati profil  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 (Prijava studenta)  
- **Acceptance criteria:**
  - Sistem mora omogućiti izmjenu podataka: 
    ime, prezime, indeks, godina studija, odsjek
  - Kada student uspješno izmijeni podatke, 
    korisnik treba dobiti potvrdu o ažuriranju profila
  - Sistem mora omogućiti upload CV-a u PDF formatu
  - Sistem ne smije dozvoliti upload fajla 
    koji nije PDF format

---

## 8. Pristup koordinatora
- **Opis:** Kao koordinator želim da pristupim posebnom interfejsu sa ciljem uvida u informacije o prijavama studenata na prakse i njihovim osnovnim informacijama  
- **Poslovne vrijednosti:** Pruža centralizovan pregled prijava i informacija o studentima što omogućava efikasno odobravanje praksi  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kojim informacijama može pristupiti koordinator?  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 5 (Prijava koordinatora)  
- **Acceptance criteria:**
  - Sistem mora omogućiti koordinatoru pregled 
    svih prijava studenata na prakse
  - Sistem mora omogućiti koordinatoru uvid u 
    osnovne informacije o studentima
  - Korisnik treba dobiti pregledan prikaz 
    statusa svake prijave
  - Sistem ne smije dozvoliti pristup 
    koordinatorskom interfejsu bez odgovarajuće role

---

## 9. Pristup administratora
- **Opis:** Kao administrator želim da pristupim posebnom interfejsu sa ciljem uvida i upravljanja svim korisnicima sistema  
- **Poslovne vrijednosti:** Administratoru omogućava upravljanje rolama korisnika što je preduslov za ispravan rad sistema  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Administrator se ne registruje kao ostali korisnici  
- **Veza sa drugim storijima ili zavisnostima:**
  - U vezi sa 2 i 3 (Davanje role koordinatora/kompanije korisniku)  
- **Acceptance criteria:**
  - Sistem mora omogućiti administratoru pregled 
    svih korisnika sistema
  - Sistem mora omogućiti dodjelu rola 
    drugom adminu, koordinatoru i kompaniji
  - Korisnik treba dobiti potvrdu nakon 
    svake akcije odobravanja ili odbijanja
  - Sistem ne smije dozvoliti pristup 
    admin interfejsu bez admin role

---

## 10. Kreiranje oglasa
- **Opis:** Kao kompanija želim da kreiram i objavim oglas kako bih studentima predstavio praksu i naše zahtjeve  
- **Poslovne vrijednosti:** Omogućava kompaniji objavljivanje oglasa za praksu i povezivanje sa studentima  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija je prijavljena i odobrena u sistemu  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6 (Prijava kompanije)  
- **Acceptance criteria:**
  - Sistem mora omogućiti unos podataka oglasa: 
    naziv, opis, trajanje, broj mjesta, uslovi
  - Kada kompanija uspješno kreira oglas, 
    sistem mora objaviti oglas i učiniti ga vidljivim studentima
  - Korisnik treba dobiti potvrdu o uspješnom 
    kreiranju oglasa
  - Sistem ne smije dozvoliti kreiranje oglasa 
    bez popunjenih obaveznih polja
  - Sistem ne smije dozvoliti kreiranje oglasa 
    neodobrenoj kompaniji

---

## 11. Pregled oglasa
- **Opis:** Kao student želim da imam mogućnost pregleda svih dostupnih praksi  
- **Poslovne vrijednosti:** Student ima konstantan uvid u dostupne prakse  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen da bi pristupio pregledu praksi  
- **Veza sa drugim storijima ili zavisnostima:**
  - U vezi sa 10 (Kreirani oglasi)  
  - Zavisi od 4 (Prijava studenta)  
- **Acceptance criteria:**
  - Sistem mora omogućiti studentu pregled 
    svih aktivnih oglasa
  - Sistem mora prikazati osnovne informacije 
    o svakom oglasu: naziv, kompanija, trajanje, broj mjesta
  - Sistem ne smije dozvoliti pregled oglasa 
    bez aktivne prijave u sistem

---

## 12. Pregled detalja oglasa
- **Opis:** Kao student želim da imam uvid u detalje prakse s ciljem odluke prijavljivanja na istu  
- **Poslovne vrijednosti:** Student ima dublji uvid u zahtjeve za praksu  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 i 11  
- **Acceptance criteria:**  
  - Sistem mora prikazati: opis, trajanje, 
    broj mjesta, uslovi, kontakt informacije
  - Korisnik treba dobiti jasan prikaz 
    roka za prijavu
  - Sistem ne smije dozvoliti pregled detalja 
    neaktivnog oglasa
---

## 13. Prijava na praksu
- **Opis:** Kao student želim da se prijavim na praksu  
- **Poslovne vrijednosti:** Omogućava studentu učešće u selekciji  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
  - Oglas mora biti aktivan  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4, 11 i 12  
- **Acceptance criteria:**
  - Sistem mora omogućiti studentu prijavu 
    na odabrani oglas
  - Kada student uspješno podnese prijavu, 
    korisnik treba dobiti potvrdu o prijavi
  - Sistem mora prikazati status prijave: 
    (Na čekanju, Odobreno, Odbijeno)
  - Sistem ne smije dozvoliti prijavu 
    na isti oglas dva puta
  - Sistem ne smije dozvoliti prijavu 
    na neaktivan oglas
  - Sistem ne smije dozvoliti prijavu 
    bez popunjenog profila  

---

## 14. Upload dokumentacije
- **Opis:** Kao student želim da upload-ujem dokumente (CV i motivaciono pismo)  
- **Poslovne vrijednosti:** Omogućava predstavljanje kvalifikacija  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Korisnik mora biti prijavljen  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 (Prijava studenata)
  - Zavisi od 13(Prijava na praksu)
- **Acceptance criteria:**
  - Sistem mora omogućiti upload CV-a 
    i motivacionog pisma u PDF formatu
  - Kada student uspješno uploada dokumente, 
    treba dobiti potvrdu o uploadu
  - Sistem mora učiniti dokumente vidljivim 
    kompaniji nakon prijave
  - Sistem ne smije dozvoliti upload fajla 
    koji nije PDF format

---

## 15. Pregled prijava na praksu
- **Opis:** Kao kompanija želim da pregledam listu prijavljenih studenata  
- **Poslovne vrijednosti:** Olakšava selekciju kandidata  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti prijavljena  
  - Oglas mora biti aktivan  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6 i 13  
- **Acceptance criteria:**
  - Sistem mora omogućiti kompaniji pregled 
    svih prijavljenih studenata po oglasu
  - Sistem mora prikazati osnovne informacije 
    o svakom kandidatu: ime, prezime, odsjek, godina studija
  - Sistem mora omogućiti pregled uploadovanih 
    dokumenata svakog kandidata
  - Sistem ne smije dozvoliti pregled prijava 
    na tuđe oglase  

---

## 16. Selekcija kandidata
- **Opis:** Kao kompanija želim da evidentiram uži krug kandidata  
- **Poslovne vrijednosti:** Efikasniji proces selekcije  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti prijavljena  
  - Oglas mora biti aktivan  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6 i 13  
- **Acceptance criteria:**
  - Sistem mora omogućiti kompaniji označavanje 
    kandidata koji prolaze u uži krug
  - Kada kompanija selektuje kandidata, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti studenta 
    o promjeni statusa njegove prijave  

---

## 17. Odobravanje prakse
- **Opis:** Kao koordinator, želim da odobrim studentsku prijavu za praksu
- **Poslovne vrijednosti:** Omogućava koordinatoru upravljanje studentskim praksama
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je uposlenik fakulteta  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 8 i 15
- **Acceptance criteria:** 
  - Sistem mora omogućiti koordinatoru odobravanje
    studentskih prijava na praksi
  - Kada koordinator odobri praksu, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti studenta 
    o promjeni statusa njegove prijave  
---

## 18. Odbijanje prakse
- **Opis:** Kao koordinator, želim da odbijem studentsku prijavu za praksu
- **Poslovne vrijednosti:** Omogućava koordinatoru upravljanje studentskim praksama
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je uposlenik fakulteta  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 8 i 15
- **Acceptance criteria:** 
  - Sistem mora omogućiti koordinatoru odbijanje
    studentskih prijava na praksi
  - Kada koordinator odobri praksu, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti studenta 
    o promjeni statusa njegove prijave  
---

## 19. Potvrda studenta
- **Opis:** Kao student, želim da potvrdim učešće na prijavu za praksu
- **Poslovne vrijednosti:** Omogućava studentu prihvatanje odobrene studentske prakse
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
  - Oglas mora biti aktivan 
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 13 i 17
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu prihvatanje
    učešća na odobrenoj praksi
  - Kada student prihvati praksu, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti kompaniju i koordinatora 
    o promjeni statusa njegove prijave
---

## 20. Dizajn baze podataka
- **Opis:** Osmisliti šemu baze podataka sistema
- **Poslovne vrijednosti:** Omogućava lakšu implementaciju baze podataka
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - 
- **Veza sa drugim storijima ili zavisnostima:** 
  -
- **Acceptance criteria:** 
  - Dizajn mora obuhvatati glavne entite sistema:
    koordinatore, studente, kompanije, prakse
  - Dizajn treba uspostaviti relacije između
    entiteta
  - Dizajn treba čuvati sve neophodne podatke o 
    entitetima
---

## 21. Implementacija baze podataka
- **Opis:** Implementirati bazu podataka sistema
- **Poslovne vrijednosti:** Omogućava lakše upravljanje i pohranjivanje podataka neophodnih za rad sistema
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Osmišljen je dizajn baze podataka
  - Koju bazu podataka koristiti?
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 20
- **Acceptance criteria:** 
  - Sistem mora omogućiti skladištenje podataka 
    u bazi
---

## 22. Generisanje ugovora
- **Opis:** Sistem generiše ugovor o praksi za studenta
- **Poslovne vrijednosti:** Omogućava automatsko generisanje ugovora koji pravno reguliše praksu studenta kod kompanije
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potvrdio praksu
  - Kompanija je saglasna sa prijavom
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 16 i 19
- **Acceptance criteria:** 
  - Sistem mora omogućiti generisanje ugovora o praksi
  - Sistem mora omogućiti studentu 
    i kompaniji uvid u ugovor
---

## 23. Preuzimanje ugovora
- **Opis:** Student može preuzeti digitalni primjerak ugovora o praksi
- **Poslovne vrijednosti:** Omogućava studentu pregled ugovora o praksi
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potvrdio praksu
  - Kompanija je saglasna sa prijavom
  - Ugovor je generisan
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 16, 19, 22
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu 
    i kompaniji uvid u ugovor
  - Sistem mora omogućiti studentu preuzimanje
    digitalne kopije ugovora
---

## 24. Evidencija aktivnosti
- **Opis:** Student unosi dnevne/sedmične aktivnosti na praksi
- **Poslovne vrijednosti:** Omogućava evidentiranje i praćenje aktivnosti studenta na praksi
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
  - Studentska praksa je u toku
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 16 i 19
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu 
    evidentiranje aktivnosti na praksi
  - Sistem mora omogućiti pregled 
    evidentiranih aktivnosti kompaniji i koordinatoru
---

## 25. Praćenje prisustva
- **Opis:** Kompanija evidentira prisustvo studenta na praksi
- **Poslovne vrijednosti:** Kompanija može pratiti prisustvo studenta
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
  - Studentska praksa je u toku
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 24
- **Acceptance criteria:** 
  - Sistem mora omogućiti evidentiranje prisustva
  - Sistem mora omogućiti studentu 
    i kompaniji uvid u prisustvo studenta
---

## 26. Evaluacija studenta
- **Opis:** Kompanija evaluira rad studenta na osnovu definisanih kriterija
- **Poslovne vrijednosti:** Kompanija može evaluirati rad studenta na praksi dajući uvid u njegovo zalaganje i trud. Student može dobiti feedback za svoj rad.
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 24
- **Acceptance criteria:** 
  - Sistem mora omogućiti evaluaciju studenta 
    na kraju prakse kroz predefinisani formular
  - Sistem mora omogućiti studentu 
    pregled evaluacije studenta
---

## 27. Evaluacija kompanije
- **Opis:** Student evaluira kompaniju u kojoj je odradio praksu
- **Poslovne vrijednosti:** Student može iznijeti mišljenje o kompaniji kod koje je radio praksu. Kompanija može vidjeti dojam studenta o praksi, te izvršiti korekcije po potrebi.
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
- **Veza sa drugim storijima ili zavisnostima:** 
  - 
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu evaluaciju
    kompanije kroz predefinisani formular
  - Sistem mora omogućiti kompaniji
    pregled evaluacije kompanije
---

## 28. Izvještaji
- **Opis:** Kompanija generiše izvještaj o praksi
- **Poslovne vrijednosti:** Kompanija može generisati izvještaj o praksi koji služi studentu kao dokaz o pohađanju prakse
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
- **Veza sa drugim storijima ili zavisnostima:** 
  - 25, 26
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu evaluaciju
---

## 29. Analiza postojećih rješenja
- **Opis:** Istražiti postojeća sisteme za upravljanje praksama
- **Poslovne vrijednosti:**  Vidjeti šta nedostaje drugim sistemima, a šta je dobro za implementirati
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  
- **Veza sa drugim storijima ili zavisnostima:** 
  - 
- **Acceptance criteria:** 
  - 
---

## 30. Dokumentacija sistema
- **Opis:** Dokumentovati fukncionalnosti i strukturu sistema
- **Poslovne vrijednosti:** Dokumentacija omogućava struktuirani pregled sistema
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Dokumentacija se aktivno održava
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od svih stavki
- **Acceptance criteria:** 
  - Promjene moraju biti redovno dokumentovane
  - Dokumentacija omogućava pregled dizajna 
    i plana rada na sistemu
---


## 31. Zatvaranje oglasa
- **Opis:** Kao kompanija želim zatvoriti oglas za praksu koji sam prethodno objavila
- **Poslovne vrijednosti:** Oglas za praksu se zatvara kako ne bi pristizale nove prijave
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Oglas je prethodno objavljen
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 10, 12, 13
- **Acceptance criteria:** 
  - Na zatvoreni oglas se ne može više prijavljivati
  - Zatvoreni oglas se ne pojavljuje u listi aktivnih oglasa
---