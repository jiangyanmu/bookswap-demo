// src/App.js
import React from "react";
import Login from "./components/Login";
import BookDetail from "./components/BookDetail";

function App() {
  return (
    <div className="App">
      <header
        style={{
          background: "#282c34",
          padding: "20px",
          color: "white",
          textAlign: "center",
        }}
      >
        <h2>BookSwap DevSecOps Demo</h2>
        <p>Role: Developer</p>
      </header>

      <main>
        {/* 展示兩個功能區域 */}
        <Login />
        <BookDetail />
      </main>
    </div>
  );
}

export default App;
