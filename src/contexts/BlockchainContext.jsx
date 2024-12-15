import React, { createContext, useContext, useState, useEffect } from 'react';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

// List of backup RPC endpoints in case primary fails
const RPC_ENDPOINTS = [
  'https://rpc.cosmos.directory/cosmoshub',
  'https://cosmos-rpc.polkachu.com',
  'https://rpc-cosmoshub.blockapsis.com',
  'https://cosmos-rpc.quickapi.com:443'
];

const DENOM = 'uatom';

const BlockchainContext = createContext({
  client: null,
  balance: '0',
  isReady: false,
  error: null,
  connectWithWallet: async () => {},
  sendTokens: async () => {},
});

export function BlockchainProvider({ children }) {
  const [client, setClient] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [currentEndpoint, setCurrentEndpoint] = useState(0);

  // Try connecting to different RPC endpoints
  const tryConnect = async (wallet = null) => {
    for (let i = currentEndpoint; i < RPC_ENDPOINTS.length; i++) {
      try {
        const endpoint = RPC_ENDPOINTS[i];
        console.log(`Attempting to connect to ${endpoint}...`);
        
        let newClient;
        if (wallet) {
          newClient = await SigningStargateClient.connectWithSigner(
            endpoint,
            wallet,
            { gasPrice: { amount: "0.025", denom: DENOM } }
          );
        } else {
          newClient = await StargateClient.connect(endpoint);
        }
        
        setCurrentEndpoint(i);
        setClient(newClient);
        setError(null);
        return newClient;
      } catch (e) {
        console.warn(`Failed to connect to ${RPC_ENDPOINTS[i]}:`, e);
        continue;
      }
    }
    throw new Error('Failed to connect to any RPC endpoint');
  };

  // Initialize read-only connection
  useEffect(() => {
    const initConnection = async () => {
      try {
        await tryConnect();
        setIsReady(true);
      } catch (e) {
        setError('Failed to connect to blockchain');
        console.error(e);
      }
    };

    if (!client && !error) {
      initConnection();
    }
  }, [client, error]);

  const connectWithWallet = async (serializedWallet) => {
    try {
      const wallet = await DirectSecp256k1HdWallet.deserialize(serializedWallet, "password");
      const [account] = await wallet.getAccounts();
      
      const signingClient = await tryConnect(wallet);
      
      // Get initial balance
      const balances = await signingClient.getAllBalances(account.address);
      const atomBalance = balances.find(b => b.denom === DENOM);
      setBalance(atomBalance ? atomBalance.amount : '0');
      
      setIsReady(true);
      return { success: true, address: account.address };
    } catch (e) {
      setError('Failed to connect wallet');
      console.error(e);
      return { success: false, error: e.message };
    }
  };

  const sendTokens = async (recipientAddress, amount) => {
    if (!client || !client.sendTokens) {
      throw new Error('Signing client not initialized');
    }

    try {
      const result = await client.sendTokens(
        recipientAddress,
        [{ denom: DENOM, amount: amount.toString() }],
        {
          amount: [{ denom: DENOM, amount: '500' }],
          gas: '200000',
        }
      );

      // Update balance after send
      const balances = await client.getAllBalances(recipientAddress);
      const atomBalance = balances.find(b => b.denom === DENOM);
      setBalance(atomBalance ? atomBalance.amount : '0');

      return { success: true, hash: result.transactionHash };
    } catch (e) {
      console.error('Failed to send tokens:', e);
      return { success: false, error: e.message };
    }
  };

  const value = {
    client,
    balance,
    isReady,
    error,
    connectWithWallet,
    sendTokens,
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
