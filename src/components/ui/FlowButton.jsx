import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const FlowButton = ({ text = "Explore the Vibe", className, onClick, ...props }) => {
  return (
    <button 
      className={cn("group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-white/20 bg-transparent px-8 py-3 text-sm font-semibold text-white cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-black hover:rounded-[12px] active:scale-[0.95]", className)}
      onClick={onClick}
      {...props}
    >
      {/* Left arrow (appears on hover) */}
      <ArrowRight 
        className="absolute w-4 h-4 left-[-25%] stroke-black fill-none z-[9] group-hover:left-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Background Expand Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (moves out on hover) */}
      <ArrowRight 
        className="absolute w-4 h-4 right-4 stroke-white fill-none z-[9] group-hover:right-[-25%] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </button>
  );
}
