import { useState } from 'react';
import { Buffer as BufferPolyfill } from 'buffer/';

export const useWebAuthn = () => {
  const [isSupported] = useState(() => {
    return window.PublicKeyCredential && 
           typeof window.PublicKeyCredential === 'function';
  });

  const generateAuthKey = async (credential) => {
    // Generate a deterministic key from the credential ID and raw ID
    const rawId = BufferPolyfill.from(credential.rawId).toString('base64');
    const credId = credential.id;
    const combinedData = `${rawId}:${credId}`;
    
    // Hash the combined data to get a consistent 256-bit key
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedData);
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    // Convert hash to base64 string
    return BufferPolyfill.from(hash).toString('base64');
  };

  const register = async (username) => {
    if (!isSupported) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('No platform authenticator available');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

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
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "required"
        },
        timeout: 60000
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Generate a proper 256-bit key from the credential
      const authKey = await generateAuthKey(credential);
      return { credential, authKey };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const authenticate = async () => {
    if (!isSupported) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('No platform authenticator available');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const domain = window.location.hostname || 'localhost';

      const publicKeyCredentialRequestOptions = {
        challenge,
        rpId: domain,
        timeout: 60000,
        userVerification: "required"
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (!credential) {
        throw new Error('Authentication failed');
      }

      // Generate the same 256-bit key from the credential
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
