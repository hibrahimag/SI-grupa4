# AI Usage Log — Sprint 8

## Unos — Implementacija upload-a dokumentacije za prijavu na praksu (SB-14)

| Polje | Sadržaj |
|---|---|
| **Datum** | 19.05.2026 |
| **Sprint broj** | 8 |
| **Alat** | ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | Irma Lemes |
| **Svrha korištenja** | Implementacija upload-a dokumentacije prilikom prijave na praksu |

**Kratak opis upita:**

> Implementirati mogućnost upload-a dokumentacije prilikom prijave na praksu. Student treba moći priložiti CV i dodatne dokumente uz validaciju formata i veličine fajla. Potrebno je povezati upload sa prijavom na praksu i prikazati korisniku poruku o uspješnom upload-u ili grešci.

**Šta je AI predložio ili generisao:**

- Backend logiku za upload dokumentacije povezane sa prijavom na praksu
- Validaciju dozvoljenih formata fajlova (PDF, DOCX i slično)
- Validaciju maksimalne veličine fajla prije pohrane
- Frontend formu za upload dokumenata unutar procesa prijave na praksu
- Prikaz success i error poruka nakon upload-a
- Povezivanje upload-anih dokumenata sa prijavom studenta

**Šta je tim prihvatio:**
- Validaciju tipa i veličine fajlova prije upload-a
- Povezivanje dokumentacije sa konkretnom prijavom na praksu
- Prikaz korisničkih poruka nakon uspješnog ili neuspješnog upload-a
- Ograničavanje upload-a samo na prijavljene studente

**Šta je tim izmijenio:**
- Prilagođen vizuelni izgled upload forme postojećem dizajnu aplikacije
- Nazivi i tekstovi poruka usklađeni sa ostatkom sistema

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**
- Potrebno dodatno testirati ponašanje sistema pri upload-u velikih fajlova i prekidu internet konekcije tokom slanja dokumentacije