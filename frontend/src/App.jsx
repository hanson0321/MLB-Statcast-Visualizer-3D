// frontend/src/App.jsx

import React, { useState, useEffect , useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Flame, Wind, Zap, Target, Bomb, Swords } from "lucide-react";

// 引入所有需要的元件
import { PlayerAutocomplete } from './components/PlayerAutocomplete';
import { TaleOfTheTape } from './components/TaleOfTheTape';
import { PitchArsenal } from './components/PitchArsenal';
import { AtBatTimeline } from './components/AtBatTimeline';
import { OutcomeSimulator } from './components/OutcomeSimulator';
import { PitchMovementChart } from './components/PitchMovementChart';
import { AuthorSignature } from './components/AuthorSignature'; 
import { PitchTrajectory3D } from './components/PitchTrajectory3D'; 
import { PlayerRadarChart } from './components/PlayerRadarChart';
import { PitchStrategy } from './components/PitchStrategy';

// 將子元件定義移至 App 外部，避免不必要的重新渲染
const UpgradedAnimatedCard = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, boxShadow: '0 8px 30px rgba(0, 255, 255, 0.1)' }}
    className={`bg-slate-900/50 border border-slate-800 rounded-xl shadow-lg transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

const LeaderboardCard = ({ icon, title, data }) => (
  <Card className="bg-slate-900 border-slate-800 text-center flex flex-col h-full transition-all duration-300 hover:border-cyan-400/50">
    <CardHeader>
      <div className="flex justify-center items-center gap-2">
        {icon}
        <CardTitle className="text-lg text-cyan-400">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow justify-center items-center p-4">
      {data ? (
        <>
          <img 
            src={data.image_url || 'https://placehold.co/128x128/1e293b/e2e8f0?text=?'} 
            alt={data.player_name || 'Player'} 
            className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border-4 border-slate-700 bg-slate-800"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/128x128/1e293b/e2e8f0?text=?'; }}
          />
          <p className="text-xl font-bold text-white">{data.value}</p>
          <p className="text-md text-slate-400">{data.player_name}</p>
        </>
      ) : (
        <p className="text-slate-500 text-sm">No Data</p>
      )}
    </CardContent>
  </Card>
);

const Leaderboards = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboards`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch leaderboards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const leaderboardItems = [
    { icon: <Wind className="text-red-400"/>, title: "Fastest Pitch", data: data?.fastest_pitch },
    { icon: <Zap className="text-yellow-400"/>, title: "Hardest Hit", data: data?.hardest_hit },
    { icon: <Flame className="text-orange-400"/>, title: "Longest HR", data: data?.longest_homerun },
    { icon: <Target className="text-green-400"/>, title: "Most Hits", data: data?.most_hits },
    { icon: <Bomb className="text-orange-500"/>, title: "Most Home Runs", data: data?.most_homeruns },
    { icon: <Swords className="text-pink-400"/>, title: "Most Strikeouts", data: data?.most_strikeouts },
  ];

  return (
    <UpgradedAnimatedCard>
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl text-center text-slate-100">
          Weekly Leaders
          {data?.message && <p className="text-xs text-slate-500 font-normal mt-1">{data.message}</p>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {leaderboardItems.map((item, index) => (
              <LeaderboardCard key={index} icon={item.icon} title={item.title} data={item.data} />
            ))}
          </div>
        )}
      </CardContent>
    </UpgradedAnimatedCard>
  );
};

function App() {
  // 狀態管理
  const [pitcherName, setPitcherName] = useState('Shohei Ohtani');
  const [batterName, setBatterName] = useState('Aaron Judge');
  const [pitcherImage, setPitcherImage] = useState(null);
  const [batterImage, setBatterImage] = useState(null);
  const [seasonStats, setSeasonStats] = useState({ pitcher: null, batter: null });
  const [arsenalData, setArsenalData] = useState(null);
  const [h2hStats, setH2hStats] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [movementData, setMovementData] = useState(null);
  const [leagueAvgMovement, setLeagueAvgMovement] = useState(null);
  const [trajectoryData, setTrajectoryData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const fetchInitialImages = async () => {
      try {
        const [pitcherRes, batterRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/player-info?name=Shohei%20Ohtani`),
          fetch(`${import.meta.env.VITE_API_URL}/api/player-info?name=Aaron%20Judge`)
        ]);
        const pitcherData = await pitcherRes.json();
        const batterData = await batterRes.json();
        setPitcherImage(pitcherData.image_url);
        setBatterImage(batterData.image_url);
      } catch (error) {
        console.error("Failed to fetch initial images:", error);
      }
    };
    fetchInitialImages();
  }, []);

  const resultsRef = useRef(null); // <-- 加入這一行
  useEffect(() => {
    if (isDataLoaded) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isDataLoaded]); // <-- 這個 effect 依賴 isDataLoaded

  const handleAnalysis = async () => {
    if (!pitcherName || !batterName) {
      setError("Please select a pitcher and a batter.");
      return;
    }
    setLoading(true);
    setError(null);
    setIsDataLoaded(false);

    try {
      const pitcherQuery = encodeURIComponent(pitcherName);
      const batterQuery = encodeURIComponent(batterName);
      
      const responses = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/player-season-stats?player_name=${pitcherQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/player-season-stats?player_name=${batterQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/pitch-arsenal?pitcher=${pitcherQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/pvb-stats?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/at-bat-timeline?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/outcome-simulator?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/pitch-movement?pitcher=${pitcherQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/league-avg-movement`),
        fetch(`${import.meta.env.VITE_API_URL}/api/3d-trajectory?pitcher=${pitcherQuery}&batter=${batterQuery}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/pitch-strategy?pitcher_name=${pitcherQuery}&batter_name=${batterQuery}`),
      ]);

      for (const res of responses) { if (!res.ok) throw new Error("An error occurred while fetching data. Please try again."); }
      
      const [
        pitcherSeasonData, batterSeasonData, arsenalData, statsData, 
        timelineData, simulationData, movementData, leagueAvgData, 
        trajectory3DData, strategyData
      ] = await Promise.all(responses.map(res => res.json()));
      
      for (const data of [pitcherSeasonData, batterSeasonData, arsenalData, statsData, timelineData, simulationData, movementData, leagueAvgData, trajectory3DData, strategyData]) {
        if (data && data.error) throw new Error(data.error);
      }
      
      setSeasonStats({ pitcher: pitcherSeasonData, batter: batterSeasonData });
      setArsenalData(arsenalData);
      setH2hStats(statsData);
      setTimelineData(timelineData);
      setSimulationData(simulationData);
      setMovementData(movementData);
      setLeagueAvgMovement(leagueAvgMovement);
      setTrajectoryData(trajectory3DData);
      setStrategyData(strategyData);
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
      <span className="text-sm text-slate-400 mt-1">{label}</span>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-7xl flex flex-col flex-grow">
        <header className="text-center mb-12">
          <AuthorSignature />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-100 mt-8">
            Pitcher vs. Batter Analytics
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Explore weekly leaders or enter player names to dive into their matchup data
          </p>
        </header>

        <main className="flex-grow space-y-12">
          <UpgradedAnimatedCard>
            <CardHeader><CardTitle className="text-2xl sm:text-3xl text-center text-slate-100">Analyze a Specific Matchup</CardTitle></CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-around gap-4">
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={pitcherImage || 'https://placehold.co/160x160/1e293b/e2e8f0?text=P'} 
                    alt={pitcherName} 
                    className="w-40 h-40 rounded-full object-cover border-4 border-slate-700 bg-slate-800 transition-transform duration-300 hover:scale-105"
                  />
                  <PlayerAutocomplete 
                    value={pitcherName} 
                    onValueChange={(player) => {
                      setPitcherName(player.name);
                      setPitcherImage(player.image_url);
                    }} 
                    placeholder="Search pitcher..." 
                  />
                </div>
                <span className="font-bold text-4xl text-slate-600">VS</span>
                <div className="flex flex-col items-center gap-4">
                   <img 
                    src={batterImage || 'https://placehold.co/160x160/1e293b/e2e8f0?text=B'} 
                    alt={batterName} 
                    className="w-40 h-40 rounded-full object-cover border-4 border-slate-700 bg-slate-800 transition-transform duration-300 hover:scale-105"
                  />
                  <PlayerAutocomplete 
                    value={batterName} 
                    onValueChange={(player) => {
                      setBatterName(player.name);
                      setBatterImage(player.image_url);
                    }} 
                    placeholder="Search batter..." 
                  />
                </div>
              </div>
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleAnalysis} 
                  disabled={loading} 
                  size="lg" 
                  className="h-14 text-xl w-full sm:w-auto bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all duration-300 hover:scale-105"
                >
                  {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</>) : ('Analyze Matchup')}
                </Button>
              </div>
            </CardContent>
          </UpgradedAnimatedCard>

          {/* <Leaderboards /> */}
          
          <div ref={resultsRef}>
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
                  <h2 className="text-3xl font-bold text-center mb-8 text-slate-100">Matchup Analysis Results</h2>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-7 max-w-5xl mx-auto bg-slate-800/50">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="radar">Radar</TabsTrigger>
                      <TabsTrigger value="arsenal">Pitch Arsenal</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      <TabsTrigger value="strategy">Strategy</TabsTrigger>
                      <TabsTrigger value="3d-view">3D View</TabsTrigger>
                      <TabsTrigger value="simulator">Simulator</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-6 space-y-8">
                      <TaleOfTheTape pitcherStats={seasonStats.pitcher} batterStats={seasonStats.batter} />
                      {h2hStats && (
                        <UpgradedAnimatedCard>
                          <CardHeader><CardTitle className="text-2xl sm:text-3xl text-center text-slate-100">{h2hStats.message ? h2hStats.message : `Head-to-Head Stats (H2H)`}</CardTitle></CardHeader>
                          {!h2hStats.message && ( <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"> <StatDisplay value={h2hStats.batting_average.toFixed(3)} label="AVG" /> <StatDisplay value={h2hStats.total_pa} label="PA" /> <StatDisplay value={h2hStats.at_bats} label="AB" /> <StatDisplay value={h2hStats.hits} label="H" /> <StatDisplay value={h2hStats.home_runs} label="HR" /> <StatDisplay value={h2hStats.strikeouts} label="K" /> <StatDisplay value={h2hStats.walks} label="BB" /> </CardContent> )}
                        </UpgradedAnimatedCard>
                      )}
                    </TabsContent>

                    <TabsContent value="radar" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <UpgradedAnimatedCard>
                          <CardHeader><CardTitle className="text-xl font-bold text-center text-slate-100">{pitcherName} Radar</CardTitle></CardHeader>
                          <CardContent><PlayerRadarChart playerName={pitcherName} /></CardContent>
                        </UpgradedAnimatedCard>
                        <UpgradedAnimatedCard>
                          <CardHeader><CardTitle className="text-xl font-bold text-center text-slate-100">{batterName} Radar</CardTitle></CardHeader>
                          <CardContent><PlayerRadarChart playerName={batterName} /></CardContent>
                        </UpgradedAnimatedCard>
                      </div>
                    </TabsContent>

                    <TabsContent value="arsenal" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {arsenalData && arsenalData.length > 0 ? (<PitchArsenal data={arsenalData} pitcherName={pitcherName} />) : <p className="text-center text-slate-500 py-8">No Pitch Arsenal data available.</p>}
                        {movementData && movementData.length > 0 ? (<UpgradedAnimatedCard><CardContent className="p-6"><PitchMovementChart data={movementData} leagueAvgData={leagueAvgMovement} /></CardContent></UpgradedAnimatedCard>) : <p className="text-center text-slate-500 py-8">No Pitch Movement data available.</p>}
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="mt-6">
                      {timelineData && timelineData.length > 0 ? <AtBatTimeline data={timelineData} /> : <p className="text-center text-slate-500 py-8">No At-Bat Timeline data available.</p>}
                    </TabsContent>
                    
                    <TabsContent value="strategy" className="mt-6">
                        {strategyData ? <PitchStrategy data={strategyData} /> : <div className="text-center text-slate-500 py-8">Loading Strategy Data...</div>}
                    </TabsContent>
                    
                    <TabsContent value="3d-view" className="mt-6">
                      <UpgradedAnimatedCard>
                        <CardHeader><CardTitle className="text-2xl sm:text-3xl text-center text-slate-100">3D Pitch Trajectory</CardTitle></CardHeader>
                        <CardContent>
                          {trajectoryData && trajectoryData.length > 0 ? (<PitchTrajectory3D data={trajectoryData} pitcherName={pitcherName} batterName={batterName}/>) : (<div className="flex items-center justify-center h-96 text-slate-500">No 3D Trajectory data available for this matchup.</div>)}
                        </CardContent>
                      </UpgradedAnimatedCard>
                    </TabsContent>

                    <TabsContent value="simulator" className="mt-6">
                      {simulationData ? <OutcomeSimulator data={simulationData} /> : <p className="text-center text-slate-500 py-8">No Simulation data available.</p>}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
        
        <footer className="w-full mt-16 py-8 text-center border-t border-slate-800">
          <p className="text-sm text-slate-500">
            Statcast Visualizer 3D © 2025 | All data sourced from MLB Statcast via pybaseball.
          </p>
        </footer>
      </div>
    </div>
  );
}
export default App;