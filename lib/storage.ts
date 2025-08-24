const STORAGE_KEY = 'grigliata-planner';

export interface StorageData {
  guestInput?: {
    adults: number;
    children: number;
    vegAdults: number;
    vegChildren: number;
    appetite: 'light' | 'normal' | 'high';
    includeSides: boolean;
  };
  params?: Record<string, {
    baseAdult: number;
    baseChild: number;
    enabled: boolean;
  }>;
  includeBuffer?: boolean;
}

export function saveToStorage(data: Partial<StorageData>): void {
  try {
    const existing = loadFromStorage();
    const updated = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

export function loadFromStorage(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return {};
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}