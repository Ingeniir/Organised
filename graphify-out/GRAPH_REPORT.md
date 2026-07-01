# Graph Report - Organised  (2026-07-01)

## Corpus Check
- 75 files · ~28,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 390 nodes · 691 edges · 25 communities (22 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7d461368`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `ThemedText()` - 22 edges
2. `useAuthStore` - 22 edges
3. `expo` - 16 edges
4. `ThemedIcon()` - 11 edges
5. `useEvents()` - 10 edges
6. `supabase` - 9 edges
7. `ThemedTouchable()` - 8 edges
8. `scripts` - 8 edges
9. `useBankAccounts()` - 8 edges
10. `useSettingsStore` - 8 edges

## Surprising Connections (you probably didn't know these)
- `DashboardScreen()` --calls--> `useAuthStore`  [EXTRACTED]
  app/(tabs)/index.tsx → src/features/auth/authStore.ts
- `TabLayout()` --calls--> `useColorScheme()`  [INFERRED]
  app/(tabs)/_layout.tsx → hooks/use-color-scheme.web.ts
- `TransactionBadge()` --calls--> `useToastStore`  [EXTRACTED]
  app/(tabs)/finance.tsx → src/stores/toastStore.ts
- `PlanningScreen()` --calls--> `useCalendarStore`  [EXTRACTED]
  app/(tabs)/planning.tsx → src/stores/calendarStore.ts
- `PlanningScreen()` --calls--> `useToastStore`  [EXTRACTED]
  app/(tabs)/planning.tsx → src/stores/toastStore.ts

## Import Cycles
- None detected.

## Communities (25 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (55): AuthState, useAuthStore, EventDetailModal, Props, styles, TYPE_COLORS, COLORS, EventModal (+47 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (32): EvilIconsName, IoniconsName, ThemedIcon(), ThemedIconProps, styles, ThemedTouchable(), ThemedTouchableProps, Props (+24 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (38): dependencies, dayjs, expo, expo-constants, expo-device, expo-font, expo-haptics, expo-image (+30 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (34): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, edgeToEdgeEnabled, predictiveBackGestureEnabled, projectId (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (20): FinancePreview(), Props, styles, CATEGORIES, styles, TransactionModal, TransactionType, TYPE_LABELS (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (13): RootLayout(), HapticTab(), Colors, Fonts, useColorScheme(), useThemeColor(), CalendarState, useCalendarStore (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (12): styles, styles, styles, ThemedBottomSheetInput(), ThemedBottomSheetInputProps, styles, ThemedInput(), ThemedInputProps (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (14): styles, ToastContainer(), VARIANT_STYLES, queryClient, cancelICalNotifications(), cancelTaskNotifications(), requestNotificationPermission(), scheduleICalNotifications() (+6 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-expo, @types/react, typescript, main, name, private (+9 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (6): extractProf(), parseICal(), unfoldLines(), fetchICal(), ICalEvent, Prof

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (11): Build & Distribution, Calendrier custom, Ce que j'ai appris, Fonctionnalités, Organised, Parsing iCal, React Native & Expo, Stack (+3 more)

### Community 11 - "Community 11"
Cohesion: 0.20
Nodes (7): Palette, DashboardScreen(), EventItem, Section, SECTIONS, styles, TYPE_COLORS

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (6): compilerOptions, paths, strict, extends, include, @/*

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (5): build, development, distribution, ios, resourceClass

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (4): enabledPlugins, expo@claude-plugins-official, hooks, PreToolUse

### Community 16 - "Community 16"
Cohesion: 0.40
Nodes (4): editor.codeActionsOnSave, source.fixAll, source.organizeImports, source.sortMembers

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): enabledMcpjsonServers, permissions, allow

## Knowledge Gaps
- **177 isolated node(s):** `expo@claude-plugins-official`, `PreToolUse`, `allow`, `enabledMcpjsonServers`, `PreToolUse` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThemedText()` connect `Community 0` to `Community 1`, `Community 4`, `Community 6`, `Community 7`, `Community 11`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `useAuthStore` connect `Community 0` to `Community 1`, `Community 4`, `Community 5`, `Community 7`, `Community 11`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 8`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `expo@claude-plugins-official`, `PreToolUse`, `allow` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05411392405063291 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09745293466223699 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._