import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { useCosmWallet } from '../hooks/useCosmWallet';
import { useWebAuthn } from '../hooks/useWebAuthn';

export const SecurityScreen = ({ onBack }) => {
  const [mode, setMode] = useState('menu');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [username, setUsername] = useState('');
  const [inputPhrase, setInputPhrase] = useState('');
  const [copied, setCopied] = useState(false);
  const { exportWallet, importWallet } = useCosmWallet();
  const webAuthn = useWebAuthn();

  const handleExport = async () => {
    try {
      setStatus('Verifying identity...');
      await webAuthn.authenticate();
      
      setStatus('Preparing backup...');
      const { phrase } = await exportWallet();
      setRecoveryPhrase(phrase);
      setMode('phrase');
      setStatus('');
    } catch (error) {
      console.error('Export failed:', error);
      setError(error.message);
      setStatus('');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(recoveryPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleEmailBackup = () => {
    const subject = 'Wallet Recovery Phrase Backup';
    const body = `
IMPORTANT: Keep this recovery phrase safe and secret!

Your recovery phrase:
${recoveryPhrase}

DO NOT share this phrase with anyone. Anyone with access to this phrase can access your funds.
    `.trim();

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
        onClick={() => setMode('export')}
        className="w-full p-4 bg-zinc-900 rounded-xl flex items-center justify-between
                 transition-all duration-200 hover:bg-zinc-800 active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FF9500] flex items-center justify-center">
            <span className="text-xl">📤</span>
          </div>
          <div className="text-left">
            <div className="font-medium">Backup Wallet</div>
            <div className="text-sm text-zinc-500">Save your recovery phrase</div>
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

  const renderExport = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">Backup Your Wallet</h3>
        <p className="text-zinc-500">
          You'll receive a recovery phrase. Keep it safe and never share it with anyone.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3 text-yellow-500">
          <span className="text-2xl">⚠️</span>
          <div className="text-sm">
            Anyone with access to your recovery phrase can access your funds.
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleExport}
          className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                   transition-all duration-200 hover:bg-[#FF9500]/90
                   active:scale-98"
        >
          Continue with Passkey
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

  const renderPhrase = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-medium mb-2">Recovery Phrase</h3>
        <p className="text-zinc-500">
          Save these words in a secure place.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4">
        <pre className="whitespace-pre-wrap break-all font-mono text-sm">
          {recoveryPhrase}
        </pre>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCopyToClipboard}
          className="w-full py-4 bg-zinc-900 rounded-xl text-white
                   transition-all duration-200 hover:bg-zinc-800
                   active:scale-98"
        >
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>

        <button
          onClick={handleEmailBackup}
          className="w-full py-4 bg-zinc-900 rounded-xl text-white
                   transition-all duration-200 hover:bg-zinc-800
                   active:scale-98"
        >
          Email to Myself
        </button>

        <button
          onClick={() => {
            setShowConfirmation(true);
          }}
          className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                   transition-all duration-200 hover:bg-[#FF9500]/90
                   active:scale-98"
        >
          I've Saved My Phrase
        </button>
      </div>
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
        {mode === 'export' && renderExport()}
        {mode === 'phrase' && renderPhrase()}
        {mode === 'import' && renderImport()}

        {showConfirmation && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md space-y-4">
              <h3 className="text-xl font-medium text-center">Confirm Backup</h3>
              <p className="text-zinc-500 text-center">
                Have you safely stored your recovery phrase?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-4 bg-zinc-800 rounded-xl"
                >
                  No, Go Back
                </button>
                <button
                  onClick={() => {
                    setShowConfirmation(false);
                    setMode('menu');
                    setRecoveryPhrase(''); // Clear the phrase for security
                  }}
                  className="flex-1 py-4 bg-[#FF9500] rounded-xl text-black"
                >
                  Yes, Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
