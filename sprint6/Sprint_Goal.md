# Sprint broj
Sprint 6

# Sprint cilj
Cilj sprinta je implementacija kompletnog sistema autentifikacije i upravljanja korisnicima - od registracije i verifikacije email adrese do prijave u sistem i obnavljanja lozinke za sve korisničke role (student, koordinator, kompanija, administrator).

# Ključne stavke koje tim želi završiti
- Registracija studenta
- Registracija koordinatora fakulteta
- Registracija kompanije
- Prijava studenata
- Prijava koordinatora
- Prijava kompanija
- Obnavljanje lozinke
- Verifikacija email adrese
- Odobravanje korisničkog računa
- Testirati funkcionalnosti u skladu sa DoD kriterijima
- Ažurirati AI Usage Log i Decision Log

## Rizici i zavisnosti
- Konfiguracija Gmail SMTP servera za slanje verifikacionih emailova može uzrokovati kašnjenje
- RBAC middleware mora biti ispravno postavljen prije testiranja pristupa po rolama
- Odobravanje računa direktno zavisi od završetka registracije i verifikacije emaila
- Sigurnosni aspekti (JWT, bcrypt, token expiry) zahtijevaju pažljivu implementaciju i testiranje