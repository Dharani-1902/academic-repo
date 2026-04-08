import { useState, useEffect } from 'react';

export default function StudentForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    student_id: '',
    name: '',
    email: '',
    program: '',
    enrollment_year: '',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        student_id: initial.student_id ?? '',
        name: initial.name ?? '',
        email: initial.email ?? '',
        program: initial.program ?? '',
        enrollment_year: initial.enrollment_year ?? '',
      });
    }
  }, [initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      enrollment_year: form.enrollment_year ? parseInt(form.enrollment_year, 10) : null,
    });
  }

  return (
    <form className="form card" onSubmit={handleSubmit}>
      <h2>{initial ? 'Edit student' : 'New student'}</h2>
      <div className="form-grid">
        <label>
          Student ID
          <input
            name="student_id"
            value={form.student_id}
            onChange={handleChange}
            required
            placeholder="e.g. STU001"
          />
        </label>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Full name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </label>
        <label>
          Program
          <input
            name="program"
            value={form.program}
            onChange={handleChange}
            placeholder="e.g. Computer Science"
          />
        </label>
        <label>
          Enrollment year
          <input
            type="number"
            name="enrollment_year"
            value={form.enrollment_year}
            onChange={handleChange}
            placeholder="e.g. 2023"
            min="1990"
            max="2030"
          />
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Save' : 'Add student'}
        </button>
      </div>
    </form>
  );
}
