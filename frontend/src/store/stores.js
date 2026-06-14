import { create } from 'zustand';

/**
 * Authentication Store
 * Manages user authentication state and JWT token
 */
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),

  login: (userData, token) => set({
    user: userData,
    token,
    isAuthenticated: true,
  }),

  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  clearAuth: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));

/**
 * Test Store
 * Manages test attempt state and responses
 */
export const useTestStore = create((set, get) => ({
  testId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  markedForReview: new Set(),
  startTime: null,
  timeLeft: 0,
  violations: 0,
  isFullscreen: false,

  startTest: (testId, questions, startTime) =>
    set({
      testId,
      questions,
      startTime,
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: new Set(),
      violations: 0,
    }),

  saveAnswer: (questionId, selectedOption) => {
    const answers = get().answers;
    set({ answers: { ...answers, [questionId]: selectedOption } });
  },

  toggleMarkForReview: (questionId) => {
    const marked = new Set(get().markedForReview);
    if (marked.has(questionId)) {
      marked.delete(questionId);
    } else {
      marked.add(questionId);
    }
    set({ markedForReview: marked });
  },

  goToQuestion: (index) => set({ currentQuestionIndex: index }),

  recordViolation: () => set((state) => ({
    violations: state.violations + 1,
  })),

  setFullscreen: (isFullscreen) => set({ isFullscreen }),

  updateTimeLeft: (time) => set({ timeLeft: time }),

  resetTest: () =>
    set({
      testId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: new Set(),
      startTime: null,
      timeLeft: 0,
      violations: 0,
      isFullscreen: false,
    }),
}));

/**
 * Practice Store
 * Manages practice mode state
 */
export const usePracticeStore = create((set) => ({
  selectedSubject: null,
  selectedTopic: null,
  selectedYear: null,
  questions: [],
  isLoading: false,
  error: null,

  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  setSelectedYear: (year) => set({ selectedYear: year }),

  setQuestions: (questions) => set({ questions, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  resetFilters: () =>
    set({
      selectedSubject: null,
      selectedTopic: null,
      selectedYear: null,
      questions: [],
    }),
}));
