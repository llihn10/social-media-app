import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {

  const { user, token, logout } = useAuth()
  const [message, setMessage] = useState('Connecting...');

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('foryou');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const res = await authFetch(`${API_URL}/posts`,
          {},
          token,
          logout
        );
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

  const Header = () => (
    <View className='items-center pt-4 border-b border-gray-100 bg-secondary'>
      <Text className='text-2xl font-semibold text-dark-100 mb-4'>The Hut</Text>

      <View className='flex-row w-full justify-around'>
        {/* Tab - For you */}
        <TouchableOpacity
          className='flex-1 items-center pb-2'
          onPress={() => setActiveTab('foryou')}
        >
          <Text className={`font-bold ${activeTab === 'foryou' ? 'text-dark-100' : 'text-dark-200'}`}>
            For you
          </Text>
          {activeTab === 'foryou' && (
            <View className='absolute bottom-0 h-[3px] w-16 bg-primary rounded-full' />
          )}
        </TouchableOpacity>

        {/* Tab - Following */}
        <TouchableOpacity
          className='flex-1 items-center pb-2'
          onPress={() => setActiveTab('following')}
        >
          <Text className={`font-bold ${activeTab === 'following' ? 'text-dark-100' : 'text-dark-200'}`}>
            Following
          </Text>
          {activeTab === 'following' && (
            <View className='absolute bottom-0 h-[3px] w-16 bg-primary rounded-full' />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) return null;
  if (error) return null;

  return (
    <SafeAreaView className='flex-1 bg-secondary' edges={['top']}>

      <FlatList
        data={posts}
        // data={activeTab === 'foryou' ? postsForYou : postsFollowing}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (<PostCard post={item} />)}

        ListHeaderComponent={Header}

        extraData={activeTab}

        ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
        showsVerticalScrollIndicator={false}
      />

      {/* <Link href="/profile" className="text-blue-500">
        Profile
      </Link> */}

    </SafeAreaView>
  );
}

