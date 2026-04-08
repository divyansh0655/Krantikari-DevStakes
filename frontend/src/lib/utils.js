export function debounce(func, delay) {
  let timeoutId;
  let lastArgs;
  
  const debounced = (...args) => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      func(...args);
    }, delay);
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      func(...lastArgs);
    }
  };

  return debounced;
}
