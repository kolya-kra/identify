# Identify

## Stack

- Frontend: ReactJS
- Backend: NodeJS
- Communication: GraphQL - WebSocket based (Subscriptions) -- alternativ: Socket.io
- DB: [MongoDB](https://www.mongodb.com/cloud/atlas)

## Other

- PWA
- ID's mit UUIDv4

## Features

### End-User

- Account-Erstellung
- Login
- Hinterlegung der eigenen Nutzerdaten
- Liste aller Geschäfte mit Live-Auslastung und Suchfunktion (Name, Location, aktueller Standort)
  - **Advanced:** Karte
- QR-Code Scanner
- Automatischer Checkout, wenn Location verlassen wird (alle 15 min polling)
- Checkout Button
- Verlauf der Besuche der letzen 14 Tage
- Profil bearbeiten

### Business-User

- Account-Erstellung
- Login
- Erstellung von Geschäftslocations mit Kapazität (Tische oder Plätze)
  - Kategorisierung der Geschäfte
  - **Advanced:** Kapazitätsbeschränkungen müssen flexibel sein (Inhaber muss auswählen können, ob bspw. es Tische gibt etc.)
- QR-Code-Generierung
- Export fürs Gesundheitsamt: PDF wird generiert
- Muss user entfernen können
- Liste aller Besucher (evtl mit Tischnummer)
  - Zeigt Aufenthaltsdauer an
  - Zeigt Check-In Zeit an
  - Muss die Möglichkeit haben, leute manuell auschecken zu können

### Backend

- Cron-Job zum löschen der veralteten Daten nach 30 Tagen

### Datenmodell

![Datenmodell](https://github.com/kuehnleon/identify/raw/main/docs/datamodel.jpg)
