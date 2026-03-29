import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { wardrobeApi } from '../../services/api';
import { ClothingItem, CATEGORY_LABELS } from '../../types';
import './index.scss';

const USER_ID = 'user123'; // TODO: 从登录态获取

const CATEGORIES = ['all', 'top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'] as const;

export default function Wardrobe() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const fetchItems = async (category?: string) => {
    setLoading(true);
    try {
      const res = await wardrobeApi.getItems(USER_ID, category && category !== 'all' ? { category } : undefined);
      setItems(res.data);
    } catch (err) {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(activeCategory);
  }, [activeCategory]);

  const handleUpload = () => {
    Taro.navigateTo({ url: '/pages/wardrobe/upload' });
  };

  const handleDelete = async (id: string) => {
    await Taro.showModal({ title: '确认删除', content: '删除后无法恢复' });
    try {
      await wardrobeApi.deleteItem(id);
      setItems(prev => prev.filter(item => item._id !== id));
      Taro.showToast({ title: '已删除', icon: 'success' });
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'error' });
    }
  };

  return (
    <View className='wardrobe'>
      {/* 分类筛选栏 */}
      <ScrollView className='category-bar' scrollX>
        {CATEGORIES.map(cat => (
          <Text
            key={cat}
            className={`category-item ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? '全部' : CATEGORY_LABELS[cat as ClothingItem['category']]}
          </Text>
        ))}
      </ScrollView>

      {/* 衣物网格 */}
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
            <View key={item._id} className='grid-item'>
              <Image className='item-image' src={item.imageUrl} mode='aspectFill' />
              <View className='item-info'>
                <Text className='item-category'>{CATEGORY_LABELS[item.category]}</Text>
                <View className='item-colors'>
                  {item.colors.slice(0, 3).map(color => (
                    <Text key={color} className='color-tag'>{color}</Text>
                  ))}
                </View>
              </View>
              <Text className='delete-btn' onClick={() => handleDelete(item._id)}>×</Text>
            </View>
          ))}
        </View>
      )}

      {/* 添加按钮 */}
      <View className='fab' onClick={handleUpload}>
        <Text className='fab-icon'>+</Text>
      </View>
    </View>
  );
}
