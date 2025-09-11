import './globals.css';
import AuthProvider from '../lib/authContext';
import Navbar from '../components/Navbar';

export const metadata = { title: 'Code Quest' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
