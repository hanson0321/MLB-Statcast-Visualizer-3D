// frontend/src/components/AtBatTimeline.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from './AnimatedCard';

export const AtBatTimeline = ({ data }) => {
  return (
    <AnimatedCard className="bg-slate-950/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl text-center text-white">
          對決時序 (At-Bat Timeline)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[600px] overflow-y-auto p-4">
        {/* 【修正處】在 (atBat) 兩邊加上括號 */}
        {data.map((atBat) => (
          <div key={`${atBat.game_date}-${atBat.at_bat_number}`} className="p-4 bg-slate-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-400">{atBat.game_date}</span>
              <span className="text-lg font-bold text-cyan-400">{atBat.final_event}</span>
            </div>
            <div className="space-y-2">
              {atBat.pitches.map((pitch) => (
                <div key={pitch.pitch_number} className="flex items-center justify-between text-sm p-2 bg-slate-900/70 rounded">
                  <span className="font-mono text-slate-400">#{pitch.pitch_number}</span>
                  <span className="font-semibold text-white">{pitch.pitch_name}</span>
                  <span className="text-slate-300">{pitch.release_speed?.toFixed(1)} mph</span>
                  <span className="text-yellow-400 w-24 text-right">{pitch.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </AnimatedCard>
  );
};