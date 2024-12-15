import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { useCosmWallet } from '../hooks/useCosmWallet';
import { useWebAuthn } from '../hooks/useWebAuthn';

export const SecurityScreen = ({ onBack }) => {
  const [mode, setMode] = useState('menu');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [inputPhrase, setInputPhrase] = useState('');
  const { address, mnemonic, importWallet } = useCosmWallet();
  const webAuthn = useWebAuthn();

  const handleBackupToEmail = async () => {
    try {
      setStatus('Verifying identity...');
      await webAuthn.authenticate();
      setStatus('Preparing backup...');

      // Validate wallet data
      if (!address || !mnemonic) {
        console.error('Missing wallet data:', { address, mnemonic: !!mnemonic });
        throw new Error('Wallet data not available. Please ensure you are logged in.');
      }

      console.log('Creating backup email with address:', address);

      const subject = 'Your Wallet Backup - KEEP THIS SAFE!';
      const body = `
IMPORTANT: This is your wallet backup. Keep it extremely safe and secret!

Your wallet address:
${address}

Your recovery phrase (keep this secret and safe!):
${mnemonic}

SECURITY WARNINGS:
- Never share this recovery phrase with anyone
- Store it in a safe place
- Anyone with access to this phrase can access your funds
- Cycles will never ask for this phrase
      `.trim();

      // Create mailto link
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      setStatus('Backup email prepared');
    } catch (error) {
      console.error('Backup failed:', error);
      setError(error.message);
      setStatus('');
    }
  };

  const handleImport = async () => {
    try {
      if (!username || !inputPhrase) {
        throw new Error('Please provide both username and recovery phrase');
      }

      setStatus('Verifying identity...');
      const { authKey } = await webAuthn.authenticate();
      
      setStatus('Restoring wallet...');
      await importWallet(inputPhrase, username, authKey);
      setStatus('Wallet restored successfully!');
      setTimeout(() => onBack(), 2000);
    } catch (error) {
      console.error('Import failed:', error);
      setError(error.message);
      setStatus('');
    }
  };

  const renderMenu = () => (
    <div className="space-y-4">
      <button
        onClick={handleBackupToEmail}
        className="w-full p-4 bg-zinc-900 rounded-xl flex items-center justify-between
                 transition-all duration-200 hover:bg-zinc-800 active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
            <span className="text-xl">📧</span>
          </div>
          <div className="text-left">
            <div className="font-medium">Email Backup</div>
            <div className="text-sm text-zinc-500">Send recovery phrase to your email</div>
          </div>
        </div>
        <span>→</span>
      </button>

      <button
        onClick={() => setMode('import')}
        className="w-full p-4 bg-zinc-900 rounded-xl flex items-center justify-between
                 transition-all duration-200 hover:bg-zinc-800 active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
            <span className="text-xl">📥</span>
          </div>
          <div className="text-left">
            <div className="font-medium">Restore Wallet</div>
            <div className="text-sm text-zinc-500">Import using recovery phrase</div>
          </div>
        </div>
        <span>→</span>
      </button>
    </div>
  );

  const renderImport = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">Restore Wallet</h3>
        <p className="text-zinc-500">
          Enter your username and recovery phrase to restore your wallet.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                   outline-none"
        />

        <textarea
          value={inputPhrase}
          onChange={(e) => setInputPhrase(e.target.value)}
          placeholder="Paste your recovery phrase here..."
          className="w-full h-40 bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                   outline-none resize-none font-mono"
        />

        <button
          onClick={handleImport}
          disabled={!username || !inputPhrase.trim()}
          className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                   transition-all duration-200 hover:bg-[#FF9500]/90
                   active:scale-98 disabled:opacity-50"
        >
          Restore Wallet
        </button>

        <button
          onClick={() => setMode('menu')}
          className="w-full py-4 bg-zinc-900 rounded-xl text-white
                   transition-all duration-200 hover:bg-zinc-800
                   active:scale-98"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Backup & Security"
        onBack={onBack}
      />
      
      <div className="flex-1 p-4 overflow-y-auto">
        {status && (
          <div className="text-center text-sm text-zinc-400 mb-4">
            {status}
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-500 mb-4">
            {error}
          </div>
        )}

        {mode === 'menu' && renderMenu()}
        {mode === 'import' && renderImport()}
      </div>
    </div>
  );
};
