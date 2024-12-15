import { useState } from 'react';

export const useWebAuthn = () => {
  const [isSupported] = useState(() => {
    try {
      return window.isSecureContext && 
             window.PublicKeyCredential && 
             typeof window.PublicKeyCredential === 'function';
    } catch (e) {
      return false;
    }
  });

  const generateAuthKey = async (credential) => {
    try {
      // Convert credential data to bytes
      const rawId = new Uint8Array(credential.rawId);
      const idBytes = new TextEncoder().encode(credential.id);
      
      // Create a key derivation salt
      const salt = new TextEncoder().encode('user-specific-salt');

      // Use PBKDF2 to derive a key
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        rawId,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      // Derive the actual encryption key
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      return key;
    } catch (error) {
      console.error('Failed to generate auth key:', error);
      throw new Error('Failed to generate secure key');
    }
  };

  const register = async (username) => {
    if (!isSupported) {
      throw new Error('WebAuthn is not supported in this browser or requires HTTPS');
    }

    try {
      // Generate challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      // Get domain, fallback to localhost for development
      const domain = window.location.hostname || 'localhost';

      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Cycles Pocket",
          id: domain
        },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },  // ES256
          { type: "public-key", alg: -257 } // RS256
        ],
        authenticatorSelection: {
          userVerification: "preferred",
          residentKey: "preferred"
        },
        attestation: "none",
        timeout: 60000
      };

      console.log('Attempting to create credential with options:', publicKeyCredentialCreationOptions);

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      console.log('Credential created successfully:', credential);

      const authKey = await generateAuthKey(credential);
      return { credential, authKey };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const authenticate = async () => {
    if (!isSupported) {
      throw new Error('WebAuthn is not supported in this browser or requires HTTPS');
    }

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const domain = window.location.hostname || 'localhost';

      const publicKeyCredentialRequestOptions = {
        challenge,
        rpId: domain,
        timeout: 60000,
        userVerification: "preferred"
      };

      console.log('Attempting to get credential with options:', publicKeyCredentialRequestOptions);

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
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
