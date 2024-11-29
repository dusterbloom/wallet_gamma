import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function SplitBillScreen() {
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState('');

  const calculateSplit = () => {
    const splitAmount = parseFloat(amount) / parseInt(people);
    return isNaN(splitAmount) ? '0' : splitAmount.toFixed(2);
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Split a Bill</Text>

      <View className="mb-4">
        <Text className="mb-2">Total Amount</Text>
        <TextInput
          className="border border-gray-300 p-2 rounded-lg"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
        />
      </View>

      <View className="mb-6">
        <Text className="mb-2">Number of People</Text>
        <TextInput
          className="border border-gray-300 p-2 rounded-lg"
          keyboardType="numeric"
          value={people}
          onChangeText={setPeople}
          placeholder="Enter number of people"
        />
      </View>

      <View className="bg-gray-100 p-4 rounded-lg mb-6">
        <Text className="text-center text-lg">Each person pays</Text>
        <Text className="text-center text-3xl font-bold">${calculateSplit()}</Text>
      </View>

      <TouchableOpacity className="bg-blue-500 p-4 rounded-lg">
        <Text className="text-white text-center font-bold">Send Payment Requests</Text>
      </TouchableOpacity>
    </View>
  );
}
