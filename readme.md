⚾ Statcast Visualizer 3D - 投手對戰優勢分析儀
Every Pitch Tells a Story. Let's Visualize It.
這是一個專業級、數據驅動的全端網站應用程式，旨在將複雜的 MLB 投打對決數據，轉化為直觀、易懂且富有洞察力的視覺化分析報告。本專案透過 pybaseball 函式庫即時抓取 Statcast 數據，並利用 Three.js 打造出媲美官方水準的互動式 3D 投球軌跡。

🚀 Live Demo - 點此體驗！ (<- 部署後請將此處替換成您的網站連結)

✨ 核心功能展示 (Feature Demos)
1. 📊 即時數據排行榜 (Live Leaderboards)
網站首頁會自動載入並呈現「近一週數據之最」，包含最速球、最遠全壘打、最多安打等 9 項有趣的數據，成功地吸引了使用者的目光。

![排行榜 Demo GIF](https://[請替換成您的排行榜 GIF 連結])

2. 🧠 深度對戰分析 (In-Depth Matchup Analysis)
輸入任意兩位球員，即可解鎖完整的對戰分析儀表板。

功能

Demo 預覽

說明

能力值雷達圖

![雷達圖 Demo GIF](https://[請替換成您的雷達圖 GIF 連結])

將球員的各項能力與聯盟平均進行視覺化對比，一目了然地看出球員的風格與強弱項。

投手武器庫

![投手武器庫 Demo GIF](https://[請替換成您的武器庫 GIF 連結])

詳細列出投手每種球路的使用率、球速、轉速與位移，並搭配專業的球路位移熱圖。

對決時序

![對決時序 Demo GIF](https://[請替換成您的時序圖 GIF 連結])

將數據故事化！用一個時間軸，詳細還原他們過去每一次對決中，每一球的詳細過程。

🚀 專案亮點：互動式 3D 投球軌跡
本專案最大的亮點，是使用 React Three Fiber 打造的互動式 3D 投球軌跡。使用者可以：

✅ 自由旋轉、縮放和平移視角。

✅ 透過顏色圖例，辨識每一球的球種。

✅ 將滑鼠懸停在軌跡上，查看該球的即時球速。

✅ 透過風格化的球員模型與背號，獲得極佳的沉浸感。

![3D 軌跡互動 GIF](https://[請替換成您的 3D 軌跡 GIF 連結])

🛠️ 技術棧 (Tech Stack)
<details>
<summary>點此展開詳細技術說明</summary>

後端 (Backend):

Python & FastAPI: 選擇 FastAPI 是因為其高效能的非同步特性，能輕鬆處理來自 pybaseball 的大量數據請求。

Pandas: 用於進行複雜的數據清理、整合與計算，是處理運動數據的絕佳利器。

Uvicorn: 作為 ASGI 伺服器，完美搭配 FastAPI。

前端 (Frontend):

React & Vite: 選擇 Vite 是為了其極速的開發體驗與熱模組替換 (HMR) 功能。

Three.js (@react-three/fiber): 選擇 @react-three/fiber 讓在 React 中操作 3D 場景變得極度聲明式與元件化，大幅簡化了 3D 開發的複雜度。

Tailwind CSS & shadcn/ui: 提供功能優先的原子化 CSS，能快速打造出現代、美觀且一致的使用者介面。

數據來源 (Data Source):

pybaseball: 一個強大的 Python 套件，作為 Baseball Savant 和 FanGraphs 等專業數據網站的 API 接口。

</details>

🚀 安裝與啟動 (Setup and Run)
1. 後端 (Backend)

# 切換到 backend 資料夾
cd backend
# 啟動 Conda 環境
conda activate pvb_final
# 安裝必要的套件
pip install -r requirements.txt
# 啟動後端伺服器
uvicorn main:app --reload

2. 前端 (Frontend)

# 切換到 frontend 資料夾
cd frontend
# 安裝依賴
npm install
# 啟動前端開發伺服器
npm run dev
