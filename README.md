# 穿搭助手小程序

基于 Taro + React + Node.js 的 AI 穿搭助手，支持衣橱管理、AI 识别衣物、智能搭配推荐。

## 功能

- 📷 **衣橱管理** — 拍照上传，AI 自动识别类别/颜色/风格/季节/场合
- ✨ **AI 穿搭推荐** — 根据天气和场合，从你的衣橱里生成 3 套搭配方案
- 📅 **穿搭记录** — 日历视图，记录每天穿了什么
- ⚙️ **设置** — 版本信息、缓存管理

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Taro 3.6 + React 18 + TypeScript |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | MongoDB + Mongoose |
| AI | 混元 API（Vision 识别 + Pro 推荐） |
| 存储 | 腾讯云 COS |

## 项目结构

```
outfit-assistant/
├── frontend/                    # Taro 小程序
│   └── src/
│       ├── pages/
│       │   ├── wardrobe/        # 衣橱页 + 上传页
│       │   ├── recommend/       # AI 推荐页
│       │   ├── record/          # 穿搭记录页
│       │   └── settings/        # 设置页
│       ├── services/api.ts      # HTTP 请求封装
│       └── types/index.ts       # 类型定义
└── backend/                     # Node.js API
    └── src/
        ├── models/              # Mongoose 数据模型
        │   ├── ClothingItem.ts
        │   ├── Outfit.ts
        │   └── WearRecord.ts
        ├── routes/              # HTTP 路由
        │   ├── wardrobe.ts      # POST/GET/PUT/DELETE /api/wardrobe/items
        │   ├── upload.ts        # POST /api/upload
        │   ├── recommend.ts     # POST /api/recommend
        │   └── records.ts       # POST/GET /api/records
        └── services/            # 业务逻辑
            ├── wardrobe.service.ts
            ├── cos.service.ts   # 腾讯云 COS 图片存储
            ├── ai.service.ts    # 混元 AI 识别 & 推荐
            ├── recommend.service.ts
            └── records.service.ts
```

## 快速开始

### 1. 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env，填写以下配置：
# - MONGODB_URI
# - COS_SECRET_ID / COS_SECRET_KEY / COS_BUCKET / COS_REGION
# - HUNYUAN_API_KEY
npm install
npm run dev
```

### 2. 前端

```bash
cd frontend
npm install
npm run dev:weapp
```

用**微信开发者工具**打开 `frontend/dist/` 目录预览。

## API 文档

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/wardrobe/items` | 新增衣物 |
| GET | `/api/wardrobe/items?userId=&category=` | 获取衣橱列表 |
| PUT | `/api/wardrobe/items/:id` | 更新衣物标签 |
| DELETE | `/api/wardrobe/items/:id` | 删除衣物 |
| POST | `/api/upload` | 上传图片（multipart），自动 AI 识别 |
| POST | `/api/recommend` | 生成穿搭推荐 |
| POST | `/api/records` | 新增穿搭记录 |
| GET | `/api/records?userId=&year=&month=` | 查询月度穿搭记录 |
| GET | `/health` | 健康检查 |

## 环境变量

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/outfit-assistant
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_BUCKET=your-bucket-1234567890
COS_REGION=ap-guangzhou
HUNYUAN_API_KEY=your_hunyuan_api_key
```

## 运行测试

```bash
cd backend
npm test
```
