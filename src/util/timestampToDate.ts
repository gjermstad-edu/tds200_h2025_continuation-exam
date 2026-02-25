import { Timestamp } from "firebase/firestore";

// Utility funksjon for å enklere oversette Firestore Timestamp til JS date og edgecase
// hvor det alt er en Date eller den mangler.

// Denne funksjonen er lagd med hjelp fra ChatGPT 5.2 pga problemer med å 
// få det til selv da datoen ikke ble vist riktig for meg.

export const timestampToDate = (value: unknown): Date | null => {
  if (value instanceof Timestamp) return value.toDate();

  if (value instanceof Date) return value;

  return null;
};