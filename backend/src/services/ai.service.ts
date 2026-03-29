import axios from 'axios';

export interface AIRecognitionResult {
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';
  colors: string[];
  style: string[];
  seasons: string[];
  occasions: string[];
}

export interface OutfitRecommendation {
  outfits: Array<{
    items: string[]; // ClothingItem IDs
    reason: string;
  }>;
}

const HUNYUAN_API_URL = 'https://hunyuan.tencentcloudapi.com/hyllm/v1/chat/completions';

const DEFAULT_RESULT: AIRecognitionResult = {
  category: 'top',
  colors: [],
  style: [],
  seasons: [],
  occasions: [],
};

/**
 * 识别衣物图片，返回结构化标签
 */
export const recognizeClothing = async (imageUrl: string): Promise<AIRecognitionResult> => {
  try {
    const response = await axios.post(
      HUNYUAN_API_URL,
      {
        model: 'hunyuan-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
              {
                type: 'text',
                text: `请分析这件衣物，以 JSON 格式返回以下信息：
{
  "category": "top|bottom|dress|outerwear|shoes|accessory 中的一个",
  "colors": ["颜色1", "颜色2"],
  "style": ["风格1", "风格2"],
  "seasons": ["spring|summer|autumn|winter 中适用的季节"],
  "occasions": ["daily|work|date|sport|formal 中适用的场合"]
}
只返回 JSON，不要其他文字。`,
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUNYUAN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) return DEFAULT_RESULT;

    try {
      const parsed = JSON.parse(content);
      return {
        category: parsed.category || DEFAULT_RESULT.category,
        colors: Array.isArray(parsed.colors) ? parsed.colors : [],
        style: Array.isArray(parsed.style) ? parsed.style : [],
        seasons: Array.isArray(parsed.seasons) ? parsed.seasons : [],
        occasions: Array.isArray(parsed.occasions) ? parsed.occasions : [],
      };
    } catch {
      return DEFAULT_RESULT;
    }
  } catch (err: any) {
    throw new Error(`AI recognition failed: ${err.message}`);
  }
};

/**
 * 根据衣橱单品和条件生成穿搭推荐
 */
export const generateOutfitRecommendation = async (
  wardrobeItems: Array<{ id: string; category: string; colors: string[]; style: string[]; occasions: string[] }>,
  occasion: string,
  weather: string
): Promise<OutfitRecommendation> => {
  try {
    const itemsDesc = wardrobeItems.map(item =>
      `ID:${item.id} 类别:${item.category} 颜色:${item.colors.join(',')} 风格:${item.style.join(',')}`
    ).join('\n');

    const response = await axios.post(
      HUNYUAN_API_URL,
      {
        model: 'hunyuan-pro',
        messages: [
          {
            role: 'user',
            content: `我有以下衣物：
${itemsDesc}

请根据场合「${occasion}」和天气「${weather}」，从上述衣物中推荐 3 套搭配方案。
以 JSON 格式返回：
{
  "outfits": [
    { "items": ["item_id1", "item_id2"], "reason": "搭配理由" },
    { "items": ["item_id3", "item_id4"], "reason": "搭配理由" },
    { "items": ["item_id5", "item_id6"], "reason": "搭配理由" }
  ]
}
只返回 JSON，不要其他文字。`,
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUNYUAN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) return { outfits: [] };

    try {
      return JSON.parse(content);
    } catch {
      return { outfits: [] };
    }
  } catch (err: any) {
    throw new Error(`Outfit recommendation failed: ${err.message}`);
  }
};
