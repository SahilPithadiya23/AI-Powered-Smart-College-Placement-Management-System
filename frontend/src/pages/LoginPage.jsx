import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogIn } from 'lucide-react';
import { login } from '../store/authSlice.js';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (event) => {
    event.preventDefault();
    const result = await dispatch(login(form));
    if (!result.error) navigate('/');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#eef3f6] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-ink">PlacementOS</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage placements, jobs, and hiring workflows.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700">Email</label>
        <input className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="mt-4 block text-sm font-medium text-slate-700">Password</label>
        <input type="password" className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-2 font-medium text-white">
          <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here? <Link className="font-medium text-brand" to="/register">Create account</Link>
        </p>
      </form>
    </main>
  );
};
