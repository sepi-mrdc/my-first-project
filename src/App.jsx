import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'inventory-management-categories';

const defaultCategories = [
  {
    id: 'dairy',
    name: 'Dairy',
    products: [
      { id: 'milk', name: 'Milk', quantity: 12 },
      { id: 'yogurt', name: 'Yogurt', quantity: 18 },
      { id: 'cheese', name: 'Cheese', quantity: 8 }
    ]
  },
  { id: 'fruits', name: 'Fruits', products: [] },
  { id: 'beverages', name: 'Beverages', products: [] },
  { id: 'bakery', name: 'Bakery', products: [] },
  { id: 'vegetables', name: 'Vegetables', products: [] },
  { id: 'meat-seafood', name: 'Meat & Seafood', products: [] },
  { id: 'frozen-foods', name: 'Frozen Foods', products: [] },
  { id: 'pantry-staples', name: 'Pantry Staples', products: [] },
  { id: 'snacks', name: 'Snacks', products: [] },
  { id: 'condiments-sauces', name: 'Condiments & Sauces', products: [] },
  { id: 'household-supplies', name: 'Household Supplies', products: [] },
  { id: 'cleaning-products', name: 'Cleaning Products', products: [] },
  { id: 'personal-care', name: 'Personal Care', products: [] },
  { id: 'office-supplies', name: 'Office Supplies', products: [] }
];

function createCategory(name) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    products: []
  };
}

function createProduct(name, quantity) {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    quantity
  };
}

function normalizeProduct(product) {
  return {
    id: product.id || crypto.randomUUID(),
    name: product.name || 'Unnamed product',
    quantity: Math.max(0, Number(product.quantity) || 0)
  };
}

function normalizeCategory(category) {
  const defaultCategory = defaultCategories.find(
    (item) => item.id === category.id
  );
  const savedProducts = Array.isArray(category.products)
    ? category.products.map(normalizeProduct)
    : null;

  return {
    id: category.id || crypto.randomUUID(),
    name: category.name || 'Unnamed category',
    products: savedProducts ?? defaultCategory?.products ?? []
  };
}

function getStoredCategories() {
  try {
    const savedCategories = localStorage.getItem(STORAGE_KEY);
    if (!savedCategories) {
      return defaultCategories;
    }

    const parsedCategories = JSON.parse(savedCategories).map(normalizeCategory);
    const savedIds = new Set(parsedCategories.map((category) => category.id));
    const missingDefaultCategories = defaultCategories.filter(
      (category) => !savedIds.has(category.id)
    );

    return [...parsedCategories, ...missingDefaultCategories];
  } catch {
    return defaultCategories;
  }
}

export default function App() {
  const [categories, setCategories] = useState(getStoredCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState('dairy');
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productError, setProductError] = useState('');

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );
  const editingCategory = useMemo(
    () => categories.find((category) => category.id === editingId),
    [categories, editingId]
  );
  const editingProduct = useMemo(
    () =>
      selectedCategory?.products.find(
        (product) => product.id === editingProductId
      ),
    [editingProductId, selectedCategory]
  );
  const totalProducts = useMemo(
    () =>
      categories.reduce(
        (total, category) => total + category.products.length,
        0
      ),
    [categories]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategory]);

  function resetCategoryForm() {
    setCategoryName('');
    setEditingId(null);
    setError('');
  }

  function resetProductForm() {
    setProductName('');
    setProductQuantity(1);
    setEditingProductId(null);
    setProductError('');
  }

  function updateSelectedCategoryProducts(updater) {
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === selectedCategoryId
          ? { ...category, products: updater(category.products) }
          : category
      )
    );
  }

  function handleCategorySubmit(event) {
    event.preventDefault();

    const nextName = categoryName.trim();
    if (!nextName) {
      setError('Enter a category name.');
      return;
    }

    const isDuplicate = categories.some(
      (category) =>
        category.name.toLowerCase() === nextName.toLowerCase() &&
        category.id !== editingId
    );

    if (isDuplicate) {
      setError('This category already exists.');
      return;
    }

    if (editingId) {
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === editingId ? { ...category, name: nextName } : category
        )
      );
    } else {
      const nextCategory = createCategory(nextName);
      setCategories((currentCategories) => [...currentCategories, nextCategory]);
      setSelectedCategoryId(nextCategory.id);
    }

    resetCategoryForm();
  }

  function handleProductSubmit(event) {
    event.preventDefault();

    if (!selectedCategory) {
      setProductError('Select a category first.');
      return;
    }

    const nextName = productName.trim();
    const nextQuantity = Math.max(0, Number(productQuantity) || 0);

    if (!nextName) {
      setProductError('Enter a product name.');
      return;
    }

    const isDuplicate = selectedCategory.products.some(
      (product) =>
        product.name.toLowerCase() === nextName.toLowerCase() &&
        product.id !== editingProductId
    );

    if (isDuplicate) {
      setProductError('This product already exists in this category.');
      return;
    }

    if (editingProductId) {
      updateSelectedCategoryProducts((products) =>
        products.map((product) =>
          product.id === editingProductId
            ? { ...product, name: nextName, quantity: nextQuantity }
            : product
        )
      );
    } else {
      updateSelectedCategoryProducts((products) => [
        ...products,
        createProduct(nextName, nextQuantity)
      ]);
    }

    resetProductForm();
  }

  function startEditingCategory(category) {
    setEditingId(category.id);
    setCategoryName(category.name);
    setError('');
  }

  function deleteCategory(categoryId) {
    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryId)
    );

    if (editingId === categoryId) {
      resetCategoryForm();
    }

    if (selectedCategoryId === categoryId) {
      resetProductForm();
    }
  }

  function selectCategory(categoryId) {
    setSelectedCategoryId(categoryId);
    resetProductForm();
  }

  function startEditingProduct(product) {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductQuantity(product.quantity);
    setProductError('');
  }

  function deleteProduct(productId) {
    updateSelectedCategoryProducts((products) =>
      products.filter((product) => product.id !== productId)
    );

    if (editingProductId === productId) {
      resetProductForm();
    }
  }

  function changeProductQuantity(productId, amount) {
    updateSelectedCategoryProducts((products) =>
      products.map((product) =>
        product.id === productId
          ? { ...product, quantity: Math.max(0, product.quantity + amount) }
          : product
      )
    );
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="page-header">
          <div>
            <p className="eyebrow">Inventory Management</p>
            <h1>Categories & Products</h1>
          </div>
          <div className="summary-cards">
            <div className="category-count">
              <span>{categories.length}</span>
              <small>Total categories</small>
            </div>
            <div className="category-count">
              <span>{totalProducts}</span>
              <small>Total products</small>
            </div>
          </div>
        </header>

        <div className="content-grid">
          <section className="panel form-panel" aria-labelledby="category-form-title">
            <h2 id="category-form-title">
              {editingCategory ? 'Edit category' : 'Add category'}
            </h2>

            <form onSubmit={handleCategorySubmit} className="category-form">
              <label htmlFor="category-name">Category name</label>
              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(event.target.value);
                  setError('');
                }}
                placeholder="Example: Dairy"
              />

              {error ? <p className="form-error">{error}</p> : null}

              <div className="button-row">
                <button type="submit" className="primary-button">
                  {editingCategory ? 'Save changes' : 'Add category'}
                </button>
                {editingCategory ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetCategoryForm}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="panel list-panel" aria-labelledby="category-list-title">
            <div className="list-header">
              <h2 id="category-list-title">All categories</h2>
              <span>{categories.length} shown</span>
            </div>

            <div className="category-list">
              {categories.map((category) => (
                <article
                  className={`category-item ${
                    selectedCategoryId === category.id ? 'selected' : ''
                  }`}
                  key={category.id}
                >
                  <button
                    type="button"
                    className="category-select"
                    onClick={() => selectCategory(category.id)}
                  >
                    <strong>{category.name}</strong>
                    <span>{category.products.length} products</span>
                  </button>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="secondary-button compact"
                      onClick={() => startEditingCategory(category)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button compact"
                      onClick={() => deleteCategory(category.id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="panel product-panel" aria-labelledby="product-panel-title">
          <div className="list-header">
            <div>
              <p className="eyebrow">Products</p>
              <h2 id="product-panel-title">
                {selectedCategory
                  ? `${selectedCategory.name} products`
                  : 'Select a category'}
              </h2>
            </div>
            <span>
              {selectedCategory ? selectedCategory.products.length : 0} shown
            </span>
          </div>

          {selectedCategory ? (
            <div className="product-layout">
              <form onSubmit={handleProductSubmit} className="product-form">
                <h3>{editingProduct ? 'Edit product' : 'Add product'}</h3>
                <label htmlFor="product-name">Product name</label>
                <input
                  id="product-name"
                  type="text"
                  value={productName}
                  onChange={(event) => {
                    setProductName(event.target.value);
                    setProductError('');
                  }}
                  placeholder="Example: Milk"
                />

                <label htmlFor="product-quantity">Quantity</label>
                <input
                  id="product-quantity"
                  type="number"
                  min="0"
                  value={productQuantity}
                  onChange={(event) => {
                    setProductQuantity(event.target.value);
                    setProductError('');
                  }}
                />

                {productError ? (
                  <p className="form-error">{productError}</p>
                ) : null}

                <div className="button-row">
                  <button type="submit" className="primary-button">
                    {editingProduct ? 'Save product' : 'Add product'}
                  </button>
                  {editingProduct ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetProductForm}
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>

              <div className="product-list">
                {selectedCategory.products.length > 0 ? (
                  selectedCategory.products.map((product) => (
                    <article className="product-item" key={product.id}>
                      <div>
                        <h3>{product.name}</h3>
                        <p>Quantity: {product.quantity}</p>
                      </div>
                      <div className="quantity-controls" aria-label="Quantity controls">
                        <button
                          type="button"
                          className="secondary-button icon-button"
                          onClick={() => changeProductQuantity(product.id, -1)}
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          -
                        </button>
                        <span>{product.quantity}</span>
                        <button
                          type="button"
                          className="secondary-button icon-button"
                          onClick={() => changeProductQuantity(product.id, 1)}
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                      <div className="item-actions">
                        <button
                          type="button"
                          className="secondary-button compact"
                          onClick={() => startEditingProduct(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-button compact"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-state">
                    No products in this category yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">Add or select a category to manage products.</div>
          )}
        </section>
      </section>
    </main>
  );
}
