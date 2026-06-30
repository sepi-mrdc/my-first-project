import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'inventory-management-categories';

const defaultCategories = [
  { id: 'dairy', name: 'Dairy' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'bakery', name: 'Bakery' }
];

function createCategory(name) {
  return {
    id: crypto.randomUUID(),
    name: name.trim()
  };
}

function getStoredCategories() {
  try {
    const savedCategories = localStorage.getItem(STORAGE_KEY);
    return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
  } catch {
    return defaultCategories;
  }
}

export default function App() {
  const [categories, setCategories] = useState(getStoredCategories);
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const editingCategory = useMemo(
    () => categories.find((category) => category.id === editingId),
    [categories, editingId]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  function resetForm() {
    setCategoryName('');
    setEditingId(null);
    setError('');
  }

  function handleSubmit(event) {
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
      setCategories((currentCategories) => [
        ...currentCategories,
        createCategory(nextName)
      ]);
    }

    resetForm();
  }

  function startEditing(category) {
    setEditingId(category.id);
    setCategoryName(category.name);
    setError('');
  }

  function deleteCategory(categoryId) {
    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryId)
    );

    if (editingId === categoryId) {
      resetForm();
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="page-header">
          <div>
            <p className="eyebrow">Inventory Management</p>
            <h1>Categories</h1>
          </div>
          <div className="category-count">
            <span>{categories.length}</span>
            <small>Total categories</small>
          </div>
        </header>

        <div className="content-grid">
          <section className="panel form-panel" aria-labelledby="category-form-title">
            <h2 id="category-form-title">
              {editingCategory ? 'Edit category' : 'Add category'}
            </h2>

            <form onSubmit={handleSubmit} className="category-form">
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
                  <button type="button" className="secondary-button" onClick={resetForm}>
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
                <article className="category-item" key={category.id}>
                  <div>
                    <h3>{category.name}</h3>
                    <p>Inventory category</p>
                  </div>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="secondary-button compact"
                      onClick={() => startEditing(category)}
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
      </section>
    </main>
  );
}
