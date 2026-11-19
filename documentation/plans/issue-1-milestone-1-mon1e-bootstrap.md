# Plan d'implémentation — Milestone 1 : Mon1e Bootstrap (0.0.1)
**Issue** : https://github.com/behaska/foundryvtt-mon1e/issues/1
**ADR** : aucun (pas de répertoire ADR configuré)
**Modules probablement impactés** : `system.json` (nouveau), `src/main.mjs` (nouveau), `package.json`, `tsconfig.json` (nouveau), `tests/` (nouveau), `docs/README.md` et `docs/DEVELOPMENT.md` (nouveaux), `.gitignore`, `index.js` (à retirer)

Source de cadrage : `documentation/cadrage/bootstrap/bootstraping-initial-project.md`, phases **P0, P1, P2 uniquement**.

## 1. Objectif
Livrer le jalon 0.0.1 : Foundry v14.370 reconnaît le système `mon1e`, un monde de test se crée et démarre sans erreur bloquante, Git est opérationnel et des commandes de vérification simples (`typecheck`, `test`, `check`) existent. Aucun moteur de règles.

## 2. Périmètre
### Inclus
- **P0** : environnement local vérifié (Foundry 14.370, Node.js, Git, VS Code, dossier User Data identifié).
- **P1** : manifeste `system.json`, point d'entrée `src/main.mjs`, `docs/README.md`, emplacement du dépôt visible par Foundry, monde de test démarré.
- **P2** : JSDoc + `checkJs` via `tsconfig.json`, scripts npm `typecheck` / `test` / `check`, un premier test `node:test`, `docs/DEVELOPMENT.md`.

### Hors périmètre
- P3 à P6 : modèles de données, `TypeDataModel`, fiches `ActorSheetV2`, mécaniques, packaging/distribution.
- Types Actor/Item, `RULES.md`, `DECISIONS.md`, `templates/`, `styles/`, `lang/`, dossiers `models|rules|sheets|foundry` vides.
- CI/CD, GitHub Actions, bibliothèque de types Foundry communautaire, bundler ou framework.

## 3. État existant
- Dépôt Git déjà initialisé (un commit initial) : l'étape `git init` du brief est faite.
- `package.json` minimal (`version` 1.0.0, script `test` factice qui échoue, aucune dépendance), `index.js` factice (`console.log`).
- Ni `system.json`, ni `src/`, ni `tests/`, ni `tsconfig.json`.
- Le dépôt est dans `~/Workspace/Perso/FoundryVTT/foundryvtt-mon1e`, pas dans `<User Data>/Data/systems/`.
- `.claude/skills` contient des skills de workflow, sans rapport avec le code produit.

## 4. Décisions d'architecture
- Game System natif, ES Modules `.mjs`, JSDoc + `checkJs`, aucun build ni bundler (brief §1).
- Identifiant `mon1e`, type `system`, compatibilité minimum et vérifiée = 14, version 0.0.1, `esmodules` = `src/main.mjs` (brief §4).
- `typescript` en devDependency uniquement pour `checkJs` ; aucun fichier `.ts`, aucune sortie générée.
- Le test initial porte sur une fonction pure sans dépendance Foundry (le périmètre `checkJs` commence par la logique pure, brief §5).
- **Décidé** : le dépôt et son répertoire restent nommés `foundryvtt-mon1e`. Foundry exige un dossier du système nommé comme l'id (`mon1e`) : le lien `<User Data>/Data/systems/mon1e` → dépôt est créé **manuellement par le mainteneur** (les chemins locaux ne sont pas fiables pour un agent). Le plan ne crée ni ne déplace rien à ce sujet.

## 5. Plan de travail
1. **P0 — Vérifier l'environnement** : confirmer Foundry 14.370, versions de Node.js et Git, VS Code ; noter le chemin User Data. Étape manuelle, résultat consigné dans `docs/DEVELOPMENT.md`.
2. **P1 — Manifeste** : créer `system.json` avec les champs du brief (`id`, `type`, `title`, `description`, `version`, `compatibility`, `esmodules`).
3. **P1 — Point d'entrée** : créer `src/main.mjs` qui journalise un message de diagnostic dans le hook `init`, rien d'autre.
4. **P1 — Rendre le système visible** : étape **manuelle (mainteneur)** : lien `<User Data>/Data/systems/mon1e` → dépôt. L'implémentation s'arrête là et attend la confirmation que le lien existe avant l'étape 6.
5. **P1 — Nettoyage et docs** : supprimer `index.js` factice, aligner `package.json` (version 0.0.1, `main` ou retrait), créer `docs/README.md`, vérifier `.gitignore`.
6. **P1 — Vérification dans Foundry** : Mon1e apparaît dans la liste des systèmes, création et démarrage d'un monde de test, message de diagnostic visible, console sans erreur bloquante.
7. **P2 — Typage** : ajouter `typescript` en devDependency, créer `tsconfig.json` (`allowJs`, `checkJs`, `noEmit`) limité d'abord à `src/` pur et `tests/`.
8. **P2 — Tests** : ajouter un test `node:test` minimal et une fonction pure associée, dans `tests/`.
9. **P2 — Scripts** : définir `typecheck`, `test` (`node --test`) et `check` (enchaîne les deux) ; supprimer le script `test` factice.
10. **P2 — Documentation** : rédiger `docs/DEVELOPMENT.md` (commandes, conventions, couverture réelle de `checkJs`, et rappel que le lien vers `systems/mon1e` est créé à la main) ; première action de commit après validation.
11. **Clôture** : cocher les critères du jalon dans l'issue #1 (hors de ce plan), vérifier l'état Git.

## 6. Fichiers probablement modifiés
- Créés : `system.json`, `src/main.mjs`, `tsconfig.json`, `tests/*.test.mjs`, `docs/README.md`, `docs/DEVELOPMENT.md`, éventuellement un module pur sous `src/`.
- Modifiés : `package.json`, `package-lock.json` (généré), `.gitignore` (`node_modules/`).
- Supprimé : `index.js`.
- À ne pas éditer à la main : `.claude/`, `.agents/`, `CLAUDE.md`, `AGENTS.md` (générés par `llm sync`). Décidé : ils sont **versionnés** dans le dépôt ; ne pas les ajouter à `.gitignore`.

## 7. Tests attendus
- `npm test` : le test `node:test` passe.
- `npm run typecheck` : zéro erreur sur le périmètre configuré.
- `npm run check` : enchaîne les deux et retourne 0.
- Validation manuelle dans Foundry : système listé, monde créé et lancé, message `init` présent, aucune erreur bloquante en console. Le résultat est consigné (réussi / échoué / non exécuté).

## 8. Risques et mitigations
- Nom de dossier ≠ `id` : Foundry ne détecte pas le système → lien nommé `mon1e` créé par le mainteneur ; ne pas le supposer présent, demander confirmation.
- `checkJs` donne un faux sentiment de sécurité sur les API Foundry → indiquer clairement le périmètre couvert dans `DEVELOPMENT.md`.
- Dérive de périmètre vers P3+ (modèles, fiches) → hors périmètre explicite, aucun dossier vide.
- Fichiers générés (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.agents/`) versionnés (décision du mainteneur, contraire au guide du workbench) → risque de diff parasites : relancer `llm sync` et committer les fichiers générés séparément du code du jalon.
- Version Foundry : valider la compatibilité réellement testée sur 14.370, pas seulement déclarée.

## 9. Critères d'arrêt
- Foundry 14.370 non disponible ou non lançable : arrêter après P0 et signaler.
- Le système n'apparaît pas dans Foundry après correction du chemin et de l'id : arrêter avant P2 et diagnostiquer.
- Toute demande de modèle de données, de fiche ou de règle Mon : hors périmètre, arrêter et remonter.
- Lien `systems/mon1e` non confirmé par le mainteneur : ne pas exécuter l'étape 6 (vérification dans Foundry) et ne rien créer dans `<User Data>`.
