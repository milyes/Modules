#!/bin/bash

# Mettre à jour et installer les dépendances nécessaires
pkg update && pkg upgrade -y
pkg install -y openjdk-8-jdk wget unzip git

# Définir les variables d'environnement pour le SDK Android
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools/bin:$ANDROID_SDK_ROOT/platform-tools

# Créer le répertoire SDK si non existant
mkdir -p $ANDROID_SDK_ROOT

# Télécharger les outils du SDK Android
wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip -O $HOME/cmdline-tools.zip
unzip -q $HOME/cmdline-tools.zip -d $ANDROID_SDK_ROOT
mv $ANDROID_SDK_ROOT/cmdline-tools $ANDROID_SDK_ROOT/tools

# Accepter les licences
yes | sdkmanager --licenses

# Installer les outils nécessaires
sdkmanager "platform-tools" "emulator" "system-images;android-29;google_apis;x86"

# Créer un AVD pour Android TV
echo no | avdmanager create avd -n android_tv_avd -k "system-images;android-29;google_apis;x86" --device tv_720p

# Démarrer l'émulateur avec l'AVD créé
emulator -avd android_tv_avd -no-snapshot &

# Attendre que l'émulateur démarre complètement
adb wait-for-device

# Cloner le dépôt GitHub
git clone https://github.com/milyes/milyes.git
cd milyes

echo "La machine virtuelle Android TV est prête et le dépôt GitHub est cloné!"
~ $
