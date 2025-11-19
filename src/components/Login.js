// src/components/Login.js
import React from 'react';
import { FEATURES } from '../config/featureFlags';

const Login = () => {
  // 模擬登入函式
  const handleGoogleLogin = () => {
    console.log("呼叫 Firebase Google Auth...");
    // 這裡未來接 Firebase/Supabase
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>歡迎來到 BookSwap</h2>

      {/* Feature Toggle Logic */}
      {FEATURES.ENABLE_GOOGLE_SSO ? (
        // --- 版本 B: Google 一鍵登入 (New Feature) ---
        <div>
          <p className="highlight">✨ 新功能：一鍵登入，無需註冊！</p>
          <button
            onClick={handleGoogleLogin}
            style={{ backgroundColor: '#4285F4', color: 'white', padding: '10px' }}
          >
            Login with Google
          </button>
        </div>
      ) : (
        // --- 版本 A: 傳統表單 (Old Way) ---
        <form>
          <input type="text" placeholder="Email" /><br/>
          <input type="password" placeholder="Password" /><br/>
          <button type="submit">註冊 / 登入</button>
        </form>
      )}
    </div>
  );
};

export default Login;