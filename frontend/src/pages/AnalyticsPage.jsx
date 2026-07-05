import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api.js';

export const AnalyticsPage = () => {
  const [branches, setBranches] = useState([]);
  const [prep, setPrep] = useState(null);

  useEffect(() => {
    api.get('/analytics/branch-placements').then(({ data }) => {
      setBranches(data.data.map((item) => ({ branch: item._id || 'NA', placed: item.placed, total: item.total })));
    });
  }, []);

  const generatePrep = async () => {
    const { data } = await api.post('/analytics/interview-prep', {
      role: 'Software Engineer',
      company: 'Target Company',
      skills: ['React', 'Node.js', 'MongoDB']
    });
    setPrep(data.questions);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Branch-wise Placements</h2>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={branches}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="placed" fill="#0f766e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#c2410c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <aside className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">AI Interview Prep</h2>
        <button onClick={generatePrep} className="focus-ring mt-4 rounded-md bg-brand px-4 py-2 font-medium text-white">Generate questions</button>
        {prep && (
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {[...prep.technical, ...prep.hr, ...prep.companySpecific].map((question) => <p key={question}>{question}</p>)}
          </div>
        )}
      </aside>
    </div>
  );
};
