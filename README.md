# Konteeksamen i TDS200 Kryssplattform (H2025)

> **Periode:** mandag 23. februar kl. 10:00 til kl. 10:00 torsdag 26. februar 2026 (72 timer, kontinuasjon for høsteksamen 2025)  
> **Eksamensform:** Individuell hjemmeeksamen  
> **Karakter:** A

## Teknologi & Rammeverk
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-000020.svg?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NativeWind](https://img.shields.io/badge/nativewind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## Om prosjektet
Dette er min individuelle kontebesvarelse i faget **TDS200 Kryssplattform** ved Høyskolen Kristiania.
Målet var å levere en mer komplett og robust løsning med tydeligere struktur, bedre flyt og mer gjennomarbeidet UI/UX.

Appen (**RehabTrace**) lar brukeren registrere skadeobservasjoner over tid og følge utvikling via indikatorer som smerte, hevelse, bevegelighet og temperatur.

## Sentrale funksjoner
- Innlogging og registrering med e-post/passord.
- Google Sign-In (Expo Auth Session + Firebase Auth).
- Router guard for å beskytte innloggede sider.
- Registrering av skadeoppføring med:
  - skadelokasjon
  - smertegrad
  - hevelse
  - mobilitetsbegrensning
  - temperatur
  - bildeopplasting (kamera/galleri)
  - fritekstbeskrivelse
- Automatisk statusberegning basert på forrige registrering for samme skadelokasjon.
- Oversiktsside med:
  - sortering (nyeste/eldste)
  - filtrering på skadelokasjon (remote/Firestore)
  - fritekstsøk i resultatene (lokalt)
- Detaljside med bildeslider, statusforklaring og egne notater/kommentarer.
- Mulighet for å slette både oppføringer og notater med bekreftelse.
- Sentralisert toast-system for konsistente tilbakemeldinger i UI.

---

## Søk og filtrering (AND-logikk)
- Filtrering på skadelokasjon henter først et begrenset datasett fra Firestore.
- Fritekstsøk kjøres deretter lokalt på dette datasettet. Det betyr at kombinasjonen fungerer som **AND**: søkeresultatet begrenses til valgt skadelokasjon når filter er aktivt.

---

## Teknisk oppsett
- **Frontend:** Expo Router + React Native + NativeWind
- **Backend-tjenester:** Firebase Authentication, Firestore og Firebase Storage
- **Datamodell:** brukere, skadeoppføringer og notater lagres per innlogget bruker
- **Arkitektur:** API-lag (`src/api`), modeller (`src/models`), auth-provider (`src/providers`), skjermruting (`src/app`) og gjenbrukbare komponenter (`src/components`)

---

## Kjøring av prosjektet

### 1) Installer avhengigheter
```bash
npm install
```
### 2) Sett opp miljøfiler
```bash
cp example.env .env
cp firebaseEnv.template.js firebaseEnv.js
```

Fyll deretter inn egne nøkler:
- .env
  - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  - EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
- firebaseEnv.js
  - Firebase web config (apiKey, authDomain, projectId, osv.)

### 3) Start appen
```bash
npm run web
# eller
npm run ios
# eller
npm run android
```

## Sensors begrunnelse
> The project demonstrated certain complete work. The report is good. Implementation is clean and with many extra functions, Good UI design. Therefore A is granted.

Selv om begrunnelsen var kort, peker den direkte på fire hovedpunkter i leveransen: helhetlig gjennomføring, god rapport, ren implementasjon med ekstra funksjonalitet og godt UI-design.

---

## Viktig merknad
Prosjektet er laget som eksamensbesvarelse i kryssplattform-utvikling.
Appen er et teknisk hjelpemiddel for registrering og oppfølging, og erstatter ikke medisinsk vurdering.

---

## Demo

https://github.com/user-attachments/assets/4bf8514f-0c2c-4559-a725-1aca9158da11


