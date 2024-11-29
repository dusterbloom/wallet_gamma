import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';

export const SplitScreen = ({ onBack, onContinue }) => {
  const [amount, setAmount] = useState('0');
  const [people, setPeople] = useState(2);
  const [customSplits, setCustomSplits] = useState([]);
  const [step, setStep] = useState('amount'); // amount, people, memo, review

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
    if (step === 'amount') {
      setStep('people');
      const equalAmount = (parseFloat(amount) / people).toFixed(2);
      setCustomSplits(Array(people).fill(equalAmount));
    } else if (step === 'people') {
      setStep('memo');
    } else if (step === 'memo') {
      setStep('review');
    } else {
      onContinue({ amount, people, splits: customSplits, memo });
    }
  };

  const handleBack = () => {
    if (step === 'people') {
      setStep('amount');
    } else if (step === 'memo') {
      setStep('people');
    } else if (step === 'review') {
      setStep('memo');
    } else {
      onBack();
    }
  };

  const [memo, setMemo] = useState('');
  const [photo, setPhoto] = useState(null);

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
        title="Split Bill"
        onBack={handleBack}
      />

      <div className="flex-1 p-4">
        {step === 'amount' && (
          <>
            <div className="text-center mb-4">
              <div className="flex items-center justify-center text-7xl font-medium">
                <span className="text-zinc-500">$</span>
                <span className={amount === '0' ? 'text-zinc-500' : 'text-white'}>
                  {amount}
                </span>
              </div>
              <p className="text-zinc-500 mt-2">Total amount to split</p>
            </div>

            {isValidAmount && (
              <div className="flex justify-center mb-8">
                <button
                  onClick={handleNext}
                  className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                           text-black font-medium
                           transition-all duration-300 hover:bg-[#FF9500]/90
                           active:scale-95"
                >
                  <span className="text-lg">Next</span>
                  <span className="text-xl">→</span>
                </button>
              </div>
            )}

            <div className="mt-auto px-6">
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
          </>
        )}

        {step === 'people' && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-6xl font-medium mb-2">{people}</div>
              <p className="text-zinc-500">People</p>
            </div>

            <div className="flex justify-center items-center gap-6">
              <button
                onClick={() => adjustPeople(-1)}
                className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center
                         text-2xl transition-all duration-200 hover:bg-zinc-800"
              >
                -
              </button>
              <button
                onClick={() => adjustPeople(1)}
                className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center
                         text-2xl transition-all duration-200 hover:bg-zinc-800"
              >
                +
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleNext}
                className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                         text-black font-medium
                         transition-all duration-300 hover:bg-[#FF9500]/90
                         active:scale-95"
              >
                <span className="text-lg">Next</span>
                <span className="text-xl">→</span>
              </button>
            </div>

            <div className="text-center text-zinc-500">
              ${(parseFloat(amount) / people).toFixed(2)} each
            </div>
          </div>
        )}

        {step === 'memo' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-medium mb-2">
                ${amount}
              </div>
              <p className="text-zinc-500">Split between {people} people</p>
            </div>

            <div className="bg-zinc-900 rounded-xl p-4">
              <textarea
                placeholder="What's this split for?"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full bg-transparent outline-none resize-none h-32 
                         text-white placeholder-zinc-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 py-4 bg-zinc-900 rounded-xl text-white
                         transition-all duration-200 hover:bg-zinc-800 
                         active:scale-98 flex items-center justify-center gap-2"
              >
                <span className="text-xl">📷</span>
                Take Photo
              </button>
              <button
                className="flex-1 py-4 bg-zinc-900 rounded-xl text-white
                         transition-all duration-200 hover:bg-zinc-800 
                         active:scale-98 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🖼️</span>
                Add Photo
              </button>
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleNext}
                className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                         text-black font-medium
                         transition-all duration-300 hover:bg-[#FF9500]/90
                         active:scale-95"
              >
                <span className="text-lg">Next</span>
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-4xl font-medium mb-2">
                ${amount}
              </div>
              <p className="text-zinc-500">Split between {people} people</p>
              {memo && <p className="text-zinc-400 mt-2">"{memo}"</p>}
            </div>

            <div className="flex justify-center mb-8">
              <button
                onClick={handleNext}
                className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                         text-black font-medium
                         transition-all duration-300 hover:bg-[#FF9500]/90
                         active:scale-95"
              >
                <span className="text-lg">Send Requests</span>
                <span className="text-xl">→</span>
              </button>
            </div>

            <div className="space-y-3">
              {customSplits.map((split, index) => (
                <div key={index} className="bg-zinc-900 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <input
                        type="number"
                        value={split}
                        onChange={(e) => updateSplit(index, e.target.value)}
                        className="bg-transparent w-24 text-right"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
