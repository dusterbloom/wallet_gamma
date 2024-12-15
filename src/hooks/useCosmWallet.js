import { useState, useCallback } from 'react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { openDB } from 'idb';

const DB_NAME = 'cosmos_wallet';
const STORE_NAME = 'encrypted_keys';
const RPC_ENDPOINT = 'https://rpc.cosmos.network';

export const useCosmWallet = () => {
  const [client, setClient] = useState(null);
  const [address, setAddress] = useState(null);

  const initializeDB = async () => {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  };

  const generateNewWallet = async () => {
    const wallet = await DirectSecp256k1HdWallet.generate(24);
    const [account] = await wallet.getAccounts();
    const serialized = await wallet.serialize();
    
    return {
      wallet,
      address: account.address,
      privateKey: new TextEncoder().encode(JSON.stringify(serialized))
    };
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
      const { wallet, address, privateKey } = await generateNewWallet();
      const encrypted = await encryptPrivateKey(privateKey, authKey);
      await storeEncryptedWallet(username, encrypted);
      
      const client = await SigningStargateClient.connectWithSigner(
        RPC_ENDPOINT,
        wallet
      );

      setClient(client);
      setAddress(address);
      return { success: true, address };
    } catch (error) {
      console.error('Failed to setup wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const loadExistingWallet = async (username, authKey) => {
    try {
      const encrypted = await getEncryptedWallet(username);
      if (!encrypted) {
        throw new Error('No wallet found for this user');
      }

      const decrypted = await decryptPrivateKey(
        encrypted.encrypted,
        encrypted.iv,
        authKey
      );

      const wallet = await DirectSecp256k1HdWallet.deserialize(
        JSON.parse(decrypted)
      );

      const [account] = await wallet.getAccounts();
      const client = await SigningStargateClient.connectWithSigner(
        RPC_ENDPOINT,
        wallet
      );

      setClient(client);
      setAddress(account.address);
      return { success: true, address: account.address };
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return { success: false, error: error.message };
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
    setupNewWallet,
    loadExistingWallet,
    signAndBroadcast,
  };
};
