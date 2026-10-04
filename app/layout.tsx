import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'MLS Property Ingest Processor',
  description: 'Automated real estate MLS property normalization and ingest processor.',
  openGraph: {
    title: 'MLS Property Ingest Processor',
    description: 'Automated real estate MLS property normalization and ingest processor.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MLS Property Ingest Processor',
    description: 'Automated real estate MLS property normalization and ingest processor.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
