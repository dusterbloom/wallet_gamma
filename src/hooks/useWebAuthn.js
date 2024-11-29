import { useState } from 'react';

export const useWebAuthn = () => {
  const [isSupported] = useState(() => {
    return window.PublicKeyCredential && 
           typeof window.PublicKeyCredential === 'function';
  });

  const register = async (username) => {
    if (!isSupported) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('No platform authenticator available');
      }

      // This would come from your backend in production
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Get the domain without protocol
      const domain = window.location.hostname;
      
      const publicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Cycles Pocket",
          // For Netlify sites, use the full domain
          id: domain
        },
        user: {
          id: new Uint8Array(16), // Should be unique per user
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 } // RS256
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

      return credential;
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

      return credential;
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