export function writeToLocalStorage(key: any, value: any) {
  if (typeof window === 'undefined') return; // Ensure this runs only on the client

  try {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error("Error writing to localStorage", error);
  }
}

export function readFromLocalStorage(key: any, defaultValue: any) {
  if (typeof window === 'undefined') return defaultValue; // Ensure this runs only on the client

  try {
    const existingValue = localStorage.getItem(key);
    if (existingValue === null) {
      // Initialize with defaultValue if the key doesn't exist
      writeToLocalStorage(key, defaultValue);
      return defaultValue;
    }
    return JSON.parse(existingValue);
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return defaultValue;
  }
}
