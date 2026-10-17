import { Link } from 'react-router'

function Footer() {
    const linkClass = 'no-underline text-gray-400 transition duration-250 hover:text-gray-50';

    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="max-w-5xl mx-auto px-6 py-10 grid gap-8 sm:grid-cols-3">

                {/* Marca */}
                <div>
                    <h2 className="text-xl font-bold text-gray-50 mb-2">Pokémon Guess</h2>
                    <p className="text-sm text-gray-400">
                        Descubra o Pokémon pela silhueta e teste o quanto você conhece
                        cada um dos 1025 Pokémon.
                    </p>
                </div>

                {/* Navegação */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-50 mb-3">Navegação</h3>
                    <ul className="flex flex-col gap-2 text-sm">
                        <li><Link className={linkClass} to="/">Silhouette</Link></li>
                        <li><Link className={linkClass} to="/termo">Termo</Link></li>
                        <li><Link className={linkClass} to="/pokedex">Pokédex</Link></li>
                        <li><Link className={linkClass} to="/perfil">Meu Perfil</Link></li>
                    </ul>
                </div>

                {/* Créditos */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-50 mb-3">Créditos</h3>
                    <p className="text-sm text-gray-400">
                        Dados e imagens fornecidos pela{' '}
                        <a
                            className="text-yellow-300 hover:text-yellow-200 underline"
                            href="https://pokeapi.co"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            PokéAPI
                        </a>.
                    </p>
                </div>
            </div>

            {/* Linha final */}
            <div className="border-t border-gray-700">
                <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} Pokémon Guess. Projeto de fã sem fins lucrativos.</p>
                    <p>Pokémon e seus personagens são marcas de Nintendo, Game Freak e Creatures Inc.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;