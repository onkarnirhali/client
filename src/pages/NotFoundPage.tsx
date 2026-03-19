import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen relative z-[1] grid place-items-center py-10">
      <section className="panel p-8 md:p-12 w-[min(680px,calc(100%-32px))] grid gap-6 text-center">
        <div className="flex items-center gap-3.5 justify-center">
          <span className="w-11 h-11 rounded-[16px] inline-flex items-center justify-center bg-linear-to-br from-primary to-primary-strong text-white text-xl font-extrabold">M</span>
          <div className="grid gap-0.5 text-left">
            <span className="text-base font-extrabold">Might as well</span>
            <span className="text-muted text-[13px]">Page not found</span>
          </div>
        </div>

        <span className="eyebrow mx-auto"><span className="eyebrow-dot" />not found</span>
        <div className="text-[6rem] md:text-[8rem] font-extrabold leading-none tracking-[-0.06em] text-primary/20">404</div>
        <div className="grid gap-3">
          <h1 className="title-md">This page slipped off the board.</h1>
          <p className="text-muted text-[15px] max-w-[560px] mx-auto">
            The page you are looking for doesn't exist. Head back to your board
            or notes to continue working.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-2">
          <article className="task-card cursor-pointer" onClick={() => navigate('/app')}>
            <div className="font-bold text-sm">Return to board</div>
            <p className="text-muted text-[13px] mt-1">Re-enter the main Kanban workspace.</p>
          </article>
          <article className="task-card cursor-pointer" onClick={() => navigate('/app/notes')}>
            <div className="font-bold text-sm">Review notes</div>
            <p className="text-muted text-[13px] mt-1">Jump back into active project context.</p>
          </article>
          <article className="task-card cursor-pointer" onClick={() => navigate('/login')}>
            <div className="font-bold text-sm">Sign in</div>
            <p className="text-muted text-[13px] mt-1">Return to the login page.</p>
          </article>
        </div>

        <div className="flex gap-3 justify-center mt-2">
          <button onClick={() => navigate('/app')} className="btn btn-primary">Go to /app</button>
          <button onClick={() => navigate('/login')} className="btn btn-secondary">Sign in</button>
        </div>
      </section>
    </main>
  );
}

