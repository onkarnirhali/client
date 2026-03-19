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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const currentPath = location.pathname;

  const gmail = providers.find((p) => p.provider === 'gmail');
  const outlook = providers.find((p) => p.provider === 'outlook');
  const reconnectRequired = providers.filter(
    (p) => !p.linked && p.metadata?.reconnectRequired === true
  );
  const reconnectPrimary = reconnectRequired[0];

  const connectProvider = (provider: string) => {
    const base = API_BASE_URL || '';
    if (provider === 'outlook') window.location.href = `${base}/auth/outlook/start`;
    else if (provider === 'gmail') window.location.href = `${base}/auth/google`;
  };

  const navItems = [
    { label: 'Board', path: '/app', meta: '/app' },
    { label: 'Notes', path: '/app/notes', meta: 'library' },
    ...(isAdmin ? [{ label: 'Admin', path: '/admin', meta: 'access' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/app') return currentPath === '/app';
    return currentPath.startsWith(path);
  };

  return (
    <main className="relative z-[1] min-h-screen">
      <div className="w-[min(1480px,calc(100%-32px))] mx-auto py-6 pb-[104px] grid grid-cols-1 lg:grid-cols-[290px_minmax(0,1fr)] gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block sticky top-5 self-start">
          <div className="grid gap-[18px]">
            <div className="panel p-5">
              <div className="flex items-center gap-3.5">
                <span className="w-11 h-11 rounded-[16px] inline-flex items-center justify-center bg-linear-to-br from-primary to-primary-strong text-white text-xl font-extrabold">M</span>
                <div className="grid gap-0.5">
                  <span className="text-base font-extrabold">Might as well</span>
                  <span className="text-muted text-[13px]">Workspace</span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 mt-[18px] min-h-[42px] px-3.5 rounded-[16px] bg-white/75 border border-border text-muted text-[13px] font-bold">
                {user?.name || user?.email || 'User'}
              </div>
              <nav className="grid gap-2.5 mt-[18px]">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center justify-between gap-3 min-h-[48px] px-4 rounded-[18px] border border-transparent text-left font-bold transition-all cursor-pointer ${
                      isActive(item.path)
                        ? 'text-primary-strong bg-primary-soft border-primary/10'
                        : 'text-muted hover:bg-white/40'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-muted text-xs font-extrabold">{item.meta}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="panel p-5">
              <div className="grid gap-3">
                <span className="eyebrow"><span className="eyebrow-dot" />provider health</span>
                <div className="grid gap-3">
                  <div className="mini-card">
                    <strong>{gmail?.linked ? 'Gmail connected' : 'Gmail not connected'}</strong>
                    <span>{gmail?.linked && gmail?.ingestEnabled ? 'Ingestion active' : gmail?.linked ? 'Connected (ingest off)' : 'Not linked yet'}</span>
                  </div>
                  <div className="mini-card">
                    <strong>{outlook?.linked ? 'Outlook connected' : 'Outlook not connected'}</strong>
                    <span>{outlook?.linked && outlook?.ingestEnabled ? 'Ingestion active' : reconnectPrimary?.provider === 'outlook' ? 'Needs reconnection' : outlook?.linked ? 'Connected (ingest off)' : 'Not linked yet'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel p-5 grid gap-3">
              <button onClick={() => setIntegrationsOpen(true)} className="mini-card text-left hover:border-primary/20 transition-colors cursor-pointer">
                <strong>Manage Integrations</strong><span>Connect or disconnect providers</span>
              </button>
              <button onClick={() => setPrivacyOpen(true)} className="mini-card text-left hover:border-primary/20 transition-colors cursor-pointer">
                <strong>Privacy Controls</strong><span>Export data or manage account</span>
              </button>
              <button onClick={() => logout()} className="mini-card text-left hover:border-danger/20 transition-colors cursor-pointer">
                <strong className="text-danger">Logout</strong><span>Sign out of your account</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <section className="grid gap-6 content-start">
          <header className="panel px-[22px] py-[18px] flex items-center justify-between gap-[18px] flex-wrap">
            <div className="flex lg:hidden items-center gap-2.5">
              <span className="w-9 h-9 rounded-[14px] inline-flex items-center justify-center bg-linear-to-br from-primary to-primary-strong text-white text-sm font-extrabold">M</span>
              <span className="text-base font-extrabold">Might as well</span>
            </div>
            <div className="flex items-center gap-3.5 flex-wrap ml-auto">
              <span className="chip hidden sm:inline-flex">{user?.name || user?.email || 'User'}</span>
              <div className="relative lg:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="chip cursor-pointer hover:bg-white/90">Menu</button>
                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 panel p-2 z-50 grid gap-1">
                    <button onClick={() => { setIntegrationsOpen(true); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-[var(--radius-xs)] hover:bg-white/60 text-sm font-bold">Manage Integrations</button>
                    <button onClick={() => { setPrivacyOpen(true); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-[var(--radius-xs)] hover:bg-white/60 text-sm font-bold">Privacy Controls</button>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left px-3 py-2 rounded-[var(--radius-xs)] hover:bg-white/60 text-sm font-bold text-danger">Logout</button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {reconnectRequired.length > 0 && (
            <div className="banner">
              <div>
                <strong>Reconnect {reconnectPrimary?.displayName || reconnectPrimary?.provider || 'provider'}</strong>
                <p>{reconnectRequired.length === 1 ? `${reconnectPrimary?.displayName || 'Provider'} access expired. Reconnect to resume suggestions.` : 'Some providers need reconnection.'}</p>
              </div>
              <button
                onClick={() => reconnectRequired.length === 1 && reconnectPrimary ? connectProvider(reconnectPrimary.provider) : setIntegrationsOpen(true)}
                className="btn btn-secondary whitespace-nowrap"
              >
                {reconnectRequired.length === 1 ? `Reconnect ${reconnectPrimary?.displayName || ''}` : 'Manage Integrations'}
              </button>
            </div>
          )}

          <Outlet />
        </section>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed left-4 right-4 bottom-4 z-[12] flex lg:hidden items-center justify-between gap-2.5 p-2.5 bg-[rgba(255,253,249,0.92)] border border-border rounded-[22px] shadow-[0_22px_34px_rgba(24,23,20,0.12)] backdrop-blur-[16px]">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 min-h-[48px] rounded-[16px] inline-flex items-center justify-center text-[13px] font-extrabold cursor-pointer transition-colors ${
              isActive(item.path) ? 'bg-primary-soft text-primary-strong' : 'text-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <IntegrationsDialog open={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </main>
  );
}
