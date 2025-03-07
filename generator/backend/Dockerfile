# Basis-Image für Node.js
FROM node:18-alpine  

# Arbeitsverzeichnis setzen
WORKDIR /app  

# Package.json & package-lock.json kopieren
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Den restlichen Code kopieren
COPY . .

# TypeScript für das Backend & `public/` kompilieren
RUN npm run prestart

# Port freigeben (falls dein Backend auf 3000 läuft)
EXPOSE 3000  

# Start-Befehl mit npm start
CMD ["npm", "start"]
