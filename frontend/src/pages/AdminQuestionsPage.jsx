import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../layouts/Layout.jsx';
import { questionAPI } from '../services/api.js';

export const AdminQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '', topicId: '', year: new Date().getFullYear(),
    questionText: '', options: ['', '', '', ''], correctOption: 0,
    explanation: '', marks: 1, negativeMarks: 0.33,
  });

  useEffect(() => { loadSubjects(); loadQuestions(); }, []);

  const loadSubjects = async () => {
    try { const r = await questionAPI.getSubjects(); setSubjects(r.data.data); }
    catch { toast.error('Failed to load subjects'); }
  };

  const loadQuestions = async () => {
    try { const r = await questionAPI.getQuestions({ limit: 50 }); setQuestions(r.data.data.questions); setIsLoading(false); }
    catch { toast.error('Failed to load questions'); setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) await questionAPI.updateQuestion(formData._id, formData);
      else await questionAPI.createQuestion(formData);
      toast.success(formData._id ? 'Question updated' : 'Question created');
      setShowForm(false);
      setFormData({ subjectId: '', topicId: '', year: new Date().getFullYear(), questionText: '', options: ['', '', '', ''], correctOption: 0, explanation: '', marks: 1, negativeMarks: 0.33 });
      loadQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question?')) {
      try { await questionAPI.deleteQuestion(id); toast.success('Question deleted'); loadQuestions(); }
      catch { toast.error('Failed to delete question'); }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold" style={{ color: '#4A3728' }}>Question Management</h1>
          <button onClick={() => setShowForm(!showForm)} className="clay-btn px-5 py-2.5 text-sm">
            {showForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        {showForm && (
          <div className="clay-card p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#4A3728' }}>New Question</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} required className="clay-input">
                  <option value="">Select Subject</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <input type="number" placeholder="Year" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="clay-input" />
              </div>
              <textarea placeholder="Question Text" value={formData.questionText} onChange={(e) => setFormData({ ...formData, questionText: e.target.value })} required className="clay-input" rows="3" />
              <div className="space-y-2">
                <p className="font-semibold text-sm" style={{ color: '#4A3728' }}>Options</p>
                {formData.options.map((opt, i) => (
                  <input key={i} type="text" placeholder={`Option ${i + 1}`} value={opt}
                    onChange={(e) => { const o = [...formData.options]; o[i] = e.target.value; setFormData({ ...formData, options: o }); }}
                    required className="clay-input" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={formData.correctOption} onChange={(e) => setFormData({ ...formData, correctOption: parseInt(e.target.value) })} className="clay-input">
                  {[0, 1, 2, 3].map((i) => <option key={i} value={i}>Correct: Option {String.fromCharCode(65 + i)}</option>)}
                </select>
                <select value={formData.marks} onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })} className="clay-input">
                  <option value="1">1 Mark</option><option value="2">2 Marks</option>
                </select>
                <select value={formData.negativeMarks} onChange={(e) => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) })} className="clay-input">
                  <option value="0.33">-0.33</option><option value="0.66">-0.66</option><option value="0">No Negative</option>
                </select>
              </div>
              <textarea placeholder="Explanation" value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} required className="clay-input" rows="3" />
              <button type="submit" className="clay-btn w-full py-3">Save Question</button>
            </form>
          </div>
        )}

        <div className="clay-table">
          {isLoading ? (
            <div className="p-6"><p style={{ color: '#8B6F5E' }}>Loading questions...</p></div>
          ) : (
            <table className="w-full">
              <thead><tr><th>Question</th><th>Subject</th><th>Year</th><th>Actions</th></tr></thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id}>
                    <td className="max-w-xs truncate">{q.questionText}</td>
                    <td>{q.subjectId?.name || '—'}</td>
                    <td>{q.year}</td>
                    <td><button onClick={() => handleDelete(q._id)} className="clay-btn-danger px-3 py-1.5 text-xs">Delete</button></td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-8" style={{ color: '#8B6F5E' }}>No questions yet</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
