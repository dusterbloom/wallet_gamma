import React from 'react';

export const Screen = ({ children, isActive }) => (
  <div className={`
    fixed inset-0 bg-black
    screen-transition
    ${isActive ? 'screen-transition-enter-active' : 'screen-transition-exit-active'}
  `}>
    <div className="max-w-md mx-auto h-full">{children}</div>
  </div>
);

export const Header = ({ title, onBack, onClose }) => (
  <div className="flex items-center justify-between p-4">
    {onBack && (
      <button 
        onClick={onBack} 
        className="w-10 h-10 flex items-center justify-center rounded-full
                 bg-zinc-900 transition-all duration-300
                 hover:bg-zinc-800 active:scale-95"
      >
        <span className="text-2xl">←</span>
      </button>
    )}
    <h1 className="text-xl font-medium">{title}</h1>
    {onClose ? (
      <button 
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-full
                 bg-zinc-900 transition-all duration-300
                 hover:bg-zinc-800 active:scale-95"
      >
        <span className="text-2xl">×</span>
      </button>
    ) : (
      <div className="w-10" />
    )}
  </div>
);
