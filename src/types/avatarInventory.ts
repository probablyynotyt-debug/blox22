export interface CustomClothingItem {
  id: string;
  name: string;
  type: 'shirt' | 'pants';
  dataUrl: string;
  previewUrl?: string;
  createdAt: number;
  creatorId?: string;
  creatorUsername?: string;
  isCreator?: boolean;
}

export const SHIRTS_INVENTORY_KEY = 'boblox_custom_shirts_v2';
export const PANTS_INVENTORY_KEY = 'boblox_custom_pants_v2';

export function isFirebaseStorageOrDeletedUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.includes('firebasestorage.googleapis.com') ||
    url.includes('firebasestorage.app') ||
    url.includes('storage.googleapis.com') ||
    url.startsWith('/clothing/') ||
    url.startsWith('\\clothing\\') ||
    url.startsWith('clothing/')
  );
}

export function getSavedShirtsInventory(): CustomClothingItem[] {
  try {
    const raw = localStorage.getItem(SHIRTS_INVENTORY_KEY);
    if (raw) {
      const list: CustomClothingItem[] = JSON.parse(raw);
      // Clean out any old items uploaded via firebase storage or local clothing folder
      const filtered = list.filter(
        (item) => !isFirebaseStorageOrDeletedUrl(item.dataUrl) && !isFirebaseStorageOrDeletedUrl(item.previewUrl)
      );
      if (filtered.length !== list.length) {
        localStorage.setItem(SHIRTS_INVENTORY_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
  } catch (e) {
    console.error('Failed to load shirts inventory:', e);
  }
  return [];
}

export function saveShirtToInventory(item: CustomClothingItem) {
  try {
    const current = getSavedShirtsInventory();
    const updated = [item, ...current.filter((i) => i.id !== item.id)];
    localStorage.setItem(SHIRTS_INVENTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save shirt to inventory:', e);
    return [];
  }
}

export function saveMultipleShirtsToInventory(items: CustomClothingItem[]) {
  if (!items || items.length === 0) return getSavedShirtsInventory();
  try {
    const current = getSavedShirtsInventory();
    const newIds = new Set(items.map((i) => i.id));
    const updated = [...items, ...current.filter((i) => !newIds.has(i.id))];
    localStorage.setItem(SHIRTS_INVENTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to batch save shirts:', e);
    return getSavedShirtsInventory();
  }
}

export function getSavedPantsInventory(): CustomClothingItem[] {
  try {
    const raw = localStorage.getItem(PANTS_INVENTORY_KEY);
    if (raw) {
      const list: CustomClothingItem[] = JSON.parse(raw);
      const filtered = list.filter(
        (item) => !isFirebaseStorageOrDeletedUrl(item.dataUrl) && !isFirebaseStorageOrDeletedUrl(item.previewUrl)
      );
      if (filtered.length !== list.length) {
        localStorage.setItem(PANTS_INVENTORY_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
  } catch (e) {
    console.error('Failed to load pants inventory:', e);
  }
  return [];
}

export function savePantsToInventory(item: CustomClothingItem) {
  try {
    const current = getSavedPantsInventory();
    const updated = [item, ...current.filter((i) => i.id !== item.id)];
    localStorage.setItem(PANTS_INVENTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save pants to inventory:', e);
    return [];
  }
}

export function saveMultiplePantsToInventory(items: CustomClothingItem[]) {
  if (!items || items.length === 0) return getSavedPantsInventory();
  try {
    const current = getSavedPantsInventory();
    const newIds = new Set(items.map((i) => i.id));
    const updated = [...items, ...current.filter((i) => !newIds.has(i.id))];
    localStorage.setItem(PANTS_INVENTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to batch save pants:', e);
    return getSavedPantsInventory();
  }
}
