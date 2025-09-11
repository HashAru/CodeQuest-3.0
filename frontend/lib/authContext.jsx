'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { postJSON } from './api';

const AuthContext = createContext();

export function useAuth(){ return useContext(AuthContext); }

export default function AuthProvider({ children }){
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const t = typeof window !== 'undefined' ? localStorage.getItem('cq_token') : null;
    const u = t ? JSON.parse(localStorage.getItem('cq_user') || 'null') : null;
    if (t && u) setUser(u);
  }, []);

  const signup = async ({email,password})=>{
    const res = await postJSON('/api/auth/register', {email,password});
    if (res.token){ localStorage.setItem('cq_token', res.token); localStorage.setItem('cq_user', JSON.stringify(res.user)); setUser(res.user); }
    return res;
  };
  const login = async ({email,password})=>{ const res = await postJSON('/api/auth/login',{email,password}); if (res.token){ localStorage.setItem('cq_token', res.token); localStorage.setItem('cq_user', JSON.stringify(res.user)); setUser(res.user);} return res; };
  const logout = ()=>{ localStorage.removeItem('cq_token'); localStorage.removeItem('cq_user'); setUser(null); };

  return <AuthContext.Provider value={{user, signup, login, logout}}>{children}</AuthContext.Provider>;
}
