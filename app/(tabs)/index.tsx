import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View
      className='flex-1 jusitfy-content items-center'
    >
      <Text className='text-5xl text-accent font-bold'>Welcome!</Text>
      <Link href="/profile">Profile</Link>
    </View >
  );
}

