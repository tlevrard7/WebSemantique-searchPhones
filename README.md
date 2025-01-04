# PhonarQL: Recherche et Comparaison de Smartphones

## Description

PhonarQL est une application web permettant d’explorer et de comparer les caractéristiques des smartphones en interrogeant DBpedia via des requêtes SPARQL. L’application offre :
- **Une interface intuitive de recherche** pour trouver des smartphones ou des marques.
- **Des pages détaillées** pour explorer les spécifications d’un smartphone ou d’une marque.
- **Une fonctionnalité de tableau comparatif** pour évaluer plusieurs smartphones côte à côte.

---

## Structure des Fichiers

### Organisation du Répertoire

```
├── Demarche_Attributs/
│   ├── WS.py                        # Script Python pour extraire des informations depuis DBpedia
│   ├── attrributs.txt               # Liste des attributs retenus pour l’application
│   └── smartphone_comparison_full.csv # Résultat de l’extraction des données DBpedia
├── Pages/
│   ├── detail/
│   │   ├── Brand/
│   │   │   ├── detail.html          # Page de détail des marques
│   │   │   └── detail.js            # Script pour afficher les détails des marques
│   │   ├── Generique/
│   │   │   ├── detail.html          # Page générique pour les entités non spécialisées
│   │   │   └── detail.js            # Script pour gérer les entités génériques
│   │   ├── Tel/
│   │   │   ├── detail.html          # Page de détail des smartphones
│   │   │   └── detail.js            # Script pour afficher les détails des smartphones
│   │   └── detail.css               # Feuille de style pour toutes les pages de détail
│   ├── index/
│   │   ├── index.css                # Feuille de style de la page d’accueil
│   │   ├── index.html               # Page d’accueil avec barre de recherche et tableau comparatif
│   │   └── index.js                 # Script pour gérer la recherche et la comparaison
│   └── utils.js                     # Fonctions utilitaires communes
├── README.md                        # Ce fichier
├── architecture_application.drawio.svg # Schéma de l’architecture de l’application
└── architecture_application.png     # Schéma exporté en image
```
---

## Lancement de l’Application

### Prérequis
- Un navigateur web moderne (Chrome, Firefox, Edge, etc.).

### Étapes pour Lancer l’Application
1. **Extraire le Code Source**  
   Téléchargez et décompressez le fichier ZIP fourni.

2. **Ouvrir l’Application**  
   - Naviguez dans le répertoire `Pages/index/`.
   - Double-cliquez sur le fichier `index.html` pour l’ouvrir dans votre navigateur.

---

## Démarche d’Extraction des Attributs

Le dossier `Demarche_Attributs/` contient :
- **WS.py** : Script Python permettant d’extraire toutes les informations disponibles sur une liste de smartphones depuis DBpedia.
- **attrributs.txt** : Liste des attributs pertinents retenus pour l’application après analyse.
- **smartphone_comparison_full.csv** : Résultat de l’extraction des données, utilisé pour définir les attributs de l’application.

---

## Schéma de l’Architecture

Le fichier `architecture_application.png` illustre l’architecture générale de l’application, détaillant les interactions entre les composants.

---

## Auteurs

Projet réalisé par : **LEVRARD, LARRAZ MARTIN, MARTIN, JEANNE, ELGHISSASSI**  
Date : **2024**  
Tout droit réservé.