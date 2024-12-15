import { useState } from 'react';
import { Buffer as BufferPolyfill } from 'buffer/';

export const useWebAuthn = () => {
  const [isSupported] = useState(() => {
    return window.PublicKeyCredential && 
           typeof window.PublicKeyCredential === 'function';
  });

  const generateAuthKey = (credential) => {
    // Generate a deterministic key from the credential ID and raw ID
    const rawId = BufferPolyfill.from(credential.rawId).toString('base64');
    const credId = credential.id;
    return `${rawId}:${credId}`;
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

      const domain = window.location.hostname;
      
      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Cycles Pocket",
          id: domain
        },
        user: {
          id: new Uint8Array(16),
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

      // Generate an auth key from the credential
      const authKey = generateAuthKey(credential);
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

      const domain = window.location.hostname;

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

      // Generate an auth key from the credential
      const authKey = generateAuthKey(credential);
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
