import React, { useState } from 'react';
import { Header } from '../components/Screen.jsx';
import { useWebAuthn } from '../hooks/useWebAuthn.js';

export const SignupScreen = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const { register } = useWebAuthn();

  const handleSubmit = async () => {
    try {
      await register(username);
      onComplete();
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle error (show message to user)
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

// import React, { useState } from 'react';
// import { Header } from '../components/Screen.jsx';

// export const SignupScreen = ({ onComplete }) => {
//   const [step, setStep] = useState('email');  // email, verify, username, biometric
//   const [email, setEmail] = useState('');
//   const [code, setCode] = useState('');
//   const [username, setUsername] = useState('');

//   const handleNext = () => {
//     if (step === 'email' && email) {
//       // In real app: Send verification code
//       setStep('verify');
//     } else if (step === 'verify' && code.length === 6) {
//       setStep('username');
//     } else if (step === 'username' && username) {
//       setStep('biometric');
//     } else if (step === 'biometric') {
//       onComplete({ email, username });
//     }
//   };
//   return (
//     <div className="h-full flex flex-col bg-black">
//       <Header
//         title="Create Account"
//       />

//       <div className="flex-1 p-4">
//         {step === 'email' && (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-2xl font-medium mb-2">Welcome to Cycles</div>
//               <p className="text-zinc-500">Enter your email to get started</p>
//             </div>

//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Email address"
//               className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
//                        outline-none text-center text-xl"
//               autoFocus
//             />

//             {email.includes('@') && (
//               <div className="flex justify-center">
//                 <button
//                   onClick={handleNext}
//                   className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
//                            text-black font-medium
//                            transition-all duration-300 hover:bg-[#FF9500]/90
//                            active:scale-95"
//                 >
//                   <span className="text-lg">Continue</span>
//                   <span className="text-xl">→</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {step === 'verify' && (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-2xl font-medium mb-2">Enter Code</div>
//               <p className="text-zinc-500">We sent a code to {email}</p>
//             </div>

//             <div className="flex justify-center gap-2">
//               {[...Array(6)].map((_, i) => (
//                 <input
//                   key={i}
//                   type="text"
//                   maxLength="1"
//                   value={code[i] || ''}
//                   onChange={(e) => {
//                     const newCode = code.split('');
//                     newCode[i] = e.target.value;
//                     setCode(newCode.join(''));
//                     if (e.target.value && e.target.nextSibling) {
//                       e.target.nextSibling.focus();
//                     }
//                   }}
//                   className="w-12 h-14 bg-zinc-900 rounded-xl text-center text-xl
//                            outline-none focus:ring-2 focus:ring-[#FF9500]"
//                 />
//               ))}
//             </div>

//             {step === 'username' && (
//               <div className="space-y-6">
//                 <div className="text-center mb-8">
//                   <div className="text-2xl font-medium mb-2">Choose a Username</div>
//                   <p className="text-zinc-500">This will be displayed to other users</p>
//                 </div>

//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   placeholder="Username"
//                   className="w-full bg-zinc-900 rounded-xl p-4 text-white placeholder-zinc-500
//                        outline-none text-center text-xl"
//                   autoFocus
//                 />

//                 {username.length >= 3 && (
//                   <div className="flex justify-center">
//                     <button
//                       onClick={handleNext}
//                       className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
//                            text-black font-medium
//                            transition-all duration-300 hover:bg-[#FF9500]/90
//                            active:scale-95"
//                     >
//                       <span className="text-lg">Continue</span>
//                       <span className="text-xl">→</span>
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {code.length === 6 && (
//               <div className="flex justify-center">
//                 <button
//                   onClick={handleNext}
//                   className="h-14 px-8 bg-[#FF9500] rounded-full flex items-center gap-3
//                            text-black font-medium
//                            transition-all duration-300 hover:bg-[#FF9500]/90
//                            active:scale-95"
//                 >
//                   <span className="text-lg">Verify</span>
//                   <span className="text-xl">→</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {step === 'biometric' && (
//           <div className="space-y-6">
//             <div className="text-center mb-8">
//               <div className="text-2xl font-medium mb-2">Enable Face ID</div>
//               <p className="text-zinc-500">For quick and secure access</p>
//             </div>

//             <div className="flex justify-center mb-8">
//               <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center">
//                 <span className="text-4xl">👤</span>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <button
//                 onClick={handleNext}
//                 className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium
//                          transition-all duration-200 hover:bg-[#FF9500]/90
//                          active:scale-98"
//               >
//                 Enable Face ID
//               </button>

//               <button
//                 onClick={handleNext}
//                 className="w-full py-4 bg-zinc-900 rounded-xl text-white
//                          transition-all duration-200 hover:bg-zinc-800
//                          active:scale-98"
//               >
//                 Skip for Now
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
