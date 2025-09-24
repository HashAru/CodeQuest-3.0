'use client';
import { ThemeProvider } from '../lib/themeContext';
import Navbar from './Navbar';

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider>
      <Navbar />
      {children}
    </ThemeProvider>
  );
}