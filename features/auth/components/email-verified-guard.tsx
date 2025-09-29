"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { Mail, AlertCircle } from 'lucide-react';
import { useSession } from "@/lib/auth-client";

interface EmailVerifiedGuardProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export function EmailVerifiedGuard({ 
  children, 
  requireEmailVerification = true 
}: EmailVerifiedGuardProps) {
  const router = useRouter();
  const session = useSession();
  const locale = useLocale();
  const t = useTranslations('auth.emailVerifiedGuard');
  const [isResending, setIsResending] = React.useState(false);
  const [resendMessage, setResendMessage] = React.useState('');

  React.useEffect(() => {
    if (!session.isPending && !session.data) {
      router.replace(`/${locale}/login`);
    }
  }, [router, session.data, session.isPending, locale]);

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      setResendMessage('');
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setResendMessage(t('resendSuccess'));
      } else {
        setResendMessage(t('resendError'));
      }
    } catch (error) {
      setResendMessage(t('resendError'));
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (session.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
      </div>
    );
  }

  // Not authenticated
  if (!session.data?.user) {
    return null;
  }

  // Email not verified (if verification is required)
  if (requireEmailVerification && !session.data.user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('title')}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('description')}
              </p>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 mb-6">
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {session.data.user.email}
                </p>
              </div>

              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full px-4 py-2 bg-gray-900 hover:bg-black disabled:bg-gray-600 dark:bg-white dark:hover:bg-gray-200 dark:disabled:bg-gray-400 text-white dark:text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                {isResending ? (
                  <>
                    <Mail className="w-5 h-5 mr-2 animate-pulse" />
                    {t('resending')}
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    {t('resendButton')}
                  </>
                )}
              </button>

              {resendMessage && (
                <p className={`text-sm mt-4 ${
                  resendMessage.includes('sent') 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {resendMessage}
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    // Sign out and redirect to login
                    window.location.href = `/${locale}/login`;
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  {t('signOutLink')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email verified or verification not required
  return <>{children}</>;
}