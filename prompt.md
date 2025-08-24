Sei un senior developer Next.js. Genera un progetto Next.js 14 (App Router) **senza database** che calcola “quanta e quale carne (e alternative) comprare” per una grigliata, in base al numero e al tipo di persone. Non servono assegnazioni per persona: mostra solo i totali per articolo. Offri anche 3–5 **opzioni automatiche** (mix alternativi) tra cui scegliere.

STACK
- Next.js 14, TypeScript, App Router.
- UI: Mantine + Tabler Icons. Tema chiaro.
- Stato: solo client-side (React). Persistenza opzionale in `localStorage`.
- Tooling: ESLint + Prettier. Nessuna API/DB. Build che parte con `pnpm dev`.

REQUISITI FUNZIONALI
1) **Input invitati**
   - Adulti onnivori, Bambini onnivori, Adulti vegetariani/vegani, Bambini vegetariani/vegani.
   - Appetito medio: leggero (-20%), normale (0%), alto (+20%).
   - Interruttore “includi contorni/verdure”.
2) **Parametri porzioni (modificabili)**
   - Carni: Manzo, Pollo, Salsiccia, Maiale.
   - Alternative: Tofu, Verdure grigliate.
   - Grammature base (default suggeriti):
     - Manzo: 200 g/adulto, 120 g/bambino
     - Pollo: 180 g/adulto, 100 g/bambino
     - Salsiccia: 150 g/adulto, 80 g/bambino
     - Maiale: 180 g/adulto, 100 g/bambino
     - Tofu: 150 g/adulto veg, 100 g/bambino veg
     - Verdure grigliate: 120 g/persona
   - Regole:
     - Ospiti veg: escludono carni, includono tofu/verdure.
     - Appetito applica moltiplicatore globale (+/-20%).
     - Arrotonda ogni voce al multiplo di **50 g**; mostra anche in **kg**.
3) **Calcolo base**
   - Calcola fabbisogno totale (g/kg) per ogni item considerando:
     - conteggi invitati
     - appetito
     - vegetariani/vegani
   - Mostra tabella “Quantità da comprare”: Item | g totali | kg totali.
4) **Opzioni automatiche (mix)**
   - Genera 4 scenari (selezionabili con tabs o pill buttons):
     - **Classico bilanciato**: distribuzione standard tra Manzo/Pollo/Salsiccia/Maiale + alternative per veg.
     - **Light/Chicken-forward**: riduce carni rosse, aumenta Pollo.
     - **Budget/Insaccati**: più Salsiccia, meno Manzo; mantiene copertura proteica.
     - **Veg-friendly**: aumenta Tofu/Verdure, riduce carni complessive.
   - Ogni scenario:
     - Mantiene lo **stesso totale proteico stimato** (entro ±5%) del calcolo base.
     - Applica pesi diversi alle categorie (es. manzo 35%→20% nel chicken-forward).
     - Ricalcola grammi per item e arrotonda a 50 g.
   - UI mostra confronto rapido tra scenari: card con totali per item e **barre** che evidenziano differenze rispetto al “Classico”.
   - Pulsanti: “Copia lista”, “Esporta CSV”, “Stampa”.
5) **Persistenza**
   - Salva automaticamente in `localStorage` ultimi input e parametri porzioni. Pulsante “Reimposta”.
6) **Accessibilità/UX**
   - Label chiari, validazioni minime (numeri ≥ 0), unità sempre esplicite (g/kg).
   - Mostra un **totale kg complessivo** e un suggerimento “aggiungi 10% di scorta” (toggle).

STRUTTURA PAGINE/COMPONENTI
- `app/page.tsx` → pagina unica con:
  - Sezione “Invitati” (form).
  - Sezione “Parametri porzioni” (accordion/collapsible).
  - Pulsante “Calcola”.
  - Tabs “Scenari: Classico | Chicken-forward | Budget | Veg-friendly”.
  - `TotalsTable` (tabella risultati dello scenario attivo).
  - `ActionsBar` (Copia / CSV / Stampa / Reimposta).
- `lib/calc.ts` → funzioni pure di calcolo.
- `lib/storage.ts` → wrapper `localStorage` con chiave namespace.
- `components/` → `NumberField`, `TotalsTable`, `ScenarioTabs`.

LOGICA DI CALCOLO (SPECIFICA)
- Input: {
adults: number, children: number,
vegAdults: number, vegChildren: number,
appetite: ‘light’|‘normal’|‘high’,
params: {
items: Record<ItemKey, { baseAdult: number; baseChild: number; enabled: boolean }>
}
- Passi:
1) Calcola fabbisogno **onnivori** per carni e verdure (verdure opzionale).
2) Calcola fabbisogno **veg** per tofu e verdure.
3) Applica moltiplicatore appetito: light=0.8, normal=1.0, high=1.2.
4) Somma per item → arrotonda a 50 g → aggiungi derivati in kg (2 decimali).
- Scenari:
- Definisci vettori di **pesi** per le carni (somma = 1 tra sole carni):
  - Classico: {Manzo .35, Pollo .30, Salsiccia .20, Maiale .15}
  - Chicken-forward: {Manzo .15, Pollo .55, Salsiccia .20, Maiale .10}
  - Budget: {Manzo .10, Pollo .25, Salsiccia .50, Maiale .15}
  - Veg-friendly: {Manzo .20, Pollo .20, Salsiccia .15, Maiale .10} + **Tofu +30%** e **Verdure +20%** rispetto al base veg
- Calcolo scenari:
  - Ricava il totale **carni_base** (somma carni per onnivori dopo appetito).
  - Ridistribuisci **carni_base** secondo i pesi dello scenario (rispettando item disabilitati).
  - Applica eventuali boost per tofu/verdure nello scenario.
  - Arrotonda a 50 g per item.
- Output: `Record<ItemKey, { grams: number; kg: number }>` per scenario attivo.

COMPONENTI CHIAVE (INTERFACCIA)
- `TotalsTable`: tabella con righe per item, colonne: Item | Grammi | Kg. Se item = 0 g, riga in grigio chiaro.
- `ScenarioTabs`: tabs con 4 opzioni; ciascuna mostra `TotalsTable` + mini grafico a barre (Mantine `Progress` multiplo) per evidenziare variazioni % vs Classico.
- `ActionsBar`: bottoni “Copia lista” (testo semplice, es. “Manzo: 3.2 kg” per riga), “Esporta CSV”, “Stampa”.

TEST
- Unit test per:
- calcolo base adulti/bambini/veg con appetito.
- ridistribuzione per scenari e arrotondamenti.
- Snapshot test su `TotalsTable` con casi tipici (es. 10 adulti, 4 bambini, 2 vegA, 1 vegB).

README
- Istruzioni `pnpm install`, `pnpm dev`.
- Spiega le grammature e come modificarle.
- Esempio completo: 8 adulti, 3 bambini, 2 vegA, 1 vegB, appetito “alto”.
- Note su arrotondamenti e scorta +10%.

CODICE DA FORNIRE SUBITO (SNIPPET GUIDA)
- Crea questi file con implementazioni minime funzionanti:

`lib/calc.ts`
- `round50(n: number): number`
- `toKg(g: number): number`
- `calcBaseTotals(input): BaseTotals`
- `applyScenario(baseTotals, scenarioKey): ScenarioTotals`

`app/page.tsx`
- Form controllato con Mantine.
- Stato salvato in `localStorage`.
- Tabs scenari che chiamano `applyScenario`.
- `TotalsTable` che riceve `ScenarioTotals`.

VINCOLI
- Nessun accesso a rete, nessun DB o server action.
- Tutto funziona client-side e parte senza errori.
- UI in italiano, testi concisi e chiari.
