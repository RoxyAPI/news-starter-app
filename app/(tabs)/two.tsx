import { useScrollToTop } from "@react-navigation/native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo, useEffect, useRef, useState } from "react";
import { FlatList, Platform, Pressable, Text, View, ActivityIndicator, useColorScheme, Modal, TouchableWithoutFeedback, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from 'expo-web-browser';
import Colors from "@/constants/Colors";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";

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
  const [modalVisible, setModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedCategorie, setSelectedCategorie] = useState<string>();
  const [selectedTag, setSelectedTag] = useState<string>();

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  useScrollToTop(flatListRef);

  const loadData = async (page = 1, refreshing = false) => {
    if ((allDataLoaded && !refreshing) || isFetching) return;

    let paginatedUrl = `${process.env.EXPO_PUBLIC_API_URL}/data/news?page=${page}&limit=${pageSize}&token=${process.env.EXPO_PUBLIC_API_TOKEN}`;
    if(selectedCategorie) {
      paginatedUrl += `&category=${selectedCategorie}`;
    }
    if(selectedTag) {
      paginatedUrl += `&tag=${selectedTag}`;
    }
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

  const loadCategories = async () => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/data/news/categories?token=${process.env.EXPO_PUBLIC_API_TOKEN}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result) {
        setCategories(result);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTags = async () => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/data/news/tags?token=${process.env.EXPO_PUBLIC_API_TOKEN}`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result) {
        setTags(result);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  useEffect(() => {
    loadData(page);
    loadCategories();
    loadTags();
  }, [page]);

  useEffect(() => {
      setPage(1);
      loadData(1, true);
  }, [selectedCategorie, selectedTag]);

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
        <View className="flex-row items-center justify-between">
          <Text className="dark:text-dark-text text-3xl font-bold p-4">News Feed</Text>
          <Pressable onPress={toggleModal}>
            {({ pressed }) => (
              <Text className={`dark:text-dark-text text-lg p-4 ${pressed ? 'opacity-50' : ''}`}>
                <FontAwesome name="filter" size={24}/> Filter
              </Text>
            )}
          </Pressable>
        </View>
        {
          (selectedCategorie || selectedTag) && (
            <View className="flex-row p-4">
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                <View className="flex-row gap-2 pr-4">
                  <Pressable onPress={() => { setSelectedCategorie(undefined); }}>
                    {selectedCategorie && (
                      <View className="px-4 py-2 rounded-md flex-row items-center justify-center gap-2 border dark:border-white">
                        <Text className="dark:text-dark-text text-sm font-bold">
                          {selectedCategorie}
                        </Text>
                        <FontAwesome6 name="x" size={12} color={colorScheme =="dark" ? "white" : "black"} />
                      </View>
                    )}
                  </Pressable>
                  <Pressable onPress={() => { setSelectedTag(undefined); }}>
                    {selectedTag && (
                      <View className="px-4 py-2 rounded-md flex-row items-center justify-center gap-2 border dark:border-white">
                        <Text className="dark:text-dark-text text-sm font-bold">
                          {selectedTag}
                        </Text>
                        <FontAwesome6 name="x" size={12} color={colorScheme =="dark" ? "white" : "black"} />
                      </View>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          )
        }
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
          ListEmptyComponent={
            !isFetching && !refreshing ? (
              <View className="flex-1 items-center justify-center">
                <Text className="dark:text-dark-text mt-10">No news found</Text>
                {
                  selectedCategorie || selectedTag ? (
                    <Pressable onPress={() => { setSelectedCategorie(undefined); setSelectedTag(undefined); }}>
                      {({ pressed }) => (
                        <Text className={`dark:text-dark-text text-lg mt-4 border dark:border-white px-4 py-2 rounded-md ${pressed ? 'opacity-50' : ''}`}>
                          Clear filters
                        </Text>
                      )}
                    </Pressable>
                  ) : null
                }
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetching && !refreshing ? (
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].text} style={{ margin: 20 }} />
            ) : null
          }
        />
      </View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          toggleModal();
          console.log('Modal has been closed.');
        }}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View className="flex-1 justify-end items-end bg-black/50 dark:bg-white/10">
            <TouchableWithoutFeedback onPress={()=>{}}>
              <View>
                <Pressable className="items-center mb-4" onPress={toggleModal}>
                  {({pressed}) => (
                    <View className={`h-12 w-12 items-center justify-center rounded-full bg-white ${pressed ? 'opacity-50': ''}`}>
                      <FontAwesome6 name="x" size={16} color="black" />
                    </View>
                  )}
                </Pressable>
                <View className="w-full bg-light-background dark:bg-dark-background rounded-t-2xl ios:rounded-t-[40px] px-4 pt-4 pb-10 ios:py-10">
                  <View className="gap-4">
                    <Text className="dark:text-dark-text text-2xl font-bold">Categories</Text>
                    <FlatList
                      data={categories}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item, index }) => (
                        <Pressable key={index} onPress={() => setSelectedCategorie(item)}>
                          {({ pressed }) => (
                            <Text className={`text-base px-4 py-2 rounded-full bg-gray-100 ${pressed ? 'opacity-50' : ''} mr-2 mb-2`}>
                              {item}
                            </Text>
                          )}
                        </Pressable>
                      )}
                      keyExtractor={(_, index) => index.toString()}
                    />

                    <Text className="dark:text-dark-text text-2xl font-bold">Tags</Text>
                    <FlatList
                      data={tags}
                      horizontal={true}
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item, index }) => (
                        <Pressable key={index} onPress={() => setSelectedTag(item)}>
                          {({ pressed }) => (
                            <Text className={`text-base px-4 py-2 rounded-full bg-gray-100 ${pressed ? 'opacity-50' : ''} mr-2 mb-2`}>
                              {item}
                            </Text>
                          )}
                        </Pressable>
                      )}
                      keyExtractor={(_, index) => index.toString()}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
