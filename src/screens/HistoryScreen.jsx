import React, { useState, useEffect } from 'react';
import { Header } from '../components/Screen.jsx';
import { useCosmWallet } from '../hooks/useCosmWallet';
import { useBlockchain } from '../contexts/BlockchainContext';

export const HistoryScreen = ({ onBack }) => {
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const { address } = useCosmWallet();
  const { client } = useBlockchain();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!client || !address) return;

      try {
        // Load blockchain transactions
        const txs = await client.searchTx({
          sentFromOrTo: address
        });

        // Transform blockchain transactions
        const chainTxs = txs.map(tx => ({
          id: tx.hash,
          type: tx.tx.body.messages[0]?.fromAddress === address ? 'send' : 'receive',
          amount: tx.tx.body.messages[0]?.amount[0]?.amount || '0',
          recipient: tx.tx.body.messages[0]?.toAddress,
          sender: tx.tx.body.messages[0]?.fromAddress,
          date: new Date(tx.timestamp).toISOString(),
          status: 'completed',
          category: 'Transfer'
        }));

        // Combine with local transactions (groups, splits, etc.)
        const allTxs = [...chainTxs, ...MOCK_TRANSACTIONS];
        
        // Sort by date
        allTxs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(allTxs);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    };

    loadTransactions();
  }, [client, address]);

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

  const formatAmount = (amount, type) => {
    // Convert from uatom to ATOM if it's a blockchain transaction
    const value = type === 'chain' ? parseFloat(amount) / 1000000 : parseFloat(amount);
    return value.toFixed(2);
  };

  const filteredTransactions = transactions.filter(
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
            <div
              key={transaction.id}
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
                    ${formatAmount(transaction.amount, transaction.source)}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mock data for local transactions
const MOCK_TRANSACTIONS = [
  {
    id: 'local-1',
    type: 'split',
    amount: 120.00,
    group: 'Weekend Trip',
    participants: ['You', 'Alice', 'Bob', 'Charlie'],
    date: '2024-01-17T20:20:00Z',
    status: 'completed',
    note: 'Dinner',
    category: 'Food & Dining',
    source: 'local'
  },
  // Add more mock transactions as needed
];
