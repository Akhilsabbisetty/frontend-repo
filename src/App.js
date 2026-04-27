import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [users, setUsers] = useState("");
  const [inventory, setInventory] = useState("");
  const [order, setOrder] = useState("");

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_USER_API}/users`)
      .then(res => setUsers(JSON.stringify(res.data)))
      .catch(() => setUsers("Error connecting"));

    axios.get(`${process.env.REACT_APP_INVENTORY_API}/inventory`)
      .then(res => setInventory(JSON.stringify(res.data)))
      .catch(() => setInventory("Error connecting"));
  }, []);

  const orderNow = () => {
    axios.post(`${process.env.REACT_APP_ORDER_API}/orders`)
      .then(res => setOrder(JSON.stringify(res.data)))
      .catch(() => setOrder("Order failed"));
  };

  return (
    <div className="container">

      <h1>👟 Shoe Store</h1>

      <div className="card">
        <h2>User Service</h2>
        <p>{users}</p>
      </div>

      <div className="card">
        <h2>Inventory</h2>
        <p>{inventory}</p>
      </div>

      <div className="card">
        <h2>Buy Shoes</h2>
        <button onClick={orderNow}>Place Order</button>
        <p>{order}</p>
      </div>

    </div>
  );
}

export default App;