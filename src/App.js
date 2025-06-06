import React, { useState } from 'react';
import './App.css';
import PomodoroTimer from './components/PomodoroTimer';

function App() {
  let dataStorage = window.DataStorage.loadDataStorage("ds-test");

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
  const [pomodoroStats, setPomodoroStats] = useState({
    totalPomodoros: 0,
    todayPomodoros: 0,
    totalFocusTime: 0
  });

  // 登录相关状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
        setPomodoroStats(prev => ({
          totalPomodoros: prev.totalPomodoros + 1,
          todayPomodoros: prev.todayPomodoros + 1,
          totalFocusTime: prev.totalFocusTime + customTimerLength
        }));
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
  React.useEffect(() => {
    const storedTasks = dataStorage.load("tasks");
    if (storedTasks) {
      setTasks(storedTasks);
    }
    
    // 加载番茄钟统计数据
    const storedStats = dataStorage.load("pomodoro_stats");
    if (storedStats) {
      setPomodoroStats(storedStats);
    }
  }, [dataStorage]);

  // 保存番茄钟统计数据
  React.useEffect(() => {
    dataStorage.save("pomodoro_stats", pomodoroStats);
  }, [pomodoroStats, dataStorage]);

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
    // 暂时不需要真实验证，直接跳转到主界面
    if (username.trim()) {
      setIsLogin(true);
    } else {
      alert('请输入用户名');
    }
  };

  // 注册处理函数
  const handleRegister = () => {
    // 临时注册逻辑 - 可以后续扩展
    if (username.trim()) {
      alert('注册功能开发中，请稍后再试！');
      // 或者可以直接让用户登录
      // setIsLogin(true);
    } else {
      alert('请输入用户名');
    }
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
        <div className="achievement-item">
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
                  type="text"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
                />
              </div>
              
              <div className="input-group">
                <div className="input-icon">🔒</div>
                <input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
      ) : (
        renderLoginScreen()
      )}
    </div>
  );
}

export default App;