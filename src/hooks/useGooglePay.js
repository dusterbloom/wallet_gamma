import { useState, useEffect } from 'react';

const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
    allowedCardNetworks: ['MASTERCARD', 'VISA']
  }
};

export const useGooglePay = () => {
  const [isReadyToPay, setIsReadyToPay] = useState(false);
  const [googlePayClient, setGooglePayClient] = useState(null);

  useEffect(() => {
    const initGooglePay = async () => {
      try {
        if (!window.google?.payments?.api) {
          console.log('Google Pay not available');
          return;
        }

        const client = new google.payments.api.PaymentsClient({
          environment: 'TEST' // Change to 'PRODUCTION' for live
        });

        const readyToPay = await client.isReadyToPay({
          ...baseRequest,
          allowedPaymentMethods: [baseCardPaymentMethod]
        });

        setIsReadyToPay(readyToPay?.result);
        setGooglePayClient(client);
      } catch (error) {
        console.error('Google Pay initialization error:', error);
      }
    };

    initGooglePay();
  }, []);

  const createPaymentRequest = (amount) => {
    return {
      ...baseRequest,
      allowedPaymentMethods: [baseCardPaymentMethod],
      merchantInfo: {
        merchantId: 'YOUR-MERCHANT-ID', // Replace with your merchant ID
        merchantName: 'Cycles App'
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: amount.toString(),
        currencyCode: 'USD',
        countryCode: 'US'
      }
    };
  };

  const processPayment = async (amount) => {
    try {
      const paymentDataRequest = createPaymentRequest(amount);
      const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);
      return paymentData;
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  };

  return {
    isReadyToPay,
    processPayment
  };
};
