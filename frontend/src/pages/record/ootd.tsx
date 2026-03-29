import { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ootdApi, recordsApi, wardrobeApi } from '../../services/api';
import { ClothingItem, CATEGORY_LABELS } from '../../types';
import './ootd.scss';

const USER_ID = 'user123';

interface RecognizedItem {
  category: string;
  colors: string[];
  material: string;
  description: string;
  matchedItem?: ClothingItem;
  confirmed: boolean;
}

export default function OotdPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [recognizedItems, setRecognizedItems] = useState<RecognizedItem[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params;
    const imagePath = params?.imagePath ? decodeURIComponent(params.imagePath) : '';
    if (imagePath) {
      loadWardrobeAndRecognize(imagePath);
    }
  }, []);

  const loadWardrobeAndRecognize = async (imagePath: string) => {
    setLoading(true);
    try {
      // 并行：获取衣橱 + 上传识别
      const [wardrobeRes, ootdRes] = await Promise.all([
        wardrobeApi.getItems(USER_ID),
        ootdApi.upload(USER_ID, imagePath),
      ]);

      setImageUrl(ootdRes.url);
      setDescription(ootdRes.recognition.description);
      setWardrobeItems(wardrobeRes.data);

      // 对每个识别到的衣物，尝试在衣橱中找匹配
      const items: RecognizedItem[] = ootdRes.recognition.items.map(recognized => {
        const matched = wardrobeRes.data.find(w =>
          w.category === recognized.category &&
          (recognized.colors.length === 0 || w.colors.some(c => recognized.colors.includes(c)))
        );
        return {
          ...recognized,
          matchedItem: matched,
          confirmed: !!matched,
        };
      });

      setRecognizedItems(items);
    } catch (err) {
      Taro.showToast({ title: '识别失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleConfirm = (index: number) => {
    setRecognizedItems(prev => prev.map((item, i) =>
      i === index ? { ...item, confirmed: !item.confirmed } : item
    ));
  };

  const handleSave = async () => {
    const confirmedIds = recognizedItems
      .filter(item => item.confirmed && item.matchedItem)
      .map(item => item.matchedItem!._id);

    setSaving(true);
    try {
      await recordsApi.createRecord({
        userId: USER_ID,
        clothingItemIds: confirmedIds,
        imageUrl,
        aiDescription: description,
        date: new Date().toISOString(),
      });
      Taro.showToast({ title: '记录成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className='loading'>
        <Text className='loading-text'>AI 识别中...</Text>
        <Text className='loading-hint'>正在分析你的穿搭</Text>
      </View>
    );
  }

  return (
    <View className='ootd'>
      <Image className='ootd-image' src={imageUrl} mode='aspectFit' />

      {description ? (
        <View className='description'>
          <Text className='desc-text'>{description}</Text>
        </View>
      ) : null}

      <View className='section'>
        <Text className='section-title'>AI 识别到的衣物</Text>
        <Text className='section-hint'>点击确认/取消匹配</Text>

        {recognizedItems.length === 0 ? (
          <Text className='empty-text'>没有识别到衣物</Text>
        ) : (
          recognizedItems.map((item, index) => (
            <View
              key={index}
              className={`item-row ${item.confirmed ? 'confirmed' : 'unconfirmed'}`}
              onClick={() => toggleConfirm(index)}
            >
              <View className='item-info'>
                <Text className='item-desc'>{item.description}</Text>
                <Text className='item-detail'>{CATEGORY_LABELS[item.category as ClothingItem['category']] || item.category} · {item.colors.join('、')}</Text>
                {item.matchedItem ? (
                  <Text className='matched-label'>✓ 匹配到衣橱中的衣物</Text>
                ) : (
                  <Text className='unmatched-label'>衣橱中未找到匹配</Text>
                )}
              </View>
              {item.matchedItem && (
                <Image className='matched-image' src={item.matchedItem.imageUrl} mode='aspectFill' />
              )}
              <View className={`check ${item.confirmed ? 'checked' : ''}`}>
                {item.confirmed && <Text className='check-icon'>✓</Text>}
              </View>
            </View>
          ))
        )}
      </View>

      <Button className='save-btn' onClick={handleSave} loading={saving}>
        记录今日穿搭
      </Button>
    </View>
  );
}
