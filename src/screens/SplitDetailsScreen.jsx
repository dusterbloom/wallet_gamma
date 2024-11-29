import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';

const SplitDetailsScreen = ({ group, expense, onBack, onContinue }) => {
  const defaultMembers = [{ name: 'You' }];
  const members = group?.members?.length ? group.members : defaultMembers;
  
  const [splits, setSplits] = useState(
    members.map(member => ({
      name: typeof member === 'string' ? member : member.name,
      amount: expense ? 
        (parseFloat(expense.amount) / members.length).toFixed(2) : 
        '0.00'
    }))
  );

  const [memo, setMemo] = useState('');

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Split Details"
        onBack={onBack}
      />
      
      <div className="flex-1 p-4">
        <div className="text-center mb-6">
          <div className="text-4xl font-medium mb-2">
            ${expense ? parseFloat(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <p className="text-zinc-500">{expense?.description || 'New Expense'}</p>
        </div>

        <div className="space-y-4 mb-6">
          {splits.map((split, index) => (
            <div key={index} className="bg-zinc-900 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    {split.name[0]}
                  </div>
                  <span>{split.name}</span>
                </div>
                <input
                  type="number"
                  value={split.amount}
                  onChange={(e) => {
                    const newSplits = [...splits];
                    newSplits[index].amount = e.target.value;
                    setSplits(newSplits);
                  }}
                  className="bg-transparent w-24 text-right outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            const newSplits = [...splits, {
              name: `Person ${splits.length + 1}`,
              amount: '0.00'
            }];
            setSplits(newSplits);
          }}
          className="w-full p-4 bg-zinc-900 rounded-xl mb-6
                   transition-all duration-200 hover:bg-zinc-800 
                   active:scale-98 flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Person
        </button>

        <div className="bg-zinc-900 rounded-xl p-4 mb-6">
          <textarea
            placeholder="Add a note (optional)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-transparent outline-none resize-none h-20
                     text-white placeholder-zinc-500"
          />
        </div>

        <div className="flex gap-3 mb-6">
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

        <div className="flex justify-center">
          <button
            onClick={() => onContinue({ splits, memo })}
            className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                     text-black font-medium
                     transition-all duration-300 hover:bg-[#FF9500]/90
                     active:scale-95"
          >
            <span className="text-lg">Send Requests</span>
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitDetailsScreen;
