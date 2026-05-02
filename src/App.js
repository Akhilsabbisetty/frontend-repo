import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const shoes = [
  {
    name: "Nike Air Max",
    price: "$120.00",
    stock: 25,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
  },
  {
    name: "Adidas Ultraboost",
    price: "$140.00",
    stock: 30,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500"
  },
  {
    name: "Puma Runner",
    price: "$90.00",
    stock: 18,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"
  },
  {
    name: "Classic High Top",
    price: "$70.00",
    stock: 40,
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500"
  }
];

function App() {
  const [userStatus, setUserStatus] = useState("Checking...");
  const [inventoryStatus, setInventoryStatus] = useState("Checking...");
  const [paymentStatus, setPaymentStatus] = useState("Checking...");
  const [notificationStatus, setNotificationStatus] = useState("Checking...");
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_USER_API}/users`)
      .then((res) => setUserStatus(res.data.status || JSON.stringify(res.data)))
      .catch(() => setUserStatus("offline"));

    axios
      .get(`${process.env.REACT_APP_INVENTORY_API}/inventory`)
      .then((res) => setInventoryStatus(res.data.stock || JSON.stringify(res.data)))
      .catch(() => setInventoryStatus("unavailable"));

    axios
      .get(`${process.env.REACT_APP_PAYMENT_API}/payment`)
      .then((res) => setPaymentStatus(res.data))
      .catch(() => setPaymentStatus("offline"));

    axios
      .get(`${process.env.REACT_APP_NOTIFICATION_API}/notification`)
      .then((res) => setNotificationStatus(res.data))
      .catch(() => setNotificationStatus("offline"));
  }, []);

  const placeOrder = () => {
    setOrderStatus("Placing order...");

    axios
      .post(`${process.env.REACT_APP_ORDER_API}/orders`)
      .then((res) => setOrderStatus(res.data.status || JSON.stringify(res.data)))
      .catch(() => setOrderStatus("order failed"));
  };

  return (
    <div className="page">
      <nav className="navbar">
        <div className="logo">👟 Shoe Store</div>

        <div className="navlinks">
          <span>Home</span>
          <span>Shoes</span>
          <span>Orders</span>
          <span>Profile</span>
        </div>

        <div className="cart">
          🛒 Cart <span>0</span>
        </div>
      </nav>

      <section className="hero">
        <div>
          <h1>Step into Style</h1>
          <p>Discover the best collection of shoes for every journey.</p>
          <button>Shop Now</button>
        </div>

        <img
          src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700"
          alt="shoe"
        />
      </section>

      <section className="status-grid">
        <div className="status-card">
          <div className="icon blue">👤</div>
          <div>
            <h3>
              User Service <span>{userStatus === "offline" ? "Offline" : "Online"}</span>
            </h3>
            <p>Status: {userStatus}</p>
          </div>
        </div>

        <div className="status-card">
          <div className="icon green">📦</div>
          <div>
            <h3>
              Inventory Service{" "}
              <span>{inventoryStatus === "unavailable" ? "Offline" : "Online"}</span>
            </h3>
            <p>Live stock: {inventoryStatus}</p>
          </div>
        </div>

        <div className="status-card">
          <div className="icon purple">🛒</div>
          <div>
            <h3>
              Order Service <span>Online</span>
            </h3>
            <p>Place and track your orders</p>
          </div>
        </div>

        <div className="status-card">
          <div className="icon yellow">💳</div>
          <div>
            <h3>
              Payment Service{" "}
              <span>{paymentStatus === "offline" ? "Offline" : "Online"}</span>
            </h3>
            <p>{paymentStatus}</p>
          </div>
        </div>

        <div className="status-card">
          <div className="icon orange">🔔</div>
          <div>
            <h3>
              Notification Service{" "}
              <span>{notificationStatus === "offline" ? "Offline" : "Online"}</span>
            </h3>
            <p>{notificationStatus}</p>
          </div>
        </div>
      </section>

      <h2 className="section-title">Featured Shoes</h2>

      <section className="products">
        {shoes.map((shoe, index) => (
          <div className="product-card" key={index}>
            <img src={shoe.image} alt={shoe.name} />

            <div className="product-info">
              <h3>{shoe.name}</h3>
              <p>{shoe.price}</p>
              <span>Stock: {shoe.stock}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="checkout">
        <div>
          <h3>Ready to buy?</h3>
          <p>Place your order and we’ll deliver to your doorstep.</p>
          {orderStatus && <strong>{orderStatus}</strong>}
        </div>

        <button onClick={placeOrder}>Place Order</button>
      </section>

      <footer>© 2026 Shoe Store. All rights reserved.</footer>
    </div>
  );
}

export default App;