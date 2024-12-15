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
      // Get the raw credential ID as bytes
      const rawId = new Uint8Array(credential.rawId);
      
      // Create a consistent salt
      const salt = new TextEncoder().encode('cosmos-wallet-v1');
      
      // Import the raw ID as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        rawId,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // Derive a key using PBKDF2
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true, // extractable
        ['encrypt', 'decrypt']
      );

      return key;
    } catch (error) {
      console.error('Key generation failed:', error);
      throw new Error('Failed to generate secure key');
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
            id: window.location.hostname || 'localhost'
          },
          user: {
            id: new TextEncoder().encode(username), // Use username as ID
            name: username,
            displayName: username
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 } // RS256
          ],
          authenticatorSelection: {
            userVerification: "preferred",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "none"
        }
      });

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      console.log('Credential created:', credential);
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
          userVerification: "preferred",
        }
      });

      if (!credential) {
        throw new Error('Authentication failed');
      }

      console.log('Authentication successful:', credential);
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
