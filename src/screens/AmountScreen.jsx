import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { GooglePayButton } from '../components/GooglePayButton.jsx';

export const AmountScreen = ({ type = 'amount', balance, onBack, onContinue }) => {
  const [amount, setAmount] = useState('0');
  
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

  const handleNext = () => {
    console.log('Next clicked with amount:', amount);
    onContinue(amount);
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
        title={type.charAt(0).toUpperCase() + type.slice(1)}
        onBack={onBack}
      />
      
      <div className="text-center mb-4 p-4">
        {balance && (
          <div className="text-zinc-500 mb-4">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} available
          </div>
        )}
        <div className="flex items-center justify-center text-7xl font-medium">
          <span className="text-zinc-500">$</span>
          <span className={amount === '0' ? 'text-zinc-500' : 'text-white'}>
            {amount}
          </span>
        </div>
      </div>

      {isValidAmount && (
        <div className="flex justify-center mb-12">
          {type === 'deposit' ? (
            <div className="px-4 w-full">
              <GooglePayButton onClick={() => onContinue(amount)} />
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                       text-black font-medium group
                       transition-all duration-300 hover:bg-[#FF9500]/90
                       active:scale-95"
            >
              <span className="text-lg">Next</span>
              <span className="text-xl">→</span>
            </button>
          )}
        </div>
      )}

      <div className="mt-auto px-6 pb-8">
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
  );
};
