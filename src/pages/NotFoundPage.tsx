import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f6f6f8] min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        {/* Large 404 */}
        <h1 className="text-8xl lg:text-9xl font-extrabold text-primary mb-2 tracking-tight">404</h1>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e3fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              <path d="M11 8v4" /><circle cx="11" cy="15" r="0.5" fill="#1e3fae" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2">Page not found</h2>
        <p className="text-muted mb-8 max-w-sm mx-auto">
          The page you&#39;re looking for doesn&#39;t exist or has been moved.
        </p>

        <button
          onClick={() => navigate('/app')}
          className="inline-flex items-center gap-2 bg-primary text-white rounded-[10px] px-6 py-3 font-semibold text-sm hover:bg-primary-strong transition-colors duration-150 shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
