const DB_NAME = 'AnimeWatchDB';
const DB_VERSION = 1;

export interface WatchHistoryEntry {
  id?: number;
  animeId: string;
  animeTitle: string;
  animeCover: string;
  episode: number;
  epId: string;
  timestamp: number;
  duration: number;
  audioType: 'sub' | 'dub';
  updatedAt: number;
  totalEpisodes: number;
}

export interface WatchlistEntry {
  id?: number;
  animeId: string;
  animeTitle: string;
  animeCover: string;
  totalEpisodes: number;
  addedAt: number;
}

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('watchHistory')) {
        const historyStore = db.createObjectStore('watchHistory', { keyPath: 'id', autoIncrement: true });
        historyStore.createIndex('animeId', 'animeId', { unique: false });
        historyStore.createIndex('animeEpisode', ['animeId', 'episode'], { unique: true });
        historyStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('watchlist')) {
        const watchlistStore = db.createObjectStore('watchlist', { keyPath: 'id', autoIncrement: true });
        watchlistStore.createIndex('animeId', 'animeId', { unique: true });
      }
    };
  });
};

export const watchHistoryDB = {
  async add(entry: Omit<WatchHistoryEntry, 'id'>): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readwrite');
      const store = transaction.objectStore('watchHistory');
      const index = store.index('animeEpisode');

      const getRequest = index.get([entry.animeId, entry.episode]);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updateRequest = store.put({ ...entry, id: existing.id });
          updateRequest.onsuccess = () => resolve(existing.id);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          const addRequest = store.add(entry);
          addRequest.onsuccess = () => resolve(addRequest.result as number);
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  async getByAnimeId(animeId: string): Promise<WatchHistoryEntry[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readonly');
      const store = transaction.objectStore('watchHistory');
      const index = store.index('animeId');
      const request = index.getAll(animeId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getByAnimeEpisode(animeId: string, episode: number): Promise<WatchHistoryEntry | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readonly');
      const store = transaction.objectStore('watchHistory');
      const index = store.index('animeEpisode');
      const request = index.get([animeId, episode]);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getLatestForAnime(animeId: string): Promise<WatchHistoryEntry | null> {
    const entries = await this.getByAnimeId(animeId);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b.updatedAt - a.updatedAt)[0];
  },

  async getAllContinueWatching(): Promise<WatchHistoryEntry[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readonly');
      const store = transaction.objectStore('watchHistory');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as WatchHistoryEntry[];
        const uniqueAnimes = new Map<string, WatchHistoryEntry>();
        
        results
          .filter(e => e.timestamp > 30 && e.duration > 0 && (e.timestamp / e.duration) < 0.9)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .forEach(e => {
            if (!uniqueAnimes.has(e.animeId)) {
              uniqueAnimes.set(e.animeId, e);
            }
          });

        resolve(Array.from(uniqueAnimes.values()));
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getAllHistory(): Promise<WatchHistoryEntry[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readonly');
      const store = transaction.objectStore('watchHistory');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as WatchHistoryEntry[];
        const uniqueAnimes = new Map<string, WatchHistoryEntry>();
        
        results
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .forEach(e => {
            if (!uniqueAnimes.has(e.animeId)) {
              uniqueAnimes.set(e.animeId, e);
            }
          });

        resolve(Array.from(uniqueAnimes.values()));
      };
      request.onerror = () => reject(request.error);
    });
  },

  async delete(animeId: string, episode: number): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readwrite');
      const store = transaction.objectStore('watchHistory');
      const index = store.index('animeEpisode');
      const request = index.getKey([animeId, episode]);

      request.onsuccess = () => {
        if (request.result) {
          store.delete(request.result);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async deleteAllForAnime(animeId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readwrite');
      const store = transaction.objectStore('watchHistory');
      const index = store.index('animeId');
      const request = index.getAllKeys(animeId);

      request.onsuccess = () => {
        request.result.forEach(key => store.delete(key));
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async clearAll(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchHistory', 'readwrite');
      const store = transaction.objectStore('watchHistory');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

export const watchlistDB = {
  async add(entry: Omit<WatchlistEntry, 'id'>): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchlist', 'readwrite');
      const store = transaction.objectStore('watchlist');
      const index = store.index('animeId');

      const getRequest = index.get(entry.animeId);
      
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(getRequest.result.id);
          return;
        }
        const addRequest = store.add(entry);
        addRequest.onsuccess = () => resolve(addRequest.result as number);
        addRequest.onerror = () => reject(addRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  async getAll(): Promise<WatchlistEntry[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchlist', 'readonly');
      const store = transaction.objectStore('watchlist');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as WatchlistEntry[];
        resolve(results.sort((a, b) => b.addedAt - a.addedAt));
      };
      request.onerror = () => reject(request.error);
    });
  },

  async exists(animeId: string): Promise<boolean> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchlist', 'readonly');
      const store = transaction.objectStore('watchlist');
      const index = store.index('animeId');
      const request = index.get(animeId);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(animeId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('watchlist', 'readwrite');
      const store = transaction.objectStore('watchlist');
      const index = store.index('animeId');
      const request = index.getKey(animeId);

      request.onsuccess = () => {
        if (request.result) {
          store.delete(request.result);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
};
