const database = 'osbatt.slides.v1';
const collection = 'pages';
export type SlideAsset = { id: string; image: Blob; thumbnail: Blob };
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(collection, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Slide storage is unavailable.'));
    request.onblocked = () => reject(new Error('Close other OSBATT tabs and try again.'));
  });
}
export async function saveAssets(assets: SlideAsset[]): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(collection, 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error('Could not save slides. Browser storage may be full.'));
      transaction.onabort = () =>
        reject(new Error('Slide import was not saved. Browser storage may be full.'));
      for (const asset of assets) transaction.objectStore(collection).put(asset);
    });
  } finally {
    db.close();
  }
}
export async function getAsset(id: string): Promise<SlideAsset | undefined> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(collection).objectStore(collection).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Could not load this slide.'));
    });
  } finally {
    db.close();
  }
}
