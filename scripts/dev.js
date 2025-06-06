const { spawn } = require('child_process');
const net = require('net');

// 检查端口是否可用
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false)); // 端口被占用
    });
    server.on('error', () => resolve(true)); // 端口可用
  });
}

// 等待端口开放
function waitForPort(port, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkInterval = setInterval(async () => {
      attempts++;
      console.log(`⏳ 等待端口 ${port} 开放... (${attempts}/${maxAttempts})`);
      
      const isAvailable = await checkPort(port);
      if (!isAvailable) { // 端口被占用，说明服务已启动
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error(`端口 ${port} 启动超时`));
      }
    }, 1000);
  });
}

async function startDev() {
  console.log('🚀 启动 YatPotato 开发环境...');
  
  try {
    // 检查端口 3000 是否已经被占用
    const portAvailable = await checkPort(3000);
    let reactProcess;
    
    if (portAvailable) {
      // 启动 React 开发服务器
      console.log('📦 启动 React 开发服务器...');
      reactProcess = spawn('npm', ['start'], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd()
      });

      reactProcess.on('error', (error) => {
        console.error('❌ React 服务器启动失败:', error);
        process.exit(1);
      });

      // 等待 React 服务器启动
      await waitForPort(3000);
      console.log('✅ React 开发服务器已启动');
    } else {
      console.log('✅ React 开发服务器已在运行');
    }

    // 等待一秒确保服务器完全就绪
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 启动 Electron
    console.log('⚡ 启动 Electron 应用...');
    const electronProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    electronProcess.on('error', (error) => {
      console.error('❌ Electron 启动失败:', error);
      if (reactProcess) reactProcess.kill();
      process.exit(1);
    });

    // 处理进程退出
    process.on('SIGINT', () => {
      console.log('\n🛑 正在关闭开发服务器...');
      if (reactProcess) reactProcess.kill();
      electronProcess.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 正在关闭开发服务器...');
      if (reactProcess) reactProcess.kill();
      electronProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 开发环境启动失败:', error);
    process.exit(1);
  }
}

startDev().catch(console.error);
