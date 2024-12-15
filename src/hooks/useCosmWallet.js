import { useState, useCallback } from 'react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { openDB } from 'idb';

const DB_NAME = 'cosmos_wallet';
const STORE_NAME = 'encrypted_keys';
const RPC_ENDPOINT = 'https://rpc.sentry-01.theta-testnet.polypore.xyz';
const CHAIN_PREFIX = "cosmos";

export const useCosmWallet = () => {
  const [client, setClient] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mnemonic, setMnemonic] = useState(null);

  const initializeDB = async () => {
    try {
      console.log('Initializing database...');
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        },
      });
      console.log('Database initialized successfully');
      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Failed to initialize secure storage');
    }
  };

  const generateNewWallet = async () => {
    try {
      console.log('Generating new wallet...');
      const wallet = await DirectSecp256k1HdWallet.generate(24, {
        prefix: CHAIN_PREFIX,
      });
      
      const [account] = await wallet.getAccounts();
      console.log('Generated wallet address:', account.address);
      
      // Get the mnemonic directly from the wallet
      const walletMnemonic = wallet.mnemonic;
      console.log('Mnemonic generated successfully');
      
      const serialized = await wallet.serialize("password");
      console.log('Wallet serialized successfully');
      
      return {
        wallet,
        address: account.address,
        privateKey: new TextEncoder().encode(serialized),
        mnemonic: walletMnemonic
      };
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      throw new Error(`Wallet generation failed: ${error.message}`);
    }
  };

  // ... (other utility functions remain the same)

  const setupNewWallet = async (username, authKey) => {
    try {
      console.log('Setting up new wallet for user:', username);
      const { wallet, address, privateKey, mnemonic: newMnemonic } = await generateNewWallet();
      
      console.log('Encrypting wallet data...');
      const encrypted = await encryptPrivateKey(privateKey, authKey);
      
      const walletData = {
        encrypted: Array.from(encrypted.encrypted),
        iv: Array.from(encrypted.iv),
        address,
        mnemonic: newMnemonic // Store mnemonic in wallet data
      };

      console.log('Storing encrypted wallet...');
      await storeEncryptedWallet(username, walletData);
      
      setClient(wallet);
      setAddress(address);
      setMnemonic(newMnemonic); // Set mnemonic in state
      
      console.log('Wallet setup complete');
      return { success: true, address };
    } catch (error) {
      console.error('Failed to setup wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const loadExistingWallet = async (username, authKey) => {
    try {
      console.log('Loading wallet for user:', username);
      const walletData = await getEncryptedWallet(username);
      
      if (!walletData) {
        throw new Error('No wallet found for this username');
      }

      console.log('Decrypting wallet data...');
      const encrypted = new Uint8Array(walletData.encrypted);
      const iv = new Uint8Array(walletData.iv);

      const serializedWallet = await decryptPrivateKey(
        encrypted,
        iv,
        authKey
      );

      console.log('Deserializing wallet...');
      const wallet = await DirectSecp256k1HdWallet.deserialize(
        serializedWallet,
        "password"
      );

      const [account] = await wallet.getAccounts();
      setClient(wallet);
      setAddress(account.address);
      setMnemonic(walletData.mnemonic); // Set mnemonic from stored data
      
      console.log('Wallet loaded successfully');
      return { success: true, address: account.address };
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const exportWallet = async () => {
    try {
      console.log('Starting wallet export...');
      if (!mnemonic) {
        console.error('No mnemonic found in state');
        throw new Error('No mnemonic available. Please load wallet first.');
      }

      // Create QR data
      const qrData = JSON.stringify({
        type: 'cosmos-wallet-backup',
        phrase: mnemonic,
        timestamp: Date.now()
      });

      console.log('Wallet export successful');
      return { phrase: mnemonic, qrData };
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export wallet: ' + error.message);
    }
  };

  const importWallet = async (phrase, username, authKey) => {
    try {
      console.log('Starting wallet import...');
      // Create new wallet from phrase
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(phrase, {
        prefix: CHAIN_PREFIX,
      });

      const [account] = await wallet.getAccounts();
      const serialized = await wallet.serialize("password");
      
      // Encrypt the wallet data
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        authKey,
        new TextEncoder().encode(serialized)
      );

      // Store the encrypted wallet
      const walletData = {
        encrypted: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv),
        address: account.address,
        mnemonic: phrase // Store mnemonic in wallet data
      };

      await storeEncryptedWallet(username, walletData);
      setClient(wallet);
      setAddress(account.address);
      setMnemonic(phrase); // Set mnemonic in state

      console.log('Wallet import successful');
      return { success: true, address: account.address };
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import wallet: ' + error.message);
    }
  };

  return {
    address,
    balance: '0',
    mnemonic, // Expose mnemonic in the hook return
    setupNewWallet,
    loadExistingWallet,
    exportWallet,
    importWallet
  };
};
