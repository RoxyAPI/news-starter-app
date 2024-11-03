import { useScrollToTop } from "@react-navigation/native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { FlatList, Platform, Pressable, Text, View, ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from 'expo-web-browser';
import Colors from "@/constants/Colors";

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

const Feed = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

      if (refreshing) setRefreshing(false);

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

  const onRefresh = () => {
    setRefreshing(true);
    setAllDataLoaded(false);
    setPage(1);
    loadData(1, true);
  };

  const colorScheme = useColorScheme();

  return (
    <SafeAreaView className="dark:bg-dark-background flex-1">
      <View className="flex-1">
        <Text className="dark:text-dark-text text-3xl font-bold p-4">News Feed</Text>
        <FlatList
          ref={flatListRef}
          className="flex-1"
          data={data}
          renderItem={({ item, index }) => (
            <VerticalNewsCard
              key={index}
              item={item}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5} // Trigger loadMoreData when 50% from bottom
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListFooterComponent={
            isFetching && !refreshing ? (
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].text} style={{ margin: 20 }} />
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const VerticalNewsCard = memo(({ item }: NewsCardProps) => {
  return (
    <Link
      target="_blank"
      // @ts-expect-error: External URLs are not typed.
      href={item.source_url}
      asChild
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          e.preventDefault();
          WebBrowser.openBrowserAsync(item.source_url);
        }
      }}
    >
      <Pressable>
        <View className="px-4 flex-row flex-wrap pb-10">
          <Image
            style={{ maxHeight: 200, height: '100%', aspectRatio: '16/9', width: 100, borderRadius: 8 }}
            source={{ uri: item.image_url }}
            placeholder={{ blurhash }}
            contentFit="cover"
            transition={1000}
          />
          <View className='px-4 flex-1'>
            <Text className='dark:text-dark-text text-xl font-bold overflow-ellipsis line-clamp-1'>{item.title}</Text>
            <Text className='dark:text-dark-text text-base mt-2 line-clamp-2'>{item.content}</Text>
            <Text className='dark:text-dark-text-muted mt-2'>{formatDate(new Date(item.created_at))}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
});

export default Feed;
