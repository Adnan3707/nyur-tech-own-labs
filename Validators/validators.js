function hasSameSchema(array) {
    if (array.length === 0) {
      return true; // Empty array is considered to have the same schema
    }
  
    const firstObject = array[0];
    const keys = Object.keys(firstObject);
  
    for (let i = 1; i < array.length; i++) {
      const obj = array[i];
      const objKeys = Object.keys(obj);
  
      if (keys.length !== objKeys.length) {
        return false; // Different number of properties, not the same schema
      }
  
      for (const key of keys) {
        if (!objKeys.includes(key)) {
          return false; // Missing property, not the same schema
        }
      }
    }
  
    return true; // All objects have the same schema
  }

module.exports = {hasSameSchema}