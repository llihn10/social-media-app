import PostCard from '@/components/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { authFetch } from '@/services/authFetch';
import { useCallback, useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Search } from 'lucide-react-native';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useFocusEffect } from 'expo-router';
import { useSearch } from '@/contexts/SearchContext';
import { API_URL } from '@/config/api'

export default function HomeScreen() {

  const { user, token, logout } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('foryou')
  const [postsForYou, setPostsForYou] = useState<any[]>([])
  const [postsFollowing, setPostsFollowing] = useState<any[]>([])
  const [loadingTab, setLoadingTab] = useState<'foryou' | 'following' | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPosts = async (tab: 'foryou' | 'following', isRefresh = false) => {
    try {
      if (!isRefresh) setLoadingTab(tab)

      const endpoint = tab === 'foryou'
        ? `${API_URL}/posts`
        : `${API_URL}/posts/following`

      const res = await authFetch(endpoint, {}, token, logout);

      if (!res) return;

      const json = await res.json();

      if (tab === 'foryou') setPostsForYou(json.data)
      else setPostsFollowing(json.data)
    } catch (err) {
      // console.error(err);
      setError('Failed to load posts')
      Alert.alert('Error', 'Failed to load posts')
    } finally {
      if (!isRefresh) setLoadingTab(null);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchPosts(activeTab as 'foryou' | 'following', true)
    setRefreshing(false)
  }

  useEffect(() => {
    if (activeTab === 'foryou' && postsForYou.length === 0) {
      fetchPosts('foryou')
    }

    if (activeTab === 'following' && postsFollowing.length === 0) {
      fetchPosts('following')
    }
  }, [activeTab])

  useFocusEffect(
    useCallback(() => {
      fetchPosts('foryou');
    }, [activeTab])
  );

  const navigation = useNavigation();
  const { openSearch } = useSearch();

  const renderEmptyState = () => {
    if (loadingTab === activeTab) return null;

    return (
      <View className="flex-1 items-center justify-center pt-20 px-8">
        {activeTab === 'foryou' ? (
          <View className="items-center">
            <Text className="text-gray-500 text-lg font-medium text-center">
              No posts recently
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Check back later for more content!
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-gray-500 text-lg font-medium text-center">
              Your following feed is empty
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Start following someone to see their latest posts here.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const Header = () => (
    <View className='pt-4 border-b border-gray-100 bg-secondary'>
      <View className='flex-row items-center justify-between px-4 mb-4'>
        <TouchableOpacity onPress={() => navigation.getParent()?.dispatch(DrawerActions.openDrawer())} className="p-1">
          <Menu size={26} color="#4B5563" />
        </TouchableOpacity>

        <Text className='text-2xl font-semibold text-dark-100'>The Hut</Text>

        <TouchableOpacity onPress={openSearch} className="p-1">
          <Search size={26} color="#4B5563" />
        </TouchableOpacity>
      </View>

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

  if (!user) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Please login</Text>
      </SafeAreaView>
    )
  }

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
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={displayedPosts?.length === 0 ? { flexGrow: 1 } : {}}
        extraData={activeTab}
        ItemSeparatorComponent={() => (<View className="border-t border-gray-200" />)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7B4A2E" colors={["#7B4A2E"]} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={8}
      />

      {loadingTab === activeTab && (
        <View className="py-3">
          <ActivityIndicator size="small" />
        </View>
      )}
    </SafeAreaView>
  );
}