'use client';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';

export default function Navbar(){
  const { user, logout } = useAuth();
  return (
    <header className="w-full border-b bg-white dark:bg-gray-900">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md flex items-center justify-center bg-amber-600 text-white font-bold">CQ</div>
          <div>
            <div className="font-semibold">Code Quest</div>
            <div className="text-xs text-gray-500">DSA Visualizer</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/" legacyBehavior><a className="hover:underline">Home</a></Link>
          <Link href="/visualizer" legacyBehavior><a className="hover:underline">Visualizer</a></Link>
          <Link href="/ide" legacyBehavior><a className="hover:underline">IDE</a></Link>
          <Link href="/forum" legacyBehavior><a className="hover:underline">Forum</a></Link>
          <Link href="/profile-tracker" legacyBehavior><a className="hover:underline">Profile Tracker</a></Link>
          <Link href="/ai" legacyBehavior><a className="hover:underline">AI Planner</a></Link>

          {user ? (
            <>
              <span className="text-sm">{user.email}</span>
              <button onClick={logout} className="px-3 py-1 rounded-md border">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" legacyBehavior><a className="px-3 py-1 rounded-md border">Login</a></Link>
              <Link href="/auth/signup" legacyBehavior><a className="px-3 py-1 rounded-md bg-emerald-500 text-white">Sign up</a></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
