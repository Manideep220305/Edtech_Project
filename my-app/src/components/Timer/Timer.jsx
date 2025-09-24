import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = () => {
  const [time, setTime] = useState(23 * 60 + 15); // 23:15 in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(23 * 60 + 15);
  };

  return (
    <div className="timer-container">
      <div className="timer-header">
        <h2>Timer</h2>
      </div>
      
      <div className="timer-display">
        <div className="time">{formatTime(time)}</div>
      </div>

      <div className="timer-controls">
        <button 
          onClick={startTimer} 
          disabled={isRunning}
          className="timer-btn start"
        >
          Start
        </button>
        <button 
          onClick={pauseTimer} 
          disabled={!isRunning}
          className="timer-btn pause"
        >
          Pause
        </button>
        <button 
          onClick={resetTimer}
          className="timer-btn reset"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;