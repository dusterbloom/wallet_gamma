import React, { useState } from 'react';
import { useWebAuthn } from '../hooks/useWebAuthn';

export const AuthPrompt = ({ onSuccess, onCancel, type = 'confirm' }) => {
  const { isSupported, authenticate } = useWebAuthn();
  const [error, setError] = useState('');

  const handleAuth = async () => {
    try {
      const result = await authenticate();
      if (result) {
        onSuccess();
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center p-4 z-50
                    animate-in fade-in slide-in-from-bottom duration-300">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-6 space-y-6">
        <div className="text-center">
          <div className="text-xl font-medium mb-2">
            {type === 'confirm' ? 'Confirm Payment' : 'Verify Identity'}
          </div>
          <p className="text-zinc-500">
            {isSupported 
              ? 'Use your device security to continue' 
              : 'Device security not available'}
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-center text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isSupported ? (
            <button
              onClick={handleAuth}
              className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                       transition-all duration-200 hover:bg-[#FF9500]/90
                       active:scale-98 flex items-center justify-center gap-2"
            >
              <span className="text-xl">🔐</span>
              Authenticate
            </button>
          ) : (
            <button
              onClick={onSuccess}
              className="w-full py-4 bg-zinc-800 rounded-xl text-white
                       transition-all duration-200 hover:bg-zinc-700
                       active:scale-98"
            >
              Continue with Password
            </button>
          )}

          <button
            onClick={onCancel}
            className="w-full py-4 bg-zinc-800 rounded-xl text-white
                     transition-all duration-200 hover:bg-zinc-700
                     active:scale-98"
          >
            Cancel
          </button>
        </div>

        {isSupported && (
          <p className="text-xs text-zinc-500 text-center">
            Your device's authentication system will be used to verify your identity
          </p>
        )}
      </div>
    </div>
  );
};
