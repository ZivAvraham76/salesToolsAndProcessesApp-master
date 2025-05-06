class CacheWithExpiration {
    constructor(expirationMillis) {
      this.expirationMillis = expirationMillis;
      this.cache = {}; // { key: { value, cachedAt } }
      this.pendingPromises = {}; // { key: Promise }
    }
  
    get(key) {
      const cacheEntry = this.cache[key];
      if (cacheEntry) {
        const age = Date.now() - cacheEntry.cachedAt;
        if (age < this.expirationMillis) {
          return cacheEntry.value;
        } else {
          console.log(`Cache expired for key: ${key}. Removing...`);
          delete this.cache[key];
        }
      }
      return null;
    }
  
    set(key, value) {
      this.cache[key] = { value, cachedAt: Date.now() };
    }
  
    getPending(key) {
      return this.pendingPromises[key] || null;
    }
  
    setPending(key, promise) {
      this.pendingPromises[key] = promise;
    }
  
    clearPending(key) {
      delete this.pendingPromises[key];
    }
  
    clear(key) {
      delete this.cache[key];
      delete this.pendingPromises[key];
    }
  }
  
  module.exports = CacheWithExpiration;
  