import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const shoeCategories = ["Sneakers", "Loafers", "Boots", "Running", "Training", "Formal"];

const shoeImages = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700",
  "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=700",
  "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=700",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700"
];

const sandalImages = [
  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=700",
  "https://images.unsplash.com/photo-1622920799137-86c891159e44?w=700",
  "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=700",
  "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=700",
  "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=700",
  "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=900"
];

const shoes = Array.from({ length: 60 }, (_, index) => {
  const brands = ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "SneakHive"];
  const colors = ["Black", "White", "Blue", "Tan", "Grey", "Red"];
  const category = shoeCategories[index % shoeCategories.length];

  return {
    id: `shoe-${index + 1}`,
    type: "shoe",
    name: `${colors[index % colors.length]} ${category} ${index + 1}`,
    brand: brands[index % brands.length],
    category,
    price: 55 + (index % 20) * 7,
    stock: 10 + (index % 35),
    image: shoeImages[index % shoeImages.length]
  };
});

const sandals = Array.from({ length: 30 }, (_, index) => {
  const categories = ["Slides", "Leather Sandals", "Casual Sandals"];
  const brands = ["Crocs", "Birkenstock", "Nike", "Adidas", "SneakHive"];

  return {
    id: `sandal-${index + 1}`,
    type: "sandal",
    name: `${categories[index % categories.length]} ${index + 1}`,
    brand: brands[index % brands.length],
    category: categories[index % categories.length],
    price: 25 + (index % 15) * 5,
    stock: 15 + (index % 30),
    image: sandalImages[index % sandalImages.length]
  };
});

function App() {
  const [activePage, setActivePage] = useState("home");
  const [theme, setTheme] = useState("light");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [authMessage, setAuthMessage] = useState("");

  const [status, setStatus] = useState({
    user: "Checking...",
    inventory: "Checking...",
    order: "Checking...",
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

    axios.get(`${process.env.REACT_APP_ORDER_API}/orders`)
      .then((res) => setStatus((s) => ({ ...s, order: res.data.status || "running" })))
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

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const addToCart = async (product) => {
    if (!currentUser) {
      setToast("Please login before adding products to cart");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...current, { ...product, qty: 1 }];
    });

    try {
      await axios.post(`${process.env.REACT_APP_ORDER_API}/cart/add`, {
        userEmail: currentUser.email,
        productId: product.id,
        productName: product.name,
        productType: product.type,
        price: product.price,
        quantity: 1
      });
    } catch (error) {
      console.log("Cart save failed", error);
    }

    setToast(`${product.name} added to cart`);
    setTimeout(() => setToast(""), 2500);
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const createAccount = async () => {
    if (!authForm.name || !authForm.email || !authForm.password) {
      setAuthMessage("Please enter name, email, and password.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_USER_API}/users/signup`, authForm);

      if (res.data.status === "success") {
        setCurrentUser({
          name: res.data.name,
          email: res.data.email,
          userId: res.data.userId
        });
        setAuthMessage("Account created and logged in successfully.");
      } else {
        setAuthMessage(res.data.message || "Signup failed.");
      }
    } catch (error) {
      setAuthMessage("Signup failed. Please check user-service.");
    }
  };

  const login = async () => {
    if (!authForm.email || !authForm.password) {
      setAuthMessage("Please enter email and password.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_USER_API}/users/login`, {
        email: authForm.email,
        password: authForm.password
      });

      if (res.data.status === "success") {
        setCurrentUser({
          name: res.data.name,
          email: res.data.email,
          userId: res.data.userId
        });
        setAuthMessage("Login successful.");
      } else {
        setAuthMessage(res.data.message || "Login failed.");
      }
    } catch (error) {
      setAuthMessage("Login failed. Please check user-service.");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setAuthMessage("Logged out successfully.");
  };

  const placeOrder = async () => {
    if (!currentUser) {
      setCheckoutMessage("Please login before placing an order.");
      setActivePage("profile");
      return;
    }

    if (cart.length === 0) {
      setCheckoutMessage("Your cart is empty.");
      return;
    }

    setCheckoutMessage("Processing order...");

    try {
      const orderResponse = await axios.post(`${process.env.REACT_APP_ORDER_API}/orders/place`, {
        email: currentUser.email,
        totalAmount: cartTotal
      });

      const orderId = String(orderResponse.data.orderId || `ORD-${Date.now()}`);

      await axios.post(`${process.env.REACT_APP_PAYMENT_API}/payment/pay`, {
        orderId,
        amount: cartTotal,
        mode: "PROJECT"
      });

      const invoiceResponse = await axios.post(`${process.env.REACT_APP_NOTIFICATION_API}/notification/invoice`, {
        orderId,
        email: currentUser.email,
        amount: cartTotal,
        items: cart
      });

      setOrders((current) => [
        {
          id: orderId,
          amount: cartTotal,
          status: "Paid",
          email: currentUser.email,
          items: cart,
          createdAt: new Date().toLocaleString()
        },
        ...current
      ]);

      setCart([]);
      setCheckoutMessage(invoiceResponse.data.message || `Invoice sent to ${currentUser.email}`);
      setActivePage("orders");
    } catch (error) {
      setCheckoutMessage("Checkout failed. Please check order, payment, and notification services.");
    }
  };

  const isOnline = (value) => !String(value).toLowerCase().includes("offline");

  return (
    <div className="page">
      {toast && <div className="toast">{toast}</div>}

      <nav className="navbar">
        <div className="brand" onClick={() => setActivePage("home")}>
          <div className="brand-icon">SK</div>
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
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button className="cart-button" onClick={() => setActivePage("cart")}>
            🛒 <span>{cartCount}</span>
          </button>
        </div>
      </nav>

      {activePage === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">SneakHive Collection</p>
              <h2>Fresh styles for every step.</h2>
              <p>
                Premium shoes and sandals with account login, cart persistence,
                order checkout, payment workflow, and invoice email support.
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
            <button onClick={() => setActivePage("shoes")}>View Collection</button>
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
              <p>Sneakers, loafers, boots, running, training, and formal styles.</p>
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
              <p>Slides, leather sandals, and casual sandals.</p>
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

          {!currentUser && (
            <p className="warning">Please login to save cart and place orders.</p>
          )}

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
                  <p>Invoice email: {currentUser?.email || "Login required"}</p>
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
                <h3>Order #{order.id}</h3>
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
          <h2>{currentUser ? "My Account" : "Login / Signup"}</h2>

          {currentUser ? (
            <div className="profile-card">
              <div className="avatar">SK</div>
              <div>
                <h3>{currentUser.name}</h3>
                <p>{currentUser.email}</p>
                <p>Orders in this session: {orders.length}</p>
                <button className="danger" onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <>
              <div className="auth-tabs">
                <button className={authMode === "login" ? "active-filter" : ""} onClick={() => setAuthMode("login")}>Login</button>
                <button className={authMode === "signup" ? "active-filter" : ""} onClick={() => setAuthMode("signup")}>Signup</button>
              </div>

              <div className="signup-form">
                {authMode === "signup" && (
                  <input
                    placeholder="Full name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  />
                )}

                <input
                  placeholder="Email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />

                <input
                  placeholder="Password"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />

                <button onClick={authMode === "login" ? login : createAccount}>
                  {authMode === "login" ? "Login" : "Create Account"}
                </button>
              </div>

              {authMessage && <p className="message">{authMessage}</p>}
            </>
          )}
        </section>
      )}

      {activePage === "services" && (
        <section className="panel status-page">
          <div className="status-header">
            <div>
              <h2>System Health</h2>
              <p>Live microservices status across SneakHive platform.</p>
            </div>
            <button onClick={checkServices}>Refresh Status</button>
          </div>

          <div className="service-dashboard">
            {Object.entries(status).map(([name, value]) => (
              <div className={isOnline(value) ? "service-card healthy" : "service-card unhealthy"} key={name}>
                <div className="service-top">
                  <div className="pulse"></div>
                  <span>{isOnline(value) ? "Healthy" : "Offline"}</span>
                </div>
                <h3>{name.toUpperCase()} SERVICE</h3>
                <p>{value}</p>
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