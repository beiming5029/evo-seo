'use client';

import { Mail, ArrowRight, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function CheckEmailPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth.checkEmail');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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
        const data = await response.json();
        setResendMessage(data.error || t('resendError'));
      }
    } catch (error) {
      setResendMessage(t('resendError'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            {/* Email Icon with Animation */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gray-400 dark:bg-gray-600 rounded-full opacity-20 animate-ping"></div>
              <Mail className="w-20 h-20 mx-auto mb-6 text-gray-700 dark:text-gray-300 relative" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('title')}
            </h1>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {t('description')}
            </p>

            {/* Email Illustration */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {t('notReceived')}
              </p>
              <ul className="text-left text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span>{t('checkSpam')}</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span>{t('checkEmailCorrect')}</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="w-4 h-4 mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span>{t('waitAndCheck')}</span>
                </li>
              </ul>
            </div>

            {/* Resend Button */}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full mb-4 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
                  {t('resending')}
                </>
              ) : (
                <>
                  <RefreshCcw className="w-5 h-5 mr-2" />
                  {t('resendButton')}
                </>
              )}
            </button>

            {/* Resend Message */}
            {resendMessage && (
              <p className={`text-sm mb-4 ${
                resendMessage.includes('successfully') 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {resendMessage}
              </p>
            )}

            {/* Back to Login */}
            <Link
              href={`/${locale}/login`}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              {t('backToLogin')}
            </Link>
          </div>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {t('securityNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}