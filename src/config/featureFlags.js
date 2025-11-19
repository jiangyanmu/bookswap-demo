// src/config/featureFlags.js

// 這裡模擬從 Server 或環境變數讀取設定
// 在真實作業中，你可以手動改這裡的 true/false 來截圖 "Before" 和 "After"
export const FEATURES = {
  // Feature 1: Google 一鍵登入
  // 如果 false -> 顯示傳統帳號密碼框
  // 如果 true  -> 顯示 Google 登入按鈕
  ENABLE_GOOGLE_SSO: true,

  // Feature 2: 一鍵出價 8 折
  // 如果 false -> 顯示普通 "聯絡賣家"
  // 如果 true  -> 顯示 "一鍵出價 (8折)"
  ENABLE_SMART_BIDDING: true
};