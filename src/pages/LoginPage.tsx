import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function LoginPage() {
  const { login, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="min-h-screen relative z-[1]">
      <div className="w-[min(1480px,calc(100%-32px))] mx-auto py-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero / left panel */}
        <section className="panel p-8 md:p-10 grid gap-6 content-start">
          <div className="flex items-center gap-3.5">
            <span className="w-11 h-11 rounded-[16px] inline-flex items-center justify-center bg-linear-to-br from-primary to-primary-strong text-white text-xl font-extrabold">M</span>
            <div className="grid gap-0.5">
              <span className="text-base font-extrabold">Might as well</span>
              <span className="text-muted text-[13px]">Inbox to action</span>
            </div>
          </div>

          <div className="grid gap-4 mt-2">
            <span className="eyebrow"><span className="eyebrow-dot" />inbox to action</span>
            <h1 className="title-xl">Turn email noise into a board you can actually use.</h1>
            <p className="text-muted text-[15px] max-w-[520px]">
              Might As Well uses AI to extract actionable to-dos from your inbox.
              Connect your provider, review suggestions, and work from a Kanban board
              with linked notes.
            </p>
          </div>

          <div className="grid gap-3 mt-2">
            <article className="mini-card">
              <span className="text-primary font-extrabold text-sm">01</span>
              <strong>Connect your provider</strong>
              <p>Start with Google and bring Outlook in when needed.</p>
            </article>
            <article className="mini-card">
              <span className="text-primary font-extrabold text-sm">02</span>
              <strong>Review extracted actions</strong>
              <p>AI suggestions surface deadlines, commitments, and follow-ups.</p>
            </article>
            <article className="mini-card">
              <span className="text-primary font-extrabold text-sm">03</span>
              <strong>Work from Kanban</strong>
              <p>Drag tasks across the board and attach notes when context matters.</p>
            </article>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge badge-primary">AI summaries</span>
            <span className="badge badge-accent">Protected notes</span>
            <span className="badge badge-info">Responsive shell</span>
          </div>
        </section>

        {/* Auth / right panel */}
        <section className="panel p-8 md:p-10 grid gap-6 content-start">
          <span className="eyebrow"><span className="eyebrow-dot" />sign in</span>
          <div className="grid gap-3 mt-1">
            <h2 className="title-md">Get started in seconds.</h2>
            <p className="text-muted text-[15px]">
              Sign in with your Google account to connect your inbox and start
              managing tasks with AI assistance.
            </p>
          </div>

          <div className="grid gap-4 mt-2">
            <article className="mini-card grid gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <strong>Continue with Google</strong>
                  <p>Primary login path and fastest onboarding</p>
                </div>
                <span className="badge badge-primary">Recommended</span>
              </div>
              <button onClick={login} className="btn btn-primary w-full">Sign in with Google</button>
            </article>

            <article className="mini-card grid gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <strong>Outlook later</strong>
                  <p>Connect once you are inside the workspace</p>
                </div>
                <span className="badge badge-accent">Optional</span>
              </div>
            </article>

            <article className="mini-card">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <strong>Privacy and control</strong>
                  <p>Read-only provider access, reconnect alerts, and protected notes stay visible in the UI.</p>
                </div>
                <span className="badge badge-info">UX note</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
