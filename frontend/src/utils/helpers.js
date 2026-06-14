/**
 * Time Formatting Utility
 */
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

/**
 * Score Calculation Utility
 */
export const calculateScore = (questions, answers) => {
  let score = 0;
  let correct = 0;

  questions.forEach((question) => {
    const selectedOption = answers[question._id];
    if (selectedOption === question.correctOption) {
      score += question.marks;
      correct++;
    } else if (selectedOption !== undefined && selectedOption !== null) {
      score -= question.negativeMarks;
    }
  });

  return {
    score: Math.max(0, score),
    correct,
    total: questions.length,
    accuracy: ((correct / questions.length) * 100).toFixed(2),
  };
};

/**
 * Local Storage Helper
 */
export const storageHelper = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

/**
 * Date Formatting
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Percentage Formatting
 */
export const formatPercentage = (value) => {
  return `${parseFloat(value).toFixed(2)}%`;
};
