import { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { recommendApi } from '../../services/api';
import { RecommendationResult, OCCASION_LABELS, WEATHER_LABELS } from '../../types';
import './index.scss';

const USER_ID = 'user123';

export default function Recommend() {
  const [occasion, setOccasion] = useState('daily');
  const [weather, setWeather] = useState('sunny');
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await recommendApi.getRecommendations(USER_ID, occasion, weather);
      setRecommendations(res.data);
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('No clothing')) {
        Taro.showToast({ title: '先去衣橱添加衣物吧', icon: 'none' });
      } else {
        Taro.showToast({ title: '推荐失败，请重试', icon: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='recommend'>
      {/* 条件选择 */}
      <View className='conditions'>
        <View className='condition-group'>
          <Text className='condition-label'>场合</Text>
          <ScrollView scrollX className='options-row'>
            {Object.entries(OCCASION_LABELS).map(([key, label]) => (
              <Text
                key={key}
                className={`option ${occasion === key ? 'active' : ''}`}
                onClick={() => setOccasion(key)}
              >
                {label}
              </Text>
            ))}
          </ScrollView>
        </View>

        <View className='condition-group'>
          <Text className='condition-label'>天气</Text>
          <ScrollView scrollX className='options-row'>
            {Object.entries(WEATHER_LABELS).map(([key, label]) => (
              <Text
                key={key}
                className={`option ${weather === key ? 'active' : ''}`}
                onClick={() => setWeather(key)}
              >
                {label}
              </Text>
            ))}
          </ScrollView>
        </View>

        <View className={`generate-btn ${loading ? 'loading' : ''}`} onClick={!loading ? handleGenerate : undefined}>
          <Text>{loading ? 'AI 生成中...' : '✨ 生成搭配'}</Text>
        </View>
      </View>

      {/* 推荐结果 */}
      {recommendations.length > 0 && (
        <View className='results'>
          {recommendations.map((rec, idx) => (
            <View key={rec.outfitId} className='outfit-card'>
              <Text className='outfit-title'>搭配方案 {idx + 1}</Text>
              <ScrollView scrollX className='items-row'>
                {rec.items.map(item => (
                  <View key={item._id} className='outfit-item'>
                    <Image className='outfit-img' src={item.imageUrl} mode='aspectFill' />
                    <Text className='outfit-category'>{item.category}</Text>
                  </View>
                ))}
              </ScrollView>
              <Text className='outfit-reason'>{rec.reason}</Text>
            </View>
          ))}

          <View className='refresh-btn' onClick={handleGenerate}>
            <Text>换一套 🔄</Text>
          </View>
        </View>
      )}

      {recommendations.length === 0 && !loading && (
        <View className='empty'>
          <Text className='empty-text'>选好场合和天气</Text>
          <Text className='empty-hint'>点击上方按钮生成今日搭配</Text>
        </View>
      )}
    </View>
  );
}
