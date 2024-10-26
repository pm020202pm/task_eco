"use client"; // Ensure this is a Client Component
import { useEffect, useState } from "react";
import "./pages/products.css"; // Import the CSS file

// Define the product type for TypeScript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5432/products");
        if (!res.ok) {
          throw new Error(`Error fetching products: ${res.statusText}`);
        }
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.description || newProduct.price <= 0 || newProduct.quantity < 0) {
      setError("Please fill out all fields with valid data.");
      return;
    }

    if (editingProduct) {
      try {
        const res = await fetch(`http://localhost:5432/products/${editingProduct.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        });

        if (!res.ok) {
          throw new Error(`Error updating product: ${res.statusText}`);
        }

        const updatedProduct: Product = await res.json();
        setProducts(products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)));
        setEditingProduct(null);
        setNewProduct({ name: "", description: "", price: 0, quantity: 0 });
        setError(null);
      } catch (error) {
        console.error(error);
        setError("Failed to update product");
      }
    } else {
      try {
        const res = await fetch("http://localhost:5432/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProduct),
        });

        if (!res.ok) {
          throw new Error(`Error creating product: ${res.statusText}`);
        }

        const createdProduct: Product = await res.json();
        setProducts([...products, createdProduct]);
        setNewProduct({ name: "", description: "", price: 0, quantity: 0 });
        setError(null);
      } catch (error) {
        console.error(error);
        setError("Failed to create product");
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5432/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Error deleting product: ${res.statusText}`);
      }

      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error(error);
      setError("Failed to delete product");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });
  };

  return (
    <div className="container">
      <h1 className="header">Product Management</h1>
      <form onSubmit={handleSubmit} className="form">
        <h2 className="editHeading">{editingProduct ? "Edit Product" : "Create a New Product"}</h2>
        <input
          type="text" placeholder="Name" value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          required className="input"
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          required
          className="input"
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
          required
          className="input"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
          min={0}
          required
          className="input"
        />
        <button type="submit" className={`button ${editingProduct ? "edit-button" : "create-button"}`}>
          {editingProduct ? "Update Product" : "Create Product"}
        </button>
        {editingProduct && (
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setNewProduct({ name: "", description: "", price: 0, quantity: 0 });
            }}
            className="cancel-button"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <ul className="product-list">
          {products.map((product) => (
            <li key={product.id} className="product-item">
  
              <h2 className="product-name">{product.name}</h2>
              <p className="product-price">Price: ${product.price.toFixed(2)}</p>
              <p className="product-quantity">Quantity: {product.quantity}</p>
        
              <p className="product-description">{product.description}</p>
              <button onClick={() => handleEdit(product)} className="edit-button">Edit</button>
              <button onClick={() => handleDelete(product.id)} className="delete-button">Delete</button>
        
          
              
              
              

              
            </li>
            
          ))}
        </ul>
      )}
    </div>
  );
}