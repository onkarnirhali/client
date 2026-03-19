import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { useProviders } from '../../features/integrations/hooks';
import { useState } from 'react';
import { IntegrationsDialog } from '../integrations/IntegrationsDialog';
import { PrivacyDialog } from '../privacy/PrivacyDialog';
import { API_BASE_URL } from '../../app/config/env';

export function AppLayout() {
  const { user, logout } = useAuth();
  const { data: providers = [] } = useProviders();
  const location = useLocation();
  const navigate = useNavigate();
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const currentPath = location.pathname;
  const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';

  const reconnectRequired = providers.filter(
    (p) => !p.linked && p.metadata?.reconnectRequired === true
  );
  const reconnectPrimary = reconnectRequired[0];

  const gmail = providers.find((p) => p.provider === 'gmail');
  const outlook = providers.find((p) => p.provider === 'outlook');

  const connectProvider = (provider: string) => {
    const base = API_BASE_URL || '';
    if (provider === 'outlook') window.location.href = `${base}/auth/outlook/start`;
    else if (provider === 'gmail') window.location.href = `${base}/auth/google`;
  };

  const navItems = [
    { label: 'Todos', path: '/app' },
    { label: 'Notes', path: '/app/notes' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/app') return currentPath === '/app';
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      {/* ===== TopBar ===== */}
      <header className="bg-white border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/app')}>
            <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Might as well</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold">{user?.name || user?.email || 'User'}</div>
              <div className="text-xs text-muted">{user?.email}</div>
            </div>
            {/* Avatar with dropdown */}
            <div className="relative">
              <button
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-primary-strong transition-colors"
              >
                {initials}
              </button>

              {avatarMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAvatarMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl border border-gray-200/60 shadow-lg py-1.5 z-50">
                    {/* Gmail Status */}
                    <div
                      className={`mx-1.5 my-0.5 px-3 py-2.5 rounded-lg text-white text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                        gmail?.linked ? 'bg-green-800 hover:bg-green-900' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                      onClick={() => { setAvatarMenuOpen(false); gmail?.linked ? setIntegrationsOpen(true) : connectProvider('gmail'); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {gmail?.linked ? (
                          <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                        ) : (
                          <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>
                        )}
                      </svg>
                      <span>{gmail?.linked ? 'Gmail Connected' : 'Connect Gmail'}</span>
                      {gmail?.linked && <span className="text-xs opacity-70 ml-auto">Active</span>}
                    </div>
                    {/* Outlook Status */}
                    <div
                      className={`mx-1.5 my-0.5 px-3 py-2.5 rounded-lg text-white text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                        outlook?.linked ? 'bg-green-800 hover:bg-green-900' : 'bg-gray-700 hover:bg-gray-800'
                      }`}
                      onClick={() => { setAvatarMenuOpen(false); outlook?.linked ? setIntegrationsOpen(true) : connectProvider('outlook'); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {outlook?.linked ? (
                          <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                        ) : (
                          <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>
                        )}
                      </svg>
                      <span>{outlook?.linked ? 'Outlook Connected' : 'Connect Outlook'}</span>
                      {outlook?.linked && <span className="text-xs opacity-70 ml-auto">Active</span>}
                    </div>
                    <div className="border-t border-gray-100 my-1.5" />
                    <button onClick={() => { setAvatarMenuOpen(false); setIntegrationsOpen(true); }} className="w-full text-left mx-1.5 my-0.5 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors" style={{ width: 'calc(100% - 12px)' }}>
                      Manage Integrations
                    </button>
                    <button onClick={() => { setAvatarMenuOpen(false); setPrivacyOpen(true); }} className="w-full text-left mx-1.5 my-0.5 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors" style={{ width: 'calc(100% - 12px)' }}>
                      Privacy Controls
                    </button>
                    <div className="border-t border-gray-100 my-1.5" />
                    <button onClick={() => { setAvatarMenuOpen(false); logout(); }} className="w-full text-left mx-1.5 my-0.5 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-50 text-danger transition-colors" style={{ width: 'calc(100% - 12px)' }}>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden border-t border-gray-100 flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 text-center py-2.5 text-xs font-medium transition-colors ${
                isActive(item.path)
                  ? 'font-semibold text-primary border-b-2 border-primary'
                  : 'text-muted'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Reconnect Alert */}
        {reconnectRequired.length > 0 && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-sm text-amber-900">
                {reconnectPrimary?.displayName || reconnectPrimary?.provider || 'Provider'} access expired. Reconnect to resume email-based suggestions.
              </span>
            </div>
            <button
              onClick={() => reconnectRequired.length === 1 && reconnectPrimary ? connectProvider(reconnectPrimary.provider) : setIntegrationsOpen(true)}
              className="text-sm font-semibold text-amber-900 hover:underline whitespace-nowrap ml-4"
            >
              Reconnect {reconnectPrimary?.displayName || ''}
            </button>
          </div>
        )}
      </header>

      {/* ===== Main Content ===== */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      <IntegrationsDialog open={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}
