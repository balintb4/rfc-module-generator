# Basis-Image für Node.js
FROM node:18-alpine 

WORKDIR /app

# Package.json & Abhängigkeiten installieren
COPY package*.json package-lock.json ./
RUN npm install

# Den Rest des Codes kopieren
COPY . .

# Port freigeben (falls dein Backend auf 3000 läuft)
EXPOSE 3000

# Start-Befehl (wird automatisch `npx tsc` vorher ausführen)
CMD ["npm", "start"]
