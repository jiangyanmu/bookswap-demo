// src/components/Login.js
import React, { useState } from "react";
import { FEATURES } from "../config/featureFlags";
// 移除 Firebase import，改成 Mock
import { mockGoogleLogin } from "../services/mockAuth";

const Login = () => {
  const [user, setUser] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      // 使用模擬登入
      const fakeUser = await mockGoogleLogin();
      setUser(fakeUser);
      alert(`登入成功！歡迎, ${fakeUser.displayName}\n(這是模擬的 SSO 流程)`);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        borderBottom: "1px solid #eee",
      }}
    >
      <h1>BookSwap Login</h1>

      {user ? (
        // 登入後顯示歡迎訊息
        <div style={{ color: "green" }}>
          <h3>✅ 已登入: {user.displayName}</h3>
          <p>Secure Token: {user.token.substring(0, 10)}...</p>
        </div>
      ) : (
        // 登入前顯示按鈕
        <>
          {FEATURES.ENABLE_GOOGLE_SSO ? (
            // Feature ON: Google SSO
            <div>
              <p style={{ color: "green" }}>
                Testing Hypothesis: SSO Increases Conversion
              </p>
              <button
                onClick={handleGoogleLogin}
                style={{
                  padding: "10px 20px",
                  background: "#4285F4",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                G | Sign in with Google (Mock)
              </button>
            </div>
          ) : (
            // Feature OFF: 傳統表單
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxWidth: "300px",
                margin: "0 auto",
              }}
            >
              <p style={{ color: "gray" }}>Control Group: Traditional Form</p>
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button>Login</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Login;
