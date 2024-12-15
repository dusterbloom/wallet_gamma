import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { useCosmWallet } from '../hooks/useCosmWallet';
import { useWebAuthn } from '../hooks/useWebAuthn';
import QRCode from 'react-qr-code';

export const SecurityScreen = ({ onBack }) => {
  const [mode, setMode] = useState('menu'); // menu, export, import, phrase
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { exportWallet, importWallet } = useCosmWallet();
  const webAuthn = useWebAuthn();

  const handleExport = async () => {
    try {
      setStatus('Verifying identity...');
      const { authKey } = await webAuthn.authenticate();
      
      setStatus('Preparing backup...');
      const { phrase, qrData } = await exportWallet(authKey);
      setRecoveryPhrase(phrase);
      setMode('phrase');
      setStatus('');
    } catch (error) {
      setError(error.message);
      setStatus('');
    }
  };

  const handleImport = async (phrase) => {
    try {
      setStatus('Verifying identity...');
      const { authKey } = await webAuthn.authenticate();
      
      setStatus('Restoring wallet...');
      await importWallet(phrase, authKey);
      setStatus('Wallet restored successfully!');
      setTimeout(() => onBack(), 2000);
    } catch (error) {
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
            <div className="text-sm text-zinc-500">Export your recovery phrase</div>
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
          You'll receive a 24-word recovery phrase. Keep it safe and never share it with anyone.
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
          Write these words down in order and keep them safe.
        </p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-2">
          {recoveryPhrase.split(' ').map((word, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm">{index + 1}.</span>
              <span className="font-mono">{word}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black p-4 rounded-xl">
        <QRCode
          value={recoveryPhrase}
          size={200}
          level="H"
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <button
          onClick={() => {
            setShowConfirmation(true);
            setRecoveryPhrase('');
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

  const renderImport = () => {
    const [inputPhrase, setInputPhrase] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-2">Restore Wallet</h3>
          <p className="text-zinc-500">
            Enter your 24-word recovery phrase to restore your wallet.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            value={inputPhrase}
            onChange={(e) => setInputPhrase(e.target.value)}
            placeholder="Enter recovery phrase..."
            className="w-full h-40 bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
                     outline-none resize-none"
          />

          <button
            onClick={() => setShowScanner(true)}
            className="w-full py-4 bg-zinc-900 rounded-xl text-white
                     transition-all duration-200 hover:bg-zinc-800
                     active:scale-98"
          >
            Scan QR Code
          </button>

          <button
            onClick={() => handleImport(inputPhrase)}
            disabled={!inputPhrase.trim()}
            className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                     transition-all duration-200 hover:bg-[#FF9500]/90
                     active:scale-98 disabled:opacity-50"
          >
            Restore Wallet
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Backup & Security"
        onBack={onBack}
      />
      
      <div className="flex-1 p-4">
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
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
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
