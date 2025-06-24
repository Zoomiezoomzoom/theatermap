"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Theater, Sun, Moon, Menu, X, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-2 bg-notion-accent" />
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <Link href="/" className="flex flex-shrink-0 items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-notion-accent">
                  <Theater size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold transition-colors text-gray-900 dark:text-white">
                  Ascend
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <Link
                href="/grants"
                className="text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Submissions Opps
              </Link>
              {isSignedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Settings
                  </Link>
                </>
              )}
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Auth Buttons */}
              {isLoaded && (
                <>
                  {!isSignedIn ? (
                    <div className="flex items-center space-x-3">
                      <SignInButton mode="modal">
                        <button className="text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                          Sign In
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover transition-colors">
                          Get Started
                        </button>
                      </SignUpButton>
                    </div>
                  ) : (
                    <UserButton />
                  )}
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <Link
                  href="/grants"
                  className="block text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Submission Opps
                </Link>
                {isSignedIn && (
                  <Link
                    href="/dashboard"
                    className="block text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                
                {/* Mobile Auth Buttons */}
                {isLoaded && (
                  <>
                    {!isSignedIn ? (
                      <div className="space-y-3 pt-3">
                        <SignInButton mode="modal">
                          <button className="w-full text-left text-sm font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-notion-accent text-white hover:bg-notion-accent-hover transition-colors">
                            Get Started
                          </button>
                        </SignUpButton>
                      </div>
                    ) : (
                      <div className="pt-3">
                        <UserButton />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
} 