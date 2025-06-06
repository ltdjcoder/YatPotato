// YatPotato - 专注时光，高效番茄
import './App.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import PomodoroTimer from './components/PomodoroTimer';
import StringAlias from './utils/StringAlias';


function App() {
  // 添加ref来管理输入框焦点
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // 使用 useMemo 缓存 dataStorage 实例，避免无限重新创建
  const dataStorage = useMemo(() => {
    return window.DataStorage.loadDataStorage("ds-test");
  }, []);

  // 状态管理
  const [activeScreen, setActiveScreen] = useState('timer'); // 当前激活的屏幕
  const [customTimerLength, setCustomTimerLength] = useState(25); // 自定义时长
  const [tasks, setTasks] = useState([
    { id: 1, title: '完成软件工程作业', completed: false },
    { id: 2, title: '阅读《设计模式》', completed: true },
    { id: 3, title: '准备明天的演讲', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [pomodoroStats, setPomodoroStats] = useState({
    totalPomodoros: 0,
    todayPomodoros: 0,
    Pomodoros:[],
    totalFocusTime: 0
  });

  // 登录相关状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // 注册相关状态
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  
  // 注册表单验证状态
  const [registerErrors, setRegisterErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 使用新的番茄钟组件
  const pomodoroTimer = PomodoroTimer({
    initialMinutes: customTimerLength,
    customTimerLength: customTimerLength,
    onTimerStart: (isBreak) => {
      console.log(isBreak ? '休息开始' : '专注时间开始');
    },
    onTimerComplete: (isBreak, pomodoroCount) => {
      if (!isBreak) {
        // 更新番茄钟统计
        // 获取今天的日期字符串
        const today = StringAlias.today(); // 使用便捷方法创建今天的日期
        
        setPomodoroStats(prev => {
          // 检查今天的日期是否已经在 Pomodoros 数组中
          const todayString = today.toString();
          const todayExists = prev.Pomodoros.some(date => {
            // 安全地比较，处理可能是字符串或StringAlias对象的情况
            const dateString = (typeof date === 'string') ? date : date.toString();
            return dateString === todayString;
          });
          const newPomodoros = todayExists 
            ? prev.Pomodoros // 如果已存在，不重复添加
            : [...prev.Pomodoros, today]; // 如果不存在，添加到数组末尾
          
          return {
            ...prev,
            totalPomodoros: prev.totalPomodoros + 1,
            todayPomodoros: prev.todayPomodoros + 1,
            totalFocusTime: prev.totalFocusTime + customTimerLength,
            Pomodoros: newPomodoros
          };
        });
      }
    },
    onTimerReset: () => {
      console.log('计时器已重置');
    },
    onTimerStateChange: (isRunning, minutes, seconds) => {
      // 可以在这里处理计时器状态变化
    }
  });

  // 添加调试信息
  console.log('当前登录状态:', isLogin);
  
  // 在组件加载完成后从数据存储加载任务
  useEffect(() => {
    const storedTasks = dataStorage.load("tasks");
    if (storedTasks) {
      setTasks(storedTasks);
    }
    
    // 加载番茄钟统计数据
    const storedStats = dataStorage.load("pomodoro_stats");
    if (storedStats) {
      // 如果存储的数据中有 Pomodoros 数组，需要将字符串转换为 StringAlias 对象
      const processedStats = {
        ...storedStats,
        Pomodoros: storedStats.Pomodoros ? 
          storedStats.Pomodoros.map(date => {
            // 安全地创建StringAlias对象
            try {
              return typeof date === 'string' ? new StringAlias(date) : date;
            } catch (error) {
              console.warn('Error creating StringAlias from date:', date, error);
              return new StringAlias(String(date));
            }
          }) : []
      };
      setPomodoroStats(processedStats);
    }
  }, [dataStorage]); // 现在 dataStorage 是稳定的，所以这个依赖是安全的

  // 保存番茄钟统计数据 - 只在初始化时保存一次，避免无限循环
  useEffect(() => {
    // 只有当统计数据不是初始值时才保存，避免无意义的保存
    if (pomodoroStats.totalPomodoros > 0 || pomodoroStats.todayPomodoros > 0 || pomodoroStats.totalFocusTime > 0) {
      // 将 StringAlias 对象转换为字符串进行保存
      const statsToSave = {
        ...pomodoroStats,
        Pomodoros: pomodoroStats.Pomodoros.map(date => {
          // 安全地转换为字符串
          try {
            return typeof date === 'string' ? date : date.toString();
          } catch (error) {
            console.warn('Error converting date to string:', date, error);
            return String(date);
          }
        })
      };
      dataStorage.save("pomodoro_stats", statsToSave);
    }
  }, [pomodoroStats, dataStorage]);

  // 实时验证注册表单
  useEffect(() => {
    if (showRegister) {
      const errors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      };

      if (registerUsername.length > 0 && registerUsername.length < 3) {
        errors.username = '用户名至少需要3个字符';
      }

      if (email.length > 0) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          errors.email = '请输入有效的邮箱地址';
        }
      }

      if (registerPassword.length > 0 && registerPassword.length < 6) {
        errors.password = '密码至少需要6个字符';
      }

      if (confirmPassword.length > 0 && confirmPassword !== registerPassword) {
        errors.confirmPassword = '两次输入的密码不一致';
      }

      setRegisterErrors(errors);
    }
  }, [registerUsername, email, registerPassword, confirmPassword, showRegister]);

  function updateTasks(newTasks){
    try{
      dataStorage.save("tasks", newTasks);
    }catch (error) {
      console.error("Error saving tasks remote:", error);
    }
    setTasks(dataStorage.load("tasks") || newTasks);
  }

  dataStorage.registerUpdateEventWithKey("tasks", ()=>{
    setTasks(dataStorage.load("tasks"));
  })

  // 添加新任务
  const addTask = () => {
    if (newTaskText.trim() !== '') {
      updateTasks([...tasks, { id: Date.now(), title: newTaskText, completed: false }]);
      setNewTaskText('');
    }
  };

  // 切换任务完成状态
  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    updateTasks(updatedTasks);
  };

  // 应用自定义时长
  const applyCustomTime = () => {
    setCustomTimerLength(customTimerLength);
    pomodoroTimer.resetTimer();
    setIsSettingsOpen(false);
  };

  // 切换屏幕锁定
  const toggleScreenLock = () => {
    setIsScreenLocked(!isScreenLocked);
  };

  // 登录处理函数
  const handleLogin = () => {
    if (!username.trim()) {
      alert('请输入用户名');
      usernameInputRef.current?.focus();
      return;
    }
    if (!password.trim()) {
      alert('请输入密码');
      passwordInputRef.current?.focus();
      return;
    }

    setIsLogin(true);
  };

  // 处理用户名输入框的键盘事件
  const handleUsernameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  // 处理密码输入框的键盘事件
  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  // 注册页面的键盘事件处理
  const handleRegisterUsernameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 跳转到邮箱输入框
      const emailInput = document.querySelector('input[type="email"]');
      emailInput?.focus();
    }
  };

  const handleRegisterEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 跳转到密码输入框
      const passwordInputs = document.querySelectorAll('.register-input[type="password"]');
      passwordInputs[0]?.focus();
    }
  };

  const handleRegisterPasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 跳转到确认密码输入框
      const passwordInputs = document.querySelectorAll('.register-input[type="password"]');
      passwordInputs[1]?.focus();
    }
  };

  const handleRegisterConfirmPasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitRegister();
    }
  };

  // 注册处理函数
  const handleRegister = () => {
    setShowRegister(true);
  };

  // 提交注册信息
  const submitRegister = () => {
    // 清空之前的错误信息
    setRegisterErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    
    let hasError = false;

    if (!registerUsername.trim()) {
      alert('请输入用户名');
      setRegisterErrors(prev => ({ ...prev, username: '用户名不能为空' }));
      hasError = true;
    } else if (registerUsername.trim().length < 3) {
      alert('用户名至少需要3个字符');
      setRegisterErrors(prev => ({ ...prev, username: '用户名至少需要3个字符' }));
      hasError = true;
    }

    if (!email.trim()) {
      alert('请输入邮箱');
      setRegisterErrors(prev => ({ ...prev, email: '邮箱不能为空' }));
      hasError = true;
    } else {
      // 简单的邮箱格式验证
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        alert('请输入有效的邮箱地址');
        setRegisterErrors(prev => ({ ...prev, email: '请输入有效的邮箱地址' }));
        hasError = true;
      }
    }

    if (!registerPassword.trim()) {
      alert('请输入密码');
      setRegisterErrors(prev => ({ ...prev, password: '密码不能为空' }));
      hasError = true;
    } else if (registerPassword.length < 6) {
      alert('密码至少需要6个字符');
      setRegisterErrors(prev => ({ ...prev, password: '密码至少需要6个字符' }));
      hasError = true;
    }

    if (registerPassword !== confirmPassword) {
      alert('两次输入的密码不一致');
      setRegisterErrors(prev => ({ ...prev, confirmPassword: '两次输入的密码不一致' }));
      hasError = true;
    }
    
    if (hasError) {
      return; // 如果有错误，阻止提交
    }
    
    // 这里可以添加实际的注册逻辑
    // 可以集成到您的 dataStorage 系统中
    alert('注册成功！请使用新账户登录。');
    
    // 注册成功后回到登录页面，并自动填入用户名
    setShowRegister(false);
    setUsername(registerUsername); // 自动填入刚注册的用户名
    setRegisterUsername('');
    setRegisterPassword('');
    setConfirmPassword('');
    setEmail('');
    backToLogin();
  };

  // 返回登录页面
  const backToLogin = () => {
    setShowRegister(false);
    setRegisterUsername('');
    setRegisterPassword('');
    setConfirmPassword('');
    setEmail('');
    
    // 确保登录状态字段也被清理
    setUsername('');
    setPassword('');
    setTimeout(() => {
      usernameInputRef.current?.focus();
    }, 100);
  };

  // 渲染主计时器屏幕
  const renderTimerScreen = () => (
    <div className="timer-screen">
      <div className="timer-container">
        {/* 添加当前阶段指示器 */}
        <div className="phase-indicator">
          <span className={`phase-badge ${pomodoroTimer.isBreak ? 'break' : 'focus'}`}>
            {pomodoroTimer.getCurrentPhase()}
          </span>
          <span className="pomodoro-count">第 {pomodoroTimer.pomodoroCount + (pomodoroTimer.isBreak ? 0 : 1)} 个番茄钟</span>
        </div>

        {/* 进度圆环 */}
        <div className="timer-progress-ring">
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke={pomodoroTimer.isBreak ? "#4CAF50" : "#ff6b35"}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - pomodoroTimer.getProgress() / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 140 140)"
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="timer-display-container">
            <h1 className="timer-display">{pomodoroTimer.formatTime()}</h1>
            <p className="timer-percentage">{Math.round(pomodoroTimer.getProgress())}%</p>
          </div>
        </div>

        <p className="motivational-quote">
          {pomodoroTimer.isBreak 
            ? "适当休息，才能更好地专注。" 
            : "集中注意力，全神贯注，是专注力的表现。"}
        </p>
        
        <div className="timer-controls">
          <button 
            className={`control-btn ${pomodoroTimer.isRunning ? 'pause' : 'start'}`} 
            onClick={pomodoroTimer.toggleTimer}
          >
            {pomodoroTimer.isRunning ? '⏸️ 暂停' : '▶️ 开始'}
          </button>
          <button 
            className="control-btn reset" 
            onClick={pomodoroTimer.resetTimer}
          >
            🔄 重置
          </button>
          <button 
            className="control-btn skip" 
            onClick={pomodoroTimer.skipPhase}
            disabled={!pomodoroTimer.isRunning}
          >
            ⏭️ 跳过
          </button>
          <button 
            className="control-btn settings" 
            onClick={() => setIsSettingsOpen(true)}
          >
            ⚙️ 设置
          </button>
        </div>

        {/* 今日统计 */}
        <div className="daily-stats">
          <div className="stat-item">
            <span className="stat-number">{pomodoroStats.todayPomodoros}</span>
            <span className="stat-label">今日番茄钟</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{pomodoroStats.totalFocusTime}</span>
            <span className="stat-label">总专注时长(分钟)</span>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="settings-overlay">
          <div className="settings-panel">
            <h2>番茄钟设置</h2>
            <div className="settings-group">
              <label>专注时长</label>
              <div className="settings-control">
                <input 
                  type="number" 
                  min="1" 
                  max="90" 
                  value={customTimerLength} 
                  onChange={(e) => setCustomTimerLength(parseInt(e.target.value))} 
                />
                <span>分钟</span>
              </div>
            </div>
            <div className="settings-info">
              <p>💡 经典番茄工作法建议25分钟专注，5分钟休息</p>
              <p>🔔 应用会在开始和结束时播放提示音</p>
              <p>📱 支持桌面通知提醒</p>
            </div>
            <div className="settings-buttons">
              <button onClick={() => setIsSettingsOpen(false)}>取消</button>
              <button onClick={applyCustomTime}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // 渲染任务列表屏幕
  const renderTaskListScreen = () => (
    <div className="tasks-screen">
      <h2>任务列表</h2>
      <div className="task-input-container">
        <input
          type="text"
          placeholder="添加新任务..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>添加</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <span onClick={() => toggleTaskCompletion(task.id)}>
              {task.completed ? '✓' : '○'} {task.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  // 渲染报告屏幕
  const renderReportsScreen = () => (
    <div className="reports-screen">
      <h2>专注报告</h2>
      <div className="report-tabs">
        <button className="report-tab active">周报</button>
        <button className="report-tab">月报</button>
      </div>
      <div className="report-content">
        <div className="report-summary">
          <div className="report-stat">
            <span className="stat-value">{pomodoroStats.totalPomodoros}</span>
            <span className="stat-label">完成番茄数</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">{Math.round(pomodoroStats.totalFocusTime / 60)}h</span>
            <span className="stat-label">专注时长</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">{pomodoroStats.todayPomodoros}</span>
            <span className="stat-label">今日番茄数</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">{pomodoroStats.Pomodoros.length}</span>
            <span className="stat-label">打卡天数</span>
          </div>
        </div>
        <div className="report-chart">
          <h3>本周专注趋势</h3>
          <div className="chart-placeholder">
            <p>📈 图表功能开发中...</p>
          </div>
        </div>
        <div className="weekly-calendar">
          <div className="calendar-header">
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
            <span>日</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染成就屏幕
  const renderAchievementsScreen = () => (
    <div className="achievements-screen">
      <h2>成就系统</h2>
      <div className="achievements-grid">
        <div className={`achievement-item ${pomodoroStats.totalPomodoros >= 1 ? 'unlocked' : ''}`}>
          <div className="achievement-icon">🔥</div>
          <div className="achievement-info">
            <h3>初学者</h3>
            <p>完成第一个番茄钟</p>
          </div>
        </div>
        <div className={`achievement-item ${pomodoroStats.todayPomodoros >= 5 ? 'unlocked' : ''}`}>
          <div className="achievement-icon">⚡</div>
          <div className="achievement-info">
            <h3>高效达人</h3>
            <p>一天内完成5个番茄钟</p>
          </div>
        </div>
        <div className="achievement-item ">
          <div className="achievement-icon">🏆</div>
          <div className="achievement-info">
            <h3>持之以恒</h3>
            <p>连续7天使用YatPotato</p>
          </div>
        </div>
        <div className={`achievement-item ${pomodoroStats.totalPomodoros >= 20 ? 'unlocked' : ''}`}>
          <div className="achievement-icon">🌟</div>
          <div className="achievement-info">
            <h3>番茄大师</h3>
            <p>完成20个番茄钟</p>
          </div>
        </div>
        <div className={`achievement-item ${pomodoroStats.totalFocusTime >= 6000 ? 'unlocked' : ''}`}>
          <div className="achievement-icon">💎</div>
          <div className="achievement-info">
            <h3>专注王者</h3>
            <p>累计专注时长超过100小时</p>
          </div>
        </div>
        <div className="achievement-item">
          <div className="achievement-icon">🚀</div>
          <div className="achievement-info">
            <h3>效率狂人</h3>
            <p>单周完成30个番茄钟</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染锁定屏幕
  const renderLockedScreen = () => (
    <div className="locked-screen">
      <div className="locked-content">
        <div className="lock-icon">🔒</div>
        <h2>专注模式已锁定</h2>
        <p className="timer-display">{pomodoroTimer.formatTime()}</p>
        <p className="lock-message">
          {pomodoroTimer.isBreak ? '休息进行中，放松一下' : '专注进行中，请勿打扰'}
        </p>
        <div className="lock-phase-indicator">
          <span className={`phase-badge ${pomodoroTimer.isBreak ? 'break' : 'focus'}`}>
            {pomodoroTimer.getCurrentPhase()}
          </span>
        </div>
        <button className="unlock-btn" onClick={toggleScreenLock}>解锁</button>
      </div>
    </div>
  );

  // 渲染登录屏幕
  const renderLoginScreen = () => (
    <div className="login-screen-desktop">
      <div className="login-container-desktop">
        <div className="login-content">
          <div className="login-header">
            <div className="app-logo-desktop">🍅</div>
            <h1 className="app-title-desktop">YatPotato</h1>
            <p className="app-subtitle-desktop">专注时光，高效番茄</p>
          </div>

          <div className="login-form-wrapper">
            <form className="login-form-desktop" onSubmit={(e) => {e.preventDefault(); handleLogin();}}>
              <div className="input-group">
                <div className="input-icon">👤</div>
                <input
                  ref={usernameInputRef}
                  type="text"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleUsernameKeyPress}
                  className="login-input"
                  autoFocus
                />
              </div>
              
              <div className="input-group">
                <div className="input-icon">🔒</div>
                <input
                  ref={passwordInputRef}
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handlePasswordKeyPress}
                  className="login-input"
                />
              </div>
              
              <button type="submit" className="login-btn-primary">
                开始专注之旅
              </button>
              
            </form>
            <form className="login-form-desktop" onSubmit={(e) => {e.preventDefault(); handleRegister();}}>
              <button type="submit" className="register-btn-secondary">
                没有账号？注册一个新的吧！
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染注册屏幕
  const renderRegisterScreen = () => (
    <div className="register-screen-desktop">
      <div className="register-container">
        <div className="login-content">
          <div className="login-header">
            <div className="app-logo-desktop">🍅</div>
            <h1 className="app-title-desktop">YatPotato</h1>
            <p className="app-subtitle-desktop">创建你的专注账户</p>
          </div>

          <div className="login-form-wrapper">
            <form className="login-form-desktop register-form" onSubmit={(e) => {e.preventDefault(); submitRegister();}}>
              <div className="input-group">
                <div className="input-icon">👤</div>
                <input
                  type="text"
                  placeholder="用户名"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className={`register-input ${registerErrors.username ? 'error' : ''}`}
                  autoFocus
                  onKeyPress={handleRegisterUsernameKeyPress}
                />
                {registerErrors.username && <span className="error-message">{registerErrors.username}</span>}
              </div>

              <div className="input-group">
                <div className="input-icon">📧</div>
                <input
                  type="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`register-input ${registerErrors.email ? 'error' : ''}`}
                  onKeyPress={handleRegisterEmailKeyPress}
                />
                {registerErrors.email && <span className="error-message">{registerErrors.email}</span>}
              </div>
              
              <div className="input-group">
                <div className="input-icon">🔒</div>
                <input
                  type="password"
                  placeholder="密码"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className={`register-input ${registerErrors.password ? 'error' : ''}`}
                  onKeyPress={handleRegisterPasswordKeyPress}
                />
                {registerErrors.password && <span className="error-message">{registerErrors.password}</span>}
              </div>

              <div className="input-group">
                <div className="input-icon">🔒</div>
                <input
                  type="password"
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`register-input ${registerErrors.confirmPassword ? 'error' : ''}`}
                  onKeyPress={handleRegisterConfirmPasswordKeyPress}
                />
                {registerErrors.confirmPassword && <span className="error-message">{registerErrors.confirmPassword}</span>}
              </div>
              
              <button type="submit" className="register-btn-primary">
                创建账户
              </button>
              
            </form>
            <button className="register-btn-secondary" onClick={backToLogin}>
              已有账号？返回登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 主渲染函数
  return (
    <div className="app">
      {/* 🔥 热重载测试区域 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: '#ff6b35',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
      </div>

      {isScreenLocked ? (
        renderLockedScreen()
      ) : isLogin ? (
        <>
          <div className="content">
            
            {activeScreen === 'timer' && renderTimerScreen()}
            {activeScreen === 'tasks' && renderTaskListScreen()}
            {activeScreen === 'reports' && renderReportsScreen()}
            {activeScreen === 'achievements' && renderAchievementsScreen()}
          </div>
          
          <nav className="bottom-navigation">
            <button 
              className={activeScreen === 'timer' ? 'active' : ''}
              onClick={() => setActiveScreen('timer')}
            >
              ⏱️
              <span>计时器</span>
            </button>
            <button 
              className={activeScreen === 'tasks' ? 'active' : ''}
              onClick={() => setActiveScreen('tasks')}
            >
              📋
              <span>任务</span>
            </button>
            <button 
              className={activeScreen === 'reports' ? 'active' : ''}
              onClick={() => setActiveScreen('reports')}
            >
              📊
              <span>报告</span>
            </button>
            <button 
              className={activeScreen === 'achievements' ? 'active' : ''}
              onClick={() => setActiveScreen('achievements')}
            >
              🏆
              <span>成就</span>
            </button>
            <button onClick={toggleScreenLock}>
              🔒
              <span>锁机</span>
            </button>
          </nav>
        </>
      ) : showRegister ? (
        renderRegisterScreen()
      ) : (
        renderLoginScreen()
      )}
    </div>
  );
}

export default App;