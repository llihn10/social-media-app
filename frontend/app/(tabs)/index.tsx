import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [message, setMessage] = useState('Connecting...');

  useEffect(() => {
    const connectBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/search`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('Backend response:', data);

        setMessage(data.message);
      } catch (error) {
        console.log('FETCH ERROR:', error);
        console.log('API_URL =', API_URL);

        setMessage('❌ Cannot connect to backend');
      }
    };

    connectBackend();
  }, []);

  return (
    <View className="flex-1 justify-center items-center gap-4">
      <Text className="text-5xl text-accent font-bold">Welcome!</Text>

      <Text className="text-base text-gray-600">
        {message}
      </Text>

      <Link href="/profile" className="text-blue-500">
        Profile
      </Link>
    </View>
  );
}

