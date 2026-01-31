import PostCard from '@/components/PostCard';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View, FlatList } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [message, setMessage] = useState('Connecting...');

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/api/posts`);
        const json = await res.json();

        setPosts(json.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load posts')
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [])

  if (loading) return null;
  if (error) return null;

  return (
    <View className="">
      <Text className="text-5xl text-accent font-bold">Welcome!</Text>

      <Text className="text-base text-gray-600">
        {message}
      </Text>

      <Link href="/profile" className="text-blue-500">
        Profile
      </Link>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard post={item} />
        )}
        ItemSeparatorComponent={() => (
          <View className="border-t border-gray-200" />
        )}
      />
    </View>
  );
}

