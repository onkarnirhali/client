import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function LoginPage() {
  const { login, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="bg-white min-h-screen text-[#0f111a]">
      {/* Main Hero Section */}
      <main className="min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: Content */}
            <div className="order-2 md:order-1">
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-10">
                <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight">Might as well</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-5">
                Turn important emails<br />into tasks
              </h1>
              <p className="text-lg text-muted leading-relaxed mb-8 max-w-lg">
                Connect your inbox and let AI automatically extract actionable tasks from your emails. Stay organized without the manual effort.
              </p>

              {/* Google Sign-in Button */}
              <button
                onClick={login}
                className="inline-flex items-center gap-3 bg-white border border-gray-300 rounded-full px-6 py-3.5 text-sm font-semibold shadow-sm hover:shadow-md hover:border-gray-400 transition-all duration-150 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>
            </div>

            {/* Right: Hero Illustration */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="w-full max-w-md aspect-square bg-gradient-to-br from-primary-soft via-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center p-8">
                <div className="space-y-3 w-full max-w-xs">
                  {/* Email card 1 */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 -rotate-1">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e3fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold mb-1">Client Meeting Follow-up</div>
                        <div className="text-[10px] text-muted">Please review the proposal and...</div>
                      </div>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
                    </svg>
                  </div>
                  {/* Task card */}
                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-primary/20 rotate-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded border-2 border-primary flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1e3fae" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold">Review client proposal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">High</span>
                      <span className="text-[10px] text-muted">Due: Tomorrow</span>
                    </div>
                  </div>
                  {/* Email card 2 */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 rotate-0.5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold mb-1">Q4 Report Ready</div>
                        <div className="text-[10px] text-muted">The quarterly report is attached...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="border-t border-gray-100 bg-[#f6f6f8]">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <h2 className="text-2xl font-bold text-center mb-3">How it works</h2>
          <p className="text-muted text-center mb-12 max-w-md mx-auto">Three simple steps to transform your inbox into an organized task list.</p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-primary/20 transition-all duration-150">
              <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-2">Connect Your Inbox</h3>
              <p className="text-sm text-muted leading-relaxed">Link your Gmail or Outlook account securely. We only read — never send or modify your emails.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-primary/20 transition-all duration-150">
              <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-2">AI Extracts Tasks</h3>
              <p className="text-sm text-muted leading-relaxed">Our AI reads your emails and identifies actionable items, deadlines, and priorities automatically.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-primary/20 transition-all duration-150">
              <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e3fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className="text-base font-bold mb-2">Get Organized</h3>
              <p className="text-sm text-muted leading-relaxed">Review, prioritize, and manage your tasks on a clean Kanban board. Attach notes and track progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-muted">&copy; 2026 Might as well. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
