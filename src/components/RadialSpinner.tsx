import React from 'react';

export default function RadialSpinner({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Spoke 1 (12 o'clock) */}
      <line x1="12" y1="4.5" x2="12" y2="7.5" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="1.0" />
      {/* Spoke 2 (1:30) */}
      <line x1="17.3" y1="6.7" x2="15.18" y2="8.82" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      {/* Spoke 3 (3 o'clock) */}
      <line x1="19.5" y1="12" x2="16.5" y2="12" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="0.70" />
      {/* Spoke 4 (4:30) */}
      <line x1="17.3" y1="17.3" x2="15.18" y2="15.18" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      {/* Spoke 5 (6 o'clock) */}
      <line x1="12" y1="19.5" x2="12" y2="16.5" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="0.40" />
      {/* Spoke 6 (7:30) */}
      <line x1="6.7" y1="17.3" x2="8.82" y2="15.18" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
      {/* Spoke 7 (9 o'clock) */}
      <line x1="4.5" y1="12" x2="7.5" y2="12" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="0.15" />
      {/* Spoke 8 (10:30) */}
      <line x1="6.7" y1="6.7" x2="8.82" y2="8.82" stroke="#FAE035" strokeWidth="2.5" strokeLinecap="round" opacity="0.10" />
    </svg>
  );
}
