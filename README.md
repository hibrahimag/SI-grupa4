# SI-grupa4
Projekat za predmet Softver Inžinjering na ETF 2025/2026

## Dokumentacija
U nastavku se nalaze linkovi do bitne dokumentacije vezane za projekat:
- [Verzija v1](https://si-grupa4-1.onrender.com/) - link za pristup aplikaciji.
- [Product Backlog](https://github.com/hibrahimag/SI-grupa4/blob/main/Product_Backlog.md) - lista svih zahtjeva (dokument koji se redovno ažurira).
- [Product Vision](https://github.com/hibrahimag/SI-grupa4/blob/main/sprint1/Product_Vision.md) - vizija i ciljevi projekta.
- [User Stories](https://github.com/hibrahimag/SI-grupa4/blob/main/sprint2/User_Stories.md) - lista svih zadataka na osnovu zahtjeva (Product Backlog)

```
SI-grupa4
├─ .claude
│  └─ settings.local.json
├─ package-lock.json
├─ projekat
│  ├─ .env.example
│  ├─ .eslintrc.cjs
│  ├─ .prettierrc
│  ├─ backend
│  │  ├─ .sequelizerc
│  │  ├─ coverage-integration
│  │  │  ├─ base.css
│  │  │  ├─ block-navigation.js
│  │  │  ├─ favicon.png
│  │  │  ├─ index.html
│  │  │  ├─ prettify.css
│  │  │  ├─ prettify.js
│  │  │  ├─ sort-arrow-sprite.png
│  │  │  ├─ sorter.js
│  │  │  └─ src
│  │  │     ├─ app.js.html
│  │  │     ├─ business
│  │  │     │  ├─ controllers
│  │  │     │  │  ├─ admin.controller.js.html
│  │  │     │  │  ├─ applications.controller.js.html
│  │  │     │  │  ├─ approval.controller.js.html
│  │  │     │  │  ├─ auth.controller.js.html
│  │  │     │  │  ├─ companies.controller.js.html
│  │  │     │  │  ├─ favourites.controller.js.html
│  │  │     │  │  ├─ index.html
│  │  │     │  │  ├─ koordinator.controller.js.html
│  │  │     │  │  ├─ listings.controller.js.html
│  │  │     │  │  ├─ notifications.controller.js.html
│  │  │     │  │  └─ users.controller.js.html
│  │  │     │  └─ services
│  │  │     │     ├─ admin.service.js.html
│  │  │     │     ├─ applications.service.js.html
│  │  │     │     ├─ approval.service.js.html
│  │  │     │     ├─ auth.service.js.html
│  │  │     │     ├─ companies.service.js.html
│  │  │     │     ├─ email.service.js.html
│  │  │     │     ├─ favourites.service.js.html
│  │  │     │     ├─ index.html
│  │  │     │     ├─ koordinator.service.js.html
│  │  │     │     ├─ listings.service.js.html
│  │  │     │     ├─ notifications.service.js.html
│  │  │     │     └─ users.service.js.html
│  │  │     ├─ index.html
│  │  │     ├─ infrastructure
│  │  │     │  └─ database
│  │  │     │     ├─ db.js.html
│  │  │     │     ├─ index.html
│  │  │     │     ├─ models
│  │  │     │     │  ├─ Aktivnost.js.html
│  │  │     │     │  ├─ Dokument.js.html
│  │  │     │     │  ├─ Evaluacija.js.html
│  │  │     │     │  ├─ Fakultet.js.html
│  │  │     │     │  ├─ index.html
│  │  │     │     │  ├─ Izvjestaj.js.html
│  │  │     │     │  ├─ Kompanija.js.html
│  │  │     │     │  ├─ Koordinator.js.html
│  │  │     │     │  ├─ Odsjek.js.html
│  │  │     │     │  ├─ Oglas.js.html
│  │  │     │     │  ├─ OmiljeniOglas.js.html
│  │  │     │     │  ├─ Praksa.js.html
│  │  │     │     │  ├─ PrijavaNaPraksu.js.html
│  │  │     │     │  ├─ Prisustvo.js.html
│  │  │     │     │  ├─ Student.js.html
│  │  │     │     │  ├─ Ugovor.js.html
│  │  │     │     │  └─ User.js.html
│  │  │     │     └─ sequelize.js.html
│  │  │     ├─ middleware
│  │  │     │  ├─ auth.middleware.js.html
│  │  │     │  ├─ index.html
│  │  │     │  ├─ rbac.middleware.js.html
│  │  │     │  └─ upload.middleware.js.html
│  │  │     └─ presentation
│  │  │        └─ routes
│  │  │           ├─ admin.routes.js.html
│  │  │           ├─ applications.routes.js.html
│  │  │           ├─ approval.routes.js.html
│  │  │           ├─ auth.routes.js.html
│  │  │           ├─ companies.routes.js.html
│  │  │           ├─ dokument.routes.js.html
│  │  │           ├─ favourites.routes.js.html
│  │  │           ├─ index.html
│  │  │           ├─ koordinator.routes.js.html
│  │  │           ├─ listings.routes.js.html
│  │  │           ├─ notifications.routes.js.html
│  │  │           └─ users.routes.js.html
│  │  ├─ jest.config.js
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ app.js
│  │  │  ├─ business
│  │  │  │  ├─ controllers
│  │  │  │  │  ├─ admin.controller.js
│  │  │  │  │  ├─ applications.controller.js
│  │  │  │  │  ├─ application_limit.controller.js
│  │  │  │  │  ├─ approval.controller.js
│  │  │  │  │  ├─ auth.controller.js
│  │  │  │  │  ├─ companies.controller.js
│  │  │  │  │  ├─ favourites.controller.js
│  │  │  │  │  ├─ koordinator.controller.js
│  │  │  │  │  ├─ listings.controller.js
│  │  │  │  │  ├─ notifications.controller.js
│  │  │  │  │  └─ users.controller.js
│  │  │  │  └─ services
│  │  │  │     ├─ admin.service.js
│  │  │  │     ├─ applications.service.js
│  │  │  │     ├─ application_limit.service.js
│  │  │  │     ├─ approval.service.js
│  │  │  │     ├─ auth.service.js
│  │  │  │     ├─ companies.service.js
│  │  │  │     ├─ email.service.js
│  │  │  │     ├─ favourites.service.js
│  │  │  │     ├─ koordinator.service.js
│  │  │  │     ├─ listings.service.js
│  │  │  │     ├─ notificationPreferences.service.js
│  │  │  │     ├─ notifications.service.js
│  │  │  │     └─ users.service.js
│  │  │  ├─ infrastructure
│  │  │  │  ├─ database
│  │  │  │  │  ├─ db.js
│  │  │  │  │  ├─ migrations
│  │  │  │  │  ├─ models
│  │  │  │  │  │  ├─ Aktivnost.js
│  │  │  │  │  │  ├─ Dokument.js
│  │  │  │  │  │  ├─ Evaluacija.js
│  │  │  │  │  │  ├─ Fakultet.js
│  │  │  │  │  │  ├─ index.js
│  │  │  │  │  │  ├─ Izvjestaj.js
│  │  │  │  │  │  ├─ Kompanija.js
│  │  │  │  │  │  ├─ Koordinator.js
│  │  │  │  │  │  ├─ NotificationPreference.js
│  │  │  │  │  │  ├─ Notifikacija.js
│  │  │  │  │  │  ├─ Odsjek.js
│  │  │  │  │  │  ├─ Oglas.js
│  │  │  │  │  │  ├─ OmiljeniOglas.js
│  │  │  │  │  │  ├─ Praksa.js
│  │  │  │  │  │  ├─ PrijavaNaPraksu.js
│  │  │  │  │  │  ├─ Prisustvo.js
│  │  │  │  │  │  ├─ Student.js
│  │  │  │  │  │  ├─ SystemSetting.js
│  │  │  │  │  │  ├─ Ugovor.js
│  │  │  │  │  │  └─ User.js
│  │  │  │  │  └─ sequelize.js
│  │  │  │  └─ supabase.js
│  │  │  ├─ middleware
│  │  │  │  ├─ auth.middleware.js
│  │  │  │  ├─ rbac.middleware.js
│  │  │  │  └─ upload.middleware.js
│  │  │  ├─ presentation
│  │  │  │  └─ routes
│  │  │  │     ├─ admin.routes.js
│  │  │  │     ├─ applications.routes.js
│  │  │  │     ├─ approval.routes.js
│  │  │  │     ├─ auth.routes.js
│  │  │  │     ├─ companies.routes.js
│  │  │  │     ├─ dokument.routes.js
│  │  │  │     ├─ favourites.routes.js
│  │  │  │     ├─ koordinator.routes.js
│  │  │  │     ├─ listings.routes.js
│  │  │  │     ├─ notificationPreferences.routes.js
│  │  │  │     ├─ notifications.routes.js
│  │  │  │     └─ users.routes.js
│  │  │  └─ server.js
│  │  └─ tests
│  │     ├─ admin.routes.integration.test.js
│  │     ├─ admin.routes.test.js
│  │     ├─ applications.routes.integration.test.js
│  │     ├─ approval.routes.test.js
│  │     ├─ auth.routes.integration.test.js
│  │     ├─ auth.routes.test.js
│  │     ├─ companies.routes.integration.test.js
│  │     ├─ favourites.routes.integration.test.js
│  │     ├─ koordinator.routes.integration.test.js
│  │     ├─ listings.routes.integration.test.js
│  │     ├─ placeholder.routes.test.js
│  │     ├─ unit
│  │     │  ├─ admin.service.test.js
│  │     │  ├─ approval.service.test.js
│  │     │  ├─ auth.middleware.test.js
│  │     │  ├─ auth.service.register.test.js
│  │     │  ├─ auth.service.test.js
│  │     │  ├─ koordinator.route.test.js
│  │     │  ├─ koordinator.service.test.js
│  │     │  ├─ rbac.middleware.test.js
│  │     │  ├─ users.controller.test.js
│  │     │  └─ users.service.test.js
│  │     └─ users.routes.integration.test.js
│  ├─ frontend
│  │  ├─ index.html
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ public
│  │  │  ├─ logo.png
│  │  │  ├─ logo2.png
│  │  │  └─ _redirects
│  │  ├─ src
│  │  │  ├─ App.jsx
│  │  │  ├─ context
│  │  │  │  ├─ AuthContext.jsx
│  │  │  │  └─ ThemeContext.jsx
│  │  │  ├─ data
│  │  │  │  └─ mockPrakse.js
│  │  │  ├─ hooks
│  │  │  │  └─ useApplicationLimit.js
│  │  │  ├─ index.css
│  │  │  ├─ main.jsx
│  │  │  ├─ modules
│  │  │  │  ├─ applications
│  │  │  │  ├─ auth
│  │  │  │  │  └─ ProtectedRoute.jsx
│  │  │  │  ├─ dashboard
│  │  │  │  ├─ koordinator
│  │  │  │  │  ├─ KoordinatorLimitPanel.jsx
│  │  │  │  │  ├─ OdobravanjePregled.jsx
│  │  │  │  │  ├─ PraksePregled.jsx
│  │  │  │  │  ├─ PrijavaDetalji.jsx
│  │  │  │  │  ├─ PrijavePregled.jsx
│  │  │  │  │  └─ StudentListaPregled.jsx
│  │  │  │  ├─ listings
│  │  │  │  │  └─ EditOglas.jsx
│  │  │  │  └─ profile
│  │  │  ├─ pages
│  │  │  │  ├─ AdminDashboard.css
│  │  │  │  ├─ AdminDashboard.jsx
│  │  │  │  ├─ ApplicationsPage.jsx
│  │  │  │  ├─ AuthPage.css
│  │  │  │  ├─ AuthPage.jsx
│  │  │  │  ├─ CompanyProfilePage.css
│  │  │  │  ├─ CompanyProfilePage.jsx
│  │  │  │  ├─ CookiesPolicy.jsx
│  │  │  │  ├─ DashboardPage.jsx
│  │  │  │  ├─ ForgotPasswordPage.jsx
│  │  │  │  ├─ KompanijaDashboard.css
│  │  │  │  ├─ KompanijaDashboard.jsx
│  │  │  │  ├─ KoordinatorDashboard.css
│  │  │  │  ├─ KoordinatorDashboard.jsx
│  │  │  │  ├─ LandingPage.jsx
│  │  │  │  ├─ ListingsPage.jsx
│  │  │  │  ├─ NotFoundPage.jsx
│  │  │  │  ├─ PrivacyPolicy.jsx
│  │  │  │  ├─ ProfilePage.css
│  │  │  │  ├─ ProfilePage.jsx
│  │  │  │  ├─ PublicListingspage.css
│  │  │  │  ├─ PublicListingsPage.jsx
│  │  │  │  ├─ RegisterPage.css
│  │  │  │  ├─ RegisterPage.jsx
│  │  │  │  ├─ ResetPasswordPage.jsx
│  │  │  │  ├─ StudentDashboard.css
│  │  │  │  ├─ StudentDashboard.jsx
│  │  │  │  ├─ TermsAndConditions.jsx
│  │  │  │  └─ VerifyEmailPage.jsx
│  │  │  ├─ routes
│  │  │  │  └─ routes_index.jsx
│  │  │  ├─ services
│  │  │  │  ├─ adminService.js
│  │  │  │  ├─ api.js
│  │  │  │  ├─ applicationsService.js
│  │  │  │  ├─ auth.service.js
│  │  │  │  ├─ companyProfile.service.js
│  │  │  │  ├─ companyPublic.service.js
│  │  │  │  ├─ favouritesService.js
│  │  │  │  ├─ koordinatorService.js
│  │  │  │  ├─ listingsService.js
│  │  │  │  └─ userService.js
│  │  │  └─ styles
│  │  │     ├─ responsive.css
│  │  │     └─ variables.css
│  │  └─ vite.config.js
│  ├─ package-lock.json
│  ├─ package.json
│  └─ tree.txt
├─ README.md
├─ sprint1
│  ├─ Product_Vision.md
│  ├─ Sprint_1_Goal.md
│  ├─ Stakeholder mapa.md
│  └─ Team Charter.md
├─ sprint2
│  ├─ NFR_lista.md
│  ├─ Sprint_2_Goal.md
│  └─ User_Stories.md
├─ sprint3
│  ├─ Analiza rizika.md
│  ├─ Architecture.png
│  ├─ Architecture_Overview.md
│  ├─ Domain_Model.md
│  ├─ ER dijagram.jpg
│  ├─ Sprint_3_Goal.md
│  ├─ Test_Strategy.md
│  └─ Use Case Model.md
├─ sprint4
│  ├─ DefinitionOfDone.md
│  ├─ Initial release plan.md
│  ├─ Sprint_4_Goal.md
│  └─ Tehnoloski_Setup.md
├─ sprint5
│  ├─ AI_Usage_Log.md
│  ├─ Decision_Log.md
│  ├─ Dizajn_baze.JPG
│  ├─ Dokumentacija sistema.md
│  ├─ Sprint_Backlog.md
│  ├─ Sprint_Goal.md
│  └─ Sprint_Review.md
├─ sprint6
│  ├─ AI_Usage_Log.md
│  ├─ Decision_Log.md
│  ├─ Sprint_Backlog.md
│  ├─ Sprint_Goal.md
│  ├─ Sprint_Retrospective_Summary.md
│  └─ Sprint_Review.md
├─ sprint7
│  ├─ AI_Usage_Log.md
│  ├─ Decision_Log.md
│  ├─ ProofOfTesting.md
│  ├─ SprintGoal.md
│  ├─ SprintRetrospectiveSummary.md
│  ├─ Sprint_Backlog.md
│  ├─ Sprint_Review.md
│  ├─ testovi1.png
│  └─ testovi2.png
├─ sprint8
│  ├─ AI_Usage_Log.md
│  ├─ Decision_Log.md
│  ├─ Product_Backlog.md
│  ├─ ProofOfTesting.md
│  ├─ SprintGoal.md
│  ├─ SprintRetrospectiveSummary.md
│  ├─ Sprint_Backlog.md
│  ├─ testovi1.png
│  └─ testovi2.png
└─ sprint9
   └─ AI_Usage_Log.md

```