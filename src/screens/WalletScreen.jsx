import React, { useState } from 'react';
import { useCosmWallet } from '../hooks/useCosmWallet';

export const WalletScreen = ({ onNavigate }) => {
  const { address, balance } = useCosmWallet();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const formatBalance = (bal) => {
    if (!bal) return '0.00';
    // Convert from uatom to ATOM (1 ATOM = 1,000,000 uatom)
    const atomBalance = parseFloat(bal) / 1000000;
    return atomBalance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  const handleLongPress = () => {
    setIsBalanceHidden(prev => !prev);
  };

  const handleTransactionsClick = (e) => {
    e.stopPropagation();
    onNavigate('history');
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="text-center mt-2">
        <span className="bg-zinc-900 text-sm px-3 py-1 rounded-full">Beta</span>
      </div>

      <div 
        className="text-center py-8 select-none cursor-pointer"
        onTouchStart={() => {
          const timer = setTimeout(handleLongPress, 2000);
          return () => clearTimeout(timer);
        }}
        onMouseDown={() => {
          const timer = setTimeout(handleLongPress, 2000);
          return () => clearTimeout(timer);
        }}
      >
        <div className="text-5xl font-bold mb-2">
          {isBalanceHidden ? 
            '********' : 
            `$${formatBalance(balance)}`
          }
        </div>
        <p className="text-zinc-500">
          Available Balance
          {!isBalanceHidden && (
            <>
              {" - "}
              <button 
                onClick={handleTransactionsClick}
                className="text-[#FF9500] underline"
              >
                Transactions
              </button>
            </>
          )}
        </p>
        {address && (
          <p className="text-xs text-zinc-600 mt-2">
            {formatAddress(address)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <button 
          onClick={() => onNavigate('send')}
          className="aspect-square rounded-full bg-zinc-900 flex flex-col items-center justify-center
                   transition-all duration-200 hover:bg-zinc-800 active:scale-95"
        >
          <span className="text-2xl mb-2">↑</span>
          <span className="text-sm">Send</span>
        </button>
        <button 
          onClick={() => onNavigate('request')}
          className="aspect-square rounded-full bg-zinc-900 flex flex-col items-center justify-center
                   transition-all duration-200 hover:bg-zinc-800 active:scale-95"
        >
          <span className="text-2xl mb-2">↓</span>
          <span className="text-sm">Request</span>
        </button>
        <button 
          onClick={() => onNavigate('split')}
          className="aspect-square rounded-full bg-zinc-900 flex flex-col items-center justify-center
                   transition-all duration-200 hover:bg-zinc-800 active:scale-95"
        >
          <span className="text-2xl mb-2">÷</span>
          <span className="text-sm">Split</span>
        </button>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onNavigate('deposit')}
          className="w-full p-4 bg-zinc-900 rounded-xl
                   transition-all duration-200 hover:bg-zinc-800 
                   active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
                <span className="text-xl">+</span>
              </div>
              <span className="text-lg">Add Cash</span>
            </div>
            <span>→</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('cashout')}
          className="w-full p-4 bg-zinc-900 rounded-xl
                   transition-all duration-200 hover:bg-zinc-800 
                   active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-xl text-black">↑</span>
              </div>
              <span className="text-lg">Cash Out</span>
            </div>
            <span>→</span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('security')}
          className="w-full p-4 bg-zinc-900 rounded-xl
                   transition-all duration-200 hover:bg-zinc-800 
                   active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
                <span className="text-xl">🔐</span>
              </div>
              <div>
                <span className="text-lg">Backup & Security</span>
                <p className="text-sm text-zinc-500">Protect your wallet</p>
              </div>
            </div>
            <span>→</span>
          </div>
        </button>

       
      </div>
    </div>
  );
};
