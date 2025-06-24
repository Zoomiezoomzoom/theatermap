import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Navbar from "./components/Navbar";
import { OnboardingProvider } from "./components/OnboardingProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ToastKeyboardHandler } from "./components/ToastKeyboardHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ascend - Theater Submission Tracker",
  description: "Your one-stop hub for theater submissions. Discover opportunities, track your submissions, and never miss a deadline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-notion-accent hover:bg-notion-accent-hover text-notion-text",
          card: "bg-notion-bg border border-notion-border",
          headerTitle: "text-notion-text",
          headerSubtitle: "text-notion-text-light",
          socialButtonsBlockButton: "bg-notion-bg border border-notion-border text-notion-text hover:bg-notion-hover-bg",
          formFieldLabel: "text-notion-text",
          formFieldInput: "bg-notion-bg border border-notion-border text-notion-text focus:border-notion-accent",
          footerActionLink: "text-notion-accent hover:text-notion-accent-hover",
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
            <ToastKeyboardHandler />
            <Toaster 
              position="top-right"
              closeButton={true}
              richColors={false}
              toastOptions={{
                style: {
                  background: 'var(--notion-bg)',
                  color: 'var(--notion-text)',
                  border: '1px solid var(--notion-border)',
                },
                className: 'notion-toast',
                duration: 5000,
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
