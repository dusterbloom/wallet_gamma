import { useState } from 'react';

export const useWebAuthn = () => {
  const [isSupported] = useState(() => {
    try {
      return window.PublicKeyCredential !== undefined;
    } catch (e) {
      return false;
    }
  });

  const generateAuthKey = async (credential) => {
    try {
      const rawId = new Uint8Array(credential.rawId);
      const salt = new TextEncoder().encode('cosmos-wallet-v1');
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        rawId,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );

      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Key generation failed:', error);
      throw new Error('Failed to generate key');
    }
  };

  const register = async (username) => {
    if (!isSupported) {
      throw new Error('WebAuthn not supported');
    }

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Cycles Wallet",
            id: window.location.hostname
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: username,
            displayName: username
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }
          ],
          timeout: 60000,
          attestation: "none"
        }
      });

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const authKey = await generateAuthKey(credential);
      return { credential, authKey };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const authenticate = async () => {
    if (!isSupported) {
      throw new Error('WebAuthn not supported');
    }

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "preferred"
        }
      });

      if (!credential) {
        throw new Error('Authentication failed');
      }

      const authKey = await generateAuthKey(credential);
      return { credential, authKey };
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  };

  return {
    isSupported,
    register,
    authenticate
  };
};
