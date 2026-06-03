import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { calculateLineTotal, formatAmount, unitOptionsForDimension, quantityInputProps, getUnitDisplay } from '../lib/units';

const initialItemState = (product) => ({
  productId: product.id,
  product,
  unit: product.baseUnit,
  quantity: '1',
  lineTotal: calculateLineTotal('1', product.baseUnit, product.pricePerBase).toFixed(2),
});

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [user, setUser] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState('');

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const total = useMemo(
    () => selectedItems.reduce((sum, item) => sum + parseFloat(item.lineTotal || 0), 0),
    [selectedItems]
  );

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((json) => setUser(json.user || null))
      .catch(() => setUser(null));

    fetch(`/api/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        const cats = [...new Set((data || []).map((p) => p.category))];
        if (category && !cats.includes(category)) setCategory('');
      })
      .catch(() => setProducts([]));
  }, [search]);

  function addProduct(product) {
    if (!user) {
      setMessage('Please sign in to add products to a quotation.');
      return;
    }

    setSelectedItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) return current;
      return [...current, initialItemState(product)];
    });
  }

  function updateItem(index, field, value) {
    setSelectedItems((current) =>
      current.map((item, idx) => {
        if (idx !== index) return item;
        const next = { ...item, [field]: value };
        const quantity = field === 'quantity' ? value : item.quantity;
        const unit = field === 'unit' ? value : item.unit;
        next.lineTotal = calculateLineTotal(quantity, unit, item.product.pricePerBase).toFixed(2);
        return next;
      })
    );
  }

  async function submitOrder(isQuotation) {
    if (!user) {
      setMessage('Please sign in to place quotations or orders.');
      return;
    }

    if (selectedItems.length === 0) {
      setMessage('Select at least one product to continue.');
      return;
    }
    const payload = {
      isQuotation,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        unit: item.unit,
        quantity: item.quantity,
      })),
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSelectedItems([]);
      setMessage(isQuotation ? 'Quotation created successfully.' : 'Order placed successfully.');
    } else {
      const body = await res.json();
      setMessage(body.error || 'Unable to place order.');
    }
  }

  return (
    <Layout>
      <div className="card">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <input
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #d1d5db' }}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px', borderRadius: '12px' }}>
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={addProduct} user={user} />
        ))}
      </div>

      <div className="card">
        <h2>Quotation & Order Builder</h2>
        {selectedItems.length === 0 ? (
          <p>Select products to build a quotation or order.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {selectedItems.map((item, index) => (
              <div key={item.productId} className="card" style={{ padding: '16px' }}>
                <h3>{item.product.name}</h3>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                  <div>
                    <label>Unit</label>
                    <select value={item.unit} onChange={(e) => updateItem(index, 'unit', e.target.value)}>
                      {unitOptionsForDimension(item.product.dimension).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Quantity ({getUnitDisplay(item.unit)})</label>
                    <input
                      type="number"
                      value={item.quantity}
                      {...quantityInputProps(item.unit)}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Line total</label>
                    <div>{formatAmount(item.lineTotal)}</div>
                  </div>
                  <div>
                    <button type="button" className="button secondary" onClick={() => setSelectedItems((prev) => prev.filter((_, i) => i !== index))}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <h3>Total estimate</h3>
                <p>{formatAmount(total)}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="button" onClick={() => submitOrder(true)}>
                  Save as Quotation
                </button>
                <button type="button" className="button" onClick={() => submitOrder(false)}>
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
        {message ? <p style={{ marginTop: '16px' }}>{message}</p> : null}
      </div>
    </Layout>
  );
}
