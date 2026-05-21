import React, { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLogin, isLoading, error, onBackToPublic }) => {
  const [email, setEmail] = useState('registrar@creditor.test');
  const [password, setPassword] = useState('TestPassword123!');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 flex flex-col">
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 text-white">
          <Shield className="w-8 h-8 text-blue-400" />
          <span className="font-bold text-lg">CrediTOR</span>
        </div>
        {onBackToPublic && (
          <button
            type="button"
            onClick={onBackToPublic}
            className="text-sm font-semibold text-blue-200 hover:text-white transition-colors"
          >
            ← Public verification
          </button>
        )}
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">CrediTOR</h1>
          </div>
          <p className="text-blue-200">Registrar Portal</p>
          <p className="text-slate-400 text-sm mt-2">Secure Transcript of Records Verification</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-200">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Login</h2>
            <p className="text-blue-100 text-sm mt-1">Sign in to your registrar account</p>
          </div>

          {/* Card Body */}
          <form onSubmit={handleSubmit} className="px-8 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="registrar@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '🔓' : '🔒'}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6 text-sm">
              <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Card Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              Demo Credentials:
              <br />
              <span className="font-mono text-xs text-slate-700">
                registrar@creditor.test / TestPassword123!
              </span>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 text-slate-400 text-sm space-y-2">
          <p>© 2024 CrediTOR. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
