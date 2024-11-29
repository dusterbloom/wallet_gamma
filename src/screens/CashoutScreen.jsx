import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { useGooglePay } from '../hooks/useGooglePay';

export const CashoutScreen = ({ balance, onBack, onComplete }) => {
  const [amount, setAmount] = useState('0');
  const [method, setMethod] = useState(null); // null, 'googlepay', 'iban'
  const [iban, setIban] = useState('');
  const { isReadyToPay, processPayment } = useGooglePay();

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

  const formatIBAN = (input) => {
    const cleaned = input.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  };

  const validateIBAN = (input) => {
    // Basic IBAN validation - should be enhanced in production
    return input.replace(/\s/g, '').length >= 15;
  };

  const handleCashout = async () => {
    try {
      if (method === 'googlepay') {
        await processPayment(amount);
      } else if (method === 'iban') {
        // In production: Call your API to process IBAN transfer
        console.log('Processing IBAN transfer:', { amount, iban });
      }
      onComplete(amount);
    } catch (error) {
      console.error('Cashout failed:', error);
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '←']
  ];

  const isValidAmount = parseFloat(amount) > 0 && parseFloat(amount) <= balance;

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Cash Out"
        onBack={onBack}
      />
      
      <div className="flex-1 p-4">
        <div className="text-center mb-4">
          <div className="text-zinc-500 mb-4">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} available
          </div>
          <div className="flex items-center justify-center text-7xl font-medium">
            <span className="text-zinc-500">$</span>
            <span className={amount === '0' ? 'text-zinc-500' : 'text-white'}>
              {amount}
            </span>
          </div>
        </div>

        {isValidAmount && !method && (
          <div className="space-y-3 mb-8">
            {isReadyToPay && (
              <button
                onClick={() => setMethod('googlepay')}
                className="w-full h-14 bg-white rounded-full flex items-center justify-center gap-3
                         text-black font-medium transition-all duration-300 
                         hover:bg-gray-100 active:scale-95"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M12 24c6.6 0 12-5.4 12-12S18.6 0 12 0 0 5.4 0 12s5.4 12 12 12z"/>
                  <path fill="#34A853" d="M15.5 13.5c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3v1.3c0 .7.6 1.3 1.3 1.3s1.3-.6 1.3-1.3v-1.3z"/>
                  <path fill="#FBBC04" d="M8.9 13.5c0-.7-.6-1.3-1.3-1.3s-1.3.6-1.3 1.3v1.3c0 .7.6 1.3 1.3 1.3s1.3-.6 1.3-1.3v-1.3z"/>
                  <path fill="#EA4335" d="M12.2 7.2c-.7 0-1.3.6-1.3 1.3v1.3c0 .7.6 1.3 1.3 1.3s1.3-.6 1.3-1.3V8.5c0-.7-.6-1.3-1.3-1.3z"/>
                </svg>
                <span>Cash Out to Google Pay</span>
              </button>
            )}
            
            <button
              onClick={() => setMethod('iban')}
              className="w-full h-14 bg-[#FF9500] rounded-full flex items-center justify-center gap-3
                       text-black font-medium transition-all duration-300 
                       hover:bg-[#FF9500]/90 active:scale-95"
            >
              <span className="text-xl">🏦</span>
              <span>Bank Transfer (IBAN)</span>
            </button>
          </div>
        )}

        {method === 'iban' && (
          <div className="space-y-4 mb-8">
            <div className="bg-zinc-900 rounded-xl p-4">
              <label className="block text-sm text-zinc-500 mb-2">IBAN Number</label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(formatIBAN(e.target.value.toUpperCase()))}
                placeholder="DE89 3704 0044 0532 0130 00"
                className="w-full bg-transparent outline-none text-lg font-mono"
                maxLength={34}
              />
            </div>

            {validateIBAN(iban) && (
              <button
                onClick={handleCashout}
                className="w-full h-14 bg-[#FF9500] rounded-full flex items-center justify-center gap-3
                         text-black font-medium transition-all duration-300 
                         hover:bg-[#FF9500]/90 active:scale-95"
              >
                <span>Confirm Transfer</span>
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
    </div>
  );
};
