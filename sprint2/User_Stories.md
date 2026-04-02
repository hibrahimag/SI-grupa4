**User Stories**
---

### 1. Registracija studenta
-Opis: Kao student, želim da se registrujem u sistem kako bih kreirao svoj profil
-Poslovne vrijednosti: Omogućava studentu pristup sistemu i njegovim osnovim funkcionalnostima
-Prioritet: High
-Pretpostavke i otvorena pitanja: 
  - Student posjeduje fakultetski email
  - Da li je potrebna verifikacija od strane fakulteta/koordinatora
-Veza sa drugim storijima ili zavisnostima: [TODO]

Acceptence criteria: [TODO]
---

### 2. Registracija koordinatora fakulteta
-Opis: Kao koordinator, želim da se registrujem u sistem s odgovarajućim privilegijama kako bih upravljao procesom odobravanja praksi
-Poslovne vrijednosti: Omogućava koordinatoru pristup određenim prvilegijama koje dolaze uz tu rolu
-Prioritet: High
-Pretpostavka i otvorena pitanja:
  - Koordinator je uposlenik fakulteta
-Veza sa drugim storijima ili zavisnostima: [TODO]

Acceptence criteria: [TODO]
---


### 3. Registracija kompanije
-Opis: Kao kompanija, želim da se registrujem u sistem s ciljem objavljivanja oglasa i povezivanja sa studentima
-Poslove vrijednosti: Objavljivanje oglasa za praksu u cilju pronalaska kvalitetne radne snage
-Prioritet: High
-Pretpostavka i otvorena pitanja:
  - Kompanija mora biti odobrena od strane fakulteta
  - Da li admin dodjeljuje rolu kompanije ili se automatski dodjeljuje nekim drugim putem?
Veza sa drugim storijima ili zavisnostima: [TODO]

Acceptence criteria: [TODO]
---

### 4.Prijava studenata
-Opis: Kao student, želim da se prijavim u sistem kako bih pristupio objavljenim praksama i prijavio se na njih
-Poslovne vrijednosti: Omogućava studentu siguran pristup već kreiranom profilu i konstantan uvid u objavljene prakse i stanje prijavljenih praksi
-Prioritet: High
-Pretpostavka i otvorena pitanja: 
  - Student se već registrovao u sistem
Veza sa drugim storijima ili zavisnostima: [TODO]

Acceptence criteria: [TODO]
---

### 5.Prijava koordinatora:
-Opis: Kao koordinator, želim da se prijavim u sistem kako bih odobravao studentima prijavljene prakse i imao uvid u njih
-Poslovne vrijednosti: Omogućava koordinatoru siguran pristup već kreiranom profilu i dalje odobravanje i evaluacije praksi
-Prioritet: High
-Pretpostavka i otvorena pitanja: 
  - Koordinator je već odobren od strane administratora kao koordinator
  - Kojim podacima studenata koordinator ima pristup?
Veza sa drugim storijima ili zavisnostima: [TODO]

Acceptence criteria: [TODO]
---

### 6.Prijava kompanija: 
-Opis: Kao kompanija želim, da se prijavim u sistem u cilju nastavka upravljanja i objavljivanja oglasa 
-Poslovne vrijednosti:  Omogućava kompaniji siguran pristup već kreiranom profilu i nastavak upravljanja oglasima i prijavama
-Prioritet: High
-Pretpostavka i otvorena pitanja:
  - Kompanija je već registrovana u sistem
Veza sa drugim storijima ili zavisnostima: [TODO]

Acceptence criteria: [TODO]
---

### 7. Uređivanje profila studenta
-Opis: Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)
-Poslovne vrijednosti: Student ima mogućnost ažuriranja profila
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Korisnik mora biti prijavljen da bi mogao uređivati profil
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---

### 8. Pristup koordinatora
-Opis: Kao koordinator želim da pristupim posebnom interfejsu sa ciljem uvida u informacije o prijavama studenata na prakse i njihovim osnovnim informacijama
Poslovne vrijednosti: Pruža centralizvan pregled prijava i informacija o studentima što mu omogućava efikasno odobravanje praksi
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Kojim informacijama može pristupiti koordinator?
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 5(Prijava koordinatora)

Acceptence criteria: [TODO]
---

### 9. Pristup administratora
-Opis: Kao administrator želim da pristupim posebnom interfejsu sa ciljem uvida i upravljanja svim korisinicima sistema
-Poslovne vrijednosti: Administratoru omogućava upravljanje rolama korisnika što je preduslov za ispravan rad sistema
-Prioritet: High
-Pretpostavka i otvorena pitanja: 
  - Administrator se ne registruje kao ostali korisnici
  - Da li postoji više administratora?
  - Da li se administrator kreira manuelno?
Veza sa drugim storijima ili zavisnostima:
- U vezi sa 2. i 3.(Davanja role koordinatora/kompanije korisniku)

Acceptence criteria: [TODO]
---

### 10. Kreiranje oglasa
-Opis: Kao kompanija želim da kreiram i objavim oglas kako bih pronašao validne kandidate za praksu
-Poslovne vrijednosti: Omogućava kompaniji objavljivanje oglasa za praksu
što omogućava povezivanje studenata s kompanijama
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Kompanija je prijavljena i odobrena u sistemu
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---

### 11. Pregled oglasa
-Opis: Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)
-Poslovne vrijednosti: [TODO]
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Korisnik mora biti prijavljen da mogao uređivati profil
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---

### 12. Pregled detalja oglasa
-Opis: Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)
-Poslovne vrijednosti: [TODO]
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Korisnik mora biti prijavljen da mogao uređivati profil
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---

### 13. Prijava na praksu
-Opis: Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)
-Poslovne vrijednosti: [TODO]
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Korisnik mora biti prijavljen da mogao uređivati profil
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---

### 14. Upload dokumentacije
-Opis: Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)
-Poslovne vrijednosti: [TODO]
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Korisnik mora biti prijavljen da mogao uređivati profil
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---

### 15. Pregled prijava na praksu
-Opis: Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)
-Poslovne vrijednosti: [TODO]
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Korisnik mora biti prijavljen da mogao uređivati profil
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---

### 16. Selekcija prijavljenih kandidata na praksu
-Opis: Kao student želim da unesem/uređujem osnovne lične podatke potrebne za praksu (odsjek, godina studije, CV)
-Poslovne vrijednosti: [TODO]
-Prioritet: Medium
-Pretpostavka i otvorena pitanja: 
  - Korisnik mora biti prijavljen da mogao uređivati profil
Veza sa drugim storijima ili zavisnostima:
  - Zavisi od 4(Prijava studenta)

Acceptence criteria: [TODO]
---