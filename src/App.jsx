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
  {
    id: 'fruits',
    name: 'Fruits',
    products: [
      { id: 'apples', name: 'Apples', quantity: 24 },
      { id: 'bananas', name: 'Bananas', quantity: 30 },
      { id: 'oranges', name: 'Oranges', quantity: 20 }
    ]
  },
  {
    id: 'beverages',
    name: 'Beverages',
    products: [
      { id: 'bottled-water', name: 'Bottled Water', quantity: 48 },
      { id: 'orange-juice', name: 'Orange Juice', quantity: 16 },
      { id: 'green-tea', name: 'Green Tea', quantity: 22 }
    ]
  },
  {
    id: 'bakery',
    name: 'Bakery',
    products: [
      { id: 'bread', name: 'Bread', quantity: 14 },
      { id: 'croissants', name: 'Croissants', quantity: 18 },
      { id: 'bagels', name: 'Bagels', quantity: 12 }
    ]
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    products: [
      { id: 'tomatoes', name: 'Tomatoes', quantity: 26 },
      { id: 'carrots', name: 'Carrots', quantity: 32 },
      { id: 'spinach', name: 'Spinach', quantity: 15 }
    ]
  },
  {
    id: 'meat-seafood',
    name: 'Meat & Seafood',
    products: [
      { id: 'chicken-breast', name: 'Chicken Breast', quantity: 18 },
      { id: 'ground-beef', name: 'Ground Beef', quantity: 12 },
      { id: 'salmon-fillets', name: 'Salmon Fillets', quantity: 10 }
    ]
  },
  {
    id: 'frozen-foods',
    name: 'Frozen Foods',
    products: [
      { id: 'frozen-peas', name: 'Frozen Peas', quantity: 20 },
      { id: 'frozen-pizza', name: 'Frozen Pizza', quantity: 14 },
      { id: 'ice-cream', name: 'Ice Cream', quantity: 9 }
    ]
  },
  {
    id: 'pantry-staples',
    name: 'Pantry Staples',
    products: [
      { id: 'rice', name: 'Rice', quantity: 25 },
      { id: 'pasta', name: 'Pasta', quantity: 28 },
      { id: 'flour', name: 'Flour', quantity: 12 }
    ]
  },
  {
    id: 'snacks',
    name: 'Snacks',
    products: [
      { id: 'potato-chips', name: 'Potato Chips', quantity: 30 },
      { id: 'granola-bars', name: 'Granola Bars', quantity: 24 },
      { id: 'mixed-nuts', name: 'Mixed Nuts', quantity: 16 }
    ]
  },
  {
    id: 'condiments-sauces',
    name: 'Condiments & Sauces',
    products: [
      { id: 'ketchup', name: 'Ketchup', quantity: 18 },
      { id: 'mayonnaise', name: 'Mayonnaise', quantity: 14 },
      { id: 'soy-sauce', name: 'Soy Sauce', quantity: 12 }
    ]
  },
  {
    id: 'household-supplies',
    name: 'Household Supplies',
    products: [
      { id: 'paper-towels', name: 'Paper Towels', quantity: 20 },
      { id: 'trash-bags', name: 'Trash Bags', quantity: 18 },
      { id: 'aluminum-foil', name: 'Aluminum Foil', quantity: 10 }
    ]
  },
  {
    id: 'cleaning-products',
    name: 'Cleaning Products',
    products: [
      { id: 'dish-soap', name: 'Dish Soap', quantity: 16 },
      { id: 'laundry-detergent', name: 'Laundry Detergent', quantity: 11 },
      { id: 'surface-cleaner', name: 'Surface Cleaner', quantity: 13 }
    ]
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    products: [
      { id: 'shampoo', name: 'Shampoo', quantity: 14 },
      { id: 'toothpaste', name: 'Toothpaste', quantity: 20 },
      { id: 'hand-soap', name: 'Hand Soap', quantity: 18 }
    ]
  },
  {
    id: 'office-supplies',
    name: 'Office Supplies',
    products: [
      { id: 'printer-paper', name: 'Printer Paper', quantity: 10 },
      { id: 'pens', name: 'Pens', quantity: 40 },
      { id: 'sticky-notes', name: 'Sticky Notes', quantity: 24 }
    ]
  }
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

function mergeDefaultProducts(savedProducts, defaultProducts = []) {
  const normalizedSavedProducts = savedProducts.map(normalizeProduct);
  const savedProductIds = new Set(
    normalizedSavedProducts.map((product) => product.id)
  );
  const missingDefaultProducts = defaultProducts.filter(
    (product) => !savedProductIds.has(product.id)
  );

  return [...normalizedSavedProducts, ...missingDefaultProducts];
}

function normalizeCategory(category) {
  const defaultCategory = defaultCategories.find(
    (item) => item.id === category.id
  );
  const savedProducts = Array.isArray(category.products) ? category.products : null;

  return {
    id: category.id || crypto.randomUUID(),
    name: category.name || 'Unnamed category',
    products: savedProducts
      ? mergeDefaultProducts(savedProducts, defaultCategory?.products)
      : defaultCategory?.products ?? []
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
                  onClick={() => selectCategory(category.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      selectCategory(category.id);
                    }
                  }}
                  role="button"
                  tabIndex="0"
                >
                  <div className="category-select">
                    <strong>{category.name}</strong>
                    <span>{category.products.length} products</span>
                  </div>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="secondary-button compact"
                      onClick={(event) => {
                        event.stopPropagation();
                        startEditingCategory(category);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button compact"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteCategory(category.id);
                      }}
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
