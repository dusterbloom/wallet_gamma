import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { useWebAuthn } from '../hooks/useWebAuthn.js';
import { useCosmWallet } from '../hooks/useCosmWallet.js';

export const SignupScreen = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { register } = useWebAuthn();
  const { setupNewWallet } = useCosmWallet();

  const handleSubmit = async () => {
    try {
      // First register with WebAuthn
      const { authKey } = await register(username);
      
      // Then setup the Cosmos wallet
      const { success, address, error } = await setupNewWallet(username, authKey);
      
      if (!success) {
        throw new Error(error || 'Failed to setup wallet');
      }

      onComplete({ username, address });
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header title="Create Account" />

      <div className="flex-1 p-4">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="text-2xl font-medium mb-2">Choose a Username</div>
            <p className="text-zinc-500">This will be your identity on Cycles</p>
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

          {error && (
            <div className="text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          {username.length >= 3 && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
                         text-black font-medium
                         transition-all duration-300 hover:bg-[#FF9500]/90
                         active:scale-95"
              >
                <span className="text-lg">Create Passkey</span>
                <span className="text-xl">→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
