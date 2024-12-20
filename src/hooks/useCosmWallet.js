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
  const [currentUsername, setCurrentUsername] = useState(null);

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

  const getCurrentWallet = async () => {
    try {
      if (!currentUsername) {
        console.log('No current username set');
        return null;
      }

      const walletData = await getEncryptedWallet(currentUsername);
      console.log('Retrieved wallet data:', {
        hasData: !!walletData,
        hasAddress: !!walletData?.address,
        hasMnemonic: !!walletData?.mnemonic
      });

      return walletData;
    } catch (error) {
      console.error('Failed to get current wallet:', error);
      return null;
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

  const encryptPrivateKey = async (privateKeyBytes, authKey) => {
    try {
      console.log('Starting encryption...');
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        authKey,
        privateKeyBytes
      );

      console.log('Encryption successful');
      return {
        encrypted: new Uint8Array(encryptedData),
        iv
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt wallet data: ' + error.message);
    }
  };

  const decryptPrivateKey = async (encryptedData, iv, authKey) => {
    try {
      console.log('Starting decryption...');
      console.log('Encrypted data size:', encryptedData.length);
      console.log('IV size:', iv.length);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        authKey,
        encryptedData
      );

      console.log('Decryption successful');
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt wallet data: ' + error.message);
    }
  };

  const storeEncryptedWallet = async (username, encryptedData) => {
    try {
      console.log('Storing wallet for user:', username);
      const db = await initializeDB();
      await db.put(STORE_NAME, encryptedData, username);
      console.log('Wallet stored successfully');
    } catch (error) {
      console.error('Failed to store wallet:', error);
      throw new Error('Failed to store wallet securely');
    }
  };

  const getEncryptedWallet = async (username) => {
    try {
      console.log('Retrieving wallet for user:', username);
      const db = await initializeDB();
      const walletData = await db.get(STORE_NAME, username);
      if (!walletData) {
        console.log('No wallet found for user:', username);
        return null;
      }
      console.log('Wallet retrieved successfully');
      return walletData;
    } catch (error) {
      console.error('Failed to retrieve wallet:', error);
      throw new Error('Failed to retrieve wallet data');
    }
  };

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
        mnemonic: newMnemonic
      };

      console.log('Storing encrypted wallet...');
      await storeEncryptedWallet(username, walletData);
      
      setClient(wallet);
      setAddress(address);
      setMnemonic(newMnemonic);
      setCurrentUsername(username);
      
      console.log('Wallet setup complete:', {
        address,
        hasMnemonic: !!newMnemonic,
        username
      });
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
      
      // Make sure we have the mnemonic from the stored data
      if (!walletData.mnemonic) {
        throw new Error('No mnemonic found in stored wallet data');
      }

      // Set all state values
      setClient(wallet);
      setAddress(account.address);
      setMnemonic(walletData.mnemonic);
      setCurrentUsername(username);

      console.log('Wallet loaded successfully:', {
        address: account.address,
        hasMnemonic: !!walletData.mnemonic,
        username
      });

      return { success: true, address: account.address };
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return { success: false, error: error.message };
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
        mnemonic: phrase
      };

      await storeEncryptedWallet(username, walletData);
      setClient(wallet);
      setAddress(account.address);
      setMnemonic(phrase);
      setCurrentUsername(username);

      console.log('Wallet import successful:', {
        address: account.address,
        hasMnemonic: !!phrase,
        username
      });
      return { success: true, address: account.address };
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import wallet: ' + error.message);
    }
  };

  const connectToChain = async (wallet) => {
    setIsConnecting(true);
    try {
      console.log('Connecting to chain...', RPC_ENDPOINT);
      const client = await SigningStargateClient.connectWithSigner(
        RPC_ENDPOINT,
        wallet,
        { gasPrice: { amount: "0.025", denom: "uatom" } }
      );
      console.log('Connected to chain successfully');
      return client;
    } catch (error) {
      console.error('Chain connection failed:', error);
      throw new Error(`Chain connection failed: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    // State
    address,
    balance: '0',
    mnemonic,
    isConnecting,
    currentUsername,

    // Core wallet functions
    setupNewWallet,
    loadExistingWallet,
    importWallet,
    getCurrentWallet,

    // Utility functions
    getEncryptedWallet,
    encryptPrivateKey,
    decryptPrivateKey,
    generateNewWallet,
    storeEncryptedWallet,
    initializeDB,
    connectToChain
  };
};
