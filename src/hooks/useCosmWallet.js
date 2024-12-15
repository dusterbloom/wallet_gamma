import { useState } from 'react';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import * as bip39 from 'bip39';

const RPC_ENDPOINT = 'https://cosmos-hub.drpc.org';
const CHAIN_PREFIX = 'cosmos';

export const useCosmWallet = () => {
  const [client, setClient] = useState(null);
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const deriveSeedFromPasskey = async (authKey) => {
    // Use a user-specific salt for determinism
    const salt = new TextEncoder().encode('user-specific-salt');
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: salt,
        iterations: 100000,
      },
      authKey,
      256
    );
    return new Uint8Array(derivedBits);
  };

  const generateNewWallet = async (seed) => {
    try {
      const mnemonic = bip39.entropyToMnemonic(Buffer.from(seed));
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: CHAIN_PREFIX,
      });

      const [account] = await wallet.getAccounts();
      console.log('Generated wallet address:', account.address);

      return {
        wallet,
        address: account.address,
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
        { gasPrice: { amount: '0.025', denom: 'uatom' } }
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

  const setupNewWallet = async (username, authKey) => {
    try {
      console.log('Setting up new wallet for user:', username);

      // Derive seed from passkey
      const seed = await deriveSeedFromPasskey(authKey);

      // Generate wallet from seed
      const { wallet, address } = await generateNewWallet(seed);

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
        error: error.message || 'Failed to setup wallet',
      };
    }
  };

  const loadExistingWallet = async (username, authKey) => {
    try {
      console.log('Loading wallet for user:', username);

      // Derive seed from passkey
      const seed = await deriveSeedFromPasskey(authKey);

      // Generate wallet from seed
      const { wallet, address } = await generateNewWallet(seed);

      console.log('Connecting to chain...');
      const client = await connectToChain(wallet);

      setClient(client);
      setAddress(address);

      console.log('Wallet loaded successfully');
      return { success: true, address };
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return {
        success: false,
        error: error.message || 'Failed to load wallet',
      };
    }
  };

  return {
    address,
    isConnecting,
    setupNewWallet,
    loadExistingWallet,
  };
};