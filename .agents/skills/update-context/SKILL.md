---
name: update-context
description: >
  Met à jour un fichier source dans llm-workbench, commite, puis re-sync
  CLAUDE.md et AGENTS.md dans le projet courant.
argument-hint: "[description de la modification de contexte]"
compatibility: "claude-code;opencode"
disable-model-invocation: true
disallowed-tools: Agent
---

# Update context

Utilise ce skill quand l'utilisateur veut mettre à jour CLAUDE.md / AGENTS.md
dans le projet courant.

## Mission

Modifier le fichier source approprié dans `~/.llm-workbench/`, commiter le
changement dans le workbench, puis lancer `llm sync` depuis le projet courant
pour régénérer CLAUDE.md et AGENTS.md.

Ne jamais éditer CLAUDE.md ou AGENTS.md directement — ce sont des fichiers
générés.

## Étapes

### 1. Localiser le projet courant

Lire `.llm-workbench/project.json` dans le répertoire courant pour obtenir le
nom du projet et le profil actif. Si absent, bloquer avec
`BLOCKED: pas de project.json trouvé — lance d'abord llm init --profile <nom>`.

### 2. Identifier le fichier source à modifier

En fonction de la nature du changement :

| Nature du changement | Fichier source |
|---|---|
| Spécifique au projet (commandes, architecture, flux de données, assets) | `~/.llm-workbench/projects/<projet>/context/project-guidance.md` |
| Convention de commit / git | `~/.llm-workbench/contexts/policies/git/commit-instructions.md` |
| Tests / stratégie de test | `~/.llm-workbench/contexts/testing/vitest-playwright.md` |
| Plateforme FoundryVTT | `~/.llm-workbench/contexts/platforms/foundry-vtt/v14-implementation.md` |
| Workflow planning | `~/.llm-workbench/contexts/workflows/planning.md` |
| Politique issues | `~/.llm-workbench/contexts/policies/issues-fr.md` |

Si ambigu, demander à l'utilisateur.

### 3. Lire le fichier source

Lire le fichier identifié avant toute modification.

### 4. Appliquer la modification

Modifier uniquement ce qui est demandé. Ne pas restructurer, ne pas reformater,
ne pas élargir la portée.

### 5. Commiter dans llm-workbench

Depuis `~/.llm-workbench/` :
```
git add <fichier modifié>
git commit -m "context(<projet>): <description courte de la modification>"
```

### 6. Lancer llm sync

Depuis le répertoire du projet courant :
```
llm sync
```

### 7. Vérifier le résultat

Confirmer que CLAUDE.md contient le changement attendu en cherchant un
extrait de la modification.

### 8. Réponse finale

Retourner uniquement :
```
Mis à jour: <fichier source dans llm-workbench>
Sync: OK — CLAUDE.md et AGENTS.md régénérés
```

Ou `BLOCKED: <raison>` si une étape échoue.

## Règles absolues

1. Ne jamais éditer CLAUDE.md ou AGENTS.md directement.
2. Ne jamais modifier le profil yaml (`.llm-workbench/profiles/`) sauf si
   l'utilisateur demande explicitement d'ajouter/retirer un contexte ou skill.
3. Ne pas modifier les fichiers sources partagés (sous `contexts/`) si le
   changement est spécifique à un projet — l'écrire dans `project-guidance.md`.
4. Ne pas créer de nouveaux fichiers contexte sans confirmation de l'utilisateur.
5. Ne pas lancer `llm sync` sans avoir commité d'abord dans llm-workbench.
