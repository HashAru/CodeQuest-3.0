'use client';
import Link from 'next/link';

export default function Page(){
  return (
    <main className="container py-16">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Interactive DSA Visualizer</h1>
          <p className="text-gray-600 mb-6">Step through algorithms, run and save code, and discuss problems in the forum.</p>
          <div className="flex gap-4">
            <Link href="/visualizer" legacyBehavior><a className="px-6 py-3 rounded-md bg-amber-600 text-white">Open Visualizer</a></Link>
            <Link href="/auth/login" legacyBehavior><a className="px-6 py-3 rounded-md border">Login</a></Link>
          </div>
        </div>
        <div>
          <div className="p-6 rounded-lg border bg-white dark:bg-gray-800">Preview of visualizers and IDE</div>
        </div>
      </div>
    </main>
  );
}
