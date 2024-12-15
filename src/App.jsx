import React, { useState } from 'react';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { Screen } from './components/Screen.jsx';
import { LoginScreen } from './screens/LoginScreen.jsx';
import { SignupScreen } from './screens/SignupScreen.jsx';
import { WalletScreen } from './screens/WalletScreen.jsx';
import { AmountScreen } from './screens/AmountScreen.jsx';
import { NoteScreen } from './screens/NoteScreen.jsx';
import { ReviewScreen } from './screens/ReviewScreen.jsx';
import { QRScreen } from './screens/QRScreen.jsx';
import { ProcessingScreen } from './screens/ProcessingScreen.jsx';
import { GroupScreen } from './screens/GroupScreen.jsx';
import { ExpenseScreen } from './screens/ExpenseScreen.jsx';
import { HistoryScreen } from './screens/HistoryScreen.jsx';
import { SecurityScreen } from './screens/SecurityScreen.jsx';
import SplitDetailsScreen from './screens/SplitDetailsScreen.jsx';
import { NewGroupScreen } from './screens/NewGroupScreen.jsx';
import { CashoutScreen } from './screens/CashoutScreen.jsx';
import { useGroups } from './hooks/useGroups.js';
import { Celebrations } from './components/Celebrations.jsx';

function App() {
  const [activeScreen, setActiveScreen] = useState('welcome');
  const [transactionType, setTransactionType] = useState('send');
  const [transactionAmount, setTransactionAmount] = useState(null);
  const [transactionNote, setTransactionNote] = useState('');

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expense, setExpense] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    addBill,
    updateBill,
    deleteBill,
  } = useGroups();

  const navigate = (screen) => {
    console.log('Navigating to:', screen);
    setActiveScreen(screen);
  };

  const handleBack = () => {
    console.log('Going back from:', activeScreen);
    switch (activeScreen) {
      case 'amount':
      case 'history':
      case 'cashout':
      case 'security': // Add this case
        navigate('wallet');
        break;
      case 'note':
        navigate('amount');
        break;
      case 'review':
        navigate('note');
        break;
      case 'qr':
        navigate('note');
        break;
      case 'group':
        navigate('wallet');
        break;
      case 'expense':
        navigate('group');
        break;
      case 'splitDetails':
        navigate('group');
        break;
      case 'newGroup':
        navigate('group');
        break;
      default:
        navigate('wallet');
    }
  };

  const handleContinue = (data) => {
    console.log('Continue with data:', data, 'from screen:', activeScreen);
    if (activeScreen === 'wallet') {
      switch (data) {
        case 'send':
        case 'request':
        case 'deposit':
          setTransactionType(data);
          navigate('amount');
          break;
        case 'split':
          navigate('group');
          break;
        case 'cashout':
          navigate('cashout');
          break;
        case 'history':
          navigate('history');
          break;
        case 'security': // Add this case
          navigate('security');
          break;
        default:
          console.log('Unknown action:', data);
      }
    } else if (activeScreen === 'amount') {
      setTransactionAmount(data);
      navigate('note');
    } else if (activeScreen === 'note') {
      setTransactionNote(data);
      navigate(transactionType === 'request' ? 'qr' : 'review');
    } else if (activeScreen === 'group') {
      if (data.id === 'new') {
        navigate('newGroup');
      } else {
        setSelectedGroup(data);
        if (data.selectedBill) {
          setSelectedBill(data.selectedBill);
          navigate('splitDetails');
        } else {
          navigate('expense');
        }
      }
    } else if (activeScreen === 'newGroup') {
      const newGroup = { ...data, bills: [] };
      addGroup(newGroup);
      setSelectedGroup(newGroup);
      navigate('expense');
    } else if (activeScreen === 'expense') {
      const newBill = {
        id: Date.now().toString(),
        amount: data.amount,
        description: data.description || 'No description',
        date: 'Today',
        settled: false
      };
      addBill(selectedGroup.id, newBill);
      navigate('group');
    } else if (activeScreen === 'splitDetails') {
      if (selectedBill) {
        updateBill(selectedGroup.id, selectedBill.id, { ...selectedBill, settled: true });
      }
      showSuccessAndReturn();
    }
  };

  const showSuccessAndReturn = () => {
    setShowConfetti(true);
    navigate('processing');
    setTimeout(() => {
      setShowConfetti(false);
      navigate('wallet');
    }, 2000);
  };

  const handleComplete = () => {
    showSuccessAndReturn();
  };

  return (
    <BlockchainProvider>
      <div className="relative w-full h-full min-h-screen bg-black text-white">
        {/* ... other screens ... */}

        <Screen isActive={activeScreen === 'security'}>
          <SecurityScreen
            onBack={handleBack}
          />
        </Screen>

        {/* ... rest of the screens ... */}
        <Screen isActive={activeScreen === 'welcome'}>
          <div className="h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-8">Welcome to Cycles</h1>
            <div className="w-full space-y-4">
              <button
                onClick={() => navigate('signup')}
                className="w-full py-4 bg-[#FF9500] rounded-xl text-black font-medium"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('login')}
                className="w-full py-4 bg-zinc-900 rounded-xl text-white"
              >
                Sign In
              </button>
            </div>
          </div>
        </Screen>

        <Screen isActive={activeScreen === 'login'}>
          <LoginScreen
            onComplete={() => {
              navigate('wallet');
            }}
          />
        </Screen>

        <Screen isActive={activeScreen === 'signup'}>
          <SignupScreen
            onComplete={() => {
              navigate('wallet');
            }}
          />
        </Screen>

        <Screen isActive={activeScreen === 'wallet'}>
          <WalletScreen onNavigate={handleContinue} />
        </Screen>

        <Screen isActive={activeScreen === 'amount'}>
          <AmountScreen
            type={transactionType}
            balance={15462.10}
            onBack={handleBack}
            onContinue={handleContinue}
          />
        </Screen>

        <Screen isActive={activeScreen === 'note'}>
          <NoteScreen
            type={transactionType}
            amount={transactionAmount}
            onBack={handleBack}
            onContinue={handleContinue}
          />
        </Screen>

        <Screen isActive={activeScreen === 'review'}>
          <ReviewScreen
            amount={transactionAmount}
            note={transactionNote}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        </Screen>

        <Screen isActive={activeScreen === 'qr'}>
          <QRScreen
            amount={transactionAmount}
            note={transactionNote}
            onBack={handleBack}
            onClose={() => navigate('wallet')}
          />
        </Screen>

        <Screen isActive={activeScreen === 'processing'}>
          <ProcessingScreen
            type={transactionType === 'send' ? 'Sending' : 'Requesting'}
            amount={transactionAmount}
            onClose={() => navigate('wallet')}
          />
        </Screen>

        <Screen isActive={activeScreen === 'group'}>
          <GroupScreen
            groups={groups}
            onBack={handleBack}
            onContinue={handleContinue}
            onDeleteGroup={deleteGroup}
            onDeleteBill={deleteBill}
            onUpdateBill={updateBill}
          />
        </Screen>

        <Screen isActive={activeScreen === 'expense'}>
          <ExpenseScreen
            group={selectedGroup}
            onBack={handleBack}
            onContinue={handleContinue}
          />
        </Screen>

        <Screen isActive={activeScreen === 'splitDetails'}>
          <SplitDetailsScreen
            group={selectedGroup}
            expense={expense}
            bill={selectedBill}
            onBack={handleBack}
            onContinue={handleContinue}
            onUpdateBill={(billData) => updateBill(selectedGroup.id, selectedBill.id, billData)}
          />
        </Screen>

        <Screen isActive={activeScreen === 'newGroup'}>
          <NewGroupScreen
            onBack={handleBack}
            onComplete={handleContinue}
          />
        </Screen>

        <Screen isActive={activeScreen === 'history'}>
          <HistoryScreen
            onBack={handleBack}
          />
        </Screen>

        <Screen isActive={activeScreen === 'cashout'}>
          <CashoutScreen
            balance={15462.10}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        </Screen>

        <Celebrations isActive={showConfetti} />
      </div>
    </BlockchainProvider>
  );
}

export default App;
