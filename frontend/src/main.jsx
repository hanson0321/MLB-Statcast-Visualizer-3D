// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// 我們不再需要 ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 直接渲染 App，不再有 ThemeProvider 包裹 */}
    <App />
  </React.StrictMode>,
)
