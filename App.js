import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import WalletScreen from './src/screens/WalletScreen';
import SplitBillScreen from './src/screens/SplitBillScreen';
import { StripeProvider } from '@stripe/stripe-react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <StripeProvider publishableKey="your_publishable_key">
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="SplitBill" component={SplitBillScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}
