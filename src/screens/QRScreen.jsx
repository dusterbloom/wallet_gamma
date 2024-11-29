import React from 'react';
import { Header } from '../components/Screen.jsx';
import QRCode from 'react-qr-code';

export const QRScreen = ({ amount, note, onBack, onClose }) => {
  const paymentLink = `https://cycles.app/pay/${btoa(JSON.stringify({
    amount,
    note,
    timestamp: Date.now()
  }))}`;

  const handleShareViaEmail = () => {
    const subject = 'Payment Request';
    const body = `
Hello,

You've received a payment request for $${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}${note ? ` for ${note}` : ''}.

Click here to pay: ${paymentLink}

Best regards,
Sent via Cycles
    `.trim();

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <Header 
        title="Request Payment"
        onBack={onBack}
        onClose={onClose}
      />
      
      <div className="flex-1 flex flex-col items-center p-4">
        <div className="text-center mb-4">
          <div className="text-3xl font-medium mb-2">
            ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          {note && <p className="text-zinc-500">{note}</p>}
        </div>

        <div className="bg-white p-6 rounded-2xl mb-8">
          <QRCode 
            value={paymentLink}
            size={200}
            level="H"
          />
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={handleShareViaEmail}
            className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
                     transition-all duration-200 hover:bg-[#FF9500]/90 
                     active:scale-98 flex items-center justify-center gap-2"
          >
            <span className="text-xl">✉️</span>
            Share via Email
          </button>

          <button
            className="w-full py-4 bg-zinc-900 rounded-xl text-white
                     transition-all duration-200 hover:bg-zinc-800 
                     active:scale-98 flex items-center justify-center gap-2"
          >
            <span className="text-xl">🔗</span>
            Copy Link
          </button>
        </div>
        
        <div className="text-center text-zinc-500 mt-6">
          <p>Scan QR code or use links to pay</p>
          <p className="text-sm mt-2">Request expires in 15 minutes</p>
        </div>
      </div>
    </div>
  );
};
