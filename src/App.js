// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import BookList from "./components/BookList";
import BookDetail from "./components/BookDetail";
import Login from "./components/Login";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  // 定義導航按鈕樣式
  // Active: 模仿 Dashboard 的選中狀態 (藍色背景)
  // Default: 深色背景上的淺灰文字，Hover 時變亮
  const navLinkClasses = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <Router>
      {/* 背景改為 Slate-50，更接近 Dashboard 的冷色調背景 */}
      <div className="App bg-slate-50 min-h-screen flex flex-col font-sans text-slate-900">
        {/* Header: 改為深色 (Slate-900) 以符合圖片上方的深色 Bar */}
        <header className="bg-slate-900 shadow-lg border-b border-slate-700 sticky top-0 z-50">
          <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
            {/* Logo 區域：加入副標題，模仿圖片中的文字層次 */}
            <div className="flex flex-col">
              <NavLink
                to="/"
                className="text-2xl font-bold text-white tracking-wide hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                BookSwap{" "}
                <span className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                  SRE
                </span>
              </NavLink>
              <span className="text-xs text-slate-400 mt-0.5 tracking-wider">
                即時監控與混沌工程驗證 (Live Monitoring & Chaos Validation)
              </span>
            </div>

            {/* 導航連結 */}
            <div className="flex items-center space-x-3">
              <NavLink to="/" className={navLinkClasses}>
                Dashboard
              </NavLink>
              <NavLink to="/login" className={navLinkClasses}>
                Login
              </NavLink>
            </div>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="container mx-auto px-6 py-8 flex-grow">
          {/* 這裡建議你的子組件 (BookList 等) 也要使用 bg-white, rounded-lg, shadow-sm 來維持卡片風格 */}
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/books/:id" element={<BookDetail />} />
            </Routes>
          </ErrorBoundary>
        </main>

        {/* Footer: 保持簡潔，使用白色背景與上方內容區隔 */}
        <footer className="bg-white border-t border-slate-200 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto px-6 py-6 text-center">
            <p className="text-slate-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} BookSwap. All Rights Reserved.
            </p>
            <div className="mt-2 flex justify-center items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-xs text-slate-400">System Healthy</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
