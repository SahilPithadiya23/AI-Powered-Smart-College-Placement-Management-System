import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus } from 'lucide-react';
import { register } from '../store/authSlice.js';

const allowedEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

export const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [formError, setFormError] = useState('');

  const updateForm = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setFormError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const validName = /^[\p{L}][\p{L}\s.'-]*$/u.test(name);
    const validEmail = allowedEmailDomains.some((domain) => email.toLowerCase().includes(domain));
    const mediumPassword = form.password.length >= 8 && /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) && /\d/.test(form.password);

    if (!validName) {
      setFormError('Enter a name using letters only. Spaces, apostrophes, periods, and hyphens are allowed.');
      return;
    }
    if (!validEmail) {
      setFormError('Use a Gmail, Yahoo, Outlook, or Hotmail email address.');
      return;
    }
    if (!mediumPassword) {
      setFormError('Use at least 8 characters with an uppercase letter, lowercase letter, and number.');
      return;
    }

    const result = await dispatch(register({ ...form, name, email }));
    if (!result.error) navigate('/');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef3f6] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-ink">Create Account</h1>
        <label className="mt-6 block text-sm font-medium text-slate-700">Name</label>
        <input required autoComplete="name" className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
        <label className="mt-4 block text-sm font-medium text-slate-700">Email</label>
        <input type="text" required autoComplete="email" className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
        <label className="mt-4 block text-sm font-medium text-slate-700">Password</label>
        <input type="password" required minLength="8" autoComplete="new-password" className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.password} onChange={(e) => updateForm('password', e.target.value)} />
        <p className="mt-1 text-xs text-slate-500">Use 8+ characters with uppercase, lowercase, and a number.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700">Role</label>
        <select className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="student">Student</option>
          <option value="recruiter">Recruiter</option>
          <option value="placement_officer">Placement Officer</option>
          <option value="admin">Admin</option>
        </select>
        {(formError || error) && <p className="mt-3 text-sm text-red-600">{formError || error}</p>}
        <button className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white">
          <UserPlus size={18} /> {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered? <Link className="font-medium text-brand" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};
