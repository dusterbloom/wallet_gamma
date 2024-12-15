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
        prefix: CHAIN_PREFIX,
        bip39Password: ""
      });
      
      const [account] = await wallet.getAccounts();
      console.log('Generated wallet address:', account.address);
      
      const serialized = await wallet.serialize("password");
      
      return {
        wallet,
        address: account.address,
        privateKey: new TextEncoder().encode(serialized)
      };
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      throw new Error(`Wallet generation failed: ${error.message}`);
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

  const encryptPrivateKey = async (privateKeyBytes, authKey) => {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        authKey,
        privateKeyBytes
      );

      return {
        encrypted: new Uint8Array(encryptedData),
        iv
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt wallet data');
    }
  };

  const decryptPrivateKey = async (encryptedData, iv, authKey) => {
    try {
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        authKey,
        encryptedData
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt wallet data');
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
      console.log('Setting up new wallet for user:', username);
      const { wallet, address, privateKey } = await generateNewWallet();
      
      console.log('Encrypting wallet data...');
      const encrypted = await encryptPrivateKey(privateKey, authKey);
      
      console.log('Storing encrypted wallet...');
      await storeEncryptedWallet(username, encrypted);
      
      console.log('Connecting to chain...');
      const client = await connectToChain(wallet);
      
      setClient(client);
      setAddress(address);
      
      console.log('Wallet setup complete');
      return { success: true, address };
    } catch (error) {
      console.error('Failed to setup wallet:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to setup wallet'
      };
    }
  };

  const loadExistingWallet = async (username, authKey) => {
    try {
      console.log('Loading wallet for user:', username);
      const encrypted = await getEncryptedWallet(username);
      if (!encrypted) {
        throw new Error('No wallet found for this user');
      }

      console.log('Decrypting wallet data...');
      const serializedWallet = await decryptPrivateKey(
        encrypted.encrypted,
        encrypted.iv,
        authKey
      );

      console.log('Deserializing wallet...');
      const wallet = await DirectSecp256k1HdWallet.deserialize(
        serializedWallet,
        "password"
      );

      const [account] = await wallet.getAccounts();
      console.log('Wallet loaded, connecting to chain...');
      
      const client = await connectToChain(wallet);
      
      setClient(client);
      setAddress(account.address);
      
      console.log('Wallet loaded successfully');
      return { success: true, address: account.address };
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to load wallet'
      };
    }
  };

  const signAndBroadcast = useCallback(async (
    recipientAddress,
    amount,
    denom = 'uatom'
  ) => {
    if (!client || !address) {
      throw new Error('Wallet not initialized');
    }

    try {
      const result = await client.sendTokens(
        address,
        recipientAddress,
        [{ denom, amount }],
        {
          amount: [{ denom, amount: '500' }],
          gas: '200000',
        }
      );

      return { success: true, hash: result.transactionHash };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { success: false, error: error.message };
    }
  }, [client, address]);

  return {
    address,
    isConnecting,
    setupNewWallet,
    loadExistingWallet,
    signAndBroadcast,
  };
};
