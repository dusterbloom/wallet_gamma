import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { useWebAuthn } from '../hooks/useWebAuthn.js';
import { useCosmWallet } from '../hooks/useCosmWallet.js';

export const LoginScreen = ({ onComplete }) => {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const webAuthn = useWebAuthn();
  const { loadExistingWallet } = useCosmWallet();

  const handleLogin = async () => {
    try {
      setStatus('Verifying identity...');
      const { authKey } = await webAuthn.authenticate();
      
      setStatus('Loading wallet...');
      const { success, address, error } = await loadExistingWallet(username, authKey);
      
      if (!success) {
        throw new Error(error || 'Failed to load wallet');
      }

      setStatus('Success!');
      onComplete({ address });
    } catch (error) {
      console.error('Authentication failed:', error);
      setError(error.message);
      setStatus('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header title="Sign In" />

      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="space-y-6 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-2xl font-medium mb-2">Welcome Back</div>
            <p className="text-zinc-500">Sign in with your username and passkey</p>
          </div>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                     outline-none text-center text-xl"
            autoFocus
          />

          {status && (
            <div className="text-center text-sm text-zinc-400">
              {status}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          {username.length >= 3 && (
            <button
              onClick={handleLogin}
              className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                     transition-all duration-200 hover:bg-[#FF9500]/90
                     active:scale-98"
            >
              Continue with Passkey
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
