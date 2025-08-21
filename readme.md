# ⚾ Statcast Visualizer 3D - An MLB Pitcher vs. Batter Analysis Tool

**Every Pitch Tells a Story. Let's Visualize It.**

This is a professional-grade, data-driven, full-stack web application designed to transform complex MLB Statcast data into an intuitive, insightful, and interactive visual analysis report.

The core feature of this project is the **3D Pitch Trajectory Visualizer**, built with `React Three Fiber (Three.js)`, which delivers a broadcast-quality experience, allowing users to analyze every pitch from any conceivable angle.

🚀 **Live Demo:** [**Click Here to Experience It!**](https://mlb-statcast-visualizer-3d.vercel.app/)

---

## ✨ Key Features

### 1. 📊 Live Leaderboards
The homepage automatically loads and displays the "Weekly Leaders," featuring key metrics like fastest pitch, hardest-hit ball, and most strikeouts, offering a real-time snapshot of top performers in the league.
* **Technical Highlight**: The backend fetches and caches data periodically using `pybaseball`; the frontend renders dynamic and engaging visuals with `React` and `Framer Motion`.

![Leaderboard Demo GIF](https://i.imgur.com/your-leaderboard-demo.gif)

### 2. 🧠 In-Depth Matchup Analysis Dashboard
Enter any pitcher and batter to unlock a comprehensive analysis dashboard, providing multi-dimensional insights into their head-to-head encounters.

| Feature Demo | Description |
| :---: | :--- |
| ![Radar Chart Demo GIF](https://i.imgur.com/your-radar-chart-demo.gif) | **Player Radar Chart**<br>Visually compares a player's advanced metrics (e.g., K/9, SLG, OPS) against the league average (PR50), making it easy to understand a player's style, strengths, and weaknesses at a glance. |
| ![Pitch Arsenal Demo GIF](https://i.imgur.com/your-arsenal-demo.gif) | **Pitch Arsenal & Movement Plot**<br>Details the usage rate, average velocity, spin rate, and movement for each of the pitcher's pitches. This is complemented by a professional pitch movement scatter plot created with `recharts`, clearly illustrating the characteristics of their arsenal. |
| ![Timeline Demo GIF](https://i.imgur.com/your-timeline-demo.gif) | **At-Bat Timeline**<br>Turns raw data into a compelling narrative. An interactive timeline meticulously reconstructs every pitch of past encounters between the two players, showing pitch type, velocity, and the final outcome to reveal the evolution of their matchups. |

### 🚀 Showcase Feature: Interactive 3D Pitch Trajectory
The standout feature of this project is the interactive 3D pitch trajectory simulator built with `React Three Fiber`.

* ✅ **Dynamic Camera Control**: Users can freely rotate, zoom, and pan the camera to view pitches from the catcher's, batter's, or an overhead perspective.
* 🎨 **Rich Visual Legend**: A clear color-coded legend allows for easy identification of different pitch types (`FF`, `SL`, `CU`, etc.).
* MPH **Instant Velocity Feedback**: Hovering over the pitch's endpoint on the trajectory reveals its real-time velocity.
* 🧊 **Accurate Strike Zone**: A 3D strike zone is dynamically generated based on the batter's average height data, enabling precise evaluation of each pitch's location as it crosses the plate.

![3D Trajectory Interaction GIF](https://i.imgur.com/your-3d-trajectory-demo.gif)

---

## 🛠️ Tech Stack

<details>
<summary><strong>Click to Expand Technical Details</strong></summary>

### Backend
* **Python & FastAPI**: Chosen for its high-performance asynchronous (`async`) capabilities, effortlessly handling large data requests from `pybaseball`. FastAPI's automatic data validation with `pydantic` ensures API stability and reliability.
* **Pandas**: The core tool for complex data cleaning, transformation, aggregation, and calculation—essential for any serious sports analytics project.
* **Pybaseball**: A powerful Python library that serves as an API wrapper for professional data sources like `Baseball Savant` and `FanGraphs`, providing real-time, accurate data.
* **Uvicorn**: A lightning-fast ASGI server, perfectly suited for FastAPI.
* **LRU Cache**: Implemented via the `@lru_cache` decorator to memoize responses for frequently requested, non-volatile data (like league-wide stats), significantly improving response times for recurring queries.

### Frontend
* **React & Vite**: Vite was chosen for its blazing-fast development server and Hot Module Replacement (HMR). The application is built as a high-performance Single Page Application (SPA) using React Hooks for state management.
* **Three.js (@react-three/fiber & drei)**: `@react-three/fiber` makes working with 3D scenes in React declarative and component-based. Combined with the extensive helpers from `drei`, it dramatically simplifies the complexity of 3D development, enabling the project's core visualization feature.
* **Tailwind CSS & shadcn/ui**: A utility-first CSS framework for rapidly building modern, responsive, and aesthetically pleasing user interfaces. `shadcn/ui` provides a set of unstyled, accessible components to ensure design consistency and maintainability.
* **Recharts**: A composable charting library used to create interactive 2D charts, such as radar and bar charts, for data visualization.
* **Framer Motion**: Used to add fluid animations and transitions to UI elements, enhancing the overall user experience.

</details>

---

## 🚀 Setup and Run

### **1. Backend**
```bash
# Navigate to the backend directory
cd backend

# (Recommended) Create and activate a Conda environment
conda create --name statcast3d python=3.10
conda activate statcast3d

# Install the required packages
pip install -r requirements.txt

# Start the backend server (will run on [http://127.0.0.1:8000](http://127.0.0.1:8000))
uvicorn main:app --reload