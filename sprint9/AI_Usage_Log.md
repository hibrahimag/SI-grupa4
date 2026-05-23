# AI Usage Log — Sprint 9

---

## Unos 1 — Ispravka dokumenta prijave, migracija na Supabase Storage i notifikacije (US-37)

| Polje | Sadržaj |
|---|---|
| **Datum** | 21.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Dijagnoza i ispravka null vrijednosti dokumenta u prijavi, migracija upload-a dokumenata na Supabase Storage, implementacija US-37 — notifikacije o statusu prijave na praksu |

**Kratak opis upita:**

> Dokumenti priloženi uz prijavu na praksu (CV, motivaciono pismo) su null u `prijave_na_praksu` tabeli. Na `/profile` stranici se prikazuju samo nazivi dokumenata bez mogućnosti preuzimanja. Zatražena je dijagnoza problema, ispravka arhitekturalne nekonzistentnosti između `dokumenti` tabele i `cv`/`motivacionoPismo` kolona, migracija uploada sa lokalnog diska na Supabase Storage s limitom od 150KB, te implementacija notifikacija o statusu prakse: email obavijesti pri prijavi/odobravanju/odbijanju i in-app zvono ikonica na student dashboardu.

**Šta je AI predložio ili generisao:**

- Dijagnoza: `dokumenti.prijava_id` polje nikad nije bilo postavljano; `cv` i `motivacionoPismo` u `prijave_na_praksu` nikad nisu popunjavani — dva paralelna sistema nikad spojena
- Ispravka `applications.service.js` — nakon `PrijavaNaPraksu.create()` automatski ažurira `dokumenti` zapise s `prijava_id`, te popunjava `cv` i `motivacionoPismo` kolone putanjama pronađenih dokumenata
- Ispravka `dokument.routes.js` (`/attach` endpoint) — prihvata opcioni `prijava_id` parametar
- Migracija `upload.middleware.js` — zamjena `multer.diskStorage` s `multer.memoryStorage()`, limit smanjen na 150 KB
- Kreiranje `backend/src/infrastructure/supabase.js` — inicijalizacija Supabase klijenta (`createClient`)
- Izmjena `dokument.routes.js` — upload buffer-a u Supabase Storage bucket `dokumenti` (putanja: `{student_id}/{timestamp}{ext}`), brisanje iz bucketa pri DELETE, novi `GET /:id/download` endpoint koji generiše signed URL
- Izmjena `ProfilePage.jsx` — dugme za preuzimanje poziva `/api/dokumenti/:id/download` s JWT tokenom u headeru umjesto direktne `/uploads/` putanje
- Ispravka destructuriranja `{ student, user }` u `createApplication` (bio samo `{ student }`, uzrokovalo 500 grešku)
- `Notifikacija.js` model — tabela `notifikacije` (student_id, prijava_id, tip, naslov, poruka, procitana, created_at)
- Ažuriranje `models/index.js` — registracija modela i asocijacije
- `notifications.service.js` — funkcije `createNotification` (s dedup-om po `student_id + prijava_id + tip`), `getMyNotifications`, `markAsRead`, `markAllAsRead`
- `notifications.routes.js` — `GET /`, `PATCH /:id/read`, `PATCH /read-all`
- Dvije nove email funkcije u `email.service.js`: `sendPrijavaPodnesenaEmail` i `sendPrijavaStatusEmail` (HTML template usklađen s postojećim)
- `applications.service.js` — šalje in-app notifikaciju i email studentu pri podnesnoj prijavi
- `koordinator.service.js` (`odluciOPrijavi`) — šalje in-app notifikaciju i email studentu pri odobravanju/odbijanju, dohvata Student/User/Oglas/Kompanija u jednom upitu
- `api.js` (frontend) — `getNotifications`, `markNotificationRead`, `markAllNotificationsRead`
- `StudentDashboard.jsx` — zvono ikonica u navbaru s crvenim badge-om za nepročitane, dropdown panel s listom notifikacija, klik označava pročitanom, "Označi sve" dugme, useEffect za dohvat pri mount-u, zatvaranje klikom van
- `StudentDashboard.css` — kompletni stilovi za `.sd-notif-wrap`, `.sd-notif-btn`, `.sd-notif-badge`, `.sd-notif-dropdown`, `.sd-notif-item`, dark mode varijante

**Šta je tim prihvatio:**
- Dijagnozu arhitekturalne nekonzistentnosti i pristup rješavanja putem `prijava_id`
- Migraciju na Supabase Storage s 150 KB limitom
- Potpunu implementaciju in-app notifikacija i email obavijesti za US-37
- Zvono ikonicu u navbaru s badge-om i dropdown panelom

**Šta je tim izmijenio:**
- Ništa strukturalno — implementacija prihvaćena kako je generisana

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**
- `user` nije bio destructuriran iz `resolveStudentFromUser` u `createApplication` — uzrokovalo 500 grešku pri prvoj prijavi; otkriveno i ispravljeno odmah
- Supabase Storage bucket `dokumenti` i tabela `notifikacije` moraju biti kreirani ručno u Supabase dashboardu (SQL Editor) — nije automatizirano
- Download link kao `<a href>` nije slao JWT token — zamijenjeno s programskim `fetch` + `window.open`
