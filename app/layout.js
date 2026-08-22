import './globals.css';

export const metadata = {
  title: 'GWD Tours · Edinburgh Immersive Experience',
  description: 'A scroll-driven cinematic architectural walkthrough of Edinburgh, Scotland. Developed by GWD Global.',
  generator: 'GWD Global, rp-3d-immersive',
  authors: [{ name: 'GWD Global' }],
  creator: 'GWD Global',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
