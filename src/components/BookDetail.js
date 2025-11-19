// src/components/BookDetail.js
import React from 'react';
import { FEATURES } from '../config/featureFlags';

const BookDetail = ({ book }) => {
  const originalPrice = 500; // 假設原價
  const discountPrice = originalPrice * 0.8; // 8折邏輯

  return (
    <div style={{ padding: '20px', marginTop: '20px', border: '1px solid #ccc' }}>
      <h3>{book.title}</h3>
      <p>售價: ${originalPrice}</p>

      {/* Feature Toggle Logic */}
      {FEATURES.ENABLE_SMART_BIDDING ? (
        // --- 版本 B: 智慧出價 (New Feature) ---
        <button style={{ backgroundColor: 'green', color: 'white', padding: '10px' }}>
           ⚡ 一鍵出價 ${discountPrice} (8折)
        </button>
      ) : (
        // --- 版本 A: 普通聯絡 (Old Way) ---
        <button>
           聯絡賣家議價
        </button>
      )}
    </div>
  );
};

export default BookDetail;