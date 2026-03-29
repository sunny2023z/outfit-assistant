import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { recordsApi } from '../../services/api';
import { WearRecord } from '../../types';
import './index.scss';

const USER_ID = 'user123';

export default function Record() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<WearRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 当月所有日期
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=周日

  // 记录日期 Set（方便快速查找）
  const recordDates = new Set(records.map(r => new Date(r.date).getDate()));

  useEffect(() => {
    fetchRecords();
  }, [year, month]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await recordsApi.getRecords(USER_ID, year, month);
      setRecords(res.data);
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOotd = async () => {
    const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] });
    if (res.tempFilePaths[0]) {
      Taro.navigateTo({ url: `/pages/record/ootd?imagePath=${encodeURIComponent(res.tempFilePaths[0])}` });
    }
  };

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 });

  return (
    <View className='record'>
      {/* 月份导航 */}
      <View className='month-nav'>
        <Text className='nav-btn' onClick={prevMonth}>‹</Text>
        <Text className='month-title'>{year}年{month}月</Text>
        <Text className='nav-btn' onClick={nextMonth}>›</Text>
      </View>

      {/* 星期标题 */}
      <View className='weekdays'>
        {['一', '二', '三', '四', '五', '六', '日'].map(d => (
          <Text key={d} className='weekday'>{d}</Text>
        ))}
      </View>

      {/* 日历格子 */}
      <View className='calendar'>
        {emptyDays.map((_, i) => <View key={`empty-${i}`} className='day empty' />)}
        {days.map(day => (
          <View
            key={day}
            className={`day ${recordDates.has(day) ? 'has-record' : ''} ${
              day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear() ? 'today' : ''
            }`}
          >
            <Text className='day-num'>{day}</Text>
            {recordDates.has(day) && <View className='dot' />}
          </View>
        ))}
      </View>

      {/* 本月统计 */}
      <View className='stats'>
        <Text className='stats-text'>本月已记录 {records.length} 天</Text>
      </View>

      {/* 浮动添加按钮 */}
      <View className='fab' onClick={handleAddOotd}>
        <Text className='fab-icon'>+</Text>
      </View>
    </View>
  );
}
