/**
 * Storage Module - Handles localStorage and data persistence
 * Provides functions for saving, loading, and managing application data
 */

const STORAGE_KEY = 'campus-life-planner-data';
const SETTINGS_KEY = 'campus-life-planner-settings';

/**
 * Generate a unique ID for tasks
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate timestamp for created/updated dates
 * @returns {string} ISO timestamp
 */
export function generateTimestamp() {
  return new Date().toISOString();
}

/**
 * Load tasks from localStorage with fallback mechanisms
 * @returns {Array} Array of task objects
 */
export function loadTasks() {
  try {
    // Try loading from localStorage first
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const tasks = JSON.parse(data);
      if (Array.isArray(tasks) && tasks.length > 0) {
        return tasks;
      }
    }
    
    // If localStorage is empty, try sessionStorage backup
    const backupData = sessionStorage.getItem(STORAGE_KEY + '_backup');
    if (backupData) {
      const backupTasks = JSON.parse(backupData);
      if (Array.isArray(backupTasks) && backupTasks.length > 0) {
        console.info('Loaded tasks from sessionStorage backup');
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, backupData);
        return backupTasks;
      }
    }
    
    // If no tasks found, try to load from seed data
    return loadSeedData();
    
  } catch (error) {
    console.error('Error loading tasks from localStorage:', error);
    
    // Try loading seed data as fallback
    try {
      return loadSeedData();
    } catch (seedError) {
      console.error('Error loading seed data:', seedError);
      return [];
    }
  }
}

/**
 * Save tasks to localStorage with automatic backup
 * @param {Array} tasks - Array of task objects to save
 * @returns {boolean} Success status
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    
    // Create automatic backup every time tasks are saved
    if (tasks.length > 0) {
      createAutomaticBackup(tasks);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving tasks to localStorage:', error);
    
    // Try to fallback to backup storage if localStorage fails
    try {
      sessionStorage.setItem(STORAGE_KEY + '_backup', JSON.stringify(tasks));
      console.warn('Tasks saved to sessionStorage backup due to localStorage error');
    } catch (backupError) {
      console.error('Backup storage also failed:', backupError);
    }
    
    return false;
  }
}

/**
 * Load settings from localStorage
 * @returns {Object} Settings object
 */
export function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    const defaultSettings = {
      timeUnit: 'hours',
      dateFormat: 'YYYY-MM-DD',
      dueReminders: true,
      goalAlerts: true,
      durationCap: 40,
      caseSensitiveSearch: false
    };
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (error) {
    console.error('Error loading settings from localStorage:', error);
    return {
      timeUnit: 'hours',
      dateFormat: 'YYYY-MM-DD',
      dueReminders: true,
      goalAlerts: true,
      durationCap: 40,
      caseSensitiveSearch: false
    };
  }
}

/**
 * Save settings to localStorage
 * @param {Object} settings - Settings object to save
 * @returns {boolean} Success status
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    return false;
  }
}

/**
 * Clear all application data
 * @returns {boolean} Success status
 */
export function clearAllData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}

/**
 * Export data as JSON
 * @param {Array} tasks - Tasks to export
 * @param {Object} settings - Settings to export
 * @returns {string} JSON string
 */
export function exportData(tasks, settings) {
  const exportData = {
    version: '1.0',
    exportedAt: generateTimestamp(),
    tasks: tasks,
    settings: settings
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import data from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {Object} Import result with success status and data
 */
export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate the imported data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }
    
    const result = {
      success: true,
      tasks: [],
      settings: null,
      errors: []
    };
    
    // Validate and import tasks
    if (Array.isArray(data.tasks)) {
      result.tasks = data.tasks.filter(task => {
        return validateTaskStructure(task);
      });
      
      // Report any invalid tasks
      const invalidTasks = data.tasks.length - result.tasks.length;
      if (invalidTasks > 0) {
        result.errors.push(`${invalidTasks} tasks were skipped due to invalid structure`);
      }
    } else if (data.tasks) {
      result.errors.push('Tasks data is not in the expected format');
    }
    
    // Validate and import settings
    if (data.settings && typeof data.settings === 'object') {
      result.settings = data.settings;
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      tasks: [],
      settings: null,
      errors: [error.message]
    };
  }
}

/**
 * Validate task structure for import
 * @param {Object} task - Task object to validate
 * @returns {boolean} Valid status
 */
function validateTaskStructure(task) {
  if (!task || typeof task !== 'object') return false;
  
  const requiredFields = ['id', 'title', 'dueDate', 'duration', 'tag'];
  const optionalFields = ['description', 'createdAt', 'updatedAt'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!task.hasOwnProperty(field) || task[field] === null || task[field] === undefined) {
      return false;
    }
  }
  
  // Validate field types
  if (typeof task.id !== 'string' ||
      typeof task.title !== 'string' ||
      typeof task.dueDate !== 'string' ||
      typeof task.tag !== 'string' ||
      (typeof task.duration !== 'number' || task.duration < 0)) {
    return false;
  }
  
  // Validate optional fields if present
  if (task.description !== undefined && typeof task.description !== 'string') {
    return false;
  }
  
  if (task.createdAt !== undefined && typeof task.createdAt !== 'string') {
    return false;
  }
  
  if (task.updatedAt !== undefined && typeof task.updatedAt !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Get storage usage information
 * @returns {Object} Storage usage stats
 */
export function getStorageInfo() {
  try {
    const tasksData = localStorage.getItem(STORAGE_KEY);
    const settingsData = localStorage.getItem(SETTINGS_KEY);
    
    const tasksSize = tasksData ? new Blob([tasksData]).size : 0;
    const settingsSize = settingsData ? new Blob([settingsData]).size : 0;
    const totalSize = tasksSize + settingsSize;
    
    return {
      tasksCount: tasksData ? JSON.parse(tasksData).length : 0,
      tasksSize: tasksSize,
      settingsSize: settingsSize,
      totalSize: totalSize,
      totalSizeFormatted: formatBytes(totalSize)
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return {
      tasksCount: 0,
      tasksSize: 0,
      settingsSize: 0,
      totalSize: 0,
      totalSizeFormatted: '0 B'
    };
  }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Backup current data to a downloadable file
 * @param {Array} tasks - Current tasks
 * @param {Object} settings - Current settings
 * @param {string} filename - Optional filename
 */
export function downloadBackup(tasks, settings, filename = null) {
  try {
    const data = exportData(tasks, settings);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `campus-life-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error creating backup download:', error);
    return false;
  }
}

/**
 * Check if localStorage is available and has space
 * @returns {Object} Storage availability info
 */
export function checkStorageAvailability() {
  try {
    // Test localStorage availability
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Estimate available space (rough calculation)
    const testData = 'x'.repeat(1024 * 1024); // 1MB test
    let availableSpace = 0;
    
    try {
      for (let i = 0; i < 10; i++) {
        localStorage.setItem(`__space_test_${i}__`, testData);
        availableSpace += 1024 * 1024;
      }
      
      // Clean up test data
      for (let i = 0; i < 10; i++) {
        localStorage.removeItem(`__space_test_${i}__`);
      }
    } catch (e) {
      // Storage quota exceeded
    }
    
    return {
      available: true,
      estimatedSpace: availableSpace,
      estimatedSpaceFormatted: formatBytes(availableSpace)
    };
  } catch (error) {
    return {
      available: false,
      estimatedSpace: 0,
      estimatedSpaceFormatted: '0 B',
      error: error.message
    };
  }
}
