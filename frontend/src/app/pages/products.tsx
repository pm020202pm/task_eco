// pages/products.tsx
import { useState } from "react";

// Define the product type for TypeScript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export default function Products({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
  });

  // Handle product creation
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5432/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });
      const createdProduct: Product = await res.json();
      setProducts([...products, createdProduct]);
      setNewProduct({ name: "", description: "", price: 0, quantity: 0 });
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  // Handle product deletion
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5432/products/${id}`, {
        method: "DELETE",
      });
      if (res.status === 200) {
        setProducts(products.filter((product) => product.id !== id));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Handle product update
  const handleUpdate = async (id: number, updatedProduct: Omit<Product, "id">) => {
    try {
      const res = await fetch(`http://localhost:5432/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });
      const data: Product = await res.json();
      setProducts(products.map((product) => (product.id === id ? data : product)));
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="container">
      <h1>Product Management</h1>

      {/* Display products */}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Quantity: {product.quantity}</p>
            <button onClick={() => handleDelete(product.id)}>Delete</button>
            {/* Update form here (if needed) */}
          </li>
        ))}
      </ul>

      {/* Create product form */}
      <form onSubmit={handleCreate}>
        <h2>Create a New Product</h2>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newProduct.quantity}
          onChange={(e) =>
            setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })
          }
        />
        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}

// Fetch products from the backend
export async function getServerSideProps() {
  const res = await fetch("http://localhost:5432/products");
  const initialProducts: Product[] = await res.json();

  return {
    props: {
      initialProducts,
    },
  };
}
