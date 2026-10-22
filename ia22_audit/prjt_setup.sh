#!/bin/bash

# Nom du projet
PROJECT_NAME="MonProjet"

# Définir les répertoires
FRONTEND_DIR="$PROJECT_NAME/frontend/components"
BACKEND_DIR="$PROJECT_NAME/backend"
DATA_DIR="$PROJECT_NAME/data"

# Fonction pour créer les répertoires
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "Répertoire créé : $1"
    else
        echo "Le répertoire existe déjà : $1"
    fi
}

# Fonction pour créer les fichiers
create_file() {
    if [ ! -f "$1" ]; then
        touch "$1"
        echo "Fichier créé : $1"
    else
        echo "Le fichier existe déjà : $1"
    fi
}

# Créer le répertoire principal du projet
create_dir "$PROJECT_NAME"

# Créer les répertoires et fichiers pour le frontend
create_dir "$FRONTEND_DIR"
create_file "$FRONTEND_DIR/Form.js"
create_file "$FRONTEND_DIR/List.js"
create_file "$FRONTEND_DIR/Dashboard.js"

# Créer les répertoires et fichiers pour le backend
create_dir "$BACKEND_DIR/controllers"
create_dir "$BACKEND_DIR/models"
create_dir "$BACKEND_DIR/utils"
create_file "$BACKEND_DIR/controllers/UserController.js"
create_file "$BACKEND_DIR/models/User.js"
create_file "$BACKEND_DIR/utils/CSVUtils.js"
create_file "$BACKEND_DIR/IAModule.js"

# Créer les fichiers et répertoires pour les fichiers et base de données
create_dir "$DATA_DIR"
create_file "$DATA_DIR/utilisateurs.csv"

# Ajouter un fichier README pour documenter le projet
create_file "$PROJECT_NAME/README.md"
{
  echo "# $PROJECT_NAME"
  echo "## Structure du projet"
  echo "### Frontend"
  echo "- components/Form.js"
  echo "- components/List.js"
  echo "- components/Dashboard.js"
  echo "### Backend"
  echo "- controllers/UserController.js"
  echo "- models/User.js"
  echo "- utils/CSVUtils.js"
  echo "- IAModule.js"
  echo "### Fichiers et Base de Données"
  echo "- data/utilisateurs.csv"
  echo "- (Option) Base de données MySQL"
} > "$PROJECT_NAME/README.md"

echo "La structure de répertoires et fichiers pour le projet $PROJECT_NAME a été créée avec succès."
