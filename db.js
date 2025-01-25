// db.js

export const dbPromise = (function initializeDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SimpleWebComponentsDB', 1);

        request.onupgradeneeded = function () {
            const db = request.result;
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };
    });
})();

export async function addItem(item) {
    const db = await dbPromise;
    const tx = db.transaction('items', 'readwrite');
    const store = tx.objectStore('items');
    store.add(item);
    await tx.done; // Ensure transaction completes
    console.log("Transaction completed successfully, item added:", item);
}

export async function getItems() {
    const db = await dbPromise;
    const tx = db.transaction('items', 'readonly');
    const store = tx.objectStore('items');
    
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            console.log("Result from getAll:", request.result); // Should be an array
            resolve(request.result);
        };
        request.onerror = () => {
            console.error("Error in getAll:", request.error);
            reject(request.error);
        };
    });
}

