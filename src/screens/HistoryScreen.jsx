import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'send',
    amount: 50.00,
    recipient: 'Alice Smith',
    recipientId: 'alice@cycles.app',
    date: '2024-01-20T10:30:00Z',
    status: 'completed',
    note: 'Lunch',
    category: 'Food & Dining'
  },
  {
    id: '2',
    type: 'receive',
    amount: 25.50,
    sender: 'Bob Johnson',
    senderId: 'bob@cycles.app',
    date: '2024-01-19T15:45:00Z',
    status: 'completed',
    note: 'Coffee and snacks',
    category: 'Food & Dining'
  },
  {
    id: '3',
    type: 'cashout',
    amount: 100.00,
    method: 'Bank Transfer',
    date: '2024-01-18T09:15:00Z',
    status: 'processing',
    details: 'IBAN: DE89 ****',
    category: 'Transfer'
  },
  {
    id: '4',
    type: 'split',
    amount: 120.00,
    group: 'Weekend Trip',
    participants: ['You', 'Alice', 'Bob', 'Charlie'],
    date: '2024-01-17T20:20:00Z',
    status: 'completed',
    note: 'Dinner',
    category: 'Food & Dining'
  }
];

export const HistoryScreen = ({ onBack }) => {
  const [filter, setFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'send': return '↑';
      case 'receive': return '↓';
      case 'cashout': return '🏦';
      case 'split': return '÷';
      default: return '•';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const filteredTransactions = MOCK_TRANSACTIONS.filter(
    t => filter === 'all' || t.type === filter
  );

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Transaction History"
        onBack={onBack}
      />
      
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'send', label: 'Sent' },
            { id: 'receive', label: 'Received' },
            { id: 'cashout', label: 'Cashouts' },
            { id: 'split', label: 'Splits' }
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap
                       transition-all duration-200 ${
                filter === id
                  ? 'bg-[#FF9500] text-black'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <button
              key={transaction.id}
              onClick={() => setSelectedTransaction(transaction)}
              className="w-full text-left bg-zinc-900 rounded-xl p-4 transition-all duration-200
                       hover:bg-zinc-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                ${transaction.type === 'receive' ? 'bg-green-500' :
                                  transaction.type === 'send' ? 'bg-blue-500' :
                                  transaction.type === 'cashout' ? 'bg-[#FF9500]' :
                                  'bg-purple-500'}`}>
                    <span className="text-xl">
                      {getTransactionIcon(transaction.type)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {transaction.recipient || transaction.sender || 
                       transaction.method || transaction.group}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={transaction.type === 'receive' ? 'text-green-500' : 'text-white'}>
                    {transaction.type === 'receive' ? '+' : ''}
                    ${transaction.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-zinc-500">
                    {transaction.status}
                  </div>
                </div>
              </div>
              {transaction.note && (
                <div className="text-sm text-zinc-500 mt-2">
                  {transaction.note}
                </div>
              )}
              {transaction.details && (
                <div className="text-sm text-zinc-500 mt-2">
                  {transaction.details}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
