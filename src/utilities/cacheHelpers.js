const getCachedEntity = async (cache, key, fetchFunction) => {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
  
    const pending = cache.getPending(key);
    if (pending) {
      return pending;
    }
  
    const promise = fetchFunction()
      .then(result => {
        cache.set(key, result);
        cache.clearPending(key);
        return result;
      })
      .catch(err => {
        cache.clearPending(key);
        throw err;
      });
  
    cache.setPending(key, promise);
    return promise;
  };
  
  module.exports = {
    getCachedEntity,
  };
  