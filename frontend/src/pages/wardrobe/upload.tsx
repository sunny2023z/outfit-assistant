import { useState } from 'react';
import { View, Text, Image, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { wardrobeApi } from '../../services/api';
import './upload.scss';

const USER_ID = 'user123';

export default function Upload() {
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'recognizing' | 'done'>('idle');
  const [saving, setSaving] = useState(false);

  const chooseImage = async () => {
    const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] });
    if (res.tempFilePaths[0]) {
      await uploadAndRecognize(res.tempFilePaths[0]);
    }
  };

  const uploadAndRecognize = async (localPath: string) => {
    setStatus('uploading');
    try {
      const uploadRes = await new Promise<any>((resolve, reject) => {
        Taro.uploadFile({
          url: 'https://outfit-assistant.jellyzen.fun/api/upload',
          filePath: localPath,
          name: 'image',
          formData: { userId: USER_ID },
          success: (res) => resolve(JSON.parse(res.data)),
          fail: reject,
        });
      });
      if (uploadRes.url) {
        setImageUrl(uploadRes.url);
      }
      setStatus('done');
      Taro.showToast({ title: 'AI 识别完成', icon: 'success' });
    } catch (err) {
      setStatus('idle');
      Taro.showToast({ title: '上传失败，请重试', icon: 'error' });
    }
  };

  const handleSave = async () => {
    if (!imageUrl) {
      return Taro.showToast({ title: '请先选择图片', icon: 'none' });
    }
    setSaving(true);
    try {
      await wardrobeApi.createItem({ userId: USER_ID, imageUrl, note, category: 'top', colors: [], seasons: [], occasions: [] });
      Taro.showToast({ title: '已添加到衣橱', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch {
      Taro.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const statusText: Record<string, string> = {
    idle: '',
    uploading: '上传中...',
    recognizing: 'AI 分析中...',
    done: 'AI 分析完成 ✓',
  };

  return (
    <View className='upload'>
      <View className='image-area' onClick={status === 'idle' || status === 'done' ? chooseImage : undefined}>
        {imageUrl ? (
          <Image className='preview' src={imageUrl} mode='aspectFit' />
        ) : (
          <View className='placeholder'>
            <Text className='plus'>+</Text>
            <Text className='hint'>点击选择衣物照片</Text>
          </View>
        )}
        {(status === 'uploading' || status === 'recognizing') && (
          <View className='overlay'>
            <Text className='overlay-text'>{statusText[status]}</Text>
          </View>
        )}
      </View>

      {status === 'done' && (
        <View className='status-bar'>
          <Text className='status-text'>{statusText.done}</Text>
          <Text className='retake' onClick={chooseImage}>重新选择</Text>
        </View>
      )}

      <View className='note-section'>
        <Text className='section-title'>备注（可选）</Text>
        <Textarea
          className='note-input'
          placeholder='描述这件衣服，比如：妈妈送的生日礼物，适合正式场合穿'
          value={note}
          onInput={e => setNote(e.detail.value)}
          maxlength={200}
        />
      </View>

      <Button className='save-btn' onClick={handleSave} loading={saving} disabled={!imageUrl || saving}>
        保存到衣橱
      </Button>
    </View>
  );
}
