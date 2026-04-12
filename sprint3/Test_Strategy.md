# Test Strategy
## Sistem za upravljanje studentskim praksama


## 1. Cilj testiranja

Cilj testiranja sistema za upravljanje studentskim praksama je osigurati da aplikacija funkcioniše pouzdano, sigurno i u skladu sa definisanim funkcionalnim i nefunkcionalnim zahtjevima. Testiranjem omogućavamo rano otkrivanje greške, te minimizaciju rizika prije produkcije. 

Pored funkcionalne ispravnosti, cilj testiranja je i validacija integracije između različitih komponenti sistema (arhitecture_overview), kako bi se osigurala konzistentnost podataka kroz cijeli sistem. Također, testiranje ima za cilj procjenu performansi, sigurnosti i upotrebljivosti sistema, kako bi se obezbijedilo kvalitetno i stabilno korisničko iskustvo za sve tipove korisnika (studenti, koordinatori i  kompanije) uz osiguranu tačnost podataka, te pouzdanu prijavu i praćenje praksi.

Konačno, cilj testiranja je pravovremeno otkrivanje i otklanjanje grešaka, kao i verifikacija da sistem ispunjava definisane acceptance kriterije i poslovne potrebe.

---

## 2. Nivoi testiranja
- šta se testira na kojem nivou
---

## 3. Veza sa acceptance kriterijima

---

## 4. Načini evidencije rezultata testiranja

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

 ## 5. Glavni rizici kvaliteta

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