import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import config from "../configs/envManager";

export default function PayPalCheckout() {
  const [amount, setAmount] = useState("10.00");
  const [status, setStatus] = useState(null);

  const API_BASE = "http://localhost:8040/api/payment";

  const initialOptions = {
    clientId: config.paypal_client_id,
    currency: "CAD",
  };

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
      <h2>💳 Pay with PayPal</h2>
      <p>Enter amount and click Pay Now:</p>

      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          width: "200px",
          padding: "10px",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      />

      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "pill", label: "paypal" }}
          createOrder={async () => {
            try {
              const res = await axios.post(`${API_BASE}/create`, { amount });
              console.log("Created order:", res.data);
              return res.data.orderId; // must return orderId
            } catch (err) {
              console.error("Error creating order:", err);
              setStatus("❌ Failed to create order");
              throw err;
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const res = await axios.post(`${API_BASE}/capture`, {
                orderId: data.orderID,
              });
              console.log("Captured order:", res.data);
              setStatus("✅ Payment successful!");
            } catch (err) {
              console.error("Error capturing order:", err);
              setStatus("❌ Payment failed");
            }
          }}
          onCancel={() => setStatus("⚠️ Payment cancelled")}
          onError={(err) => {
            console.error("PayPal error:", err);
            setStatus("❌ Something went wrong with PayPal");
          }}
        />
      </PayPalScriptProvider>

      {status && (
        <p
          style={{
            marginTop: "30px",
            fontWeight: "bold",
            color: status.includes("✅") ? "green" : "crimson",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
