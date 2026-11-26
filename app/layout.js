import './globals.css';

export const metadata = {
  title: 'OpsLife – Personal Command Centre',
  description: 'Shift-aware routines, hydration, fitness and a six-month DevOps roadmap.',
};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b1220' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
