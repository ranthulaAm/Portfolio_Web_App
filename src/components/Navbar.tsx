import { Link, useLocation } from 'react-router-dom';
import { usePortfolioData } from '../hooks/usePortfolioData';

export default function Navbar() {
  const location = useLocation();
  const { data } = usePortfolioData();
  const isAdmin = location.pathname === '/admin';
  
  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b ${isAdmin ? 'bg-white/80 border-gray-200' : 'bg-[rgba(var(--primary-rgb),0.4)] border-white/10'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className={`flex items-center gap-2 text-2xl font-black tracking-tighter uppercase shrink-0 ${isAdmin ? 'text-gray-900' : 'text-white'}`}>
            {data.logoType === 'image' && data.logoImageUrl ? (
              <img src={data.logoImageUrl} alt="Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" fetchPriority="high" />
            ) : (
              <>{data.logoText}<span className="text-[var(--secondary)]">.</span></>
            )}
          </Link>
          <div className="flex space-x-8 shrink-0 ml-4">
            <Link 
              to="/" 
              className={`font-medium transition-colors hover:text-[var(--secondary)] ${location.pathname === '/' ? 'text-[var(--secondary)] drop-shadow-[0_0_8px_rgba(var(--secondary-rgb),0.5)]' : (isAdmin ? 'text-gray-500' : 'text-gray-400')}`}
            >
              Portfolio
            </Link>
            <Link 
              to="/admin" 
              className={`font-medium transition-colors hover:text-[var(--secondary)] ${location.pathname === '/admin' ? 'text-[var(--secondary)] drop-shadow-[0_0_8px_rgba(var(--secondary-rgb),0.5)]' : (isAdmin ? 'text-gray-500' : 'text-gray-400')}`}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
