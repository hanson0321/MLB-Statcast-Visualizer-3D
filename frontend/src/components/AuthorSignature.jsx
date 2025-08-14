// frontend/src/components/AuthorSignature.jsx

import React from "react";
import hansonPhoto from "../assets/yuheng.jpeg"; 

export function AuthorSignature() { 
  return (
    <div className="w-full  py-6 flex justify-center items-center bg-slate-950/50 border-y border-slate-800 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <img 
          src={hansonPhoto} 
          alt="Hanson" 
          className="w-40 h-30 rounded-full object-cover border-2 border-cyan-400 shadow-lg" 
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/80x80/1e293b/e2e8f0?text=H'; }}
        />
        <div className="text-center sm:text-left">
          <p className="text-4xl text-white font-bold">Hanson Huang</p>
          <p className="text-xl text-cyan-400">Full-Stack Developer | Data Visualization</p>
          <p className="text-base text-slate-300 mt-2 max-w-lg">
            A developer  in building data-driven, full-stack applications.  
            Currently exploring applications of Generative AI for data storytelling.
          </p>
        </div>
      </div>
    </div>
  );
}
