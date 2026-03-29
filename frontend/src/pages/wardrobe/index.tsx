import { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { wardrobeApi } from '../../services/api';
import { ClothingItem } from '../../types';
import './index.scss';

const USER_ID = 'user123';

export default function Wardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await wardrobeApi.getItems(USER_ID);
      setItems(res.data);
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 每次页面显示时刷新（从详情页返回后）
  Taro.useDidShow(() => {
    fetchItems();
  });

  const handleItemClick = (item: ClothingItem) => {
    Taro.navigateTo({ url: `/pages/wardrobe/detail?id=${item._id}` });
  };

  const handleUpload = () => {
    Taro.navigateTo({ url: '/pages/wardrobe/upload' });
  };

  return (
    <View className='wardrobe'>
      {loading ? (
        <View className='loading'><Text>加载中...</Text></View>
      ) : items.length === 0 ? (
        <View className='empty'>
          <Text className='empty-text'>衣橱还是空的</Text>
          <Text className='empty-hint'>点击右下角 + 添加衣物</Text>
        </View>
      ) : (
        <View className='grid'>
          {items.map(item => (
            <View key={item._id} className='grid-item' onClick={() => handleItemClick(item)}>
              <Image className='item-image' src={item.imageUrl} mode='aspectFill' />
            </View>
          ))}
        </View>
      )}

      <View className='fab' onClick={handleUpload}>
        <Text className='fab-icon'>+</Text>
      </View>
    </View>
  );
}
