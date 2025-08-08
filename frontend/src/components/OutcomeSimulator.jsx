// src/components/OutcomeSimulator.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCard } from './AnimatedCard';

export function OutcomeSimulator({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <AnimatedCard className="bg-slate-950/50 border-slate-800">
      <CardHeader>
        {/* 【修正處】加入 text-white class */}
        <CardTitle className="text-2xl sm:text-3xl text-center text-white">Next At-Bat Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {data.map(([outcome, probability]) => (
          <div key={outcome}>
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium text-white">{outcome}</span>
              <span className="text-sm font-medium text-cyan-400">{probability}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div 
                className="bg-cyan-500 h-2.5 rounded-full" 
                style={{ width: `${probability}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </AnimatedCard>
  );
}