#!/bin/bash
echo "[$(date)] Lancement du scraping" >> /var/log/cron_scraper.log

# Aller dans le bon dossier
cd /root/manjaco/backend || exit 1

# Créer le dossier logs s'il n'existe pas
mkdir -p logs

# Exécuter la commande et logguer la sortie
/usr/bin/node ace db:seed --files "database/seeders/scrap_manga_seeder" >> logs/scraper.log 2>&1

echo "[$(date)] Fin du scraping" >> /var/log/cron_scraper.log
