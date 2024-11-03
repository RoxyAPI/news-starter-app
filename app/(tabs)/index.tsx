import { Dimensions, FlatList, Platform, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { memo, useEffect, useRef, useState } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface NewsCardProps {
  item: {
    title: string;
    content: string;
    image_url: string;
    created_at: string;
    source_url: string;
  };
}

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0'); 
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

const { height } = Dimensions.get('window');

export default function Home() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // New state for refreshing
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const pageSize = 20;
  const flatListRef = useRef(null);

  useScrollToTop(flatListRef);

  const loadData = async (page = 1, refreshing = false) => {
    if ((allDataLoaded && !refreshing) || isFetching) return;

    const paginatedUrl = `${process.env.EXPO_PUBLIC_API_URL}/data/news?page=${page}&limit=${pageSize}&token=${process.env.EXPO_PUBLIC_API_TOKEN}`;
    try {
      setIsFetching(true);
      const response = await fetch(paginatedUrl);
      const result = await response.json();

      const newData = result || [];
      setData(prevData => (page === 1 ? newData : [...prevData, ...newData]));
      setIsFetching(false);

      if (refreshing) setRefreshing(false); // Reset refreshing state after data reload

      if (newData.length < pageSize) {
        setAllDataLoaded(true);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setIsFetching(false);
      if (refreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  const loadMoreData = () => {
    if (!isFetching && !allDataLoaded) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    setAllDataLoaded(false);  // Reset end-of-data state if you want to reload all data
    setPage(1);
    loadData(1, true);
  };

  return (
    <SafeAreaView className='dark:bg-dark-background'>
      <View className=''>
        <FlatList
          data={data}
          ref={flatListRef}
          keyExtractor={(_, index) => index.toString()}
          disableIntervalMomentum
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          snapToOffsets={data.map((_, index) => index * height)}
          initialNumToRender={5}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}  // Add refreshing state
          onRefresh={onRefresh}    // Add onRefresh function
          renderItem={({ item, index }) => (
            <VerticalNewsCard
              key={index}
              item={item}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const VerticalNewsCard = memo(({ item }: NewsCardProps) => {
  return (
    <View className="h-screen w-full">
      <Image
        style={{ width: '100%', minHeight: 300 }}
        source={{ uri: item.image_url }}
        placeholder={{ blurhash }}
        contentFit="cover"
        transition={1000}
      />
      <View className='p-4'>
        <Text className='dark:text-dark-text text-3xl font-bold overflow-ellipsis'>{item.title}</Text>
        <Text className='dark:text-dark-text text-lg mt-4 line-clamp-6'>{item.content}</Text>
        <Text className='dark:text-dark-text-secondary text-gray-600 mt-4'>{formatDate(new Date(item.created_at))}</Text>
        <Link 
          target="_blank" 
          // @ts-expect-error: External URLs are not typed.
          href={item.source_url}
          asChild 
          onPress={(e) => {
            if (Platform.OS !== 'web') {
              // Prevent the default behavior of linking to the default browser on native.
              e.preventDefault();
              // Open the link in an in-app browser.
              WebBrowser.openBrowserAsync(item.source_url);
            }
          }}
          className='border border-dark-text-muted rounded-full p-4 mt-8 self-start flex-row items-center gap-4'>
          <Pressable>
            <Text className='dark:text-dark-text'>Read More</Text>
            <Text className='dark:text-dark-text'><FontAwesome name='chevron-right' size={16} /></Text>
          </Pressable>
        </Link>

      </View>
    </View>
  );
});
