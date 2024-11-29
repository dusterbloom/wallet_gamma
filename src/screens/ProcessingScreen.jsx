import React, { useState, useEffect } from 'react';
import { Header } from '../components/Screen.jsx';
import { Celebrations } from '../components/Celebrations.jsx';

export const ProcessingScreen = ({ type, amount, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Almost there..."
        onClose={onClose}
      />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-[#FF9500] rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
          </div>
          <div className="text-2xl font-medium mb-2">
            {type}
          </div>
          <div className="text-4xl font-bold mb-4">
            ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-zinc-500">
            Please wait while we process your {type.toLowerCase()} transaction. This may take a few moments.
          </p>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={onClose}
          className="w-full py-4 bg-zinc-900 rounded-xl text-white font-medium
                   transition-all duration-200 hover:bg-zinc-800 
                   active:scale-98"
        >
          Close
        </button>
      </div>

      <Celebrations isActive={showConfetti} />
    </div>
  );
};
