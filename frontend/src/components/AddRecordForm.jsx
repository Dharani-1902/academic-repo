import { useState } from 'react';

const CURRENT_YEAR = new Date().getFullYear();

export default function AddRecordForm({ courses, onSubmit, onCancel }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [form, setForm] = useState({
    term: 'Fall',
    year: String(CURRENT_YEAR),
    grade: '',
    credits_earned: '',
  });

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    
    const record = {
      course_id: Number(selectedCourseId),
      term: form.term,
      year: Number(form.year),
      grade: form.grade || null,
      credits_earned: form.credits_earned ? parseFloat(form.credits_earned) : null,
    };
    onSubmit([record]);
  }

  return (
    <form className="form card" onSubmit={handleSubmit}>
      <h3>Add academic record</h3>
      <p className="form-hint">Select a course and enter the academic details.</p>

      <label>
        Course
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name} {c.credits != null && `(${c.credits} cr)`}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <label>
          Term
          <select name="term" value={form.term} onChange={handleFormChange}>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
        </label>
        <label>
          Year
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={handleFormChange}
            min="1990"
            max="2030"
          />
        </label>
        <label>
          Grade
          <input
            name="grade"
            value={form.grade}
            onChange={handleFormChange}
            placeholder="e.g. A, B+"
          />
        </label>
        <label>
          Credits earned
          <input
            type="number"
            name="credits_earned"
            value={form.credits_earned}
            onChange={handleFormChange}
            step="0.5"
            min="0"
            placeholder="e.g. 4"
          />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!selectedCourseId}
        >
          Add record
        </button>
      </div>
    </form>
  );
}