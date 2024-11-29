import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function WalletScreen() {
  const [balance, setBalance] = useState('0');
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    const newWallet = ethers.Wallet.createRandom();
    setWallet(newWallet);
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="bg-blue-500 p-6 rounded-lg mb-6">
        <Text className="text-white text-lg mb-2">Balance</Text>
        <Text className="text-white text-3xl font-bold">${balance}</Text>
      </View>

      <View className="flex-row justify-between mb-6">
        <TouchableOpacity className="bg-green-500 p-4 rounded-lg flex-1 mr-2">
          <Text className="text-white text-center">Add Money</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-blue-500 p-4 rounded-lg flex-1 ml-2">
          <Text className="text-white text-center">Send Money</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-gray-100 p-4 rounded-lg">
        <Text className="font-bold mb-2">Wallet Address</Text>
        <Text className="text-gray-600">{wallet?.address}</Text>
      </View>
    </View>
  );
}
