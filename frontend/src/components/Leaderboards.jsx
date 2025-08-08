// frontend/src/components/Leaderboards.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Flame, ArrowRightLeft, Wind, Zap, Target, Bomb, Swords, Turtle, Repeat } from 'lucide-react';
import { AnimatedCard } from './AnimatedCard'; 

const LeaderboardCard = ({ icon, title, data }) => (
  <Card className="bg-slate-900 border-slate-800 text-center flex flex-col">
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
          <p className="text-md text-slate-300">{data.player_name}</p>
        </>
      ) : (
        <p className="text-slate-500 text-sm">無數據</p>
      )}
    </CardContent>
  </Card>
);

export const Leaderboards = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/leaderboards`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("無法獲取排行榜:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const leaderboardItems = [
    { icon: <Wind className="text-red-400"/>, title: "最速火球", data: data?.fastest_pitch },
    { icon: <Zap className="text-yellow-400"/>, title: "最猛擊球", data: data?.hardest_hit },
    { icon: <ArrowRightLeft className="text-blue-400"/>, title: "最殺轉速", data: data?.highest_spin_rate },
    { icon: <Target className="text-green-400"/>, title: "安打王", data: data?.most_hits },
    { icon: <Bomb className="text-orange-500"/>, title: "全壘打王", data: data?.most_homeruns },
    { icon: <Flame className="text-orange-400"/>, title: "最遠全壘打", data: data?.longest_homerun },
    { icon: <Swords className="text-pink-400"/>, title: "揮空製造機", data: data?.top_whiffer },
    { icon: <Repeat className="text-indigo-400"/>, title: "纏鬥大師", data: data?.longest_pa },
    { icon: <Turtle className="text-purple-400"/>, title: "最慢變化球", data: data?.slowest_offspeed },
  ];

  return (
    <AnimatedCard className="bg-slate-950/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl text-center text-white">
          近一週數據之最
          {data?.message && <p className="text-xs text-slate-400 font-normal mt-1">{data.message}</p>}
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
    </AnimatedCard>
  );
};
