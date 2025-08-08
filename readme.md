⚾ 投手對戰優勢分析儀 (Pitcher vs. Batter Analytics)
這是一個專業級、數據驅動的全端網站應用程式，旨在將複雜的 MLB 投打對決數據，轉化為直觀、易懂且富有洞察力的視覺化分析報告。使用者可以輸入任意兩位球員，深入探索他們之間的對戰歷史、本賽季表現，以及各項高階數據。

Live Demo 部署連結 (<- 部署後請將此處替換成您的網站連結)

✨ 功能亮點 (Features)
📊 即時排行榜: 自動抓取並呈現「近一週數據之最」，包含最速球、最遠全壘打等 9 項有趣的數據。

🧠 深度對戰分析:

賽季數據 (Tale of the Tape) 與 生涯對戰 (H2H) 的完整呈現。

能力值雷達圖 (Radar Chart)，將球員能力與聯盟平均進行視覺化對比。

投手武器庫 (Pitch Arsenal) 與專業的球路位移熱圖。

對決時序 (At-Bat Timeline)，還原每一次投打對決的詳細過程。

🚀 頂級視覺化:

2D 圖表：包含好球帶分析圖與擊球落點分佈圖。

互動式 3D 投球軌跡：專案的終極亮點！一個媲美 Statcast 的 3D 場景，包含：

可自由旋轉、縮放的互動視角。

風格化的投手與打者模型。

清晰的球路顏色圖例。

滑鼠懸停時顯示即時球速。

📸 專案截圖 (Screenshots)
(請在此處放入您精心挑選的 2-3 張專案截圖)

主分析介面

能力值雷達圖

互動式 3D 投球軌跡 (GIF 動圖)
(強烈建議您錄製一段操作 3D 場景的 GIF 動圖，這是最大的亮點！)
![3D 軌跡互動 GIF](https://[請替換成您的 GIF 連結])

🛠️ 技術棧 (Tech Stack)
後端 (Backend)

前端 (Frontend)

數據來源 (Data Source)

pybaseball (Baseball Savant, FanGraphs)

🚀 安裝與啟動 (Setup and Run)
1. 後端 (Backend)

# 切換到 backend 資料夾
cd backend

# (建議) 建立並啟動 Conda 環境
conda create --name pvb_env python=3.10
conda activate pvb_env

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
