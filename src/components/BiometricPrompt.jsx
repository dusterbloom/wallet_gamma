import React from 'react';

export const BiometricPrompt = ({ onSuccess, onCancel, type = 'confirm' }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center p-4 z-50
                    animate-in fade-in slide-in-from-bottom duration-300">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-6 space-y-6">
        <div className="text-center">
          <div className="text-xl font-medium mb-2">
            {type === 'confirm' ? 'Confirm Payment' : 'Verify Identity'}
          </div>
          <p className="text-zinc-500">Use Face ID to continue</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onSuccess}
            className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center
                     transition-all duration-200 hover:bg-zinc-700 active:scale-95"
          >
            <span className="text-3xl">👤</span>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full py-4 bg-zinc-800 rounded-xl text-white
                   transition-all duration-200 hover:bg-zinc-700
                   active:scale-98"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
