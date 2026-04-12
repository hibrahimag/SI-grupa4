
# User Stories

---

> ## Izmjene sa konsultacija (drugi sprint)
>
> Dodani sljedeći user storiji:
>
> - **32. Uređivanje oglasa**
> - **33. Odustajanje od prakse**
> - **34. Obnavljanje lozinke** 
> - **35. Student dashboard** 
> - **36. Filtriranje oglasa** 
> - **37. Notifikacije o statusu prakse** 
> - **38. Verifikacija email adrese** 
> - **39. Pretraživanje oglasa** 
> - **40. Deaktivacija/brisanje korisničkog računa**
> - **16. Upravljanje statusima prijave (Workflow engine)**
> - **26. Historija aktivnosti (Audit log)**
> - **12. Upravljanje rokovima prijave**
> - **17. Ograničenje broja prijava po studentu**
> - **29. Digitalni potpis ugovora**
> - **27. Validacija unosa podataka**


---

## 1. Registracija studenta | PB1
- **Opis:** Kao student, želim da se registrujem u sistem kako bih kreirao svoj profil  
- **Poslovne vrijednosti:** Omogućava studentu pristup sistemu i njegovim osnovnim funkcionalnostima  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Student posjeduje fakultetski email  
- **Veza sa drugim storijima ili zavisnostima:**  
  - Vezano za 46 (Verifikacija email adrese)
- **Acceptance criteria:**
  - Sistem mora omogućiti unos podataka: ime, prezime, email, lozinka, indeks, godina studija, odsjek
  - Korisnik dobija potvrdu o registraciji
  - Sistem ne smije dozvoliti registraciju s već postojećim emailom
  - Sistem ne smije odobriti profil prije verifikacije
  - Obavezna polja moraju biti popunjena

---

## 2. Registracija koordinatora fakulteta | PB1
- **Opis:** Kao koordinator, želim da se registrujem u sistem s odgovarajućim privilegijama  
- **Poslovne vrijednosti:** Omogućava upravljanje procesom praksi  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je uposlenik fakulteta  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 9 (Pristup administratora)  
  - Vezano za 46 (Verifikacija email adrese)
- **Acceptance criteria:** 
  - Unos: ime, prezime, email, lozinka, institucija, odsjek
  - Registracija na čekanju admin odobrenja
  - Nema pristupa bez admin odobrenja
  - Email mora biti jedinstven

---

## 3. Registracija kompanije | PB1
- **Opis:** Kao kompanija, želim da se registrujem radi objavljivanja oglasa  
- **Poslovne vrijednosti:** Omogućava objavljivanje praksi  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti odobrena  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 9 (Pristup administratora)  
  - Vezano za 46 (Verifikacija email adrese)
- **Acceptance criteria:**
  - Unos: naziv, email, lozinka, adresa, kontakt osoba
  - Zahtjev ide adminu
  - Email mora biti jedinstven

---

## 4. Prijava studenata | PB2
- **Opis:** Kao student, želim da se prijavim u sistem  
- **Poslovne vrijednosti:** Omogućava pristup dashboardu  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 1  
  - Blokirano dok 46 nije završeno
- **Acceptance criteria:**
  - Ispravni kredencijali → dashboard (42)
  - Greška za pogrešne podatke
  - Ne dozvoliti prijavu bez verifikacije

---

## 5. Prijava koordinatora | PB2
- **Opis:** Kao koordinator, želim prijavu u sistem  
- **Poslovne vrijednosti:** Omogućava pristup koordinatorskom dashboardu  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 2 i 9  
- **Acceptance criteria:**
  - Pristup samo odobrenim accountima
  - Greška za pogrešne podatke

---

## 6. Prijava kompanija | PB2
- **Opis:** Kao kompanija želim prijavu radi upravljanja oglasima  
- **Poslovne vrijednosti:** Omogućava upravljanje praksama  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 3 i 9  
- **Acceptance criteria:**
  - Pristup samo odobrenim accountima

---

## 7. Pregled profila kompanije | PB4
- **Opis:** Kao student, želim vidjeti detalje o kompaniji  
- **Poslovne vrijednosti:** Informisana odluka o prijavi  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4  
  - Vezano za 14 (Pregled detalja oglasa)  
  - Vezano za 3  
- **Acceptance criteria:**
  - Prikaz osnovnih podataka
  - Lista aktivnih oglasa
  - Dostupno samo prijavljenim studentima

---

## 8. Pristup koordinatora | PB5
- **Opis:** Koordinator ima poseban interfejs  
- **Poslovne vrijednosti:** Centralizovan pregled prijava  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 5  
- **Acceptance criteria:**
  - Pregled svih prijava
  - Uvid u informacije studenata

---

## 9. Pristup administratora | PB5
- **Opis:** Administrator upravlja korisnicima  
- **Poslovne vrijednosti:** Upravljanje rolama  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Vezano za 2 i 3  
- **Acceptance criteria:**
  - Pregled svih korisnika
  - Dodjela rola

---

## 10. Kreiranje oglasa | PB6
- **Opis:** Kompanija kreira oglas  
- **Poslovne vrijednosti:** Objavljivanje prakse  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6  
- **Acceptance criteria:**
  - Unos: naziv, opis, trajanje, broj mjesta
  - Oglas postaje vidljiv studentima

---

## 11. Zatvaranje oglasa | PB6
- **Opis:** Kompanija zatvara oglas  
- **Poslovne vrijednosti:** Sprečava nove prijave  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 10  
- **Acceptance criteria:** 
  - Nije moguće prijaviti se na zatvoren oglas

---

## 12. Upravljanje rokovima prijave | PB6
- **Opis:** Definisanje roka prijave  
- **Poslovne vrijednosti:** Automatsko zatvaranje  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**  
  - Zavisi od 10  
- **Acceptance criteria:**
  - Rok mora biti u budućnosti
  - Automatsko zatvaranje nakon isteka

---

## 13. Pregled oglasa | PB7
- **Opis:** Student vidi sve aktivne oglase  
- **Poslovne vrijednosti:** Uvid u ponudu praksi  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 i 10  
- **Acceptance criteria:**
  - Prikaz svih aktivnih oglasa
  - Prikaz osnovnih informacija

---

## 14. Pregled detalja oglasa | PB8
- **Opis:** Student vidi detalje oglasa  
- **Poslovne vrijednosti:** Donošenje odluke  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 i 13  
- **Acceptance criteria:**  
  - Prikaz opisa, trajanja, broja mjesta, uslova
  - Prikaz roka prijave

---

## 15. Prijava na praksu | PB9
- **Opis:** Student se prijavljuje na praksu  
- **Poslovne vrijednosti:** Učešće u selekciji  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4, 13 i 14  
  - U vezi sa 16 (Workflow engine)
- **Acceptance criteria:**
  - Status počinje kao "Na čekanju"
  - Nije moguće prijaviti se dva puta
  - Nije moguće prijaviti se na zatvoren oglas

---

## 16. Upravljanje statusima prijave (Workflow engine) | PB9
- **Opis:** Definisan tok statusa prijave  
- **Poslovne vrijednosti:** Konzistentan proces  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Vezano za 15, 20, 21, 23, 40  
- **Acceptance criteria:**
  - Definisani statusi
  - Nema preskakanja redoslijeda
  - Historija promjena statusa

---

## 17. Ograničenje broja prijava po studentu | PB9
- **Opis:** Limit aktivnih prijava  
- **Poslovne vrijednosti:** Sprečava zloupotrebu  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 15  
- **Acceptance criteria:**
  - Administrator definiše limit
  - Nije moguće prekoračiti limit

---

## 18. Upload dokumentacije | PB10
- **Opis:** Upload CV i motivacionog pisma  
- **Poslovne vrijednosti:** Predstavljanje kvalifikacija  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 i 15  
- **Acceptance criteria:**
  - Samo PDF format
  - Dokumenti vidljivi kompaniji

---

## 19. Pregled prijava na praksu | PB11
- **Opis:** Kompanija vidi prijavljene studente  
- **Poslovne vrijednosti:** Selekcija kandidata  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6 i 15  
- **Acceptance criteria:**
  - Pregled svih kandidata
  - Uvid u dokumente

---

## 20. Selekcija kandidata | PB12
- **Opis:** Kompanija bira uži krug  
- **Poslovne vrijednosti:** Efikasna selekcija  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 19  
  - U vezi sa 16  
- **Acceptance criteria:**
  - Označavanje kandidata
  - Promjena statusa

---

## 21. Odobravanje prakse | PB13
- **Opis:** Koordinator odobrava praksu  
- **Poslovne vrijednosti:** Kontrola fakulteta  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 8 i 20  
  - U vezi sa 16  
- **Acceptance criteria:** 
  - Ažuriranje statusa
  - Notifikacija studentu

---

## 22. Odbijanje prakse | PB13
- **Opis:** Koordinator odbija praksu  
- **Poslovne vrijednosti:** Kontrola procesa  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 8 i 20  
  - U vezi sa 16  
- **Acceptance criteria:** 
  - Ažuriranje statusa
  - Notifikacija studentu

 ---

## 23. Potvrda studenta | PB14
- **Opis:** Kao student, želim da potvrdim učešće na odobrenoj praksi  
- **Poslovne vrijednosti:** Omogućava studentu prihvatanje odobrene prakse  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
  - Praksa je odobrena od koordinatora  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 15 i 21  
  - U vezi sa 16  
- **Acceptance criteria:** 
  - Student može potvrditi praksu
  - Status prelazi u "Potvrđena od studenta"
  - Kompanija i koordinator dobijaju obavještenje

---

## 24. Dizajn baze podataka | PB15
- **Opis:** Osmisliti šemu baze podataka sistema  
- **Poslovne vrijednosti:** Temelj za implementaciju sistema  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Povezano sa svim funkcionalnim storijima  
- **Acceptance criteria:** 
  - Entiteti: studenti, kompanije, koordinatori, prijave, oglasi
  - Definisane relacije između entiteta

---

## 25. Implementacija baze podataka | PB15
- **Opis:** Implementirati bazu podataka sistema  
- **Poslovne vrijednosti:** Omogućava skladištenje podataka  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 24  
- **Acceptance criteria:** 
  - Sistem mora omogućiti skladištenje podataka u bazi

---

## 26. Historija aktivnosti (Audit log) | PB15
- **Opis:** Administrator ima uvid u historiju akcija  
- **Poslovne vrijednosti:** Sigurnost i pravna validnost  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Povezano sa 1–23  
- **Acceptance criteria:**
  - Evidencija registracija
  - Evidencija promjena statusa
  - Evidencija brisanja naloga
  - Evidencija uređivanja oglasa
  - Evidencija odustajanja od prakse
  - Samo administrator ima pristup

---

## 27. Validacija unosa podataka | PB16
- **Opis:** Validacija svih korisničkih unosa  
- **Poslovne vrijednosti:** Sprečava greške i sigurnosne propuste  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Povezano sa 1, 2, 3, 10, 12, 15  
- **Acceptance criteria:**
  - Email validan format
  - Lozinka min 8 karaktera
  - Broj mjesta pozitivan
  - Rok prijave u budućnosti
  - Validacija frontend i backend

---

## 28. Generisanje ugovora | PB17
- **Opis:** Sistem generiše ugovor o praksi  
- **Poslovne vrijednosti:** Automatizacija pravne dokumentacije  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 20 i 23  
- **Acceptance criteria:** 
  - Automatsko generisanje ugovora
  - Dostupno studentu i kompaniji

---

## 29. Digitalni potpis ugovora | PB17
- **Opis:** Student i kompanija digitalno potpisuju ugovor  
- **Poslovne vrijednosti:** Potpuna digitalizacija procesa  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 28  
- **Acceptance criteria:**
  - Omogućeno digitalno potpisivanje
  - Status ugovora "Potpisan"
  - Dokument se ne može mijenjati nakon potpisa

---

## 30. Preuzimanje ugovora | PB18
- **Opis:** Student preuzima digitalni ugovor  
- **Poslovne vrijednosti:** Pregled i arhiviranje ugovora  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 28 i 29  
- **Acceptance criteria:** 
  - Omogućeno preuzimanje PDF verzije

---

## 31. Evidencija aktivnosti | PB19
- **Opis:** Student unosi dnevne/sedmične aktivnosti  
- **Poslovne vrijednosti:** Praćenje rada studenta  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 23 i 29  
- **Acceptance criteria:** 
  - Student unosi aktivnosti
  - Kompanija i koordinator imaju pregled

---

## 32. Automatsko završavanje prakse | PB19
- **Opis:** Sistem automatski završava praksu  
- **Poslovne vrijednosti:** Automatizacija procesa  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 31  
  - U vezi sa 16  
- **Acceptance criteria:**
  - Nakon isteka trajanja → status "Završena"
  - Obavještenje studentu i kompaniji

---

## 33. Praćenje prisustva | PB20
- **Opis:** Kompanija evidentira prisustvo  
- **Poslovne vrijednosti:** Praćenje redovnosti  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 31  
- **Acceptance criteria:** 
  - Evidentiranje prisustva
  - Student ima uvid

---

## 34. Evaluacija studenta | PB21
- **Opis:** Kompanija evaluira studenta  
- **Poslovne vrijednosti:** Povratna informacija  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 32  
- **Acceptance criteria:** 
  - Evaluacija kroz formular
  - Student vidi evaluaciju

---

## 35. Evaluacija kompanije | PB22
- **Opis:** Student evaluira kompaniju  
- **Poslovne vrijednosti:** Poboljšanje kvaliteta praksi  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 32  
- **Acceptance criteria:** 
  - Student popunjava formular
  - Kompanija vidi evaluaciju

---

## 36. Izvještaji | PB23
- **Opis:** Kompanija generiše izvještaj o praksi  
- **Poslovne vrijednosti:** Dokaz o pohađanju prakse  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 33 i 34  
- **Acceptance criteria:** 
  - Generisanje izvještaja
  - Dostupno studentu

 ---

## 37. Analiza postojećih rješenja | PB24
- **Opis:** Istražiti postojeće sisteme za upravljanje praksama  
- **Poslovne vrijednosti:** Identifikacija dobrih praksi i nedostataka drugih sistema  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Prethodi 24 (Dizajn baze podataka)  
- **Acceptance criteria:** 
  - Analiza minimalno 3 postojeća sistema
  - Dokumentovani zaključci i preporuke

---

## 38. Dokumentacija sistema | PB25
- **Opis:** Dokumentovati funkcionalnosti i strukturu sistema  
- **Poslovne vrijednosti:** Strukturiran pregled sistema  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Dokumentacija se aktivno održava  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od svih implementiranih stavki (1–36)  
- **Acceptance criteria:** 
  - Promjene moraju biti redovno dokumentovane
  - Dokumentacija omogućava pregled dizajna i plana rada

---

## 39. Uređivanje oglasa | PB26
- **Opis:** Kao kompanija, želim izmijeniti postojeći oglas  
- **Poslovne vrijednosti:** Održavanje oglasa ažurnim  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 10  
  - Povezano sa 26 (Audit log)  
- **Acceptance criteria:**
  - Moguća izmjena naziva, opisa, trajanja, broja mjesta
  - Potvrda o uspješnom ažuriranju
  - Nije moguće uređivati zatvoren oglas

---

## 40. Odustajanje od prakse | PB27
- **Opis:** Kao student, želim odustati od prijavljene ili odobrene prakse  
- **Poslovne vrijednosti:** Fleksibilnost upravljanja prijavama  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 15, 21 i 23  
  - U vezi sa 16  
  - Povezano sa 26  
- **Acceptance criteria:**
  - Moguće odustati u statusu "Na čekanju" ili "Odobrena"
  - Status prelazi u "Odustao student"
  - Obavještenje kompaniji i koordinatoru
  - Nije moguće odustati od završene prakse

---

## 41. Obnavljanje lozinke | PB28
- **Opis:** Kao korisnik, želim obnoviti lozinku  
- **Poslovne vrijednosti:** Kontinuiran pristup sistemu  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 1, 2, 3, 4, 5, 6  
- **Acceptance criteria:**
  - Slanje reset linka na email
  - Link ističe nakon definisanog vremena
  - Nakon promjene lozinke → preusmjeravanje na prijavu
  - Ne otkrivati postojanje emaila u sistemu

---

## 42. Student dashboard | PB29
- **Opis:** Student ima centralizovani pregled prijava  
- **Poslovne vrijednosti:** Bolje korisničko iskustvo  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 i 15  
  - Povezano sa 45  
- **Acceptance criteria:**
  - Lista svih prijava
  - Prikaz trenutnog statusa
  - Prikaz notifikacija
  - Nema prikaza tuđih prijava

---

## 43. Filtriranje oglasa | PB30
- **Opis:** Student filtrira oglase  
- **Poslovne vrijednosti:** Brža pretraga  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 13 i 10  
- **Acceptance criteria:**
  - Filtriranje po oblasti
  - Filtriranje po vrsti plaćanja
  - Reset filtera

---

## 44. Pretraživanje oglasa | PB30
- **Opis:** Student pretražuje oglase po ključnoj riječi  
- **Poslovne vrijednosti:** Brže pronalaženje praksi  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 13 i 43  
- **Acceptance criteria:**
  - Pretraga po nazivu i opisu
  - Poruka ako nema rezultata

---

## 45. Notifikacije o statusu prakse | PB31
- **Opis:** Student prima notifikacije o promjeni statusa  
- **Poslovne vrijednosti:** Pravovremeno informisanje  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 16, 20, 21, 23  
  - Povezano sa 42  
- **Acceptance criteria:**
  - Notifikacija pri svakoj promjeni statusa
  - Prikaz historije notifikacija
  - Nema duplikata

---

## 46. Verifikacija email adrese | PB32
- **Opis:** Novi korisnik mora verifikovati email  
- **Poslovne vrijednosti:** Sprečavanje lažnih naloga  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 1, 2, 3  
  - Blokira 4, 5, 6 dok nije završeno  
- **Acceptance criteria:**
  - Automatsko slanje emaila
  - Link ističe nakon 24h
  - Mogućnost ponovnog slanja

---

## 47. Deaktivacija/brisanje korisničkog računa | PB33
- **Opis:** Korisnik može deaktivirati nalog  
- **Poslovne vrijednosti:** Kontrola nad podacima  
- **Prioritet:** Low  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4, 5, 6  
  - Povezano sa 9 i 26  
- **Acceptance criteria:**
  - Potvrda prije brisanja
  - Onemogućena prijava nakon deaktivacije
  - Admin može reaktivirati nalog

---

## 48. Početna stranica (Landing page) | PB34
- **Opis:** Informativna početna stranica  
- **Poslovne vrijednosti:** Prvi dojam o sistemu  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Vezano za 1–6  
- **Acceptance criteria:**
  - Opis platforme
  - Linkovi za registraciju i prijavu
  - Nema zaštićenog sadržaja

---

## 49. Navigacija | PB35
- **Opis:** Prilagođena navigacija po roli  
- **Poslovne vrijednosti:** Lakše kretanje kroz sistem  
- **Prioritet:** High  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4, 5, 6  
  - Povezano sa 42, 8, 9  
- **Acceptance criteria:**
  - Navigacija prilagođena roli
  - Vidljiva opcija odjave

---

## 50. Pregled korisničkog profila | PB36
- **Opis:** Korisnik vidi detalje svog profila  
- **Poslovne vrijednosti:** Transparentnost podataka  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 1, 2, 3  
  - Povezano sa 53 i 54  
- **Acceptance criteria:**
  - Prikaz osnovnih informacija
  - Dostupno samo prijavljenim korisnicima

---

## 51. Privacy policy & User Terms stranica | PB37
- **Opis:** Prikaz politike privatnosti i uslova korištenja  
- **Poslovne vrijednosti:** Pravna usklađenost  
- **Prioritet:** Low  
- **Veza sa drugim storijima ili zavisnostima:**  
  - Dostupno svima (vezano za 48)  
- **Acceptance criteria:**
  - Vidljivo prijavljenim i neprijavljenim korisnicima

---

## 52. Tamni režim rada | PB38
- **Opis:** Mogućnost promjene teme  
- **Poslovne vrijednosti:** Bolje korisničko iskustvo  
- **Prioritet:** Low  
- **Veza sa drugim storijima ili zavisnostima:**  
  - Povezano sa 49  
- **Acceptance criteria:**
  - Svjetla i tamna tema
  - Jednostavna promjena teme

---

## 53. Uređivanje profila studenta | PB39
- **Opis:** Student uređuje svoje podatke  
- **Poslovne vrijednosti:** Ažurnost profila  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4  
  - Povezano sa 50  
- **Acceptance criteria:**
  - Izmjena ličnih podataka
  - Upload CV u PDF formatu

---

## 54. Uređivanje profila kompanije | PB39
- **Opis:** Kompanija uređuje podatke  
- **Poslovne vrijednosti:** Ažurnost javnih informacija  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6  
  - Povezano sa 50  
- **Acceptance criteria:**
  - Izmjena podataka
  - Samo prijavljena kompanija

---

## 55. Favoriziranje oglasa | PB39
- **Opis:** Student označava oglase kao omiljene  
- **Poslovne vrijednosti:** Lakše praćenje interesantnih praksi  
- **Prioritet:** Low  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 i 13  
- **Acceptance criteria:**
  - Označavanje oglasa
  - Lista omiljenih
  - Uklanjanje iz omiljenih

---

## 56. Arhiviranje oglasa | PB40
- **Opis:** Kompanija arhivira zatvorene oglase  
- **Poslovne vrijednosti:** Organizacija historije oglasa  
- **Prioritet:** Low  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 11  
- **Acceptance criteria:**
  - Arhivirani oglasi nisu vidljivi studentima
  - Moguće vratiti oglas iz arhive

---

## 57. Pregled statistike prijava | PB41
- **Opis:** Kompanija vidi statistiku prijava  
- **Poslovne vrijednosti:** Bolje planiranje budućih oglasa  
- **Prioritet:** Medium  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 19 i 15  
- **Acceptance criteria:**
  - Broj prijava
  - Statistika po odsjeku i godini
  - Filtriranje podataka
  - Nije moguće vidjeti statistiku tuđih oglasa
