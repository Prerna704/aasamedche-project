import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { unitOptionsForDimension } from '../../lib/units';

const defaultForm = {
  name: '',
  sku: '',
  category: '',
  description: '',
  dimension: 'WEIGHT',
  baseUnit: 'g',
  pricePerBase: '0.000000',
  inventoryBase: '0.000000',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data);
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createProduct(event) {
    event.preventDefault();
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage('Product created successfully.');
      setForm(defaultForm);
      refresh();
    } else {
      const body = await res.json();
      setMessage(body.error || 'Unable to create product.');
    }
  }

  async function deleteProduct(id) {
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    refresh();
  }

  function updateProduct(id, field, value) {
    setProducts((current) =>
      current.map((product) => (product.id === id ? { ...product, [field]: value } : product))
    );
  }

  async function saveProduct(product) {
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      setMessage('Product updated.');
      refresh();
    } else {
      const body = await res.json();
      setMessage(body.error || 'Unable to update product.');
    }
  }

  return (
    <Layout>
      <div className="card">
        <h2>Manage products</h2>
        <form onSubmit={createProduct} style={{ display: 'grid', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
            <input value={form.name} placeholder="Name" onChange={(e) => handleChange('name', e.target.value)} />
            <input value={form.sku} placeholder="SKU" onChange={(e) => handleChange('sku', e.target.value)} />
            <input value={form.category} placeholder="Category" onChange={(e) => handleChange('category', e.target.value)} />
            <select value={form.dimension} onChange={(e) => handleChange('dimension', e.target.value)}>
              <option value="WEIGHT">Weight</option>
              <option value="VOLUME">Volume</option>
              <option value="COUNT">Count</option>
            </select>
            <select value={form.baseUnit} onChange={(e) => handleChange('baseUnit', e.target.value)}>
              {unitOptionsForDimension(form.dimension).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              value={form.pricePerBase}
              placeholder="Price per base unit"
              onChange={(e) => handleChange('pricePerBase', e.target.value)}
            />
            <input
              value={form.inventoryBase}
              placeholder="Inventory base quantity"
              onChange={(e) => handleChange('inventoryBase', e.target.value)}
            />
            <input
              value={form.description}
              placeholder="Description"
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <button className="button" type="submit">
            Create product
          </button>
        </form>
        {message ? <p>{message}</p> : null}
        <div className="grid grid-2">
          {products.map((product) => (
            <div key={product.id} className="card">
              <div style={{ display: 'grid', gap: '10px' }}>
                <div>
                  <strong>{product.name}</strong> ({product.sku})
                </div>
                <input value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} />
                <input value={product.category} onChange={(e) => updateProduct(product.id, 'category', e.target.value)} />
                <input
                  value={product.pricePerBase}
                  onChange={(e) => updateProduct(product.id, 'pricePerBase', e.target.value)}
                />
                <input
                  value={product.inventoryBase}
                  onChange={(e) => updateProduct(product.id, 'inventoryBase', e.target.value)}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="button secondary" type="button" onClick={() => saveProduct(product)}>
                    Save
                  </button>
                  <button className="button secondary" type="button" onClick={() => deleteProduct(product.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
