# Grigliata Planner

Un'applicazione web per calcolare quanta carne e alternative comprare per la tua grigliata, basata sul numero e tipo di invitati.

![Grigliata Planner](https://github.com/user-attachments/assets/7b529cd0-1fc5-411f-895e-640e90f14881)

## Caratteristiche

- **Calcolo intelligente**: Calcola automaticamente le quantità necessarie basandosi su:
  - Numero di adulti e bambini onnivori
  - Numero di adulti e bambini vegetariani/vegani
  - Livello di appetito (leggero -20%, normale, alto +20%)
  - Opzione per includere contorni/verdure

- **4 Scenari di calcolo**:
  - **Classico bilanciato**: Distribuzione standard tra tutti i tipi di carne
  - **Chicken-forward**: Riduce carni rosse, aumenta pollo
  - **Budget/Insaccati**: Più salsiccia, meno manzo (opzione economica)
  - **Veg-friendly**: Riduce carni complessive, aumenta tofu e verdure

- **Parametri personalizzabili**: Modifica le grammature base per ogni ingrediente
- **Visualizzazione avanzata**: Tabelle dettagliate con grafici a barre per confrontare gli scenari
- **Funzionalità di export**: Copia lista, esporta CSV, stampa
- **Persistenza dati**: Salva automaticamente le impostazioni in localStorage
- **Scorta opzionale**: Aggiungi 10% di scorta alle quantità calcolate

## Installazione

```bash
# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Avvia il server di produzione
npm start
```

## Esempio di utilizzo

### Scenario esempio: Grigliata per 14 persone
- **8 adulti onnivori**
- **3 bambini onnivori** 
- **2 adulti vegetariani**
- **1 bambino vegetariano**
- **Appetito alto (+20%)**

### Risultati per scenario "Classico bilanciato":
- Manzo: 2.9 kg
- Pollo: 2.5 kg
- Salsiccia: 1.65 kg
- Maiale: 1.25 kg
- Tofu: 0.5 kg
- Verdure grigliate: 0.45 kg
- **Totale: 9.25 kg**

## Grammature base (modificabili)

### Carni (per onnivori)
- **Manzo**: 200g/adulto, 120g/bambino
- **Pollo**: 180g/adulto, 100g/bambino
- **Salsiccia**: 150g/adulto, 80g/bambino
- **Maiale**: 180g/adulto, 100g/bambino

### Alternative (per vegetariani)
- **Tofu**: 150g/adulto, 100g/bambino
- **Verdure grigliate**: 120g/persona (anche onnivori se abilitato)

## Come funziona il calcolo

1. **Calcolo base**: Ogni ingrediente viene calcolato moltiplicando il numero di persone per la grammatura base
2. **Moltiplicatore appetito**: Applica il fattore di correzione (0.8, 1.0, 1.2)
3. **Arrotondamento**: Ogni quantità viene arrotondata al multiplo di 50g più vicino
4. **Scenari**: Ridistribuisce le carni secondo pesi specifici mantenendo il totale proteico simile
5. **Boost vegetariano**: Negli scenari veg-friendly, tofu e verdure vengono incrementati

### Pesi per scenario
- **Classico**: Manzo 35%, Pollo 30%, Salsiccia 20%, Maiale 15%
- **Chicken-forward**: Manzo 15%, Pollo 55%, Salsiccia 20%, Maiale 10%
- **Budget**: Manzo 10%, Pollo 25%, Salsiccia 50%, Maiale 15%
- **Veg-friendly**: Manzo 20%, Pollo 20%, Salsiccia 15%, Maiale 10% + Tofu +30%, Verdure +20%

## Stack tecnologico

- **Next.js 14** con App Router
- **TypeScript** per type safety
- **Mantine UI** per i componenti
- **Tabler Icons** per le icone
- **Client-side only** - nessun database o API
- **localStorage** per la persistenza dati

## Struttura del progetto

```
├── app/
│   ├── layout.tsx          # Layout principale con provider Mantine
│   └── page.tsx            # Pagina principale dell'applicazione
├── lib/
│   ├── calc.ts            # Funzioni di calcolo delle quantità
│   └── storage.ts         # Gestione localStorage
├── components/
│   ├── TotalsTable.tsx    # Tabella risultati
│   ├── ScenarioTabs.tsx   # Tabs scenari con grafici
│   ├── ActionsBar.tsx     # Bottoni azioni (copia, export, etc.)
│   └── NumberField.tsx    # Campo numerico personalizzato
└── README.md
```

## Note importanti

- **Arrotondamenti**: Tutte le quantità sono arrotondate a multipli di 50g per praticità di acquisto
- **Scorta +10%**: Opzione consigliata per evitare di rimanere a corto di cibo
- **Persistenza**: I dati vengono salvati automaticamente nel browser e ripristinati alla riapertura
- **Export**: Le funzioni di export includono solo gli ingredienti con quantità > 0

## Licenza

MIT License