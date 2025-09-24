import './globals.css';
import AuthProvider from '../lib/authContext';
import ClientLayout from '../components/ClientLayout';

export const metadata = { 
  title: 'CodeQuest - Master Algorithms Visually',
  description: 'Interactive algorithm visualizations, AI-powered study plans, and comprehensive coding environment for mastering programming interviews.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 antialiased">
        <AuthProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
