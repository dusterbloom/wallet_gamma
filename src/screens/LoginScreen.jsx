import React from 'react';
import { Header } from '../components/Screen.jsx';
import { useWebAuthn } from '../hooks/useWebAuthn.js';

export const LoginScreen = ({ onComplete }) => {
  const { authenticate } = useWebAuthn();

  const handleLogin = async () => {
    try {
      await authenticate();
      onComplete();
    } catch (error) {
      console.error('Authentication failed:', error);
      // Handle error (show message to user)
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header title="Sign In" />

      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="space-y-6 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-2xl font-medium mb-2">Welcome Back</div>
            <p className="text-zinc-500">Sign in with your passkey</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                     transition-all duration-200 hover:bg-[#FF9500]/90
                     active:scale-98"
          >
            Continue with Passkey
          </button>
        </div>
      </div>
    </div>
  );
};