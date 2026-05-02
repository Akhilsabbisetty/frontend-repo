import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const products = [
  {
    id: 1,
    name: "Nike Air Max Pulse",
    brand: "Nike",
    price: 120,
    stock: 25,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    category: "Running"
  },
  {
    id: 2,
    name: "Adidas Ultraboost Cloud",
    brand: "Adidas",
    price: 140,
    stock: 30,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
    category: "Lifestyle"
  },
  {
    id: 3,
    name: "Puma Runner Pro",
    brand: "Puma",
    price: 90,
    stock: 18,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
    category: "Training"
  },
  {
    id: 4,
    name: "Classic High Top",
    brand: "Converse",
    price: 70,
    stock: 40,
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600",
    category: "Classic"
  },
  {
    id: 5,
    name: "Urban Street Runner",
    brand: "SneakHive",
    price: 110,
    stock: 32,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600",
    category: "Streetwear"
  },
  {
    id: 6,
    name: "White Flex Trainer",
    brand: "SneakHive",
    price: 95,
    stock: 21,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600",
    category: "Gym"
  },
  {
    id: 7,
    name: "Black Motion Sneaker",
    brand: "SneakHive",
    price: 105,
    stock: 16,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600",
    category: "Sports"
  },
  {
    id: 8,
    name: "Premium Leather Low",
    brand: "SneakHive",
    price: 150,
    stock: 14,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600",
    category: "Premium"
  }
];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [email, setEmail] = useState("customer@example.com");
  const [orderMessage, setOrderMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [invoiceMessage, setInvoiceMessage] = useState("");

  const [status, setStatus] = useState({
    user: "Checking...",
    inventory: "Checking...",
    order: "Ready",
    payment: "Checking...",
    notification: "Checking..."
  });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_USER_API}/users`)
      .then((res) => setStatus((s) => ({ ...s, user: res.data.status || "running" })))
      .catch(() => setStatus((s) => ({ ...s, user: "offline" })));

    axios.get(`${process.env.REACT_APP_INVENTORY_API}/inventory`)
      .then((res) => setStatus((s) => ({ ...s, inventory: `Stock ${res.data.stock || "available"}` })))
      .catch(() => setStatus((s) => ({ ...s, inventory: "offline" })));

    axios.get(`${process.env.REACT_APP_PAYMENT_API}/payment`)
      .then((res) => setStatus((s) => ({ ...s, payment: res.data.status || "running" })))
      .catch(() => setStatus((s) => ({ ...s, payment: "offline" })));

    axios.get(`${process.env.REACT_APP_NOTIFICATION_API}/notification`)
      .then((res) => setStatus((s) => ({ ...s, notification: res.data.status || "running" })))
      .catch(() => setStatus((s) => ({ ...s, notification: "offline" })));
  }, []);

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

  const placeOrder = async () => {
    setOrderMessage("Creating order...");
    setPaymentMessage("");
    setInvoiceMessage("");

    try {
      const orderResponse = await axios.post(`${process.env.REACT_APP_ORDER_API}/orders`, {
        items: cart,
        total: cartTotal
      });

      const orderId = `ORD-${Date.now()}`;
      setOrderMessage(orderResponse.data.status || "order placed");

      const paymentResponse = await axios.post(`${process.env.REACT_APP_PAYMENT_API}/payment/pay`, {
        orderId,
        amount: cartTotal,
        mode: "DEMO"
      });

      setPaymentMessage(paymentResponse.data.message || "Demo payment completed");

      const invoiceResponse = await axios.post(`${process.env.REACT_APP_NOTIFICATION_API}/notification/invoice`, {
        orderId,
        email,
        amount: cartTotal,
        items: cart
      });

      setInvoiceMessage(invoiceResponse.data.message || `Invoice sent to ${email}`);

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
      setActivePage("orders");
    } catch (error) {
      setOrderMessage("Order/payment/invoice failed. Please check backend service logs.");
    }
  };

  const statusBadge = (value) => {
    const offline = String(value).toLowerCase().includes("offline");
    return <span className={offline ? "badge offline" : "badge online"}>{offline ? "Offline" : "Online"}</span>;
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand" onClick={() => setActivePage("home")}>
          <span className="brand-icon">⬢</span>
          <div>
            <h1>Sneak<span>Hive</span></h1>
            <p>Premium Sneaker Collective</p>
          </div>
        </div>

        <div className="navlinks">
          <button className={activePage === "home" ? "active" : ""} onClick={() => setActivePage("home")}>Home</button>
          <button className={activePage === "products" ? "active" : ""} onClick={() => setActivePage("products")}>Products</button>
          <button className={activePage === "orders" ? "active" : ""} onClick={() => setActivePage("orders")}>Orders</button>
          <button className={activePage === "profile" ? "active" : ""} onClick={() => setActivePage("profile")}>Profile</button>
        </div>

        <button className="cart-button" onClick={() => setActivePage("cart")}>
          🛒 Cart <span>{cart.reduce((sum, item) => sum + item.qty, 0)}</span>
        </button>
      </nav>

      {activePage === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <p className="eyebrow">New season drop</p>
              <h2>Step bold. Move smart. Rule the street.</h2>
              <p>
                Discover curated sneakers with real-time inventory, demo order flow,
                payment simulation, and invoice notifications powered by your microservices.
              </p>
              <div className="hero-actions">
                <button onClick={() => setActivePage("products")}>Explore Collection</button>
                <button className="secondary" onClick={() => setActivePage("orders")}>View Orders</button>
              </div>
            </div>
            <div className="hero-card">
              <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800" alt="Sneaker" />
            </div>
          </section>

          <section className="status-grid">
            <div className="status-card">
              <div className="icon blue">👤</div>
              <div>
                <h3>User Service {statusBadge(status.user)}</h3>
                <p>{status.user}</p>
              </div>
            </div>

            <div className="status-card">
              <div className="icon green">📦</div>
              <div>
                <h3>Inventory Service {statusBadge(status.inventory)}</h3>
                <p>{status.inventory}</p>
              </div>
            </div>

            <div className="status-card">
              <div className="icon purple">🛒</div>
              <div>
                <h3>Order Service {statusBadge(status.order)}</h3>
                <p>Create demo orders</p>
              </div>
            </div>

            <div className="status-card">
              <div className="icon yellow">💳</div>
              <div>
                <h3>Payment Service {statusBadge(status.payment)}</h3>
                <p>{status.payment}</p>
              </div>
            </div>

            <div className="status-card">
              <div className="icon orange">🔔</div>
              <div>
                <h3>Notification Service {statusBadge(status.notification)}</h3>
                <p>{status.notification}</p>
              </div>
            </div>
          </section>

          <div className="section-header">
            <h2>Featured Sneakers</h2>
            <button onClick={() => setActivePage("products")}>View All</button>
          </div>

          <section className="products">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </section>
        </>
      )}

      {activePage === "products" && (
        <>
          <div className="section-header">
            <h2>All SneakHive Products</h2>
            <p>{products.length} curated shoes available</p>
          </div>
          <section className="products">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </section>
        </>
      )}

      {activePage === "cart" && (
        <section className="panel">
          <h2>Your Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty. Add sneakers from Products.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>Qty: {item.qty} × ${item.price}</p>
                  </div>
                  <strong>${item.qty * item.price}</strong>
                  <button className="danger" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              ))}

              <div className="checkout-box">
                <div>
                  <h3>Total: ${cartTotal}</h3>
                  <p>Demo payment only. No real money will be charged.</p>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Invoice email" />
                  {orderMessage && <p className="message">{orderMessage}</p>}
                  {paymentMessage && <p className="message success">{paymentMessage}</p>}
                  {invoiceMessage && <p className="message success">{invoiceMessage}</p>}
                </div>
                <button onClick={placeOrder}>Pay Demo & Send Invoice</button>
              </div>
            </>
          )}
        </section>
      )}

      {activePage === "orders" && (
        <section className="panel">
          <h2>Orders</h2>
          {orders.length === 0 ? (
            <p>No orders yet. Place a demo order from the cart.</p>
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
          <h2>Profile</h2>
          <div className="profile-card">
            <div className="avatar">A</div>
            <div>
              <h3>Akhil’s SneakHive Account</h3>
              <p>Email: {email}</p>
              <p>Membership: Demo Premium</p>
              <p>Orders placed in this session: {orders.length}</p>
            </div>
          </div>
        </section>
      )}

      <footer>© 2026 SneakHive. Built with React, Spring Boot, Kafka, Redis, Nexus, Jenkins, EKS and Argo CD.</footer>
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