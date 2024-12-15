import { useState, useEffect } from 'react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { openDB } from 'idb';
import { useBlockchain } from '../contexts/BlockchainContext';

const DB_NAME = 'cosmos_wallet';
const STORE_NAME = 'encrypted_keys';

export const useCosmWallet = () => {
  const [address, setAddress] = useState(null);
  const { connectWithWallet, balance } = useBlockchain();

  const initializeDB = async () => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  };

  const generateNewWallet = async () => {
    try {
      const wallet = await DirectSecp256k1HdWallet.generate(24, {
        prefix: "cosmos",
      });
      
      const [account] = await wallet.getAccounts();
      console.log('Generated wallet address:', account.address);
      
      const serialized = await wallet.serialize("password");
      return {
        address: account.address,
        privateKey: new TextEncoder().encode(serialized),
        serialized
      };
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      throw error;
    }
  };

  const storeEncryptedWallet = async (username, encryptedData) => {
    const db = await initializeDB();
    await db.put(STORE_NAME, encryptedData, username);
  };

  const getEncryptedWallet = async (username) => {
    const db = await initializeDB();
    return db.get(STORE_NAME, username);
  };

  const setupNewWallet = async (username, authKey) => {
    try {
      console.log('Setting up new wallet...');
      const { address, privateKey, serialized } = await generateNewWallet();
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        authKey,
        privateKey
      );

      const walletData = {
        encrypted: new Uint8Array(encryptedData),
        iv,
        address
      };

      await storeEncryptedWallet(username, walletData);
      setAddress(address);
      
      // Connect to blockchain with the new wallet
      await connectWithWallet(serialized);
      
      return { success: true, address };
    } catch (error) {
      console.error('Failed to setup wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const loadExistingWallet = async (username, authKey) => {
    try {
      const walletData = await getEncryptedWallet(username);
      if (!walletData) {
        throw new Error('No wallet found');
      }

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: walletData.iv },
        authKey,
        walletData.encrypted
      );

      const serialized = new TextDecoder().decode(decryptedData);
      setAddress(walletData.address);

      // Connect to blockchain with the loaded wallet
      await connectWithWallet(serialized);

      return { success: true, address: walletData.address };
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    address,
    balance,
    setupNewWallet,
    loadExistingWallet
  };
};
