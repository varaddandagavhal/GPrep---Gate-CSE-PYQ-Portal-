import { useEffect, useState, useCallback, useRef } from 'react';
import { testAPI } from '../services/api.js';
import toast from 'react-hot-toast';

const GRACE_PERIOD = 5000;

const useProctoring = (testId, onAutoSubmit) => {
  const [violations, setViolations] = useState(0);
  const activeRef = useRef(false);
  const submittedRef = useRef(false);
  const cleanupRef = useRef(null);
  const graceTimerRef = useRef(null);
  const fsIntervalRef = useRef(null);
  const prevTestIdRef = useRef(testId);

  const cleanup = useCallback(() => {
    if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    if (fsIntervalRef.current) clearInterval(fsIntervalRef.current);
    if (cleanupRef.current) cleanupRef.current();
  }, []);

  const redirectAfterSubmit = useCallback(() => {
    cleanup();
    toast.dismiss();
    if (onAutoSubmit) onAutoSubmit();
  }, [cleanup, onAutoSubmit]);

  const recordViolation = useCallback(async (type) => {
    if (submittedRef.current || !activeRef.current) return;

    try {
      const res = await testAPI.recordViolation(testId, type);
      setViolations(res.data.violations);

      if (res.data.autoSubmit && !submittedRef.current) {
        submittedRef.current = true;
        toast.error('Multiple violations detected! Redirecting...', { id: 'auto-submit' });
        setTimeout(redirectAfterSubmit, 1200);
      } else {
        toast.error(`Violation ${res.data.violations}/2. Stay in the test window!`, {
          id: 'violation-warn',
          duration: 4000,
        });
      }
    } catch {
      // silently fail
    }
  }, [testId, redirectAfterSubmit]);

  useEffect(() => {
    if (!testId) return;

    activeRef.current = false;
    graceTimerRef.current = setTimeout(() => {
      activeRef.current = true;
    }, GRACE_PERIOD);

    // Periodically ensure fullscreen
    fsIntervalRef.current = setInterval(() => {
      if (!activeRef.current || submittedRef.current) return;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      }
    }, 5000);

    const onVisibility = () => {
      if (document.hidden) recordViolation('tab_switch');
    };
    const onBlur = () => {
      if (document.hidden) recordViolation('tab_switch');
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        recordViolation('fullscreen_exit');
      }
    };
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    const onPopState = () => {
      window.history.pushState(null, null, window.location.href);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('popstate', onPopState);

    window.history.pushState(null, null, window.location.href);

    cleanupRef.current = () => {
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      if (fsIntervalRef.current) clearInterval(fsIntervalRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
      if (document.fullscreenElement) document.exitFullscreen?.();
      if (document.webkitFullscreenElement) document.webkitExitFullscreen?.();
    };

    return cleanupRef.current;
  }, [testId, recordViolation]);

  return violations;
};

const useTestTimer = (testId, totalSeconds, onTimeUp) => {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    if (timeLeft <= 0) { onTimeUp(); return; }
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  return timeLeft;
};

const useAutoSave = (testId, answers, timeSpent, markedForReview) => {
  useEffect(() => {
    const interval = setInterval(() => {
      Object.entries(answers).forEach(([qId, opt]) => {
        testAPI.saveAnswer(testId, qId, opt, timeSpent?.[qId] || 0, markedForReview?.has(qId) || false)
          .catch(() => {});
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [testId, answers, timeSpent, markedForReview]);
};

export { useProctoring, useTestTimer, useAutoSave };
