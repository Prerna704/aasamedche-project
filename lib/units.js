import Decimal from 'decimal.js';

export const UNIT_MAP = {
  g: { display: 'grams', type: 'WEIGHT', factor: new Decimal(1) },
  kg: { display: 'kilograms', type: 'WEIGHT', factor: new Decimal(1000) },
  mL: { display: 'milliliters', type: 'VOLUME', factor: new Decimal(1) },
  L: { display: 'liters', type: 'VOLUME', factor: new Decimal(1000) },
  unit: { display: 'items', type: 'COUNT', factor: new Decimal(1) },
};

export const BASE_UNIT = {
  WEIGHT: 'g',
  VOLUME: 'mL',
  COUNT: 'unit',
};

function normalizeQuantity(quantity) {
  if (quantity === undefined || quantity === null || quantity === '') return new Decimal(0);
  const value = typeof quantity === 'string' ? quantity.trim() : quantity;
  if (value === '') return new Decimal(0);
  return new Decimal(value);
}

export function toBase(quantity, unit) {
  const normalized = normalizeQuantity(quantity);
  return normalized.mul(UNIT_MAP[unit]?.factor || new Decimal(1));
}

export function fromBase(quantity, unit) {
  const normalized = normalizeQuantity(quantity);
  return normalized.div(UNIT_MAP[unit]?.factor || new Decimal(1));
}

export function formatAmount(value) {
  const normalized = normalizeQuantity(value);
  return `₹${normalized.toFixed(2)}`;
}

export function calculateLineTotal(quantity, unit, pricePerBase) {
  const baseQuantity = toBase(quantity, unit);
  const price = normalizeQuantity(pricePerBase);
  return baseQuantity.mul(price);
}

export function unitOptionsForDimension(dimension) {
  return Object.entries(UNIT_MAP)
    .filter(([, meta]) => meta.type === dimension)
    .map(([value, meta]) => ({ value, label: `${meta.display} (${value})` }));
}

export function getUnitDisplay(unit) {
  return UNIT_MAP[unit]?.display || unit;
}

export function quantityInputProps(unit) {
  if (UNIT_MAP[unit]?.type === 'COUNT') {
    return { min: '1', step: '1' };
  }
  return { min: '0', step: '0.001' };
}
