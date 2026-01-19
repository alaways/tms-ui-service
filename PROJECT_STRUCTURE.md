# TMS UI Service 项目结构分析

## 项目概述

TMS UI Service 是一个基于 React 和 TypeScript 的前端 Web 应用项目，名为 "leasing-web-admin"。该项目使用 Vite 作为构建工具，提供了一个功能丰富的管理后台界面，支持国际化、状态管理、图表展示、PDF 处理等多种功能。

## 技术栈

### 核心框架
- **React 18**: 用户界面库
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 快速的构建工具和开发服务器

### UI 组件库
- **Ant Design (antd)**: 企业级 UI 设计语言
- **Material-UI (MUI)**: React 组件库
- **Mantine**: 现代 React 组件库
- **Tailwind CSS**: 实用优先的 CSS 框架

### 状态管理
- **Redux Toolkit**: 简化 Redux 的状态管理
- **React Query**: 数据获取和缓存

### 路由和导航
- **React Router DOM**: 声明式路由

### 其他重要库
- **Axios**: HTTP 客户端
- **Formik + Yup**: 表单处理和验证
- **FullCalendar**: 日历组件
- **ApexCharts**: 图表库
- **PDF.js**: PDF 处理
- **Socket.io**: 实时通信
- **Firebase**: 后端服务
- **i18next**: 国际化

## 目录结构

```
/Users/jan/Desktop/gs/tms-ui-service/
├── bitbucket-pipelines.yml          # Bitbucket CI/CD 配置
├── firebase-config.ts              # Firebase 配置
├── index.html                      # HTML 入口文件
├── package.json                    # 项目依赖和脚本
├── postcss.config.cjs              # PostCSS 配置
├── README.md                       # 项目说明文档
├── tailwind.config.cjs             # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
├── tsconfig.node.json              # Node.js TypeScript 配置
├── vercel.json                     # Vercel 部署配置
├── vite.config.ts                  # Vite 构建配置
├── htaccess/                       # Apache 配置目录
│   ├── admin.htaccess
│   ├── bu.htaccess
│   ├── customer.htaccess
│   └── shop.htaccess
├── htaccess-deploy/                # 部署用的 Apache 配置
├── public/                         # 静态资源目录
│   ├── demo-prepare.html
│   ├── firebase-messaging-sw.js    # Firebase 消息服务工作线程
│   ├── manifest.json               # PWA 清单
│   ├── assets/
│   │   └── images/                 # 图片资源
│   │       ├── asor/
│   │       ├── auth/
│   │       ├── demo/
│   │       ├── error/
│   │       ├── faq/
│   │       ├── flags/
│   │       ├── knowledge/
│   │       └── rnp/
│   └── locales/                    # 国际化资源
│       ├── en/
│       │   └── translation.json
│       ├── th/
│       │   └── translation.json
│       └── zh/
│           └── translation.json
├── sh/                             # Shell 脚本目录
│   ├── admin.sh
│   ├── main.sh
│   ├── pre.sh
│   ├── send_message.py
│   └── test.sh
└── src/                            # 源代码目录
    ├── App.tsx                     # 根组件
    ├── global.css                  # 全局样式
    ├── i18n.tsx                    # 国际化配置
    ├── main.tsx                    # 应用入口
    ├── tailwind.css                # Tailwind CSS 样式
    ├── theme.config.tsx            # 主题配置
    ├── theme.domain.init.tsx       # 主题域初始化
    ├── theme.init.tsx              # 主题初始化
    ├── vite-env.d.ts               # Vite 环境类型定义
    ├── assets/                     # 资源文件
    │   ├── css/                    # CSS 文件
    │   │   ├── animate.css
    │   │   ├── datatables.css
    │   │   ├── dragndrop.css
    │   │   ├── file-upload-preview.css
    │   │   ├── flatpickr.css
    │   │   ├── form-elements.css
    │   │   ├── fullcalendar.css
    │   │   ├── markdown-editor.css
    │   │   ├── progressbar.css
    │   │   ├── quill-editor.css
    │   │   ├── scrumboard.css
    │   │   ├── select2.css
    │   │   ├── sweetalert.css
    │   │   ├── swiper.css
    │   │   ├── table-income.css
    │   │   └── tippy.css
    │   └── fonts/                  # 字体文件
    │       └── fonts.css
    ├── components/                  # 可复用组件
    │   ├── CameraOCR.tsx           # 相机 OCR 组件
    │   ├── Dropdown.tsx            # 下拉菜单组件
    │   ├── Error.tsx               # 错误处理组件
    │   ├── faviconUtil.tsx         # 网站图标工具
    │   ├── Highlight.tsx           # 高亮组件
    │   ├── Portals.tsx             # 门户组件
    │   ├── HOC/                    # 高阶组件
    │   │   └── Carousel.tsx        # 轮播高阶组件
    │   ├── Icon/                   # 图标组件
    │   └── Layouts/                # 布局组件
    ├── helpers/                    # 辅助函数和工具
    │   ├── breadcrumbs.tsx         # 面包屑导航
    │   ├── config.tsx              # 配置工具
    │   ├── constant.tsx            # 常量定义
    │   ├── formatDate.tsx          # 日期格式化
    │   ├── formatNumeric.tsx       # 数字格式化
    │   ├── globalApi.tsx           # 全局 API
    │   ├── helpFunction.tsx        # 帮助函数
    │   ├── importShopData.tsx      # 商店数据导入
    │   ├── mockFunction.tsx        # 模拟函数
    │   ├── preLoading.tsx          # 预加载
    │   ├── regex.tsx               # 正则表达式
    │   ├── showNotification.tsx    # 通知显示
    │   └── ...
    ├── overrides/                  # 覆盖和自定义
    │   ├── router/                 # 路由覆盖
    │   └── services/               # 服务覆盖
    ├── pages/                      # 页面组件
    │   ├── About.tsx               # 关于页面
    │   ├── Analytics.tsx           # 分析页面
    │   ├── Charts.tsx              # 图表页面
    │   ├── ChatPopup.tsx           # 聊天弹窗
    │   ├── Crypto.tsx              # 加密页面
    │   ├── DragAndDrop.tsx         # 拖拽页面
    │   ├── Finance.tsx             # 财务页面
    │   ├── FontIcons.tsx           # 字体图标页面
    │   ├── Index.tsx               # 首页
    │   ├── Tables.tsx              # 表格页面
    │   ├── Widgets.tsx             # 小部件页面
    │   ├── Apps/                   # 应用页面
    │   ├── Authentication/         # 认证页面
    │   ├── Components/             # 组件展示页面
    │   ├── DataTables/             # 数据表格页面
    │   ├── DefaultPages/           # 默认页面
    │   ├── Elements/               # 元素页面
    │   ├── Forms/                  # 表单页面
    │   └── Users/                  # 用户页面
    ├── router/                     # 路由配置
    │   ├── authRoute.tsx           # 认证路由
    │   ├── index.tsx               # 路由入口
    │   └── routes.tsx              # 路由定义
    ├── services/                   # API 服务
    │   ├── endpoints.ts            # API 端点
    │   ├── requestApi.ts           # API 请求
    │   ├── requestApiChat.ts       # 聊天 API
    │   ├── requestApiError.ts      # 错误处理 API
    │   ├── requestApiLine.ts        # Line API
    │   ├── requestApiPayment.ts    # 支付 API
    │   └── mutations/              # 数据变更
    ├── store/                      # 状态管理
    │   ├── dataStore.tsx           # 数据存储
    │   ├── index.tsx               # 存储入口
    │   ├── pageStore.tsx           # 页面存储
    │   └── themeConfigSlice.tsx    # 主题配置切片
    └── types/                      # TypeScript 类型定义
        └── index.tsx               # 类型入口
```

## 主要模块说明

### 1. 组件层 (components/)
- **Layouts/**: 应用布局组件，定义整体页面结构
- **HOC/**: 高阶组件，用于组件增强和复用
- **Icon/**: 图标组件库
- 其他通用组件如 Dropdown、Error、Highlight 等

### 2. 页面层 (pages/)
- 包含所有页面级组件，按功能分类组织
- **Apps/**: 应用相关页面
- **Authentication/**: 用户认证页面
- **Forms/**: 表单相关页面
- **Users/**: 用户管理页面

### 3. 路由层 (router/)
- **routes.tsx**: 定义所有路由规则
- **authRoute.tsx**: 认证路由保护
- **index.tsx**: 路由配置入口

### 4. 服务层 (services/)
- **endpoints.ts**: API 端点配置
- **requestApi.ts**: 基础 API 请求封装
- 针对不同功能的专用 API 文件 (Chat, Payment, Line 等)

### 5. 状态管理 (store/)
- 使用 Redux Toolkit 管理全局状态
- **themeConfigSlice.tsx**: 主题配置状态
- **dataStore.tsx**: 应用数据状态
- **pageStore.tsx**: 页面级状态

### 6. 辅助工具 (helpers/)
- 提供各种工具函数：日期格式化、数字处理、通知显示等
- **globalApi.tsx**: 全局 API 工具
- **config.tsx**: 应用配置

### 7. 国际化 (locales/)
- 支持多语言：英语(en)、泰语(th)、中文(zh)
- 使用 i18next 进行国际化管理

## 配置文件说明

### 构建配置
- **vite.config.ts**: Vite 构建和开发服务器配置
- **tsconfig.json**: TypeScript 编译配置
- **tailwind.config.cjs**: Tailwind CSS 配置
- **postcss.config.cjs**: PostCSS 处理配置

### 部署配置
- **vercel.json**: Vercel 平台部署配置
- **bitbucket-pipelines.yml**: Bitbucket CI/CD 流水线
- **htaccess/**: Apache 服务器配置

### 其他配置
- **firebase-config.ts**: Firebase 服务配置
- **manifest.json**: PWA 应用清单

## 开发和构建

### 开发环境
```bash
npm run start        # 启动开发服务器
npm run start:loc    # 本地开发模式
npm run lint         # 代码检查
```

### 生产构建
```bash
npm run build        # 生产构建
npm run build:prod   # 生产环境构建
npm run preview      # 预览构建结果
```

## 总结

TMS UI Service 是一个功能完整的 React 应用，采用了现代前端技术栈，具有良好的项目结构和模块化设计。项目支持多语言、响应式设计、实时通信等多种功能，适合用于构建企业级管理后台应用。
