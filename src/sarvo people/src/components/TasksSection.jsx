import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, CheckSquare, Square, Trash2 } from 'lucide-react';
import { personalTaskApi } from '../apis/personalTaskApi';

export default function TasksSection() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  // Load tasks from backend API
  const loadTasks = async () => {
    try {
      const data = await personalTaskApi.getTasks();
      // Map database format to component expectations
      const mapped = data.map(t => ({
        id: t.id,
        name: t.name,
        dueDate: t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
        description: t.description,
        completed: t.completed
      }));
      setTasks(mapped);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskName) return;

    try {
      await personalTaskApi.createTask({
        name: taskName,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        description
      });
      await loadTasks();
      
      // Close & reset
      setIsModalOpen(false);
      setTaskName('');
      setDueDate('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleToggleComplete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await personalTaskApi.toggleTask(id, !task.completed);
      await loadTasks();
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await personalTaskApi.deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const openTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="tasks-section-container">
      {/* 1. Header Control Bar */}
      <div className="tasks-header-bar">
        <div className="tasks-stats-row">
          <div className="task-stat-item">
            <span className="stat-lbl">Total</span>
            <span className="stat-num-val">{tasks.length}</span>
          </div>
          <div className="task-stat-item divider-left">
            <span className="stat-lbl">Open</span>
            <span className="stat-num-val font-blue">{openTasks.length}</span>
          </div>
          <div className="task-stat-item divider-left">
            <span className="stat-lbl">Completed</span>
            <span className="stat-num-val font-green">{completedTasks.length}</span>
          </div>
        </div>

        <div className="tasks-actions-right">
          <button className="btn-add-task" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} style={{ marginRight: '4px' }} />
            Add Task
          </button>
        </div>
      </div>

      {/* 2. Main content list / Empty state */}
      <div className="tasks-content-card">
        {tasks.length === 0 ? (
          <div className="empty-state-container">
            {/* Clipboard checklist SVG */}
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="empty-illustration">
              <rect x="55" y="40" width="90" height="120" rx="8" fill="#ffffff" stroke="#3B82F6" strokeWidth="4" />
              <rect x="75" y="25" width="50" height="20" rx="4" fill="#3B82F6" />
              <line x1="85" y1="35" x2="115" y2="35" stroke="white" strokeWidth="3" strokeLinecap="round" />
              
              {/* Checklist details */}
              <circle cx="80" cy="75" r="8" fill="#EBF3FF" stroke="#3B82F6" strokeWidth="2" />
              <line x1="100" y1="75" x2="130" y2="75" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              
              <circle cx="80" cy="105" r="8" fill="#EBF3FF" stroke="#3B82F6" strokeWidth="2" />
              <line x1="100" y1="105" x2="130" y2="105" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              
              <circle cx="80" cy="135" r="8" fill="#EBF3FF" stroke="#3B82F6" strokeWidth="2" />
              <line x1="100" y1="135" x2="130" y2="135" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              
              {/* Cute little pencil */}
              <path d="M145 125 L165 105 L175 115 L155 135 Z" fill="#FBBF24" />
              <path d="M145 125 L140 135 L150 130 Z" fill="#1F2937" />
              <rect x="160" y="100" width="10" height="5" rx="1" fill="#FCA5A5" transform="rotate(-45 160 100)" />
            </svg>
            <p className="empty-state-text" style={{ marginTop: '15px' }}>No tasks to list here</p>
          </div>
        ) : (
          <div className="tasks-list-wrapper">
            <h3 className="logs-list-title">My Checklist</h3>
            {tasks.map(task => (
              <div key={task.id} className={`task-row-item ${task.completed ? 'completed-task-row' : ''}`}>
                <button 
                  className="btn-checkbox-toggle" 
                  onClick={() => handleToggleComplete(task.id)}
                >
                  {task.completed ? (
                    <CheckSquare size={20} className="icon-green" fill="#dcfce7" />
                  ) : (
                    <Square size={20} className="icon-muted" />
                  )}
                </button>
                
                <div className="task-row-details">
                  <span className="task-row-name">{task.name}</span>
                  <span className="task-row-desc">{task.description || 'No description provided.'}</span>
                </div>

                <div className="task-row-meta">
                  <Calendar size={14} style={{ marginRight: '6px', color: '#8e9bb3' }} />
                  <span>Due: {task.dueDate}</span>
                </div>

                <button className="btn-delete-task" onClick={() => handleDeleteTask(task.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Add Task Modal popup */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="modal-form">
              <div className="form-group">
                <label>Task Name *</label>
                <input 
                  type="text" 
                  placeholder="Task title" 
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Enter details..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
