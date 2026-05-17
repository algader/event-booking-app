# Fehler-Dokumentation - Event Booking App

Diese Datei dokumentiert alle Fehler, die während der Entwicklung aufgetreten sind, damit du daraus lernen kannst.

---

## ERROR #1: MongoDB SSL/TLS Internal Error

### Fehler:
```
SSL: CERTIFICATE_VERIFY_FAILED
```

### Ursache:
- Deine aktuelle IP-Adresse war nicht in der MongoDB Atlas Network Access List eingetragen

### Lösung:
1. Gehe zu MongoDB Atlas Dashboard
2. Navigiere zu "Network Access"
3. Füge deine IP-Adresse hinzu (oder verwende 0.0.0.0/0 für alle IPs)
4. Entferne redundante `tls: true` Parameter aus mongoose.connect()

### Lernpunkt:
Stelle sicher, dass Datenbank-Verbindungen korrekt konfiguriert sind, bevor du dich damit auseinandersetzt.

---

## ERROR #2: Module Not Found

### Fehler:
```
Cannot find module '../models/event'
```

### Ursache:
- Die Datei heißt `events.js` (Plural), nicht `event.js`
- Der Import-Pfad war falsch

### Fehlerhafter Code:
```javascript
const Event = require('../models/event');  // ❌ Falsch
```

### Korrekter Code:
```javascript
const Event = require('../models/events');  // ✅ Richtig
```

### Lernpunkt:
- Überprüfe immer die genauen Dateinamen
- Verwende `ls models/` um zu sehen, welche Dateien existieren

---

## ERROR #3: Login Returns null

### Fehler:
```
Query login returns null statt User mit Token
```

### Ursache:
- Ein alter Node-Prozess lief noch auf Port 4000 und servierte alten Code
- Der neue Code mit JWT-Token wurde nicht ausgeführt

### Lösung:
```bash
# Alte Prozesse killen
pkill -f "nodemon index.js"
pkill -f "node index.js"

# Server neu starten
npm start
```

### Lernpunkt:
Stelle sicher, dass nur EINE Instanz des Servers läuft. Prüfe mit:
```bash
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

---

## ERROR #4: EADDRINUSE (Port Already in Use)

### Fehler:
```
Error: listen EADDRINUSE :::4000
```

### Ursache:
- Mehrere Server-Instanzen laufen gleichzeitig
- Ein alter Prozess hat Port 4000 noch nicht freigegeben

### Lösung:
```bash
# Port-Prozess finden
lsof -nP -iTCP:4000 -sTCP:LISTEN

# Prozess killen (z.B. PID 12345)
kill -9 12345

# Oder alle Node-Prozesse killen
pkill -f "node"
pkill -f "nodemon"
```

### Lernpunkt:
Nutze `lsof` um zu sehen, welcher Prozess einen Port blockiert. Das ist wichtig für Debugging!

---

## ERROR #5: createEvent - creator: null

### Fehler:
```
Event erstellt, aber creator ist null
```

### Ursache:
- `.populate('creator')` wurde nicht aufgerufen
- `await` fehlte bei der Populate-Operation

### Fehlerhafter Code:
```javascript
const event = await Event.create({ ...args, creator: context.user._id });
return event;  // ❌ creator ist nicht gefüllt
```

### Korrekter Code:
```javascript
const event = await Event.create({ ...args, creator: context.user._id });
await event.populate('creator');  // ✅ Jetzt populated
return event.toObject();
```

### Lernpunkt:
- Mongoose `.populate()` muss IMMER verwendet werden, um Referenzen zu füllen
- Vergiss nicht `await` vor `.populate()`

---

## ERROR #6: Query events - creator: null for Old Events

### Fehler:
```
GraphQL Error: Cannot return null for non-nullable field Event.creator!
```

### Ursache:
- Schema definierte `creator: User!` (nicht null)
- Alte Events in der Datenbank haben null als creator
- GraphQL konnte null-Wert nicht zurückgeben

### Lösung - Schema ändern:
```javascript
// Vorher:
creator: User!  // ❌ Nicht nullable

// Nachher:
creator: User   // ✅ Nullable für Rückwärtskompatibilität
```

### Lernpunkt:
Denke an Datenbankmigrationen! Wenn du Schema änderst, könnte alte Daten nicht kompatibel sein.

---

## ERROR #7: deleteEvent - Cast to ObjectId Failed

### Fehler:
```
Cast to ObjectId failed for value "" at path "_id"
```

### Ursache:
- Empty String `""` wurde als eventId übergeben
- Mongoose konnte `""` nicht zu ObjectId konvertieren

### Fehlerhafter Code:
```javascript
await Event.findByIdAndDelete(args.eventId);  // ❌ eventId könnte ""sein
```

### Korrekter Code:
```javascript
if (!args.eventId || args.eventId.trim() === '') {
  throw new UserInputError('Event ID is required');
}
await Event.findByIdAndDelete(args.eventId);  // ✅ Validiert
```

### Lernpunkt:
Validiere IMMER die Input-Argumente bevor du sie mit der Datenbank verwendest!

---

## ERROR #8: deleteEvent - Missing Variable

### Fehler:
```
Variable $eventId is required but not provided
```

### Ursache:
- Client sendete eine Mutation ohne $eventId Variable

### Beispiel Mutation:
```graphql
mutation DeleteEvent {
  deleteEvent(eventId: "123")  # ❌ Variable $eventId wurde nicht definiert
}
```

### Korrekter Mutation:
```graphql
mutation DeleteEvent($eventId: ID!) {
  deleteEvent(eventId: $eventId)  # ✅ Variable definiert
}
```

### Lernpunkt:
Verwende Variables in GraphQL Mutations! Das ist Beste Praxis.

---

## ERROR #9: Exit Code 143 During Server Restart

### Fehler:
```
npm start
Exit Code: 143
```

### Ursache:
Exit Code 143 ist NICHT ein Fehler! Es bedeutet das SIGTERM Signal (process termination).
Das ist normal, wenn du `pkill` benutzt um einen Prozess zu stoppen.

### Was passiert:
```bash
pkill -f "node index.js"    # Sendet SIGTERM (Signal 15)
                             # Process beendet sich mit Code 143
```

### Normale Restart-Sequenz:
```bash
# Alte Prozesse killen (code 143 = normal)
pkill -f "nodemon index.js"; pkill -f "node index.js"; sleep 1

# Server starten (sollte jetzt erfolgreich sein)
npm start
```

### Lernpunkt:
Exit Code 143 ist KEIN Fehler - es zeigt nur, dass der Prozess durch SIGTERM beendet wurde.
Das ist völlig normal und erwartet!

---

## ERROR #10: Frontend React Installation

### Fehler:
```
Frontend Ordner war leer nach create-react-app
```

### Ursache:
- `create-react-app .` im leeren Ordner funktioniert manchmal nicht
- npm-Zugriff oder Permissions-Probleme

### Lösung:
```bash
# Manuell installieren statt create-react-app zu verwenden
cd frontend
npm init -y
npm install react react-dom react-scripts web-vitals

# Dann public/ und src/ Ordner mit Dateien erstellen
```

### Lernpunkt:
Wenn `create-react-app` fehlschlägt, kann man React manuell installieren!

---

## ERROR #11: JWT Context Extraction - Missing await

### Fehler:
```
Error: Cannot read property 'id' of undefined
```

### Ursache:
- `User.findById()` ist asynchron aber wurde nicht mit `await` aufgerufen
- Code versuchte auf `user` zuzugreifen bevor die Promise erfüllt war

### Fehlerhafter Code:
```javascript
const user = User.findById(decodedToken.id);  // ❌ Keine await
return { currentUser: user };
```

### Korrekter Code:
```javascript
const user = await User.findById(decodedToken.id);  // ✅ Mit await
return { currentUser: user };
```

### Lernpunkt:
IMMER `await` vor MongoDB-Operationen verwenden (findById, findOne, create, etc.)!

---

## ERROR #12: bookEvent - Duplicate Check Broken

### Fehler:
```
TypeError: array.find is not a function
```

### Ursache:
```javascript
const bookings = await Booking.find(...);  // Das ist ein Array
const duplicate = bookings.find(...);       // Das sollte funktionieren

// Aber wenn Code anders war:
const duplicate = booking.find(...);  // ❌ 'booking' ist ein Object, nicht Array!
```

### Korrekter Code:
```javascript
const existingBooking = await Booking.findOne({
  event: args.eventId,
  user: context.user._id,
});

if (existingBooking) {
  throw new UserInputError('Already booked');
}
```

### Lernpunkt:
- `.find()` mit Query-Objekt gibt EIN Dokument zurück (oder null)
- `.find()` ohne Query gibt Array zurück
- Mongoose Methoden gut lernen!

---

## Häufige Fehlerquellen

### 1. Async/Await vergessen
```javascript
// ❌ Falsch
const data = await Event.find();  // Vergessen auf Promise zu warten
console.log(data);

// ✅ Richtig
const data = await Event.find();
console.log(data);
```

### 2. .populate() vergessen
```javascript
// ❌ Falsch
const events = await Event.find();
// events[0].creator ist noch Object ID, nicht User Objekt

// ✅ Richtig
const events = await Event.find().populate('creator');
// Jetzt ist events[0].creator ein echtes User-Objekt
```

### 3. Mehrere Server-Instanzen
```bash
# ❌ Falsch
npm start &  # Start im Hintergrund
npm run dev  # Starte noch eine Instanz!
# Jetzt laufen 2 Server und kämpfen um Port 4000

# ✅ Richtig
npm start  # Nur EINE Instanz!
```

### 4. Schema vs. Database Mismatch
```javascript
// Wenn du Schema änderst aber alte Daten sind noch da:
// creator: User!  (alt) vs creator: User  (neu)
// = GraphQL Error für alte Documents

// Lösung: Migrationen schreiben oder Schema kompatibel machen!
```

---

## ERROR #13: React - Identifier 'React' has already been declared

### Fehler:
```
SyntaxError: Identifier 'React' has already been declared. (9:7)
```

### Ursache:
- `React` wurde zweimal importiert: einmal oben und dann nochmal unten in der gleichen Datei
- Passiert z.B. wenn man einen Import einfügt, ohne den alten zu löschen

### Fehlerhafter Code:
```javascript
import React from 'react';               // ❌ Zeile 1
import './App.css';
// ... andere Imports ...

import React, { useState } from 'react'; // ❌ Zeile 9 - doppelt!
```

### Korrekter Code:
```javascript
import React from 'react';  // ✅ Nur einmal importieren!
import './App.css';
```

### Lernpunkt:
Immer sicherstellen, dass jedes Paket nur EINMAL importiert wird. Bei VSCode: `Ctrl+F` → nach `import React` suchen und doppelte Zeilen entfernen.

---

## ERROR #14: ReferenceError - Navbar is not defined

### Fehler:
```
ReferenceError: Navbar is not defined
```

### Ursache:
- Eine Komponente (`<Navbar/>`) wurde in JSX verwendet, aber nicht importiert
- Die Datei existiert, aber der `import`-Befehl fehlt oben in der Datei

### Fehlerhafter Code:
```javascript
// App.js - kein Navbar-Import!
function App() {
  return (
    <BrowserRouter>
      <Navbar/>  {/* ❌ Woher soll React wissen, was Navbar ist? */}
    </BrowserRouter>
  );
}
```

### Korrekter Code:
```javascript
import Navbar from './components/Navbar';  // ✅ Import hinzufügen

function App() {
  return (
    <BrowserRouter>
      <Navbar/>  {/* ✅ Jetzt bekannt */}
    </BrowserRouter>
  );
}
```

### Lernpunkt:
Jede React-Komponente muss zuerst importiert werden, bevor sie genutzt werden kann. Wenn du `ReferenceError: X is not defined` siehst, fehlt meistens der `import`-Befehl.

---

## ERROR #15: Bootstrap Collapse funktioniert nicht

### Fehler:
- Hamburger-Button in der Navbar wird geklickt, aber das Menü öffnet sich nicht

### Ursachen (zwei Probleme gleichzeitig!):
1. **Bootstrap JavaScript nicht importiert** – Nur CSS war importiert, das JS für Collapse fehlte
2. **ID-Mismatch** – Button sucht `#navbarNav` aber div hat `id="navbarContent"`

### Fehlerhafter Code:
```javascript
// index.js - kein Bootstrap JS:
import 'bootstrap/dist/css/bootstrap.min.css';
// ❌ bootstrap JS fehlt!

// Navbar.js - ID stimmt nicht überein:
<button data-bs-target="#navbarNav">...</button>          // zeigt auf "navbarNav"
<div className="collapse" id="navbarContent">...</div>    // ❌ heißt "navbarContent"
```

### Korrekter Code:
```javascript
// index.js - Bootstrap JS hinzufügen:
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';  // ✅

// Navbar.js - IDs müssen übereinstimmen:
<button data-bs-target="#navbarNav">...</button>    // zeigt auf "navbarNav"
<div className="collapse" id="navbarNav">...</div>  // ✅ gleiche ID!
```

### Lernpunkt:
- Bootstrap Collapse benötigt **JavaScript** – CSS allein reicht nicht!
- `data-bs-target` und `id` müssen **exakt übereinstimmen** (Tippfehler sind häufig)
- `bootstrap.bundle.min.js` enthält sowohl Bootstrap JS als auch Popper.js

---

## Debugging-Tipps

### 1. Logs nutzen
```javascript
console.log('Wert:', value);  // Einfaches Debugging
console.error('Fehler:', error);  // Für Fehler
```

### 2. Ports überprüfen
```bash
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

### 3. Prozesse überprüfen
```bash
ps -ef | grep node
ps -ef | grep nodemon
```

### 4. MongoDB Verbindung testen
```javascript
mongoose.connection.on('connected', () => console.log('DB connected'));
mongoose.connection.on('error', (err) => console.error('DB error:', err));
```

### 5. GraphQL Playground nutzen
Gehe zu `http://localhost:4000/graphql` und teste Queries direkt!

---

## Checkpoint: Validierungsfragen

Teste dein Wissen:

1. **Was ist Exit Code 143?**
   - [ ] Ein echter Fehler
   - [x] SIGTERM Signal beim Prozess-Ende (normal!)

2. **Wann brauchst du `.populate()`?**
   - [x] Wenn du Referenzen zu anderen Collections ausfüllen willst
   - [ ] Bei jedem MongoDB Query

3. **Was bedeutet EADDRINUSE?**
   - [x] Ein Prozess blockiert bereits den Port
   - [ ] Authentifizierungsfehler

4. **Wie viele Server sollten gleichzeitig laufen?**
   - [ ] 2 (npm start + npm run dev)
   - [x] 1 (entweder npm start ODER npm run dev)

---

---

## ERROR #16: CSS-Styles wirken nicht (margin zu klein)

### Fehler:
- CSS-Klasse `.main-content` ist gesetzt, aber der Abstand ist kaum sichtbar

### Ursache:
- `margin: .7rem .2rem` → `.2rem` seitlich = nur ~3px → kaum sichtbar!
- Sehr kleine `rem`-Werte unter `0.5rem` sind oft unsichtbar

### Fehlerhafter Code:
```css
.main-content {
    margin: .7rem .2rem;  /* ❌ .2rem seitlich = ~3px, unsichtbar! */
}
```

### Korrekter Code:
```css
.main-content {
    margin: 1rem 2rem;  /* ✅ 1rem oben/unten, 2rem links/rechts */
}
```

### Lernpunkt:
- `1rem` = 16px (Standardgröße)
- `.2rem` = ~3px (zu klein um sichtbar zu sein!)
- Typische nützliche Werte: `0.5rem`, `1rem`, `1.5rem`, `2rem`
- Nutze Browser DevTools (F12 → Elements) um CSS live zu testen

---

**Viel Erfolg beim Lernen! 🚀**
