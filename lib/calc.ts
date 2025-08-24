export type ItemKey = 'manzo' | 'pollo' | 'salsiccia' | 'maiale' | 'tofu' | 'verdure';

export type Appetite = 'light' | 'normal' | 'high';

export type ScenarioKey = 'classico' | 'chicken' | 'budget' | 'veg';

export interface GuestInput {
  adults: number;
  children: number;
  vegAdults: number;
  vegChildren: number;
  appetite: Appetite;
  includeSides: boolean;
}

export interface ItemParams {
  baseAdult: number;
  baseChild: number;
  enabled: boolean;
}

export interface ItemTotal {
  grams: number;
  kg: number;
}

export type BaseTotals = Record<ItemKey, ItemTotal>;
export type ScenarioTotals = Record<ItemKey, ItemTotal>;

const APPETITE_MULTIPLIERS: Record<Appetite, number> = {
  light: 0.8,
  normal: 1.0,
  high: 1.2,
};

const DEFAULT_PARAMS: Record<ItemKey, ItemParams> = {
  manzo: { baseAdult: 200, baseChild: 120, enabled: true },
  pollo: { baseAdult: 180, baseChild: 100, enabled: true },
  salsiccia: { baseAdult: 150, baseChild: 80, enabled: true },
  maiale: { baseAdult: 180, baseChild: 100, enabled: true },
  tofu: { baseAdult: 150, baseChild: 100, enabled: true },
  verdure: { baseAdult: 120, baseChild: 120, enabled: true },
};

const MEAT_WEIGHTS: Record<ScenarioKey, Record<ItemKey, number>> = {
  classico: {
    manzo: 0.35,
    pollo: 0.30,
    salsiccia: 0.20,
    maiale: 0.15,
    tofu: 1.0,
    verdure: 1.0,
  },
  chicken: {
    manzo: 0.15,
    pollo: 0.55,
    salsiccia: 0.20,
    maiale: 0.10,
    tofu: 1.0,
    verdure: 1.0,
  },
  budget: {
    manzo: 0.10,
    pollo: 0.25,
    salsiccia: 0.50,
    maiale: 0.15,
    tofu: 1.0,
    verdure: 1.0,
  },
  veg: {
    manzo: 0.20,
    pollo: 0.20,
    salsiccia: 0.15,
    maiale: 0.10,
    tofu: 1.3, // +30% boost
    verdure: 1.2, // +20% boost
  },
};

export function round50(n: number): number {
  return Math.round(n / 50) * 50;
}

export function toKg(grams: number): number {
  return Math.round((grams / 1000) * 100) / 100;
}

export function getDefaultParams(): Record<ItemKey, ItemParams> {
  return JSON.parse(JSON.stringify(DEFAULT_PARAMS));
}

export function calcBaseTotals(
  input: GuestInput,
  params: Record<ItemKey, ItemParams> = DEFAULT_PARAMS
): BaseTotals {
  const { adults, children, vegAdults, vegChildren, appetite, includeSides } = input;
  const multiplier = APPETITE_MULTIPLIERS[appetite];
  
  const meatItems: ItemKey[] = ['manzo', 'pollo', 'salsiccia', 'maiale'];
  const vegItems: ItemKey[] = ['tofu', 'verdure'];
  
  const totals: BaseTotals = {
    manzo: { grams: 0, kg: 0 },
    pollo: { grams: 0, kg: 0 },
    salsiccia: { grams: 0, kg: 0 },
    maiale: { grams: 0, kg: 0 },
    tofu: { grams: 0, kg: 0 },
    verdure: { grams: 0, kg: 0 },
  };

  // Calculate meat for omnivores
  meatItems.forEach((item) => {
    if (!params[item].enabled) return;
    
    const grams = (
      adults * params[item].baseAdult + 
      children * params[item].baseChild
    ) * multiplier;
    
    totals[item].grams = round50(grams);
    totals[item].kg = toKg(totals[item].grams);
  });

  // Calculate alternatives for vegetarians
  vegItems.forEach((item) => {
    if (!params[item].enabled) return;
    
    let grams = (
      vegAdults * params[item].baseAdult + 
      vegChildren * params[item].baseChild
    ) * multiplier;
    
    // For verdure, add omnivores if includeSides is true
    if (item === 'verdure' && includeSides) {
      grams += (
        adults * params[item].baseAdult + 
        children * params[item].baseChild
      ) * multiplier;
    }
    
    totals[item].grams = round50(grams);
    totals[item].kg = toKg(totals[item].grams);
  });

  return totals;
}

export function applyScenario(
  baseTotals: BaseTotals, 
  scenarioKey: ScenarioKey
): ScenarioTotals {
  const weights = MEAT_WEIGHTS[scenarioKey];
  const meatItems: ItemKey[] = ['manzo', 'pollo', 'salsiccia', 'maiale'];
  
  // Calculate total base meat weight
  const totalBaseMeat = meatItems.reduce(
    (sum, item) => sum + baseTotals[item].grams, 
    0
  );
  
  const result: ScenarioTotals = {
    manzo: { grams: 0, kg: 0 },
    pollo: { grams: 0, kg: 0 },
    salsiccia: { grams: 0, kg: 0 },
    maiale: { grams: 0, kg: 0 },
    tofu: { grams: 0, kg: 0 },
    verdure: { grams: 0, kg: 0 },
  };
  
  // Redistribute meat according to scenario weights
  meatItems.forEach((item) => {
    const grams = round50(totalBaseMeat * weights[item]);
    result[item].grams = grams;
    result[item].kg = toKg(grams);
  });
  
  // Apply boosts to veg items
  ['tofu', 'verdure'].forEach((item) => {
    const vegItem = item as ItemKey;
    const grams = round50(baseTotals[vegItem].grams * weights[vegItem]);
    result[vegItem].grams = grams;
    result[vegItem].kg = toKg(grams);
  });
  
  return result;
}

export function getTotalKg(totals: BaseTotals | ScenarioTotals): number {
  return Object.values(totals).reduce((sum, item) => sum + item.kg, 0);
}

export function getItemNames(): Record<ItemKey, string> {
  return {
    manzo: 'Manzo',
    pollo: 'Pollo',
    salsiccia: 'Salsiccia',
    maiale: 'Maiale',
    tofu: 'Tofu',
    verdure: 'Verdure grigliate',
  };
}

export function getScenarioNames(): Record<ScenarioKey, string> {
  return {
    classico: 'Classico bilanciato',
    chicken: 'Chicken-forward',
    budget: 'Budget/Insaccati',
    veg: 'Veg-friendly',
  };
}