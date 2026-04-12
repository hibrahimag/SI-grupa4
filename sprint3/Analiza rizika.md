# Risk Register

## R-01: Neispravna autentifikacija korisnika
- **Uzrok:** Greške u implementaciji login/registracije  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Validacija inputa i testiranje autentifikacije  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-02: Sigurnosni propusti i curenje podataka
- **Uzrok:** Rad sa osjetljivim korisničkim podacima  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Enkripcija podataka i sigurnosno testiranje  
- **Odgovorna osoba/uloga:** Backend developer / DevOps  
- **Status:** Otvoren  

---

## R-03: Gubitak podataka o prijavama
- **Uzrok:** Problemi sa bazom ili backup sistemom  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Redovan backup i transakcije baze  
- **Odgovorna osoba/uloga:** DB administrator  
- **Status:** Otvoren  

---

## R-04: Neispravan proces prijave na praksu
- **Uzrok:** Kompleksan workflow između više uloga  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Modeliranje procesa i testiranje scenarija  
- **Odgovorna osoba/uloga:** QA / Software architect  
- **Status:** Otvoren  

---

## R-05: Neispravna kontrola pristupa (role)
- **Uzrok:** Pogrešna implementacija korisničkih uloga  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Implementacija RBAC modela i testiranje  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-06: Loše performanse sistema
- **Uzrok:** Velik broj korisnika i zahtjeva  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Load i stress testiranje  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-07: Problemi sa uploadom dokumenata
- **Uzrok:** Neispravna validacija ili storage fajlova  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Validacija fajlova i testiranje upload-a  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-08: Neusklađenost implementacije sa zahtjevima
- **Uzrok:** Pogrešna interpretacija user stories  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Validacija kroz acceptance criteria  
- **Odgovorna osoba/uloga:** QA / Product Owner  
- **Status:** Otvoren  

---

## R-09: Loš korisnički interfejs
- **Uzrok:** Kompleksnost sistema i loš UX dizajn  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Srednji  
- **Prioritet:** Nizak  
- **Plan mitigacije:** User testing i poboljšanje dizajna  
- **Odgovorna osoba/uloga:** Frontend developer  
- **Status:** Otvoren  

---

## R-10: Kašnjenje u razvoju
- **Uzrok:** Loša procjena vremena i zadataka  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Praćenje sprintova i bolja organizacija  
- **Odgovorna osoba/uloga:** Scrum Master  
- **Status:** Otvoren  

---

## R-11: Neuspješno generisanje ugovora
- **Uzrok:** Kompleksna logika generisanja PDF dokumenta  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Testiranje generisanih dokumenata  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-12: Neispravno slanje notifikacija
- **Uzrok:** Problemi sa email servisom ili integracijom  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Retry mehanizam i fallback opcije  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-13: Nedostupnost sistema
- **Uzrok:** Pad servera ili hosting problema  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Monitoring i backup server  
- **Odgovorna osoba/uloga:** DevOps  
- **Status:** Otvoren  

---

## R-14: Neovlašten pristup podacima
- **Uzrok:** Loša kontrola pristupa ili sigurnosne rupe  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Audit pristupa i sigurnosni testovi  
- **Odgovorna osoba/uloga:** DevOps / Security  
- **Status:** Otvoren  

---

## R-15: Problemi sa integracijom sistema
- **Uzrok:** Integracija sa eksternim servisima  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Testiranje integracija i fallback rješenja  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-16: Nepravilno evidentiranje prisustva
- **Uzrok:** Greške u unosu ili logici sistema  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Validacija unosa i provjera podataka  
- **Odgovorna osoba/uloga:** QA / Backend developer  
- **Status:** Otvoren  

---

## R-17: Nedovoljna skalabilnost sistema
- **Uzrok:** Povećanje broja korisnika  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Optimizacija baze i arhitekture  
- **Odgovorna osoba/uloga:** Software architect  
- **Status:** Otvoren  

---

## R-18: Problemi sa kompatibilnošću
- **Uzrok:** Različiti uređaji i browseri  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Testiranje na više platformi  
- **Odgovorna osoba/uloga:** Frontend developer  
- **Status:** Otvoren  
