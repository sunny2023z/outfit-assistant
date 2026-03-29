import { useState, useEffect } from 'react';
import { View, Text, Image, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { wardrobeApi } from '../../services/api';
import { ClothingItem, CATEGORY_LABELS } from '../../types';
import './detail.scss';

export default function Detail() {
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [note, setNote] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params;
    const id = params?.id;
    if (id) fetchItem(id);
  }, []);

  const fetchItem = async (id: string) => {
    try {
      const res = await wardrobeApi.getItems('user123');
      const found = res.data.find(i => i._id === id);
      if (found) {
        setItem(found);
        setNote(found.note || '');
      }
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'error' });
    }
  };

  const saveNote = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await wardrobeApi.updateNote(item._id, note);
      setItem(prev => prev ? { ...prev, note } : null);
      setEditingNote(false);
      Taro.showToast({ title: '已保存', icon: 'success' });
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    const { confirm } = await Taro.showModal({ title: '确认删除', content: '删除后无法恢复' });
    if (!confirm) return;
    try {
      await wardrobeApi.deleteItem(item._id);
      Taro.showToast({ title: '已删除', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'error' });
    }
  };

  const getLastWornText = (lastWornAt: string | null) => {
    if (!lastWornAt) return '从未穿过';
    const days = Math.floor((Date.now() - new Date(lastWornAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    return `${days} 天前`;
  };

  if (!item) return <View className='loading'><Text>加载中...</Text></View>;

  return (
    <View className='detail'>
      <Image className='hero-image' src={item.imageUrl} mode='aspectFit' />

      {/* 穿着统计 */}
      <View className='stats-row'>
        <View className='stat-item'>
          <Text className='stat-value'>{item.wearCount || 0}</Text>
          <Text className='stat-label'>次穿着</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-value'>{getLastWornText(item.lastWornAt)}</Text>
          <Text className='stat-label'>上次穿</Text>
        </View>
      </View>

      {/* AI 识别属性 */}
      <View className='section'>
        <Text className='section-title'>衣物信息</Text>
        <View className='attr-list'>
          <View className='attr-row'>
            <Text className='attr-label'>类别</Text>
            <Text className='attr-value'>{CATEGORY_LABELS[item.category]}</Text>
          </View>
          {item.colors?.length > 0 && (
            <View className='attr-row'>
              <Text className='attr-label'>颜色</Text>
              <Text className='attr-value'>{item.colors.join('、')}</Text>
            </View>
          )}
          {item.material && (
            <View className='attr-row'>
              <Text className='attr-label'>材质</Text>
              <Text className='attr-value'>{item.material}</Text>
            </View>
          )}
          {item.seasons?.length > 0 && (
            <View className='attr-row'>
              <Text className='attr-label'>季节</Text>
              <Text className='attr-value'>{item.seasons.map(s => ({ spring:'春', summer:'夏', autumn:'秋', winter:'冬' }[s] || s)).join('、')}</Text>
            </View>
          )}
          {item.occasions?.length > 0 && (
            <View className='attr-row'>
              <Text className='attr-label'>场合</Text>
              <Text className='attr-value'>{item.occasions.join('、')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 备注 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>备注</Text>
          {!editingNote && (
            <Text className='edit-btn' onClick={() => setEditingNote(true)}>编辑</Text>
          )}
        </View>
        {editingNote ? (
          <View>
            <Textarea
              className='note-input'
              value={note}
              onInput={e => setNote(e.detail.value)}
              maxlength={200}
              autoFocus
            />
            <View className='note-actions'>
              <Text className='cancel-btn' onClick={() => { setNote(item.note || ''); setEditingNote(false); }}>取消</Text>
              <Button className='save-note-btn' onClick={saveNote} loading={saving}>保存</Button>
            </View>
          </View>
        ) : (
          <Text className='note-text'>{note || '还没有备注，点击编辑添加'}</Text>
        )}
      </View>

      <Button className='delete-btn' onClick={handleDelete}>删除这件衣物</Button>
    </View>
  );
}
