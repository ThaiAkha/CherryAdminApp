# Thai Akha Kitchen - Admin System 🍲

Questo è il sistema di gestione integrato per **Thai Akha Kitchen**. La piattaforma coordina le prenotazioni delle classi di cucina, la logistica dei trasporti, la gestione del magazzino e le operazioni di acquisto al mercato.

## 🚀 Architettura Operativa

Il sistema è suddiviso in moduli funzionali basati sui ruoli utente, garantendo che ogni dipartimento abbia gli strumenti necessari per l'operatività quotidiana.

### 🍱 Modulo Kitchen & Booking
Gestione centralizzata delle classi di cucina.
- **Booking Overview**: Monitoraggio live dei partecipanti e selezioni menu.
- **Dietary Tracking**: Gestione avanzata di allergie e profili dietetici (Vegan, Halal, Gluten-Free).
- **Prep Lists**: Generazione automatica delle liste di preparazione basate sulle selezioni dei guest.

### 🚚 Modulo Logistics & Driver
Coordinamento dei trasporti e dei pickup presso gli hotel.
- **Manager Logistics**: Pannello di controllo per assegnare i guest ai driver e definire l'ordine dei pickup.
- **Live Board**: Visualizzazione in tempo reale dello stato dei percorsi.
- **Driver Portal**: Interfaccia ottimizzata per i driver con dettagli sui pickup e note dei clienti.

### 🛒 Modulo Market (Market Planner)
Ottimizzazione del processo di acquisto giornaliero.
- **Market Shop**: Pianificazione degli acquisti basata sulle scorte attuali e il numero di partecipanti previsti.
- **Market Runner**: App operativa per gli acquisti fisici al mercato con aggiornamento prezzi e scorte in tempo reale.

### 🛍️ Modulo Store & POS
Gestione delle vendite on-site durante le classi.
- **Manager POS**: Punto vendita per merchandising, bibite e ingredienti.
- **Inventory Management**: Controllo centralizzato dello stock con alert per giacenze basse.

### 🏢 Modulo Agency
Portale dedicato ai partner e alle agenzie di viaggio.
- **Agency Dashboard**: Prenotazioni self-service e reportistica sulle commissioni.

---

## 🛠️ Tech Stack & Core Features

- **Frontend**: Vite + React 19 + TypeScript.
- **Styling**: Tailwind CSS v4 (Design System personalizzato).
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Smart Caching**: Implementazione del pattern *Stale-While-Revalidate* tramite `contentService` per caricamenti istantanei.
- **Dynamic Metadata**: Titoli, icone e badge delle pagine gestiti dinamicamente tramite la tabella `site_metadata`.

## 📦 Sviluppo

1.  **Installazione**: `npm install`
2.  **Sviluppo Locale**: `npm run dev`
3.  **Build Produzione**: `npm run build`

## 🚀 Deployment
Il sistema viene distribuito automaticamente su **Google Cloud Run** tramite GitHub Actions.
- **Ambiente**: Produzione
- **CI/CD**: GitHub Actions (Workload Identity Federation)
- **Container**: Docker + Nginx

---
*Developed for Thai Akha Kitchen - Chiang Mai, Thailand.*
