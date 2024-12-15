import React, { createContext, useContext, useEffect, useState } from 'react';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

const CHAIN_RPC_ENDPOINT = 'https://rpc.cosmos.network:443';
const DENOM = 'uatom';

const BlockchainContext = createContext({
  client: null,
  address: '',
  balance: '0',
  isReady: false,
  error: null,
  sendTokens: async () => {},
});

export function BlockchainProvider({ children }) {
  const [client, setClient] = useState(null);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const initializeWallet = async (authKey) => {
    try {
      // In production, you would decrypt the stored wallet using authKey
      // For demo, we'll create a new wallet
      const wallet = await DirectSecp256k1HdWallet.generate(24);
      const [account] = await wallet.getAccounts();
      
      const signingClient = await SigningStargateClient.connectWithSigner(
        CHAIN_RPC_ENDPOINT,
        wallet
      );

      setClient(signingClient);
      setAddress(account.address);
      
      // Get initial balance
      const balances = await signingClient.getAllBalances(account.address);
      const atomBalance = balances.find(b => b.denom === DENOM);
      setBalance(atomBalance ? atomBalance.amount : '0');
      
      setIsReady(true);
      setError(null);
    } catch (err) {
      console.error('Failed to initialize wallet:', err);
      setError(err.message);
    }
  };

  const sendTokens = async (recipientAddress, amount) => {
    if (!client || !address) {
      throw new Error('Wallet not initialized');
    }

    try {
      const result = await client.sendTokens(
        address,
        recipientAddress,
        [{ denom: DENOM, amount: amount.toString() }],
        {
          amount: [{ denom: DENOM, amount: '500' }],
          gas: '200000',
        }
      );

      // Update balance after send
      const balances = await client.getAllBalances(address);
      const atomBalance = balances.find(b => b.denom === DENOM);
      setBalance(atomBalance ? atomBalance.amount : '0');

      return { success: true, hash: result.transactionHash };
    } catch (err) {
      console.error('Failed to send tokens:', err);
      throw err;
    }
  };

  const value = {
    client,
    address,
    balance,
    isReady,
    error,
    sendTokens,
    initializeWallet,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};
