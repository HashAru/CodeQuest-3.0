'use client';
import { useState } from 'react';
import { useAuth } from '../../../lib/authContext';
import { useRouter } from 'next/navigation';

export default function LoginPage(){
  const { login } = useAuth();
  const router = useRouter();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState('');

  const handle = async (e)=>{ e.preventDefault(); const res = await login({email,password}); if (res.token) router.push('/'); else setErr(res.message || 'Login failed'); };

  return (
    <main className="container py-12">
      <div className="max-w-md mx-auto p-6 rounded-lg border bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form onSubmit={handle} className="space-y-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 border rounded" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 border rounded" />
          {err && <div className="text-red-500">{err}</div>}
          <div className="flex justify-between items-center">
            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded">Login</button>
            <a href="/auth/signup" className="text-sm">Create account</a>
          </div>
        </form>
      </div>
    </main>
  );
}
