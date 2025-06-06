# YatPotato - React Electron 桌面应用

这是一个使用 React 和 Electron 构建的桌面应用程序项目。

## 项目技术栈

- **前端框架**: React 19.1.0
- **桌面应用框架**: Electron 36.3.2
- **构建工具**: React Scripts 5.0.1
- **开发环境**: Node.js + npm

## 项目结构

```
yatpotato-react-test/
├── src/                    # React 应用源代码
│   ├── components/         # React 组件
│   ├── utils/             # 工具函数
│   ├── App.js             # 主应用组件
│   └── index.js           # React 入口
├── public/                # 静态资源和 Electron 配置
│   ├── electron.js        # Electron 主进程
│   └── preload.js         # 预加载脚本
├── .cursor/               # Cursor AI 规则配置
│   └── rules/             # 开发规则文件
├── build/                 # 构建输出目录
├── data/                  # 数据存储目录
└── package.json           # 项目配置
```

## 开发命令

### 标准 React 命令

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Electron 专用命令

### `npm run electron-dev`

并发启动 React 开发服务器和 Electron 应用，支持热重载。

### `npm run electron-build`

构建 React 应用后启动 Electron。

### `npm run dist`

构建并打包 Electron 应用为可分发的安装包。

## 变更日志

### 2024-12-19 - AI助手变更记录 (最新)

#### 新增文件
- `.cursor/rules/auto-git-commit.mdc` - 自动Git提交规则，定义AI助手在完成代码修改后自动执行git add和git commit的工作流程，包含提交信息规范、错误处理和验证反馈

#### 修改文件
- `.cursor/rules/development-workflow.mdc` - 
  - 在AI助手工作流程中新增"自动提交"步骤
  - 添加了Git提交要求的强制执行规则
  - 要求每次代码修改后立即执行git操作

---

### 2024-12-19 - AI助手变更记录

#### 新增文件
- `.cursor/rules/project-overview.mdc` - 项目概览规则，描述项目架构、目录结构和主要入口点
- `.cursor/rules/react-development.mdc` - React 开发规则，包含组件开发约定、状态管理和测试规范
- `.cursor/rules/electron-development.mdc` - Electron 开发规则，涵盖架构、IPC通信、安全实践和打包指南
- `.cursor/rules/coding-standards.mdc` - 代码规范标准，定义代码风格、命名约定、依赖管理和性能优化准则
- `.cursor/rules/development-workflow.mdc` - 开发工作流程规则，包含项目设置、开发流程、构建部署和调试指南
- `.cursor/rules/change-tracking.mdc` - 变更跟踪规则，要求AI助手在每次代码修改后记录变更日志

#### 修改文件
- `README.md` - 
  - 添加了项目说明和技术栈介绍
  - 重新组织了项目结构说明
  - 新增了Electron专用命令说明
  - 创建了变更日志部分用于跟踪所有代码变更

---

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
