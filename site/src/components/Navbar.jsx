import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'

function Navbar() {
    const { pathname } = useLocation();
    const [aberto, setAberto] = useState(false);
    const menuRef = useRef(null);

    const linkClass = 'no-underline text-xl text-gray-300 transition duration-250 hover:text-gray-50';
    const noGuess = pathname === '/' || pathname === '/termo';

    // Fecha o menu ao trocar de página
    useEffect(() => {
        setAberto(false);
    }, [pathname]);

    // Fecha o menu ao clicar fora dele
    useEffect(() => {
        const aoClicarFora = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setAberto(false);
            }
        };
        document.addEventListener('mousedown', aoClicarFora);
        return () => document.removeEventListener('mousedown', aoClicarFora);
    }, []);

    return (
        <div className="bg-gray-900 flex justify-between h-10 items-center px-6">
            <div className='flex gap-10 items-center'>

                {/* Dropdown fixo em "Guess" */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setAberto(!aberto)}
                        aria-haspopup="true"
                        aria-expanded={aberto}
                        className={`${linkClass} flex items-center gap-2 cursor-pointer ${noGuess ? 'text-gray-50' : ''}`}
                    >
                        Guess
                        {/* Seta: aponta pra cima fechado, gira pra baixo quando aberto */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className={`w-4 h-4 transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}
                        >
                            <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.83l-3.71 3.94a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {aberto && (
                        <div className="absolute top-full left-0 mt-1 min-w-full whitespace-nowrap bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden flex flex-col">
                            <Link
                                to="/"
                                className={`${linkClass} px-4 py-2 hover:bg-gray-800 ${pathname === '/' ? 'text-gray-50' : ''}`}
                            >
                                Silhouette
                            </Link>
                            <Link
                                to="/termo"
                                className={`${linkClass} px-4 py-2 hover:bg-gray-800 ${pathname === '/termo' ? 'text-gray-50' : ''}`}
                            >
                                Termo
                            </Link>
                        </div>
                    )}
                </div>

                <Link className={linkClass} to='/pokedex'>Pokédex</Link>
            </div>

            <div>
                <Link className="flex flex-item h-10 text-white px-6 items-center bg-gray-900 justify-end" to='/perfil'>Meu Perfil</Link>
            </div>
        </div>
    )
}

export default Navbar;