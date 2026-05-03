import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const shoeCategories = ["Sneakers", "Loafers", "Boots", "Running", "Training", "Formal"];

const shoes = Array.from({ length: 60 }, (_, index) => {
  const categories = shoeCategories;
  const brands = ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "SneakHive"];
  const colors = ["Black", "White", "Blue", "Tan", "Grey", "Red"];
  const category = categories[index % categories.length];
  const brand = brands[index % brands.length];
  const color = colors[index % colors.length];

  return {
    id: `shoe-${index + 1}`,
    type: "shoe",
    name: `${color} ${category} ${index + 1}`,
    brand,
    category,
    price: 55 + (index % 20) * 7,
    stock: 10 + (index % 35),
    image: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=700",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=700",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700"
    ][index % 6]
  };
});

const sandals = Array.from({ length: 50 }, (_, index) => {
  const categories = ["Slides", "Flip Flops", "Leather Sandals", "Outdoor Sandals", "Casual Sandals"];
  const brands = ["Crocs", "Birkenstock", "Nike", "Adidas", "SneakHive"];
  const category = categories[index % categories.length];
  const brand = brands[index % brands.length];

  return {
    id: `sandal-${index + 1}`,
    type: "sandal",
    name: `${category} ${index + 1}`,
    brand,
    category,
    price: 25 + (index % 15) * 5,
    stock: 15 + (index % 30),
    image: [
      "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=700",
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=700",
      "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=700",
      "https://images.unsplash.com/photo-1624005340901-6fb7daff484b?w=700",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700"
    ][index % 5]
  };
});

function App() {
  const [activePage, setActivePage] = useState("home");
  const [theme, setTheme] = useState("light");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState("customer@example.com");
  const [account, setAccount] = useState({ name: "", email: "", password: "" });
  const [signupMessage, setSignupMessage] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const [status, setStatus] = useState({
    user: "Checking...",
    inventory: "Checking...",
    order: "Ready",
    payment: "Checking...",
    notification: "Checking..."
  });

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    checkServices();
  }, []);

  const checkServices = () => {
    axios.get(`${process.env.REACT_APP_USER_API}/users`)
      .then((res) => setStatus((s) => ({ ...s, user: res.data.status || "running" })))
      .catch(() => setStatus((s) => ({ ...s, user: "offline" })));

    axios.get(`${process.env.REACT_APP_INVENTORY_API}/inventory`)
      .then((res) => setStatus((s) => ({ ...s, inventory: res.data.stock ? `Stock ${res.data.stock}` : "running" })))
      .catch(() => setStatus((s) => ({ ...s, inventory: "offline" })));

    axios.post(`${process.env.REACT_APP_ORDER_API}/orders`)
      .then(() => setStatus((s) => ({ ...s, order: "running" })))
      .catch(() => setStatus((s) => ({ ...s, order: "offline" })));

    axios.get(`${process.env.REACT_APP_PAYMENT_API}/payment`)
      .then((res) => setStatus((s) => ({ ...s, payment: res.data.status || "running" })))
      .catch(() => setStatus((s) => ({ ...s, payment: "offline" })));

    axios.get(`${process.env.REACT_APP_NOTIFICATION_API}/notification`)
      .then((res) => setStatus((s) => ({ ...s, notification: res.data.status || "running" })))
      .catch(() => setStatus((s) => ({ ...s, notification: "offline" })));
  };

  const filteredShoes = useMemo(() => {
    if (selectedCategory === "All") return shoes;
    return shoes.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { ...product, qty: 1 }];
    });
    setActivePage("cart");
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const createAccount = () => {
    if (!account.name || !account.email || !account.password) {
      setSignupMessage("Please enter name, email, and password.");
      return;
    }

    setEmail(account.email);
    setSignupMessage(`Account created for ${account.name}.`);
  };

  const placeOrder = async () => {
    setCheckoutMessage("Processing order, payment, and invoice...");

    try {
      const orderId = `ORD-${Date.now()}`;

      await axios.post(`${process.env.REACT_APP_ORDER_API}/orders`, {
        orderId,
        items: cart,
        total: cartTotal
      });

      await axios.post(`${process.env.REACT_APP_PAYMENT_API}/payment/pay`, {
        orderId,
        amount: cartTotal,
        mode: "PROJECT"
      });

      const invoiceResponse = await axios.post(`${process.env.REACT_APP_NOTIFICATION_API}/notification/invoice`, {
        orderId,
        email,
        amount: cartTotal,
        items: cart
      });

      setOrders((current) => [
        {
          id: orderId,
          amount: cartTotal,
          status: "Paid",
          email,
          items: cart,
          createdAt: new Date().toLocaleString()
        },
        ...current
      ]);

      setCart([]);
      setCheckoutMessage(invoiceResponse.data.message || `Invoice sent to ${email}`);
      setActivePage("orders");
    } catch (error) {
      setCheckoutMessage("Checkout failed. Please verify order, payment, and notification APIs.");
    }
  };

  const isOnline = (value) => !String(value).toLowerCase().includes("offline");

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => setActivePage("home")}>
          <div className="brand-icon">⚡</div>
          <div>
            <h1>Sneak<span>Hive</span></h1>
            <p>Style that moves</p>
          </div>
        </div>

        <div className="navlinks">
          {["home", "shoes", "sandals", "cart", "orders", "profile", "services"].map((page) => (
            <button
              key={page}
              className={activePage === page ? "active" : ""}
              onClick={() => setActivePage(page)}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>

        <div className="right-actions">
          <button className="theme-toggle" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button className="cart-button" onClick={() => setActivePage("cart")}>
            🛒 <span>{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
          </button>
        </div>
      </nav>

      {activePage === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">SneakHive Collection</p>
              <h2>Fresh sneakers. Premium comfort. Everyday confidence.</h2>
              <p>
                Explore shoes, sandals, demo checkout, service status, and invoice email flow in one project-ready storefront.
              </p>
              <div className="hero-actions">
                <button onClick={() => setActivePage("shoes")}>Shop Shoes</button>
                <button className="secondary" onClick={() => setActivePage("sandals")}>Shop Sandals</button>
              </div>
            </div>
            <div className="hero-card">
              <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900" alt="SneakHive" />
            </div>
          </section>

          <div className="section-header">
            <h2>Featured Shoes</h2>
            <button onClick={() => setActivePage("shoes")}>View 60 Shoes</button>
          </div>

          <section className="products">
            {shoes.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </section>
        </>
      )}

      {activePage === "shoes" && (
        <>
          <div className="section-header">
            <div>
              <h2>Shoes Collection</h2>
              <p>Sneakers, loafers, boots, running, training, and formal shoes.</p>
            </div>
          </div>

          <div className="filters">
            {["All", ...shoeCategories].map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? "active-filter" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <section className="products">
            {filteredShoes.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </section>
        </>
      )}

      {activePage === "sandals" && (
        <>
          <div className="section-header">
            <div>
              <h2>Sandals Collection</h2>
              <p>50 sandals across slides, flip flops, leather, outdoor, and casual styles.</p>
            </div>
          </div>

          <section className="products">
            {sandals.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </section>
        </>
      )}

      {activePage === "cart" && (
        <section className="panel">
          <h2>Your Cart</h2>

          {cart.length === 0 ? (
            <p>Your cart is empty. Add products from Shoes or Sandals.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.category} · Qty {item.qty} × ${item.price}</p>
                  </div>
                  <strong>${item.qty * item.price}</strong>
                  <button className="danger" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              ))}

              <div className="checkout-box">
                <div>
                  <h3>Total: ${cartTotal}</h3>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Invoice email" />
                  {checkoutMessage && <p className="message success">{checkoutMessage}</p>}
                </div>
                <button onClick={placeOrder}>Pay & Send Invoice</button>
              </div>
            </>
          )}
        </section>
      )}

      {activePage === "orders" && (
        <section className="panel">
          <h2>Orders</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div className="order-card" key={order.id}>
                <h3>{order.id}</h3>
                <p>Status: <strong>{order.status}</strong></p>
                <p>Total: ${order.amount}</p>
                <p>Invoice Email: {order.email}</p>
                <p>Created: {order.createdAt}</p>
              </div>
            ))
          )}
        </section>
      )}

      {activePage === "profile" && (
        <section className="panel profile">
          <h2>Create Account / Signup</h2>
          <div className="signup-form">
            <input placeholder="Full name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
            <input placeholder="Email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
            <input placeholder="Password" type="password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
            <button onClick={createAccount}>Create Account</button>
          </div>
          {signupMessage && <p className="message success">{signupMessage}</p>}
        </section>
      )}

      {activePage === "services" && (
        <section className="panel">
          <div className="section-header no-padding">
            <h2>Microservices Status</h2>
            <button onClick={checkServices}>Refresh</button>
          </div>

          <div className="service-list">
            {Object.entries(status).map(([name, value]) => (
              <div className="service-row" key={name}>
                <div>
                  <h3>{name.toUpperCase()} SERVICE</h3>
                  <p>{value}</p>
                </div>
                <span className={isOnline(value) ? "badge online" : "badge offline"}>
                  {isOnline(value) ? "Online" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer>© 2026 SneakHive. All rights reserved.</footer>
    </div>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-info">
        <span className="category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.brand}</p>
        <div className="product-bottom">
          <strong>${product.price}</strong>
          <span>Stock: {product.stock}</span>
        </div>
        <button onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    </div>
  );
}

export default App;