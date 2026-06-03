import { formatAmount, fromBase, getUnitDisplay } from '../lib/units';

export default function ProductCard({ product, onSelect }) {
  const basePrice = formatAmount(product.pricePerBase);
  const inventoryBase = Number(product.inventoryBase);
  const inventoryDisplay = `${fromBase(inventoryBase, product.baseUnit).toFixed(3)} ${getUnitDisplay(product.baseUnit)}`;

  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>
        <strong>SKU:</strong> {product.sku}
      </p>
      <p>
        <strong>Category:</strong> {product.category}
      </p>
      <p>
        <strong>Price:</strong> {basePrice} / {getUnitDisplay(product.baseUnit)}
      </p>
      <p>
        <strong>Inventory:</strong> {inventoryDisplay}
      </p>
      <button type="button" className="button" onClick={() => onSelect(product)}>
        Add to quote
      </button>
    </div>
  );
}
