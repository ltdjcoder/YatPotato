import React, { useState } from 'react';
import './App.css';

function App() {
  let dataStorage = window.DataStorage.loadDataStorage("ds-test");

  // 状态管理
  const [activeScreen, setActiveScreen] = useState('timer'); // 当前激活的屏幕
  const [isTimerRunning, setIsTimerRunning] = useState(false); // 计时器是否在运行
  const [timerMinutes, setTimerMinutes] = useState(25); // 默认25分钟
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [customTimerLength, setCustomTimerLength] = useState(25); // 自定义时长
  const [tasks, setTasks] = useState([
    { id: 1, title: '完成软件工程作业', completed: false },
    { id: 2, title: '阅读《设计模式》', completed: true },
    { id: 3, title: '准备明天的演讲', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  // 在组件加载完成后从数据存储加载任务
  React.useEffect(() => {
    const storedTasks = dataStorage.load("tasks");
    if (storedTasks) {
      setTasks(storedTasks);
    }
  }, []);

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

  // 开始/暂停计时器
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // 重置计时器
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerMinutes(customTimerLength);
    setTimerSeconds(0);
  };

  // 应用自定义时长
  const applyCustomTime = () => {
    setTimerMinutes(customTimerLength);
    setTimerSeconds(0);
    setIsSettingsOpen(false);
  };

  // 切换屏幕锁定
  const toggleScreenLock = () => {
    setIsScreenLocked(!isScreenLocked);
  };

  // 格式化时间显示
  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 渲染主计时器屏幕
  const renderTimerScreen = () => (
    <div className="timer-screen">
      <div className="timer-container">
        <h1 className="timer-display">{formatTime(timerMinutes, timerSeconds)}</h1>
        <p className="motivational-quote">"集中注意力，全神贯注，是专注力的表现。"</p>
        
        <div className="timer-controls">
          <button className={`control-btn ${isTimerRunning ? 'pause' : 'start'}`} onClick={toggleTimer}>
            {isTimerRunning ? '暂停' : '开始'}
          </button>
          <button className="control-btn reset" onClick={resetTimer}>重置</button>
          <button className="control-btn settings" onClick={() => setIsSettingsOpen(true)}>设置</button>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="settings-overlay">
          <div className="settings-panel">
            <h2>自定义计时长度</h2>
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
            <span className="stat-value">14</span>
            <span className="stat-label">完成番茄数</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">7.5</span>
            <span className="stat-label">专注小时</span>
          </div>
          <div className="report-stat">
            <span className="stat-value">8</span>
            <span className="stat-label">完成任务</span>
          </div>
        </div>
        <div className="report-chart">
          <div className="chart-placeholder">
            <div className="bar" style={{height: '60%'}}></div>
            <div className="bar" style={{height: '80%'}}></div>
            <div className="bar" style={{height: '40%'}}></div>
            <div className="bar" style={{height: '90%'}}></div>
            <div className="bar" style={{height: '60%'}}></div>
            <div className="bar" style={{height: '30%'}}></div>
            <div className="bar" style={{height: '70%'}}></div>
          </div>
          <div className="chart-labels">
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
        <div className="achievement-item unlocked">
          <div className="achievement-icon">🔥</div>
          <div className="achievement-info">
            <h3>初学者</h3>
            <p>完成第一个番茄钟</p>
          </div>
        </div>
        <div className="achievement-item unlocked">
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
        <div className="achievement-item">
          <div className="achievement-icon">🌟</div>
          <div className="achievement-info">
            <h3>任务大师</h3>
            <p>完成20个任务</p>
          </div>
        </div>
        <div className="achievement-item">
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
        <p className="timer-display">{formatTime(timerMinutes, timerSeconds)}</p>
        <p className="lock-message">专注进行中，请勿打扰</p>
        <button className="unlock-btn" onClick={toggleScreenLock}>解锁</button>
      </div>
    </div>
  );

  // 主渲染函数
  return (
    <div className="app">
      {isScreenLocked ? (
        renderLockedScreen()
      ) : (
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
      )}
    </div>
  );
}

export default App;