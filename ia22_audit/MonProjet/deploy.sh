#!/bin/bash

# Définir les variables
APP_NAME="milyes_app"
APP_DIR="/var/www/html/$APP_NAME"
REPO_URL="https://github.com/milyes/milyes.github.io.git"

# Fonction pour afficher l'utilisation
usage() {
    echo "Usage: $0 [option]"
    echo "Options:"
    echo "  -i, --install    Installer l'application"
    echo "  -u, --update     Mettre à jour l'application"
    echo "  -h, --help       Afficher cette aide"
}

# Fonction pour vérifier les erreurs
check_error() {
    if [ $? -ne 0 ]; then
        echo "Erreur: $1"
        exit 1
    fi
}

# Fonction pour installer l'application
install_app() {
    echo "Installation de l'application..."

    # Créer le répertoire si nécessaire
    sudo mkdir -p $APP_DIR
    check_error "Échec de la création du répertoire $APP_DIR"

    # Cloner le repo
    git clone $REPO_URL $APP_DIR
    check_error "Échec du clonage du dépôt"

    # Configurer les permissions
    sudo chown -R www-data:www-data $APP_DIR
    sudo chmod -R 755 $APP_DIR

    echo "Installation terminée avec succès."
}

# Fonction pour mettre à jour l'application
update_app() {
    echo "Mise à jour de l'application..."

    # Naviguer vers le répertoire de l'application
    cd $APP_DIR
    check_error "Le répertoire $APP_DIR n'existe pas"

    # Tirer les dernières modifications
    git pull origin master
    check_error "Échec de la mise à jour du dépôt"

    echo "Mise à jour terminée avec succès."
}

# Vérifier les arguments
if [ $# -eq 0 ]; alors
    usage
    exit 1
fi

case $1 in
    -i|--install)
    install_app
    ;;
    -u|--update)
    update_app
    ;;
    -h|--help)
    usage
    ;;
    *)
    echo "Option invalide: $1"
    usage
    exit 1
    ;;
esac
