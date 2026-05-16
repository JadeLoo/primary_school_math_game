# 小学数学图形算式闯关游戏 — 设计与开发计划

## 一、项目概述

为上海一年级小学生设计一个数学游戏 Web 应用，目标是通过图形算式提升计算能力，采用关卡地图 + 闯关推进方式。

- **平台**：纯 Web 页面（手机/平板/PC 浏览器均可）
- **部署**：GitHub Pages（免费）或任意静态托管
- **数据存储**：浏览器 localStorage（无需后端服务器）

---

## 二、题型设计（6 种）

### 题型1：单一图形求值
同一图形出现多次，求其值。
> 示例：`★ + ★ = 8` → ★ = 4

### 题型2：多图形联立
两个不同图形，两个等式，联立求解。
> 示例：`▲ + ■ = 12, ▲ - ■ = 4` → ▲ = 8, ■ = 4

### 题型3：链式推理
图形之间有关系，逐步代入推导。
> 示例：`● + ● = ▲, ▲ + ● = 9` → ● = 3, ▲ = 6

### 题型4：图形替代数字
直接给定图形对应的数字，计算表达式的值。
> 示例：`● = 3, ▲ = 5, ● + ▲ = ?` → 8

### 题型5：竖式进位加法
竖式中的某些数位替换为图形，含进位。
> 示例：
> ```
>   ▲ 7
> + 2 ■
> ——————
>   6 4
> ```
> ▲ = 3, ■ = 7（即 37 + 27 = 64）

### 题型6：竖式退位减法
竖式中的某些数位替换为图形，含退位。
> 示例：
> ```
>   5 ▲
> - 1 8
> ——————
>   3 4
> ```
> ▲ = 2（即 52 - 18 = 34）

---

## 三、关卡地图（6 区 18 关）

```
🌱 数字草原（第1-3关）   → 题型1、4，数字 ≤ 10
🌲 图形森林（第4-6关）   → 题型2，数字 ≤ 20
🏔️ 推理山丘（第7-9关）   → 题型3，数字 ≤ 20
🌊 加法河流（第10-12关） → 题型5，两位数
🏰 减法城堡（第13-15关） → 题型6，两位数
⭐ 综合星空（第16-18关） → 全部题型混合，≤ 100
```

- 每区 3 关，第 3 关为 Boss 关（难度略高）
- 每关 8 道题
- 初始仅第 1 关解锁，通关后解锁下一关

---

## 四、答题流程

1. 进入关卡 → 显示第 1 题 → 自动朗读题干
2. 孩子在输入框中填入答案（每个图形一个输入框）
3. 点击确认按钮
4. 即时反馈：正确（绿色✓+连击+1）或错误（红色✗+显示正确答案+连击中断）
5. 连击 ≥ 3 次触发庆祝动画
6. 8 题完成 → 跳转结果页

### 星星规则
| 答对题数 | 星星 |
|----------|------|
| 8/8 | ★★★ |
| 6-7/8 | ★★ |
| 4-5/8 | ★ |
| < 4 | 不通过，需重试 |

### 连击动画等级
| 连击数 | 效果 |
|--------|------|
| 3-4 | 小火花 |
| 5-6 | 中等烟花 |
| 7-8 | 大型庆祝粒子 |

---

## 五、技术选型

| 维度 | 选择 | 原因 |
|------|------|------|
| 框架 | React 18 + TypeScript | 组件化适合游戏 UI，类型安全 |
| 构建 | Vite | 快速开发 |
| 样式 | CSS Modules | 无额外依赖 |
| 路由 | React Router v6 | 页面间导航 |
| 语音 | Web Speech API | 免费，浏览器内置 |
| 持久化 | localStorage | 无需后端 |
| 状态 | React Context + useReducer | 轻量够用 |

---

## 六、页面与路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 标题、吉祥物、开始按钮 |
| `/map` | 关卡地图 | SVG 蛇形路线 + 18 个关卡节点 |
| `/game/:id` | 答题界面 | 核心游戏页（id=1~18） |
| `/result/:id` | 通关结果 | 星星展示、导航按钮 |

---

## 七、核心组件树

```
App
├── HomePage
│   ├── TitleBanner
│   └── StartButton
│
├── MapPage
│   ├── MapPath（SVG 路线）
│   ├── ZoneNode × 6（区域标识）
│   ├── LevelNode × 18（关卡节点）
│   └── TotalStarBadge（总星数）
│
├── GamePage
│   ├── ProgressDots（进度 ●◌◌◌  X/8）
│   ├── QuestionCard
│   │   ├── GraphicsRenderer（图形算式渲染）
│   │   └── VerticalRenderer（竖式渲染）
│   ├── VoiceButton（朗读按钮）
│   ├── AnswerArea
│   │   ├── SymbolInputRow（图形→答案输入框）
│   │   └── NumberKeypad（数字键盘）
│   ├── ComboEffect（连击粒子动画）
│   └── FeedbackToast（对/错反馈）
│
├── ResultPage
│   ├── StarReveal（星星弹出动画）
│   ├── ScoreRing（正确率环形图）
│   └── ActionButtons（重试/下一关/返回地图）
│
└── Common
    ├── StarParticle
    └── Confetti
```

---

## 八、题目生成算法简述

### 题型1：单一图形求值
```
1. 随机选运算符（+/-）
2. 随机生成图形值 v（1~maxNumber/图形数量）
3. 用 v 计算等式左边总和
4. 构造题目字符串
```

### 题型2：多图形联立
```
1. 随机生成两个不同的值 v1, v2
2. 构造：v1 + v2 = S, v1 - v2 = D
3. 确保 S 和 D 在范围内
4. 生成两个等式
```

### 题型3：链式推理
```
1. 反向构造：先定最终图形值
2. 逐层回推中间图形值
3. 确保所有值为正整数
```

### 题型4：图形替代数字
```
1. 随机赋值给 2-3 个图形（值范围 1~maxNumber）
2. 构造一个混合算式（含 +、-）
3. 计算正确答案
```

### 题型5：竖式进位加法
```
1. 生成两个两位数 a 和 b
2. 确保 a%10 + b%10 ≥ 10（进位条件）
3. 随机选择 1-2 个数位替换为图形符号
4. 展示竖式，正确答案为被替换数位对应的值
```

### 题型6：竖式退位减法
```
1. 生成被减数 a 和减数 b
2. 确保 a%10 < b%10（退位条件），且 a > b
3. 随机选择 1-2 个数位替换为图形符号
4. 展示竖式，正确答案为被替换数位对应的值
```

---

## 九、数据存储结构

```typescript
interface LevelState {
  unlocked: boolean;
  stars: 0 | 1 | 2 | 3;
  bestCombo: number;
}

interface GameSave {
  levels: Record<number, LevelState>;
  totalStars: number;
}
```

存储在 `localStorage`，key 为 `math_game_save`。

---

## 十、开发计划

### 第一阶段：最小可用 Demo

| 任务 | 内容 | 预估 |
|------|------|------|
| 1 | 项目初始化（Vite + React + TS + Router） | 搭建骨架 |
| 2 | 题目生成引擎（6 种题型） | 核心逻辑 |
| 3 | 游戏状态管理（Context + localStorage） | 数据层 |
| 4 | 首页 | 简单标题 + 开始按钮 |
| 5 | 关卡地图（简化版） | 18 个节点 + 路径 |
| 6 | 答题界面（核心） | 题目展示 + 输入 + 判断 |
| 7 | 结果页 | 星星展示 + 导航 |
| 8 | 语音朗读 | Web Speech API 集成 |

### 第二阶段：完善打磨

| 任务 | 内容 |
|------|------|
| 9 | 连击动画系统 | 粒子效果 |
| 10 | 响应式适配 | 移动端优化 |
| 11 | 关卡地图美化 | SVG 路线 + 区域主题色 |
| 12 | 整体样式打磨 | 配色、字体、动画过渡 |

### 第三阶段：可选增强

| 任务 | 内容 |
|------|------|
| 13 | 草稿区预留接口 | Canvas 组件占位 |
| 14 | 部署指南 | GitHub Pages 部署 |

---

## 十一、目录结构

```
primary_school_math_game/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── index.ts              # 所有类型定义
    ├── engine/
    │   ├── generator.ts           # 题目生成器（6种题型）
    │   └── validator.ts           # 答案验证
    ├── store/
    │   └── GameContext.tsx         # 游戏状态 Context
    ├── hooks/
    │   ├── useGameProgress.ts     # 进度操作 hook
    │   └── useTTS.ts              # 语音朗读 hook
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── HomePage.module.css
    │   ├── MapPage.tsx
    │   ├── MapPage.module.css
    │   ├── GamePage.tsx
    │   ├── GamePage.module.css
    │   ├── ResultPage.tsx
    │   └── ResultPage.module.css
    ├── components/
    │   ├── ProgressDots.tsx        # 进度指示
    │   ├── QuestionCard.tsx        # 题目卡片（含 GraphicsRenderer + VerticalRenderer）
    │   ├── NumberKeypad.tsx        # 数字键盘
    │   ├── VoiceButton.tsx         # 朗读按钮
    │   ├── ComboEffect.tsx         # 连击粒子动画
    │   ├── StarReveal.tsx          # 星星弹出
    │   └── ScratchPad.tsx          # 草稿区（预留）
    └── styles/
        └── global.css             # 全局样式 + CSS 变量
```
