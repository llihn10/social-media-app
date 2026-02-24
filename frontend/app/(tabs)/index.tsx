import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {

  const { user, token, logout } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('foryou')
  const [postsForYou, setPostsForYou] = useState<any[]>([])
  const [postsFollowing, setPostsFollowing] = useState<any[]>([])
  const [loadingTab, setLoadingTab] = useState<'foryou' | 'following' | null>(null)

  const fetchPosts = async (tab: 'foryou' | 'following') => {
    try {
      setLoadingTab(tab)

      const endpoint = tab === 'foryou'
        ? `${API_URL}/posts`
        : `${API_URL}/posts/following`

      const res = await authFetch(endpoint, {}, token, logout);
      const json = await res.json();

      if (tab === 'foryou') setPostsForYou(json.data)
      else setPostsFollowing(json.data)
    } catch (err) {
      console.error(err);
      setError('Failed to load posts')
    } finally {
      setLoadingTab(null);
    }
  }

  useEffect(() => {
    if (activeTab === 'foryou' && postsForYou.length === 0) {
      fetchPosts('foryou')
    }

    if (activeTab === 'following' && postsFollowing.length === 0) {
      fetchPosts('following')
    }
  }, [activeTab])

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

  const displayedPosts = activeTab === 'foryou' ? postsForYou : postsFollowing

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-secondary">
        <Text className="text-red-500">{error}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-secondary' edges={['top']}>

      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (<PostCard post={item} />)}
        ListHeaderComponent={Header}
        extraData={activeTab}
        ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
        showsVerticalScrollIndicator={false}
      />

      {loadingTab === activeTab && (
        <View className="py-3">
          <ActivityIndicator size="small" />
        </View>
      )}
    </SafeAreaView>
  );
}

