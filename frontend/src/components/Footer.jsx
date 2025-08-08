// frontend/src/components/Footer.jsx

import React from "react";
// 【最終修正】改用 @ 別名代表 src 資料夾，這是最穩定的路徑寫法
import hansonPhoto from "/Users/yuheng/Desktop/pvb-analyzer/frontend/src/assets/hanosn.jpg"; 

export function Footer() {
  return (
    <footer className="w-full mt-16 py-8 flex justify-center items-center border-t border-slate-800">
      <div className="flex items-center gap-4">
        <img 
          src={hansonPhoto} 
          alt="Hanson" 
          className="w-12 h-12 rounded-full object-cover" 
          // 加入一個錯誤處理，以防圖片真的遺失
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/48x48/1e293b/e2e8f0?text=H'; }}
        />
        <div>
          <p className="text-white font-semibold">Hanson</p>
          <p className="text-sm text-slate-400">數據分析與網站開發</p>
        </div>
      </div>
    </footer>
  );
}