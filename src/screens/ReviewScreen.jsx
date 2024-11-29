import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { AuthPrompt } from '../components/AuthPrompt.jsx';

export const ReviewScreen = ({ amount, note, onBack, onComplete }) => {
  const [showAuth, setShowAuth] = useState(false);

  const handleSend = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    onComplete();
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Review & Send"
        onBack={onBack}
      />
      
      <div className="flex-1 p-4">
        <div className="text-center mb-8">
          <div className="text-4xl font-medium mb-2">
            ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          {note && <p className="text-zinc-500">{note}</p>}
        </div>
        
        <div className="space-y-4">
          <div className="bg-zinc-900 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-zinc-500">From</p>
                <p>Main Account</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#FF9500]" />
            </div>
          </div>
          
          <div className="bg-zinc-900 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-zinc-500">Network Fee</p>
                <p>$0.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={handleSend}
          className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                   transition-all duration-200 hover:bg-[#FF9500]/90
                   active:scale-98"
        >
          Send Payment
        </button>
      </div>

      {showAuth && (
        <AuthPrompt
          type="confirm"
          onSuccess={handleAuthSuccess}
          onCancel={() => setShowAuth(false)}
        />
      )}
    </div>
  );
};
