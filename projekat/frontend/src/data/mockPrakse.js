export const MOCK_PRAKSE = [
  {
    id: 1, naziv: 'Frontend Developer Intern', kompanija: 'LANACO d.o.o.',
    logo: 'LA', logoColor: '#1a6fd4',
    opis: 'Tražimo motiviranog studenta za rad na modernim web aplikacijama koristeći React i TypeScript. Naučit ćeš best practices u razvoju UI komponenti i raditi na stvarnim projektima u agilnom timu sa iskusnim seniorima.',
    tehnologije: ['React', 'TypeScript', 'CSS', 'Git'],
    trajanje: 3, brojMjesta: 2, lokacija: 'Sarajevo', tip: 'Hybrid',
    datumObjave: '2026-04-25', datumPocetka: '2026-06-01', stipendija: true,
    rokPrijave: '2026-05-25', aktivan: true,
    uslovi: ['Poznavanje HTML, CSS i JavaScript osnova', 'Poželjno iskustvo sa React frameworkom', 'Dobre komunikacijske vještine', 'Student 3. ili 4. godine ETF-a ili računarskih nauka'],
    kontakt: { osoba: 'Amira Kurtić', email: 'praksa@lanaco.com' },
  },
  {
    id: 2, naziv: 'Backend Developer Intern (Node.js)', kompanija: 'Telegroup d.o.o.',
    logo: 'TG', logoColor: '#0e9e6e',
    opis: 'Pridruži se backend timu i radi na razvoju REST API-ja, integraciji baza podataka i optimizaciji serverskih aplikacija. Odlična prilika za upoznavanje sa production sistemima i cloud arhitekturom.',
    tehnologije: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    trajanje: 6, brojMjesta: 1, lokacija: 'Banja Luka', tip: 'Onsite',
    datumObjave: '2026-04-20', datumPocetka: '2026-07-01', stipendija: false,
    rokPrijave: '2026-06-10', aktivan: true,
    uslovi: ['Znanje Node.js-a ili sličnog backend frameworka', 'Osnove rada sa relacijskim bazama podataka', 'Poznavanje Git-a i verzioniranja koda', 'Poželjno iskustvo sa REST API dizajnom'],
    kontakt: { osoba: 'Darko Milić', email: 'hr@telegroup.ba' },
  },
  {
    id: 3, naziv: 'Data Science Intern', kompanija: 'Intera d.o.o.',
    logo: 'IN', logoColor: '#6d4ce1',
    opis: 'Istraži svijet podataka uz naš tim data scientista. Radićeš na analizi podataka, vizualizaciji i izgradnji ML modela za stvarne poslovne probleme. Obuka na internim datasetima i mentorstvo senior kolega.',
    tehnologije: ['Python', 'Pandas', 'Scikit-learn', 'Jupyter', 'SQL'],
    trajanje: 4, brojMjesta: 2, lokacija: 'Mostar', tip: 'Remote',
    datumObjave: '2026-05-01', datumPocetka: '2026-06-15', stipendija: true,
    rokPrijave: '2026-05-20', aktivan: true,
    uslovi: ['Znanje Pythona (numpy, pandas osnove)', 'Osnove statistike i linearne algebre', 'Iskustvo s Jupyter Notebook-om poželjno', 'Interes za machine learning i analitiku podataka'],
    kontakt: { osoba: 'Lejla Alagić', email: 'karijere@intera.ba' },
  },
  {
    id: 4, naziv: 'Mobile Developer Intern (React Native)', kompanija: 'ASA Tech',
    logo: 'AT', logoColor: '#e07b1a',
    opis: 'Razvijaj cross-platform mobilne aplikacije za iOS i Android. Radićeš u timu iskusnih mobile developera na live projektu sa stotinama hiljada korisnika. Pokrivamo sve aspekte modernog mobilnog razvoja.',
    tehnologije: ['React Native', 'JavaScript', 'Firebase', 'Redux'],
    trajanje: 3, brojMjesta: 1, lokacija: 'Sarajevo', tip: 'Hybrid',
    datumObjave: '2026-04-18', datumPocetka: '2026-06-01', stipendija: false,
    rokPrijave: '2026-05-08', aktivan: false,
    uslovi: ['JavaScript ES6+ osnove', 'Interes za mobilni razvoj', 'Sposobnost rada u timu'],
    kontakt: { osoba: 'Mirza Hadžić', email: 'zapošljavanje@asatech.ba' },
  },
  {
    id: 5, naziv: 'DevOps / Cloud Intern', kompanija: 'Logosoft d.o.o.',
    logo: 'LS', logoColor: '#0891b2',
    opis: 'Nauči kako funkcionira moderna cloud infrastruktura. Radićeš sa CI/CD pipeline-ovima, containerizacijom i automatizaciji deployment procesa. Direktan pristup AWS okruženju i real-world projektima od prvog dana.',
    tehnologije: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
    trajanje: 6, brojMjesta: 1, lokacija: 'Sarajevo', tip: 'Remote',
    datumObjave: '2026-05-05', datumPocetka: '2026-07-15', stipendija: true,
    rokPrijave: '2026-07-01', aktivan: true,
    uslovi: ['Osnove Linux/Unix komandne linije', 'Interes za cloud i DevOps metodologiju', 'Osnove skriptiranja (Bash ili Python)', 'Poželjno: AWS Cloud Practitioner certifikat'],
    kontakt: { osoba: 'Bojan Petrić', email: 'hr@logosoft.ba' },
  },
  {
    id: 6, naziv: 'Full Stack Developer Intern', kompanija: 'Mistral Technologies',
    logo: 'MT', logoColor: '#be185d',
    opis: 'Idealna praksa za studente koji žele iskustvo na svim slojevima aplikacije. Radićeš na internom projektu za upravljanje resursima koji koriste stotine zaposlenih kompanije i njenih partnera.',
    tehnologije: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
    trajanje: 4, brojMjesta: 3, lokacija: 'Sarajevo', tip: 'Hybrid',
    datumObjave: '2026-04-10', datumPocetka: '2026-06-01', stipendija: false,
    rokPrijave: '2026-05-30', aktivan: true,
    uslovi: ['Iskustvo sa React i Node.js osnovama', 'Poznavanje REST API koncepta', 'MongoDB ili SQL osnove', 'Sposobnost rada na punom stacku aplikacije'],
    kontakt: { osoba: 'Sara Bjelopavlić', email: 'tim@mistral.ba' },
  },
  {
    id: 7, naziv: 'UI/UX Design Intern', kompanija: 'Bit Alliance',
    logo: 'BA', logoColor: '#7c3aed',
    opis: 'Kreativna praksa za studente zainteresovane za product design. Radićeš na istraživanju korisnika, wireframingu i high-fidelity prototipovima koristeći Figma. Mentorstvo od senior designera na klijentskim projektima.',
    tehnologije: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    trajanje: 2, brojMjesta: 2, lokacija: 'Tuzla', tip: 'Remote',
    datumObjave: '2026-05-08', datumPocetka: '2026-06-01', stipendija: true,
    rokPrijave: '2026-05-28', aktivan: true,
    uslovi: ['Osnove vizualnog dizajna i tipografije', 'Iskustvo s Figmom ili Adobe XD poželjno', 'Portfolio radova je prednost', 'Kreativno i analitičko razmišljanje'],
    kontakt: { osoba: 'Nela Osmanović', email: 'hello@bitalliance.ba' },
  },
  {
    id: 8, naziv: 'Java Backend Developer Intern', kompanija: 'LANACO d.o.o.',
    logo: 'LA', logoColor: '#1a6fd4',
    opis: 'Pridruži se timu koji razvija enterprise aplikacije za bankarski sektor. Naučit ćeš Spring Boot, REST API dizajn i rad sa Oracle bazama podataka u high-availability okruženju sa strogim SLA zahtjevima.',
    tehnologije: ['Java', 'Spring Boot', 'Oracle DB', 'REST API', 'Maven'],
    trajanje: 5, brojMjesta: 1, lokacija: 'Sarajevo', tip: 'Onsite',
    datumObjave: '2026-04-22', datumPocetka: '2026-07-01', stipendija: false,
    rokPrijave: '2026-06-15', aktivan: true,
    uslovi: ['Java osnove (OOP principi)', 'Osnove SQL-a i rada s bazama podataka', 'Spring Boot poznavanje je prednost', 'Interes za enterprise softverski razvoj'],
    kontakt: { osoba: 'Amira Kurtić', email: 'praksa@lanaco.com' },
  },
];

export const SVE_TEHNOLOGIJE = [...new Set(MOCK_PRAKSE.flatMap(p => p.tehnologije))].sort();

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

export function relativeDate(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Danas';
  if (diff === 1) return 'Juče';
  if (diff < 7)  return `Prije ${diff} dana`;
  if (diff < 30) return `Prije ${Math.floor(diff / 7)} sedm.`;
  return formatDate(dateStr);
}

export function trajanjeLabel(mj) {
  if (mj === 1) return '1 mjesec';
  if (mj < 5)   return `${mj} mjeseca`;
  return `${mj} mjeseci`;
}

export function mjestLabel(n) {
  return n === 1 ? '1 mjesto' : `${n} mjesta`;
}

export function deadlineInfo(dateStr) {
  const days = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
  if (days < 0)   return { label: 'Rok je istekao',                              cls: 'expired' };
  if (days === 0) return { label: 'Rok ističe danas!',                            cls: 'urgent'  };
  if (days <= 3)  return { label: `Ističe za ${days} dan${days === 1 ? '' : 'a'}!`, cls: 'urgent'  };
  if (days <= 7)  return { label: `Ističe za ${days} dana`,                       cls: 'soon'    };
  return           { label: `Još ${days} dana`,                                   cls: 'ok'      };
}
