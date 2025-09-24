import React, { useState } from 'react';
import './TodoList.css';

const TodoList = ({ todos, setTodos }) => {
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      const newTodoItem = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h2>To-Do List</h2>
        <div className="todo-input-section">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="todo-input"
          />
          <button onClick={addTodo} className="add-btn">Add</button>
        </div>
      </div>

      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <label className="todo-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="todo-checkbox"
              />
              <span className="todo-text">{todo.text}</span>
            </label>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="delete-btn"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoList;