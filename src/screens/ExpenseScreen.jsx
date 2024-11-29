import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';

export const ExpenseScreen = ({ group, onBack, onContinue }) => {
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');
  
  const handleKeyPress = (key) => {
    if (amount.length >= 10) return;
    if (key === '.' && amount.includes('.')) return;
    if (key === '.' && amount === '0') {
      setAmount('0.');
      return;
    }
    if (key === '0' && amount === '0') return;
    if (key !== '0' && key !== '.' && amount === '0') {
      setAmount(key);
      return;
    }
    setAmount(prev => prev + key);
  };

  const handleDelete = () => {
    setAmount(prev => prev === '0' ? '0' : prev.slice(0, -1) || '0');
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '←']
  ];

  const isValidAmount = parseFloat(amount) > 0;

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title={group?.name || 'New Bill'}
        onBack={onBack}
      />
      
      <div className="flex-1 p-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center text-7xl font-medium">
            <span className="text-zinc-500">$</span>
            <span className={amount === '0' ? 'text-zinc-500' : 'text-white'}>
              {amount}
            </span>
          </div>
        </div>

        {isValidAmount && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => onContinue({ amount, description })}
              className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                       text-black font-medium
                       transition-all duration-300 hover:bg-[#FF9500]/90
                       active:scale-95"
            >
              <span className="text-lg">Save Bill</span>
              <span className="text-xl">→</span>
            </button>
          </div>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="What's this for? (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                     outline-none"
          />
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-3 gap-3">
            {keys.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => key === '←' ? handleDelete() : handleKeyPress(key)}
                    className="h-14 rounded-full bg-zinc-900 text-xl font-medium 
                             transition-colors duration-200
                             hover:bg-zinc-800 active:bg-zinc-700"
                  >
                    {key}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
