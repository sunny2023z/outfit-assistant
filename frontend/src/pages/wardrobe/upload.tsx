import { useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { wardrobeApi } from '../../services/api';
import { ClothingItem, CATEGORY_LABELS, OCCASION_LABELS } from '../../types';
import './upload.scss';

const USER_ID = 'user123';

interface TagState {
  category: ClothingItem['category'];
  colors: string[];
  style: string[];
  seasons: string[];
  occasions: string[];
}

export default function Upload() {
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<TagState>({
    category: 'top',
    colors: [],
    style: [],
    seasons: [],
    occasions: [],
  });
  const [recognizing, setRecognizing] = useState(false);
  const [saving, setSaving] = useState(false);

  const chooseImage = async () => {
    const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] });
    if (res.tempFilePaths[0]) {
      setImageUrl(res.tempFilePaths[0]);
      await uploadAndRecognize(res.tempFilePaths[0]);
    }
  };

  const uploadAndRecognize = async (localPath: string) => {
    setRecognizing(true);
    try {
      const uploadRes = await Taro.uploadFile({
        url: `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://your-api-domain.com'}/api/upload`,
        filePath: localPath,
        name: 'image',
        formData: { userId: USER_ID },
      });
      const data = JSON.parse(uploadRes.data);
      if (data.recognition) {
        setTags(data.recognition);
      }
      if (data.url) {
        setImageUrl(data.url);
      }
      Taro.showToast({ title: 'AI 识别完成', icon: 'success' });
    } catch (err) {
      Taro.showToast({ title: '识别失败，请手动填写', icon: 'none' });
    } finally {
      setRecognizing(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl) {
      return Taro.showToast({ title: '请先选择图片', icon: 'none' });
    }
    setSaving(true);
    try {
      await wardrobeApi.createItem({ userId: USER_ID, imageUrl, ...tags });
      Taro.showToast({ title: '已添加到衣橱', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const CATEGORIES: ClothingItem['category'][] = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];

  return (
    <View className='upload'>
      {/* 图片区域 */}
      <View className='image-area' onClick={chooseImage}>
        {imageUrl ? (
          <Image className='preview' src={imageUrl} mode='aspectFit' />
        ) : (
          <View className='placeholder'>
            <Text className='plus'>+</Text>
            <Text className='hint'>点击选择衣物照片</Text>
          </View>
        )}
        {recognizing && <View className='recognizing-overlay'><Text>AI 识别中...</Text></View>}
      </View>

      {/* 标签编辑区 */}
      <View className='tags-section'>
        <Text className='section-title'>类别</Text>
        <View className='tag-row'>
          {CATEGORIES.map(cat => (
            <Text
              key={cat}
              className={`tag ${tags.category === cat ? 'active' : ''}`}
              onClick={() => setTags(prev => ({ ...prev, category: cat }))}
            >
              {CATEGORY_LABELS[cat]}
            </Text>
          ))}
        </View>

        <Text className='section-title'>场合</Text>
        <View className='tag-row'>
          {Object.entries(OCCASION_LABELS).map(([key, label]) => (
            <Text
              key={key}
              className={`tag ${tags.occasions.includes(key) ? 'active' : ''}`}
              onClick={() => setTags(prev => ({
                ...prev,
                occasions: prev.occasions.includes(key)
                  ? prev.occasions.filter(o => o !== key)
                  : [...prev.occasions, key]
              }))}
            >
              {label}
            </Text>
          ))}
        </View>

        <Text className='section-title'>季节</Text>
        <View className='tag-row'>
          {(['spring', 'summer', 'autumn', 'winter'] as const).map(season => (
            <Text
              key={season}
              className={`tag ${tags.seasons.includes(season) ? 'active' : ''}`}
              onClick={() => setTags(prev => ({
                ...prev,
                seasons: prev.seasons.includes(season)
                  ? prev.seasons.filter(s => s !== season)
                  : [...prev.seasons, season]
              }))}
            >
              {{ spring: '春', summer: '夏', autumn: '秋', winter: '冬' }[season]}
            </Text>
          ))}
        </View>
      </View>

      <Button className='save-btn' onClick={handleSave} loading={saving}>
        保存到衣橱
      </Button>
    </View>
  );
}
