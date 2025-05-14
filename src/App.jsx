import { useState, useEffect } from 'react'
import './App.css'
import pomodoLogo from './assets/react.svg' 

function App() {
  
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState('work'); 
  
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [animateTimer, setAnimateTimer] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isActive) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) {
            clearInterval(interval);
            setIsActive(false);
            handleTimerComplete();
          } else {
            setTimerMinutes(timerMinutes - 1);
            setTimerSeconds(59);
          }
        } else {
          setTimerSeconds(timerSeconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timerMinutes, timerSeconds]);

  const handleTimerComplete = () => {
    if (timerMode === 'work') {
      setTimerMode('shortBreak');
      setTimerMinutes(5);
    } else if (timerMode === 'shortBreak') {
      setTimerMode('work');
      setTimerMinutes(25);
    }
  };

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (timerMode === 'work') {
      setTimerMinutes(25);
    } else if (timerMode === 'shortBreak') {
      setTimerMinutes(5);
    } else if (timerMode === 'longBreak') {
      setTimerMinutes(15);
    }
    setTimerSeconds(0);
  };

  const changeTimerMode = (mode) => {
    if (mode === timerMode) return;
    
    setAnimateTimer(true);
    
    setTimeout(() => {
      setTimerMode(mode);
      setIsActive(false);
      
      if (mode === 'work') {
        setTimerMinutes(25);
      } else if (mode === 'shortBreak') {
        setTimerMinutes(5);
      } else if (mode === 'longBreak') {
        setTimerMinutes(15);
      }
      setTimerSeconds(0);
      
      setAnimateTimer(false);
    }, 300); 
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      subTimer: {
        minutes: 0,
        seconds: 0,
        isActive: false
      }
    };
    
    setTodos([...todos, newTask]);
    setNewTodo('');
  };

  const toggleTodoComplete = (id) => {
    const todo = todos.find(todo => todo.id === id);
    const newCompleted = !todo.completed;
    
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: newCompleted } : todo
      )
    );
    
    if (newCompleted && selectedTodo?.id === id) {
      setSelectedTodo(null);
    }
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    if (selectedTodo?.id === id) {
      setSelectedTodo(null);
    }
  };

  const startSubTimer = (id) => {
    
    const todoToSelect = todos.find(todo => todo.id === id);
    
    setTodos(
      todos.map(todo => 
        todo.id === id 
          ? { ...todo, subTimer: { ...todo.subTimer, isActive: true } } 
          : todo
      )
    );
    
    setSelectedTodo(todoToSelect);
  };

  const pauseSubTimer = (id) => {
    setTodos(
      todos.map(todo => 
        todo.id === id 
          ? { ...todo, subTimer: { ...todo.subTimer, isActive: false } } 
          : todo
      )
    );
  };

  const updateSubTimer = (id, minutes, seconds) => {
    setTodos(
      todos.map(todo => 
        todo.id === id 
          ? { ...todo, subTimer: { ...todo.subTimer, minutes, seconds } } 
          : todo
      )
    );
  };

  useEffect(() => {
    const intervals = todos.map(todo => {
      if (todo.subTimer.isActive) {
        return setInterval(() => {
          let newMinutes = todo.subTimer.minutes;
          let newSeconds = todo.subTimer.seconds + 1;
          
          if (newSeconds >= 60) {
            newMinutes += 1;
            newSeconds = 0;
          }
          
          updateSubTimer(todo.id, newMinutes, newSeconds);
          
          if (selectedTodo && todo.id === selectedTodo.id) {
            setSelectedTodo({
              ...todo,
              subTimer: {
                ...todo.subTimer,
                minutes: newMinutes,
                seconds: newSeconds
              }
            });
          }
        }, 1000);
      }
      return null;
    }).filter(Boolean);
    
    return () => intervals.forEach(interval => clearInterval(interval));
  }, [todos, selectedTodo]);

  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerContainerClass = () => {
    const baseClass = "timer-container";
    if (animateTimer) return `${baseClass} timer-fade`;
    return baseClass;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <img src={pomodoLogo} className="app-logo" alt="Pomodo logo" />
        <h1>Pomodo</h1>
      </header>
      
      <div className={getTimerContainerClass()}>
        <div className="timer-display">
          <h2>{formatTime(timerMinutes, timerSeconds)}</h2>
          <div className="timer-mode">
            Mode: {timerMode === 'work' ? 'Work' : timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </div>
        </div>
        
        <div className="timer-controls">
          {!isActive ? (
            <button className="primary-btn" onClick={startTimer}>
              <span className="btn-icon">▶</span> Start
            </button>
          ) : (
            <button className="secondary-btn" onClick={pauseTimer}>
              <span className="btn-icon">⏸</span> Pause
            </button>
          )}
          <button onClick={resetTimer}>
            <span className="btn-icon">↺</span> Reset
          </button>
        </div>
        
        <div className="timer-modes">
          <button 
            className={timerMode === 'work' ? 'active' : ''} 
            onClick={() => changeTimerMode('work')}
          >
            Work (25:00)
          </button>
          <button 
            className={timerMode === 'shortBreak' ? 'active' : ''} 
            onClick={() => changeTimerMode('shortBreak')}
          >
            Short Break (5:00)
          </button>
          <button 
            className={timerMode === 'longBreak' ? 'active' : ''} 
            onClick={() => changeTimerMode('longBreak')}
          >
            Long Break (15:00)
          </button>
        </div>
      </div>
      
      <div className="todo-container">
        <h2>Todo List</h2>
        
        <form onSubmit={addTodo} className="todo-form">
          <input 
            type="text" 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)} 
            placeholder="Add a new task..."
          />
          <button type="submit" className="primary-btn">Add</button>
        </form>
        
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => toggleTodoComplete(todo.id)} 
                />
                <span className="todo-text">{todo.text}</span>
                <span className="sub-timer">
                  {formatTime(todo.subTimer.minutes, todo.subTimer.seconds)}
                </span>
              </div>
              
              <div className="todo-actions">
                {!todo.subTimer.isActive ? (
                  <button onClick={() => startSubTimer(todo.id)}>
                    <span className="btn-icon">▶</span> Track
                  </button>
                ) : (
                  <button onClick={() => pauseSubTimer(todo.id)}>
                    <span className="btn-icon">⏸</span> Pause
                  </button>
                )}
                <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                  <span className="btn-icon">×</span> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {selectedTodo && (
        <div className="selected-task">
          <h3>Currently Tracking: {selectedTodo.text}</h3>
          <div className="time-spent">
            Time spent: {formatTime(selectedTodo.subTimer.minutes, selectedTodo.subTimer.seconds)}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
