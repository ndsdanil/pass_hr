import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import AuthProvider from "./components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

export const metadata: Metadata = {
  title: "Pass.hr - AI-Powered Career Platform for Job Seekers",
  description: "Streamline your job search with AI-powered tools. Optimize resumes, prepare for interviews, and land your dream job faster with our intelligent career platform",
  keywords: "job search, resume optimization, ATS, career platform, interview preparation, job application automation, AI career tools",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-6K37HVMMDJ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6K37HVMMDJ');
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <main className="min-h-screen bg-black text-white">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
