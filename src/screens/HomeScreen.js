import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-2xl font-bold">PaySplit</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
          <Text className="text-blue-500">Wallet</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="bg-blue-500 p-4 rounded-lg mb-4"
        onPress={() => navigation.navigate('SplitBill')}
      >
        <Text className="text-white text-center font-bold">Split a Bill</Text>
      </TouchableOpacity>

      <View className="bg-gray-100 rounded-lg p-4">
        <Text className="font-bold mb-2">Recent Activity</Text>
        {/* Activity list will go here */}
      </View>
    </View>
  );
}
