# Domenski model

## Glavni entiteti

- **Student** - korisnik sistema koji pretražuje, prijavljuje se i učestvuje na praksama
- **Kompanija** - korisnik sistema koji nudi oglase za praksu, pregleda prijave, bira studente i prati njihov progres
- **Koordinator** - korisnik sistema koji odobrava praksu i prati progres studenata za vrijeme trajanja prakse
- **Admin** - korisnik sistema koji odobrava naloge kompanija i koordinatora
- **Fakultet** - institucija kojoj pripadaju studenti i koordinatori
- **Oglas** - oglas za praksu koji obajvljuje kompanija
- **PrijavaNaPraksu** - prijava studenta na određeni oglas za praksu
- **Praksa** - aktivna praksa koja nastaje nakon odobrenja prijave studenta na praksu
- **Ugovor** - dokument koji formalizuje praksu 
- **Izvještaj** - dokument koji formalizuje završetak prakse
- **Prisustvo** - evidencija prisustva studenta tokom prakse
- **Aktivnost** - evidencija o aktivnostima studenta tokom prakse
- **EvaluacijaKompanije** - ocjena i komentar studenta o kompaniji za koju je radio praksu
- **EvaluacijaStudenta** - ocjena i komentar kompanije o studentu koji je radio praksu


## Ključni atributi

- **Student**: indeks, ime, prezime, email, godina studija, odsjek
- **Koordinator**: ime, prezime, email
- **Kompanija**: naziv, email, adresa, telefon, opis poslovanja
- **Admin**: ime, prezime, email
- **Fakultet**: naziv, email, adresa
- **Oglas**: naziv, opis, broj mjesta, datum objave, rok prijave, 
  trajanje, oblast, plaćena praksa (da/ne)
- **PrijavaNaPraksu**: status, datum prijave, CV, motivaciono pismo
- **Praksa**: datum početka, datum kraja
- **Ugovor**: datum početka, opis, datum završetka
- **Izvještaj**: datum, opis, preporuka
- **EvaluacijaStudenta**: ocjena, komentar, datum
- **EvaluacijaKompanije**: ocjena, komentar, datum
- **Prisustvo**: datum, status
- **Aktivnost**: datum, opis

## Veza između entiteta

**Student i Fakultet**
- student pripada jednom fakultetu dok fakultet ima više studenata

**Student i PrijavaNaPraksu**
- student može podnijeti više prijava za praksu, ali samo jednu po oglasu
- kroz entitet PrijavaNaPraksu student postaje povezan sa kompanijom koja organizuje praksu kroz oglas i koordinatorom koji će pratiti praksu

**Student i Koordinator**
- koordinator odobrava profil studenta sa svog fakulteta
- jedan koordinator može odobriti više studenata

**Kompanija i Oglas**
- ista kompanija može objaviti više oglasa za praksu
- oglas objavljuje samo jedna kompanija

**Oglas i PrijavaNaPraksu**
- oglas može imati više prijava
- prijava se može odnositi samo na jedan oglas
- veza omogućava dalje ostvarivanje veze između studenta i kompanije koja objavljuje oglas

**PrijavaNaPraksu i Koordinator**
- koordinator može odobriti više praksi
- prijavu na praksu odobrava jedan koordinator
- veza omogućava dalje ostvarivanje veze između koordinatora, studenta i kompanije

**Koordiantor i Fakultet**
- koordinator pripada jednom fakultetu, dok fakultet može imati više koordinatora

**PrijavaNaPraksu i Praksa**
- nakon koordinatorovog odobrenja prijava rezultira jednom praksom

**Praksa i EvaluacijaKompanije**
- unutar jedne prakse je moguće da student uradi evaluaciju kompanije za koju radi praksu
- student može evaluirati sve kompanije za koje je radio prakse

**Praksa i EvaluacijaStudenta**
- unutar jedne prakse je moguće da kompanija uradi evauaciju studenta koji radi praksu
- jedna kompanija može evaluirati sve studente koji rade na nekoj praksi te kompanije

**Praksa i Aktivnost**
- unutar prakse se prate aktivnosti studenta na kojima on radi za vrijeme trajanja prakse
- za jednu praksu se veže više aktivnosti kako bi se pokrilo sve ono što student radi tokom prakse

**Praksa i Prisustvo**
- unutar prakse prisustvo omogućava evidentiranje dolazaka studenata na praksu

**Praksa i Ugovor**
- praksa ima tačno jedan ugovor za formaliziranje početka prakse
- jedan ugovor odgovara tačno jednoj praksi

**Praksa i Izvještaj**
- praksa ima tačno jedan izvještaj za formaliziranje kraja prakse
- jedan izvještaj odgovara tačno jednoj praksi

**Admin i Kompanija**
- admin odobrava registraciju kompanije
- jedan admin može odobriti više kompanija

**Admin i Koordinator**
- admin odobrava registraciju koordinatora
- jedan admin može odobriti više koordinatora

**Admin i Fakultet**
- admin dodaje i upravlja fakultetima u sistemu
- jedan admin može dodati više fakulteta


## Poslovna pravila važna za model

- Student se može prijaviti na isti oglas tačno jednom (unique constraint: studentID + oglasID)
- Student se može prijaviti na više različitih praksi
- Student ne može imati dvije aktivne prakse u isto vrijeme
- Student može obaviti više praksi tokom školovanja
- Student ne može odustati od prakse koja je već završena
- Student ne može pristupiti sistemu dok njegov email nije verfikovan i dok koordinator ne učini njegov profil aktivnim
- Promjena fakulteta tretira se kao kreiranje novog profila
- Email kompanije mora biti verifikovan prije korištenja sistema
- Email koordinatora mora biti verifikovan prije korištenja sistema
- Kompanija mora biti odobrena od strane admina prije korištenja sistema (admin označava profil kompanije kao aktivan)
- Koordinator mora biti odobren od strane admina prije korištenja sistema (admin označava profil koordinatora kao aktivan)
- Koordinator može odobriti prijave studenata samo sa svog fakulteta
- Koordinator se dodjeljuje prijavi tek pri donošenju odluke o odobrenju prakse
- Koordinator ne može odobriti prijavu studentu koji već ima aktivnu praksu
- Praksa nastaje kada se odobri prijava na praksu
- Prijava na praksu može postojati bez prakse (odbijena prijava ili prijava na čekanju ne rezultira praksom)
- Samo admin može dodavati fakultete u sistem
- Sistem može posjedovati više admina