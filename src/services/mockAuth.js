// src/services/mockAuth.js

// 這是模擬的 Google 登入服務
// 它會等待 1 秒鐘，然後回傳一個成功的「假使用者資料」
export const mockGoogleLogin = () => {
  return new Promise((resolve) => {
    console.log("正在連線到模擬的 Identity Provider...");

    setTimeout(() => {
      // 模擬成功登入後回傳的 Token 與資料
      resolve({
        uid: "user_12345",
        displayName: "Demo Student",
        email: "student@university.edu",
        token: "mock-secure-jwt-token-xyz"
      });
    }, 800); // 延遲 0.8 秒模擬網路請求
  });
};