import { useState } from 'react';

export const useWebAuthn = () => {
  const [isSupported] = useState(() => {
    return window.PublicKeyCredential && 
           typeof window.PublicKeyCredential === 'function';
  });

  const authenticate = async () => {
    if (!isSupported) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      // Check if user has biometric capability
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (!available) {
        throw new Error('No platform authenticator available');
      }

      // This would be provided by your backend in a real app
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: "required"
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      return !!credential;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  };

  return {
    isSupported,
    authenticate
  };
};
