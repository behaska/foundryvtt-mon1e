# **Workflow de démarrage — Mon1e for Foundry VTT**

Stack validée

Foundry VTT v14.370 • 19 novembre 2026

## **1. La stratégie retenue**

Je recommande de démarrer **Mon1e comme un Game System Foundry natif, sans framework supplémentaire, sans compilation obligatoire et sans générateur complexe**.

L'objectif est d'obtenir rapidement un système qui démarre, puis de construire Mon1e par petites fonctionnalités entièrement vérifiées.

## **Nos choix techniques de départ**

| **Système**             | Mon1e for Foundry VTT          |
| ----------------------- | ------------------------------ |
| **Identifiant proposé** | `mon1e`                        |
| **Foundry cible**       | v14.370 Stable                 |
| **Langage**             | JavaScript ES Modules (`.mjs`) |
| **Typage**              | JSDoc + `checkJs`              |
| **Modèles de données**  | `TypeDataModel`                |
| **Interfaces**          | `ApplicationV2` + Handlebars   |
| **Tests unitaires**     | Node.js `node:test`            |
| **Versioning**          | Git                            |
| **Build initial**       | Aucun                          |

La version Foundry 14.370 est la dernière stable publiée à la date de vérification, le 2 novembre 2026.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Foundry Virtual Tabletop+1

**Le principe directeur : ne créer que les composants nécessaires à la prochaine fonctionnalité.**

Aucun React, Vite, Docker, ORM, framework d'injection de dépendances ou outil de bundling à ce stade. Nous les introduirons uniquement lorsqu'un besoin concret le justifiera.

## **2. Notre parcours de développement**

1. **P0 — Préparer l'environnement**

   Installer Foundry v14 stable, Node.js, Git et VS Code. Identifier le répertoire de données Foundry.
2. **P1 — Créer le Game System Mon1e**

   Initialiser le dépôt et le manifeste `system.json`. Vérifier que Foundry reconnaît le système et peut créer un monde.
3. **P2 — Mettre en place le socle qualité**

   Configurer les ES Modules, JSDoc, `checkJs`, les premiers tests et les commandes de vérification.
4. **P3 — Définir les données minimales**

   À partir des règles confirmées de Mon, sélectionner les premiers types `Actor` et éventuellement `Item`, puis construire leurs `TypeDataModel`.
5. **P4 — Développer une première fiche**

   Utiliser `ActorSheetV2` et Handlebars. Vérifier la création, l'édition, l'enregistrement et le rechargement des données.
6. **P5 — Implémenter une première mécanique**

   Développer une règle confirmée sous forme de fonction testable, puis l'intégrer à la fiche et, si nécessaire, au système de jets et au chat.
7. **P6 — Stabiliser et livrer la v0**

   Exécuter les contrôles, vérifier les permissions, empaqueter le système et tester son installation dans un environnement propre.

Chaque phase possède son propre critère de sortie. **On ne passe à la suivante que lorsque la précédente fonctionne réellement.**

## **3. P0 — Préparer l'environnement local**

Je recommande de développer directement contre une **installation locale et dédiée de Foundry**, avec un monde de test que l'on peut recréer sans risque.

## **Outils à installer**

[Foundry Vtt Icon & Logo | Dashboard Icons & Logos](https://images.openai.com/static-rsc-4/LjZzZwNXvNnNKq5xYUJhUATijZspxzFkarhANFviX1-3bK-CfPnz0GuS5SDsK2psqB95jhKCPHkfow1ESmZO7FazXw58qnd7f-Me5Xb-FYPXe0vlmKyoikLzhbfCsBnxVuW6PNZiZnIuR3hKcNyIsM9K3SlvPuVWVKNjJw9j4ec?purpose=inline)

**Foundry Virtual Tabletop v14.370**

Application locale, version stable. Une installation séparée des mondes utilisés en jeu évite les régressions sur les données réelles.

[Version 14.370](https://foundryvtt.com/releases/14.370?utm_source=chatgpt.com)

[File:Visual Studio Code 1.35 icon.svg - Wikimedia Commons](https://images.openai.com/static-rsc-4/bwltRsn8xFpdSRcYQ3DdHauINNG_Ll8uEuWak3gU_Cd8IQKU8JMwJXvDy7WOSMXzw_LreGtysSFaVMfFopIshhFxhhA7optqpzdDNA41Fr3DZ8RT6oELKwe8M8zFoIi4_H68G4UOg124XH5x4eObz-mHD-E9xY_6m_hLlZ275hc?purpose=inline)

**Visual Studio Code**

Éditeur, débogage, diagnostics JavaScript/JSDoc et extensions de qualité.

[Site officiel](https://code.visualstudio.com/?utm_source=chatgpt.com)

[GitHub - wilsonzlin/minify-html: Extremely fast and smart HTML + JS + CSS minifier, available for Rust, Deno, Java, Node.js, Python, Ruby, and WASM](https://images.openai.com/static-rsc-4/geNfgoAxk30UqxSXdWtDIHmYfLLqvGU16nKVXMNNx3HDVvROQxaB4zjbAvtbjqBg7YdmDLjM1Cr7xfyxhQZzKcVnaPFWdSIT0dKIvf4cJDdri6mVEA3HEUFf8s3A1kNoPelFoIpXfrmwUSxUoVTM1YBj2JVWW0D022nHTWcbY0o?purpose=inline)

**Node.js + npm**

Pour exécuter les tests, scripts et vérifications statiques. Il ne sert pas à compiler obligatoirement le système.

[Télécharger Node.js](https://nodejs.org/?utm_source=chatgpt.com)

[Code Yellow Software](https://images.openai.com/static-rsc-4/AcXiSoCUlMsiC5tbnBYxhvYNizaL2lqCgEZgMsy61wLWAJVcFl6nl-h-Rq_jGyCAi50fBuZMjCbTjnfWk1HDHraj0WY6nLTgPufy8T05jLC4qNBuPTqzwvVu55URKsO30O-SOf-8vmXOjyCblXhOwa8lS0UVp9eEOCfn6dJuSxk?purpose=inline)

**Git**

Historique, retour arrière, branches courtes et identification des versions validées.

[Installer Git](https://git-scm.com/?utm_source=chatgpt.com)

Foundry v14 impose au minimum Node.js 24 pour un serveur auto-hébergé ; l'application de bureau dispose de son propre environnement d'exécution.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Foundry Virtual Tabletop



### **Où installer le projet ?**

Foundry recherche les systèmes dans :

`<User Data>/Data/systems/`

Pour démarrer au plus simple, je créerais directement le dépôt Git sous :

`<User Data>/Data/systems/mon1e/`

Cela permet de modifier les fichiers sans copie, packaging ni synchronisation intermédiaire. C'est également une approche recommandée dans la documentation officielle.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Foundry Virtual Tabletop



## **4. P1 — Obtenir le premier Mon1e installable**

**Objectif :** voir Mon1e dans la liste des systèmes Foundry et réussir à créer et ouvrir un monde qui l'utilise.

La structure initiale peut rester extrêmement réduite :

```
mon1e/
├── system.json
├── package.json
├── src/
│   └── main.mjs
├── docs/
│   └── README.md
└── .gitignore
```

À ce stade, inutile de créer des modèles, des fiches, des moteurs de jets ou des dizaines de dossiers vides.

### **Manifeste minimal**

Voici un exemple de configuration technique, non encore intégré à un dépôt :

```
{
  "id": "mon1e",
  "type": "system",
  "title": "Mon1e for Foundry VTT",
  "description": "Game System pour Mon, de Fringe Worlds.",
  "version": "0.0.1",
  "compatibility": {
    "minimum": 14,
    "verified": 14
  },
  "esmodules": [
    "src/main.mjs"
  ]
}
```

Les champs `id`, `type`, `title`, `version`, `compatibility` et `esmodules` correspondent au manifeste officiel de Foundry v14.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Version 14



Le fichier `src/main.mjs` pourra simplement enregistrer un message de diagnostic lors du hook `init`, qui est documenté pour l'enregistrement des composants du système.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Foundry Virtual Tabletop



**Critère de réussite P1 :** le système apparaît dans Foundry, un monde peut être créé et démarré, le point d'entrée est chargé et aucune erreur bloquante n'apparaît dans la console.

À ce stade, ce n'est pas encore une version jouable. C'est uniquement notre preuve que le socle fonctionne.

## **5. P2 — Installer la qualité minimale**

Nous ajoutons ensuite les contrôles statiques et les tests, sans imposer de transpilation.

Commandes de démarrage, dans le dépôt :

```
npm init -y
npm install --save-dev typescript
git init
```

Le paquet `typescript` sert ici uniquement à `checkJs`. Nous n'écrivons aucun fichier `.ts` et ne générons pas de JavaScript compilé.

Je configurerais ces commandes :

| Commande            | Fonction                                           |
| ------------------- | -------------------------------------------------- |
| `npm run typecheck` | Exécute `tsc --noEmit` avec `allowJs` et `checkJs` |
| `npm test`          | Lance les tests unitaires Node.js                  |
| `npm run check`     | Regroupe les vérifications techniques              |

Un fichier `tsconfig.json` permettra de paramétrer ces contrôles. Nous commencerons par vérifier les fonctions métier pures, puis étendrons le périmètre au code Foundry lorsque les déclarations d'API nécessaires auront été examinées.

Je n'introduirais pas immédiatement de bibliothèque de types communautaire obligatoire. Elle pourrait produire du travail supplémentaire simplement pour satisfaire le compilateur. Le niveau réel de couverture de `checkJs` devra être indiqué clairement.

**Critère de réussite P2 :** des commandes simples, reproductibles et documentées permettent de vérifier le code. Aucun faux sentiment de sécurité : les API Foundry non couvertes restent à contrôler dans Foundry.

## **6. P3 à P5 — Construire Mon1e par tranches verticales**

C'est ici que je recommande une méthode stricte : **chaque fonctionnalité doit traverser les données, les règles, l'intégration Foundry, l'interface et les tests**, mais uniquement dans la mesure où ces éléments sont nécessaires.

### **P3 — Le premier modèle de données**

Avant d'écrire les modèles, il faut inventorier les documents de règles réellement disponibles et identifier les données nécessaires à la première fonctionnalité.

Je ne choisirais pas encore les caractéristiques, ressources, types d'Actor ou types d'Item tant que les règles correspondantes n'ont pas été confirmées.

Ensuite, nous utiliserons les `TypeDataModel` natifs et `CONFIG.Actor.dataModels` ou `CONFIG.Item.dataModels`, selon les types retenus. Ces mécanismes sont documentés par Foundry.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Foundry Virtual Tabletop



### **P4 — La première fiche**

Une fois le modèle défini, nous implémenterons une fiche via `ActorSheetV2` et `HandlebarsApplicationMixin`, enregistrée avec `DocumentSheetConfig.registerSheet`.

Ces classes et cette méthode d'enregistrement sont officiellement documentées pour Foundry v14.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Version 14



Le premier scénario de validation doit prouver que les données peuvent être modifiées, sauvegardées, puis retrouvées après fermeture et réouverture du monde.

### **P5 — La première fonctionnalité jouable**

Le choix de la mécanique appartient au créateur de Mon. Elle doit être confirmée dans les documents de règles.

### **Une tranche verticale type**

On livre une fonctionnalité vérifiable, et pas cinq composants génériques sans comportement complet.

Je recommande de garder le moteur de règles indépendant de Foundry lorsque les opérations sont purement métier. Les tests unitaires seront ainsi simples et rapides. L'intégration Foundry sera ensuite testée dans le véritable runtime.

## **7. L'arborescence cible, à construire progressivement**

```
mon1e/
│
├── system.json
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
│
├── src/
│   ├── main.mjs
│   │
│   ├── models/          # Modèles de données
│   ├── rules/           # Moteur de règles Mon
│   ├── sheets/          # Fiches V2
│   └── foundry/         # Intégration Foundry
│
├── templates/           # Handlebars
├── styles/              # CSS
├── lang/                # Traductions
│
├── tests/               # Tests unitaires
│
└── docs/
    ├── RULES.md
    ├── DECISIONS.md
    └── DEVELOPMENT.md
```

Cette arborescence est une **cible indicative**, pas une obligation de créer tous ces dossiers dès P1.

Je recommande particulièrement trois documents courts : `RULES.md` pour distinguer règles confirmées et inconnues, `DECISIONS.md` pour les arbitrages techniques et fonctionnels, et `DEVELOPMENT.md` pour les commandes et conventions réellement utilisées.

Si `MON_DEVELOPMENT_GUIDELINES.md` est disponible dans le dépôt réel, il prendra naturellement la place du référentiel de développement proposé ici.

## **8. Le workflow quotidien de développement**

Pour chaque nouvelle fonctionnalité de Mon1e, nous suivrons le même cycle.

01

**Spécifier**

Règle confirmée, comportement attendu, cas limites

02

**Analyser**

Code existant, API v14, impacts et permissions

03

**Implémenter**

Changements ciblés, aucun ajout superflu

04

**Contrôler**

checkJs, tests et exécution Foundry

05

**Valider**

Conformité aux règles par le créateur

06

**Versionner**

Commit Git et documentation ajustée

Une fonctionnalité ne sera considérée comme terminée que si son comportement est vérifié, ses données persistent correctement et son résultat respecte la règle validée.

### **Utiliser ChatGPT efficacement dans ce workflow**

Pour éviter les modifications incontrôlées, je recommande de confier à l'assistant une fonctionnalité à la fois, avec accès aux fichiers réels du dépôt.

Voici une consigne réutilisable :

**Projet :** Mon1e — Game System Foundry VTT v14.

**Objectif :** [décrire la fonctionnalité à réaliser].

Avant de modifier le code :

1. Examiner le dépôt et les conventions existantes.
2. Identifier les règles confirmées et les inconnues.
3. Vérifier les API Foundry v14 concernées dans la documentation officielle.
4. Proposer l'implémentation minimale.

Implémenter uniquement le périmètre demandé, en JavaScript ES Modules avec JSDoc et `checkJs`, en privilégiant les API natives et les fonctionnalités existantes.

Fournir les tests adaptés, exécuter les contrôles possibles et préciser leurs résultats.

**Livraison attendue :** fichiers modifiés, choix techniques, tests réussis/échoués/non exécutés, limites et points nécessitant mon arbitrage.

Ne jamais inventer ou modifier silencieusement une règle de Mon.

## **9. P6 — Préparer la première distribution**

Je ne mettrais pas en place une CI/CD complexe immédiatement.

Pour la première v0, un contrôle local suivi d'une archive ZIP testée suffit. Foundry permet l'installation manuelle d'un Game System ; une installation automatisée via une URL de manifeste pourra être ajoutée ensuite.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://foundryvtt.com\&sz=32)

Foundry Virtual Tabletop



Lorsque cette première distribution fonctionnera, nous pourrons mettre en place GitHub Actions pour exécuter les tests, construire l'archive et publier les versions.

La compatibilité Foundry sera toujours testée, et non simplement déclarée dans `system.json`.

## **10. Checklist de démarrage**

Cette checklist constitue le tableau de bord du premier jalon. Rien n'est encore marqué comme réalisé.

## **Avancement Mon1e v0**

0/14

**Environnement**

Foundry 14.370 installé

Node.js, Git et VS Code disponibles

Dossier User Data identifié

**Projet**

Dépôt Git mon1e initialisé

system.json valide

Point d'entrée ES Modules chargé

Monde de test Mon1e démarré

**Qualité**

JSDoc et checkJs configurés

Première commande de test opérationnelle

Conventions de développement documentées

**Fonctionnel**

Première règle confirmée identifiée

Premier modèle de données validé

Première fiche utilisable

Première mécanique vérifiée dans Foundry

## **Ma recommandation pour lancer le projet**

Je propose de formaliser deux jalons successifs :

**Jalon 1 — Mon1e Bootstrap (**`0.0.1`**)** : système reconnu par Foundry, monde démarrable, Git et contrôles de base opérationnels. Aucun moteur de règles nécessaire.

**Jalon 2 — Mon1e v0 fonctionnelle** : premier modèle réel, fiche persistante et première mécanique confirmée, avec tests associés.

C'est la voie que je privilégierais : une fondation technique très petite, vérifiée immédiatement, puis du développement orienté fonctionnalités.

Le premier travail concret est donc **P0 + P1 : créer&#x20;**`mon1e`**, préparer&#x20;**`system.json`**, ouvrir un monde Foundry et vérifier le chargement**. Tout le reste peut attendre ce premier résultat.

Références techniques : [Foundry — System Development](https://foundryvtt.com/article/system-development/?utm_source=chatgpt.com) ; [System Data Models](https://foundryvtt.com/article/system-data-models/?utm_source=chatgpt.com) ; [Document Sheets v14](https://foundryvtt.com/api/v14/modules/foundry.applications.sheets.html?utm_source=chatgpt.com) ; [API v14.370](https://foundryvtt.com/api/v14/?utm_source=chatgpt.com).