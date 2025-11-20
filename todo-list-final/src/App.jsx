import React, { useState, useEffect } from 'react';
import { Trash2, Check, Plus, Moon, Sun, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import './App.css';

function App() {
  // =================================================
  // 1. ZONA DE ESTADOS
  // =================================================

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('todo-theme');
    return savedTheme === 'dark';
  });
  
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('todo-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { 
        id: 1, 
        title: 'Bienvenido a tu Gestor', 
        desc: 'En el celular, toca la flecha arriba para volver a la lista.', 
        completed: false 
      }
    ];
  });
  
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // =================================================
  // 2. ZONA DE EFECTOS
  // =================================================

  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('todo-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // =================================================
  // 3. ZONA DE FUNCIONES
  // =================================================

  const addTask = () => {
    if (inputValue.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      title: inputValue.trim(),
      desc: '', 
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setInputValue('');
    // En PC seleccionamos directo, en móvil quizás prefieras no cambiar de pantalla bruscamente
    // pero por ahora lo dejaremos así para que puedas editarla de inmediato.
    setSelectedTaskId(newTask.id); 
  };

  const deleteTask = (e, id) => {
    e.stopPropagation(); 
    setTasks(tasks.filter(task => task.id !== id));
    if (selectedTaskId === id) setSelectedTaskId(null); 
  };

  const toggleComplete = (e, id) => {
    e.stopPropagation();
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const updateTask = (key, value) => {
    setTasks(tasks.map(t => t.id === selectedTaskId ? { ...t, [key]: value } : t));
  };

  const activeTask = tasks.find(t => t.id === selectedTaskId);

  // =================================================
  // 4. ZONA VISUAL
  // =================================================
  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      
      <header className="main-header">
        <h1>Gestor de Proyectos</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      {/* Clases dinámicas para controlar qué se ve en el móvil */}
      <main className={`dashboard ${selectedTaskId ? 'show-notepad' : 'show-list'}`}>
        
        {/* --- PANEL IZQUIERDO (LISTA) --- */}
        <section className="task-panel">
          <div className="input-group">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Nueva tarea..."
            />
            <button className="add-btn" onClick={addTask}>
              <Plus size={24} />
            </button>
          </div>

          <ul className="task-list">
            {tasks.length === 0 && <p className="empty-msg">Sin tareas pendientes</p>}
            
            {tasks.map(task => (
              <li 
                key={task.id} 
                className={`task-item 
                  ${task.completed ? 'completed' : ''} 
                  ${selectedTaskId === task.id ? 'selected' : ''}
                `}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <div className="task-info">
                  <button 
                    className={`check-btn ${task.completed ? 'active' : ''}`} 
                    onClick={(e) => toggleComplete(e, task.id)}
                  >
                    <Check size={16} />
                  </button>
                  <span className="task-title">{task.title}</span>
                </div>
                
                <div className="actions">
                  {task.desc && <FileText size={14} className="icon-indicator"/>}
                  <button className="delete-btn" onClick={(e) => deleteTask(e, task.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* --- PANEL DERECHO (BLOC DE NOTAS) --- */}
        <section className="notepad-panel">
          {activeTask ? (
            <div className="notepad-content">
              <div className="notepad-header">
                {/* Botón VOLVER (Solo visible en móvil gracias a CSS) */}
                <button className="back-btn" onClick={() => setSelectedTaskId(null)}>
                  <ArrowLeft size={20} /> Volver
                </button>
                
                <span className="id-label">#{activeTask.id}</span>
              </div>

              <input 
                type="text" 
                className="notepad-title" 
                value={activeTask.title}
                onChange={(e) => updateTask('title', e.target.value)}
              />

              <textarea 
                className="notepad-body" 
                placeholder="Escribe aquí los detalles..."
                value={activeTask.desc}
                onChange={(e) => updateTask('desc', e.target.value)}
              />
              
              <div className="notepad-footer">
                <small>Guardado automático</small>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <ArrowRight size={48} />
              <p>Selecciona una tarea</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;