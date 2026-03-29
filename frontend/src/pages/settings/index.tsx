import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Settings() {
  const handleClearCache = () => {
    Taro.showModal({
      title: '清除缓存',
      content: '确认清除本地缓存？',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorage();
          Taro.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className='settings'>
      <View className='section'>
        <Text className='section-title'>关于</Text>
        <View className='item'>
          <Text className='item-label'>版本</Text>
          <Text className='item-value'>1.0.0</Text>
        </View>
        <View className='item'>
          <Text className='item-label'>穿搭助手</Text>
          <Text className='item-value'>AI 驱动的个人造型顾问</Text>
        </View>
      </View>

      <View className='section'>
        <Text className='section-title'>存储</Text>
        <View className='item' onClick={handleClearCache}>
          <Text className='item-label'>清除缓存</Text>
          <Text className='item-arrow'>›</Text>
        </View>
      </View>
    </View>
  );
}
