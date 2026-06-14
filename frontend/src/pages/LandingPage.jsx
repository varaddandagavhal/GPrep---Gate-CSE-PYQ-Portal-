import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/stores.js';

const FeatureCard = ({ icon, title, desc }) => (
  <div className="rounded-3xl p-8 flex flex-col items-center text-center"
    style={{
      backgroundColor: '#EDE0D1',
      boxShadow: '12px 12px 24px rgba(74, 55, 40, 0.12), -4px -4px 12px rgba(245, 237, 227, 0.8)',
      borderRadius: '28px',
      border: '1px solid rgba(200, 122, 90, 0.15)',
    }}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-5"
      style={{
        backgroundColor: '#C87A5A',
        boxShadow: '6px 6px 12px rgba(74, 55, 40, 0.15), -3px -3px 8px rgba(200, 122, 90, 0.3)',
      }}>
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2" style={{ color: '#4A3728' }}>{title}</h3>
    <p className="text-sm leading-relaxed" style={{ color: '#8B6F5E' }}>{desc}</p>
  </div>
);

const SubjectPill = ({ name }) => (
  <div className="px-5 py-2.5 rounded-full text-sm font-semibold"
    style={{
      backgroundColor: '#EDE0D1',
      color: '#4A3728',
      boxShadow: '4px 4px 10px rgba(74, 55, 40, 0.1), -2px -2px 6px rgba(245, 237, 227, 0.7)',
      border: '1px solid rgba(200, 122, 90, 0.1)',
    }}>
    {name}
  </div>
);

const ClayButton = ({ to, children, primary }) => (
  <Link to={to}
    className="inline-block px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 hover:-translate-y-0.5"
    style={{
      backgroundColor: primary ? '#C87A5A' : '#EDE0D1',
      color: primary ? '#FFF' : '#4A3728',
      boxShadow: primary
        ? '8px 8px 16px rgba(74, 55, 40, 0.2), -3px -3px 10px rgba(200, 122, 90, 0.25)'
        : '6px 6px 14px rgba(74, 55, 40, 0.1), -3px -3px 8px rgba(245, 237, 227, 0.7)',
      border: primary ? 'none' : '1px solid rgba(200, 122, 90, 0.12)',
    }}>
    {children}
  </Link>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div style={{ backgroundColor: '#F5EDE3', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
        <span className="text-2xl font-bold" style={{ color: '#C87A5A' }}>GatePrep</span>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#EDE0D1',
              color: '#4A3728',
              boxShadow: '4px 4px 10px rgba(74, 55, 40, 0.1), -2px -2px 6px rgba(245, 237, 227, 0.7)',
              border: '1px solid rgba(200, 122, 90, 0.1)',
            }}>
            Log in
          </button>
          <button onClick={() => navigate('/register')} className="px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#C87A5A',
              color: '#FFF',
              boxShadow: '6px 6px 12px rgba(74, 55, 40, 0.2), -2px -2px 8px rgba(200, 122, 90, 0.2)',
            }}>
            Sign up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ color: '#4A3728' }}>
              Crack GATE CSE<br />with Confidence
            </h1>
            <p className="text-lg mb-8 max-w-lg mx-auto lg:mx-0" style={{ color: '#8B6F5E' }}>
              Practice 150+ handpicked questions across 12 subjects, take proctored mock tests, and track your progress with detailed analytics.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <ClayButton to="/register" primary>Get Started Free</ClayButton>
              <ClayButton to="/login">Sign In</ClayButton>
            </div>
          </div>

          {/* Hero card */}
          <div className="flex-shrink-0 w-full max-w-sm p-8 rounded-[32px]"
            style={{
              backgroundColor: '#EDE0D1',
              boxShadow: '16px 16px 32px rgba(74, 55, 40, 0.12), -6px -6px 16px rgba(245, 237, 227, 0.8)',
              border: '1px solid rgba(200, 122, 90, 0.12)',
            }}>
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <div className="text-4xl font-extrabold mb-1" style={{ color: '#C87A5A' }}>150+</div>
              <div className="font-semibold mb-4" style={{ color: '#8B6F5E' }}>Practice Questions</div>
              <div className="flex justify-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: '#C87A5A', color: '#FFF' }}>12 Subjects</span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: '#8FAB7A', color: '#FFF' }}>Mock Tests</span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: '#E8B86D', color: '#FFF' }}>Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16" style={{ backgroundColor: '#EBE0D3' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: '#4A3728' }}>Everything you need</h2>
          <p className="text-center mb-12 max-w-md mx-auto" style={{ color: '#8B6F5E' }}>A complete platform designed for GATE CSE aspirants</p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon="📝" title="Practice Mode" desc="Attempt questions by subject or topic with instant feedback and detailed explanations for every answer." />
            <FeatureCard icon="🛡️" title="Proctored Tests" desc="Simulate real exam conditions with fullscreen enforcement, tab-switch detection, and auto-submit on violations." />
            <FeatureCard icon="📊" title="Detailed Analytics" desc="Review your scores, accuracy, time spent per question, and track improvement across multiple tests." />
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3" style={{ color: '#4A3728' }}>Cover all GATE CSE subjects</h2>
        <p className="text-center mb-10 max-w-md mx-auto" style={{ color: '#8B6F5E' }}>From Engineering Mathematics to Computer Networks</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {['Engineering Mathematics', 'Discrete Mathematics', 'Digital Logic', 'Computer Organization', 'Programming & DS', 'Algorithms', 'Theory of Computation', 'Compiler Design', 'Operating Systems', 'Databases', 'Computer Networks', 'General Aptitude'].map(s => (
            <SubjectPill key={s} name={s} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16" style={{ backgroundColor: '#EBE0D3' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#4A3728' }}>How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up as a student in seconds and get immediate access to all questions and tests.' },
              { step: '2', title: 'Practice & Test', desc: 'Practice topic-wise or take full proctored mock tests under real exam conditions.' },
              { step: '3', title: 'Track Progress', desc: 'Review detailed results, identify weak areas, and improve with every attempt.' },
            ].map((item) => (
              <div key={item.step} className="rounded-3xl p-8 text-center"
                style={{
                  backgroundColor: '#EDE0D1',
                  boxShadow: '10px 10px 20px rgba(74, 55, 40, 0.1), -4px -4px 12px rgba(245, 237, 227, 0.7)',
                  border: '1px solid rgba(200, 122, 90, 0.1)',
                }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-5"
                  style={{
                    backgroundColor: '#C87A5A',
                    boxShadow: '4px 4px 10px rgba(74, 55, 40, 0.15)',
                  }}>
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#4A3728' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8B6F5E' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-lg mx-auto rounded-[32px] p-10"
          style={{
            backgroundColor: '#EDE0D1',
            boxShadow: '14px 14px 28px rgba(74, 55, 40, 0.1), -6px -6px 16px rgba(245, 237, 227, 0.7)',
            border: '1px solid rgba(200, 122, 90, 0.12)',
          }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#4A3728' }}>Ready to start preparing?</h2>
          <p className="mb-8" style={{ color: '#8B6F5E' }}>Join GatePrep and take your GATE CSE preparation to the next level.</p>
          <ClayButton to="/register" primary>Create Free Account</ClayButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm" style={{ color: '#8B6F5E', borderTop: '1px solid rgba(200, 122, 90, 0.15)' }}>
        <span className="font-bold" style={{ color: '#C87A5A' }}>GatePrep</span> — GATE CSE Preparation Platform
      </footer>
    </div>
  );
}
