// src/components/BookDetail.js
import React from "react";
import { FEATURES } from "../config/featureFlags";

const BookDetail = () => {
  const book = { title: "Introduction to Algorithms", price: 1000 };
  const discountPrice = book.price * 0.8;

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        borderTop: "2px solid #eee",
      }}
    >
      <h2>{book.title}</h2>
      <p>Original Price: ${book.price}</p>

      {/* === Feature Toggle 邏輯 === */}
      {FEATURES.ENABLE_SMART_BIDDING ? (
        // 新功能：智慧出價
        <div>
          <p style={{ color: "green" }}>
            Testing Hypothesis: Quick Bid Reduces Friction
          </p>
          <button
            style={{
              padding: "15px",
              background: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ⚡ One-Click Bid: ${discountPrice} (20% OFF)
          </button>
        </div>
      ) : (
        // 舊功能：聯絡賣家
        <div>
          <p style={{ color: "gray" }}>Control Group: Manual Contact</p>
          <button>Contact Seller to Negotiate</button>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
