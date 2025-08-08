// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// 引入所有需要的元件
import { PlayerAutocomplete } from './components/PlayerAutocomplete';
import { TaleOfTheTape } from './components/TaleOfTheTape';
import { PitchArsenal } from './components/PitchArsenal';
import { AtBatTimeline } from './components/AtBatTimeline';
import { OutcomeSimulator } from './components/OutcomeSimulator';
import { StrikeZonePlot } from './components/StrikeZonePlot';
import { SprayChart } from './components/SprayChart';
import { AnimatedCard } from './components/AnimatedCard';
import { PitchMovementChart } from './components/PitchMovementChart';
import { Footer } from './components/Footer';
import { PitchTrajectory3D } from './components/PitchTrajectory3D'; 
import { PlayerRadarChart } from './components/PlayerRadarChart';
import { Leaderboards } from './components/Leaderboards';

function App() {
  // 狀態管理
  const [pitcherName, setPitcherName] = useState('Shohei Ohtani');
  const [batterName, setBatterName] = useState('Aaron Judge');
  const [seasonStats, setSeasonStats] = useState({ pitcher: null, batter: null });
  const [arsenalData, setArsenalData] = useState(null);
  const [h2hStats, setH2hStats] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [pitchData, setPitchData] = useState(null);
  const [sprayData, setSprayData] = useState(null);
  const [movementData, setMovementData] = useState(null);
  const [leagueAvgMovement, setLeagueAvgMovement] = useState(null);
  const [trajectoryData, setTrajectoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // 點擊分析按鈕時觸發的函式
  const handleAnalysis = async () => {
    if (!pitcherName || !batterName) {
      setError("請選擇一位投手和一位打者。");
      return;
    }
    setLoading(true);
    setError(null);
    setIsDataLoaded(false);

    try {
      const pitcherQuery = encodeURIComponent(pitcherName);
      const batterQuery = encodeURIComponent(batterName);
      
      const responses = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/player-season-stats?player_name=${pitcherQuery}`),
        fetch(`http://127.0.0.1:8000/api/player-season-stats?player_name=${batterQuery}`),
        fetch(`http://127.0.0.1:8000/api/pitch-arsenal?pitcher=${pitcherQuery}`),
        fetch(`http://127.0.0.1:8000/api/pvb-stats?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`http://127.0.0.1:8000/api/at-bat-timeline?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`http://127.0.0.1:8000/api/outcome-simulator?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`http://127.0.0.1:8000/api/pvb-pitch-chart?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`http://127.0.0.1:8000/api/pvb-spray-chart?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`http://127.0.0.1:8000/api/pitch-movement?pitcher=${pitcherQuery}`),
        fetch(`http://127.0.0.1:8000/api/league-avg-movement`),
        fetch(`http://127.0.0.1:8000/api/3d-trajectory?pitcher=${pitcherQuery}&batter=${batterQuery}`)
      ]);

      for (const res of responses) { if (!res.ok) throw new Error("獲取數據時發生錯誤，請再試一次。"); }
      
      const [
        pitcherSeasonData, batterSeasonData, arsenalData, statsData, 
        timelineData, simulationData, pitchData, sprayData, movementData,
        leagueAvgData, trajectory3DData
      ] = await Promise.all(responses.map(res => res.json()));
      
      for (const data of [pitcherSeasonData, batterSeasonData, arsenalData, statsData, timelineData, simulationData, pitchData, sprayData, movementData, leagueAvgData, trajectory3DData]) {
        if (data && data.error) throw new Error(data.error);
      }
      
      setSeasonStats({ pitcher: pitcherSeasonData, batter: batterSeasonData });
      setArsenalData(arsenalData);
      setH2hStats(statsData);
      setTimelineData(timelineData);
      setSimulationData(simulationData);
      setPitchData(pitchData);
      setSprayData(sprayData);
      setMovementData(movementData);
      setLeagueAvgMovement(leagueAvgData);
      setTrajectoryData(trajectory3DData);
      setIsDataLoaded(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const StatDisplay = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-lg">
      <span className="text-4xl font-bold text-cyan-400">{value}</span>
      <span className="text-sm text-slate-300 mt-1">{label}</span>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-7xl flex flex-col flex-grow">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">投手 vs. 打者 分析儀</h1>
          <p className="text-slate-300 mt-2">輸入球員姓名以探索他們的對戰數據，或查看每週數據之最</p>
        </header>
        <main className="flex-grow space-y-12">
          {/* 分析對決區塊 - 移至最上方 */}
          <AnimatedCard className="bg-slate-950/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-center text-white">分析指定對決</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <PlayerAutocomplete value={pitcherName} onValueChange={setPitcherName} placeholder="搜尋投手..." />
                <span className="font-bold text-2xl text-slate-500">VS</span>
                <PlayerAutocomplete value={batterName} onValueChange={setBatterName} placeholder="搜尋打者..." />
                <Button onClick={handleAnalysis} disabled={loading} size="lg" className="h-12 text-lg w-full sm:w-auto mt-4 sm:mt-0">
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />分析中...</>) : ('分析對決')}
                </Button>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* 排行榜區塊 - 獨立顯示 */}
          <Leaderboards />
          
          <div>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <Card className="bg-red-900/20 border-red-500/30 max-w-4xl mx-auto mb-8">
                    <CardContent className="p-6"><p className="text-red-400 text-center">{error}</p></CardContent>
                  </Card>
                </motion.div>
              )}
              
              {isDataLoaded && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <h2 className="text-3xl font-bold text-center mb-8">對決分析結果</h2>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-7 max-w-5xl mx-auto">
                      <TabsTrigger value="overview">總覽</TabsTrigger>
                      <TabsTrigger value="radar">能力雷達</TabsTrigger>
                      <TabsTrigger value="arsenal">投手武器庫</TabsTrigger>
                      <TabsTrigger value="timeline">對決時序</TabsTrigger>
                      <TabsTrigger value="charts">2D 圖表</TabsTrigger>
                      <TabsTrigger value="3d-view">3D 視圖</TabsTrigger>
                      <TabsTrigger value="simulator">模擬器</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6 space-y-8">
                      <TaleOfTheTape pitcherStats={seasonStats.pitcher} batterStats={seasonStats.batter} />
                      {h2hStats && (
                        <AnimatedCard className="bg-slate-950/50 border-slate-800">
                          <CardHeader><CardTitle className="text-2xl sm:text-3xl text-center text-white">{h2hStats.message ? h2hStats.message : `生涯對戰數據 (H2H)`}</CardTitle></CardHeader>
                          {!h2hStats.message && ( <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"> <StatDisplay value={h2hStats.batting_average.toFixed(3)} label="AVG" /> <StatDisplay value={h2hStats.total_pa} label="PA" /> <StatDisplay value={h2hStats.at_bats} label="AB" /> <StatDisplay value={h2hStats.hits} label="H" /> <StatDisplay value={h2hStats.home_runs} label="HR" /> <StatDisplay value={h2hStats.strikeouts} label="K" /> <StatDisplay value={h2hStats.walks} label="BB" /> </CardContent> )}
                        </AnimatedCard>
                      )}
                    </TabsContent>

                    <TabsContent value="radar" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatedCard className="bg-slate-950/50 border-slate-800">
                          <CardHeader><CardTitle className="text-xl font-bold text-center text-white">{pitcherName} 能力分析</CardTitle></CardHeader>
                          <CardContent><PlayerRadarChart playerName={pitcherName} /></CardContent>
                        </AnimatedCard>
                        <AnimatedCard className="bg-slate-950/50 border-slate-800">
                          <CardHeader><CardTitle className="text-xl font-bold text-center text-white">{batterName} 能力分析</CardTitle></CardHeader>
                          <CardContent><PlayerRadarChart playerName={batterName} /></CardContent>
                        </AnimatedCard>
                      </div>
                    </TabsContent>

                    {/* ... 其他 TabsContent 維持不變 ... */}
                    
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
export default App;
