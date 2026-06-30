# Organised

Application mobile de productivité étudiante construite avec React Native (Expo SDK 54), ciblant iPad et iPhone.

Projet personnel développé pour ma rentrée en L3 MIASHS à La Réunion.

---

## Ce que j'ai appris

### React Native & Expo

- Structure d'un projet Expo avec **Expo Router** (file-based routing, layouts, groupes `(auth)` / `(tabs)`)
- Composants adaptés au thème (`ThemedText`, `ThemedInput`, `ThemedIcon`, `ThemedTouchable`) en suivant le pattern du template Expo
- Gestion du **safe area**, des insets et de l'adaptation iPad / iPhone avec `useWindowDimensions`
- Animations avec `Animated` de React Native (slide, opacity, séquences)
- Scroll synchronisé entre plusieurs `ScrollView` via refs et verrous
- Navigation infinie entre semaines avec `FlatList` horizontal + `pagingEnabled`
- `forwardRef` + `useImperativeHandle` pour exposer des méthodes de composants enfants

### Supabase

- Authentification (email/password, session persistante avec `AsyncStorage`)
- **Row Level Security** pour isoler les données par utilisateur
- Triggers SQL pour mettre à jour automatiquement les soldes bancaires
- Fonctions RPC atomiques pour garantir l'intégrité des transactions financières
- Schéma relationnel : `events`, `tasks`, `subtasks`, `bank_accounts`, `transactions`

### State Management

- **Zustand** pour l'état global (auth, settings, toasts)
- **TanStack Query** pour le cache des données serveur (fetch, mutations, invalidation)
- Séparation claire entre état local (UI) et état serveur (React Query)

### Parsing iCal

- Fetch et parsing manuel d'un flux iCal ADE (emploi du temps universitaire)
- Extraction des champs `SUMMARY`, `LOCATION`, `DESCRIPTION`, `DTSTART`, `DTEND`
- Détection automatique du type de cours (CM / TD / CTE) et du nom du professeur depuis la description
- Gestion du folding iCal (lignes continues)

### Calendrier custom

- Vue **mensuelle** avec grille de jours, dots d'événements, sélection dashed
- Vue **hebdomadaire** avec grille horaire, positionnement absolu des events par durée réelle
- Affichage des **jours fériés** (La Réunion) et weekends différenciés visuellement
- Synchronisation du scroll vertical entre pages de la FlatList

### Fonctionnalités

- **Planning** : calendrier mensuel et hebdomadaire, events personnels + iCal ADE (L2/L3), toggle par source, long press pour créer un event
- **Tâches** : CRUD complet, sous-tâches, timer de session avec progression SVG circulaire, date d'échéance
- **Finances** : suivi compte principal + argent de poche, transactions (dépense / revenu / virement), catégories
- **Dashboard** : previews miniatures des 4 modules en temps réel
- **Notifications** : rappels automatiques 1h, 30min et 15min avant chaque cours iCal et tâches

### Build & Distribution

- **GitHub Actions** sur runner `macos-latest` pour compiler un `.ipa` non signé
- Distribution via **Sideloadly** sur Windows pour installer sur iPad (sideload AltStore)
- Variables d'environnement Supabase injectées via GitHub Secrets

---

## Stack

| Outil                | Usage                  |
| -------------------- | ---------------------- |
| Expo SDK 54          | Framework React Native |
| Expo Router 6        | Navigation file-based  |
| Supabase             | Auth + base de données |
| Zustand              | État global            |
| TanStack Query       | Cache serveur          |
| @gorhom/bottom-sheet | Modals                 |
| dayjs                | Manipulation de dates  |
| react-native-svg     | Timer circulaire       |
| expo-notifications   | Rappels de cours       |

---

## Structure

```
app/
├── (auth)/          # Login, Register
└── (tabs)/          # Dashboard, Planning, Tasks, Finance
components/
├── themed-*         # Design system
├── calendar/        # MonthView, WeekView, modals
├── tasks/           # TaskModal, TaskTimer
├── finance/         # TransactionModal
└── dashboard/       # Previews miniatures
src/
├── features/        # Hooks data (useEvents, useTasks, useFinance, useICalEvents)
├── stores/          # settingsStore, toastStore
└── types/           # Types TypeScript
```
