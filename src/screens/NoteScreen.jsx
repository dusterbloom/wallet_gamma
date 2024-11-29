import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';

export const NoteScreen = ({ type, amount, onBack, onContinue }) => {
  const [note, setNote] = useState('');
  
  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Add Note"
        onBack={onBack}
      />
      
      <div className="flex-1 p-4">
        <div className="text-center mb-8">
          <p className="text-zinc-500 mb-2">{type === 'send' ? 'Sending' : 'Requesting'}</p>
          <div className="text-4xl font-medium">
            ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => onContinue(note)}
            className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                     text-black font-medium
                     transition-all duration-300 hover:bg-[#FF9500]/90
                     active:scale-95"
          >
            <span className="text-lg">Next</span>
            <span className="text-xl">→</span>
          </button>
        </div>
        
        <div className="bg-zinc-900 rounded-xl p-4 mb-4">
          <textarea
            placeholder="What's it for? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-transparent outline-none resize-none h-32 
                     text-white placeholder-zinc-500"
          />
        </div>
      </div>
    </div>
  );
};
