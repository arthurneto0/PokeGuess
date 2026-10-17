import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import {
    TOTAL_POKEMON,
    spriteUrl,
    carregarDescobertos,
    limparDescobertos,
} from '../utils/pokedexStorage';

const FILTROS = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'descobertos', rotulo: 'Descobertos' },
    { valor: 'faltando', rotulo: 'Faltando' },
];

const numero = (id) => `#${String(id).padStart(4, '0')}`;

function CartaDescoberto({ pokemon }) {
    const data = pokemon.data ? new Date(pokemon.data).toLocaleDateString('pt-BR') : '';

    return (
        <div
            className="bg-white rounded-xl shadow-sm p-2 flex flex-col items-center"
            title={data ? `Descoberto em ${data}` : undefined}
        >
            <span className="text-xs text-gray-500 self-start">{numero(pokemon.id)}</span>
            <img
                src={spriteUrl(pokemon.id)}
                alt={pokemon.name}
                loading="lazy"
                className="w-20 h-20 object-contain"
            />
            <span className="text-sm font-bold capitalize text-center">{pokemon.name}</span>
        </div>
    );
}

function CartaBloqueada({ id }) {
    return (
        <div className="bg-gray-200 rounded-xl p-2 flex flex-col items-center">
            <span className="text-xs text-gray-500 self-start">{numero(id)}</span>
            <div className="w-20 h-20 flex items-center justify-center text-4xl font-bold text-gray-400">
                ?
            </div>
            <span className="text-sm font-bold text-gray-400">???</span>
        </div>
    );
}

function Pokedex() {
    // Lê os descobertos salvos no navegador assim que a página abre
    const [descobertos, setDescobertos] = useState(carregarDescobertos);
    const [filtro, setFiltro] = useState('todos');
    const [busca, setBusca] = useState('');

    const mapaDescobertos = useMemo(() => {
        const mapa = {};
        descobertos.forEach((p) => {
            mapa[p.id] = p;
        });
        return mapa;
    }, [descobertos]);

    const porcentagem = Math.round((descobertos.length / TOTAL_POKEMON) * 100);

    // Lista de ids visíveis, de acordo com o filtro e a busca
    const idsVisiveis = useMemo(() => {
        const texto = busca.trim().toLowerCase().replace('#', '');
        const ids = [];

        for (let id = 1; id <= TOTAL_POKEMON; id++) {
            const pokemon = mapaDescobertos[id];

            if (filtro === 'descobertos' && !pokemon) continue;
            if (filtro === 'faltando' && pokemon) continue;

            if (texto) {
                const achouNome = pokemon && pokemon.name.includes(texto);
                const achouNumero = String(id) === texto;
                if (!achouNome && !achouNumero) continue;
            }

            ids.push(id);
        }
        return ids;
    }, [mapaDescobertos, filtro, busca]);

    const limpar = () => {
        if (window.confirm('Tem certeza que deseja apagar todos os Pokémon descobertos?')) {
            limparDescobertos();
            setDescobertos([]);
        }
    };

    return (
        <div className="p-6 bg-gray-100 rounded-2xl max-w-5xl mx-auto shadow-md mt-10 mb-10">
            <h1 className="text-2xl font-bold text-center mb-1">Pokédex</h1>
            <p className="text-sm text-gray-600 text-center mb-4">
                Os Pokémon que você descobriu acertando nos jogos.
            </p>

            {/* Progresso */}
            <div className="max-w-md mx-auto mb-6">
                <div className="flex justify-between text-sm font-bold mb-1">
                    <span>{descobertos.length} / {TOTAL_POKEMON} descobertos</span>
                    <span>{porcentagem}%</span>
                </div>
                <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${porcentagem}%` }}
                    />
                </div>
            </div>

            {descobertos.length === 0 && (
                <p className="text-center text-gray-600 mb-6">
                    Você ainda não descobriu nenhum Pokémon. Jogue qualquer modo (
                    <Link to="/" className="text-blue-600 font-bold underline">
                        Silhouette
                    </Link>{' '}
                    ou{' '}
                    <Link to="/termo" className="text-blue-600 font-bold underline">
                        Termo
                    </Link>
                    ) e acerte um para registrá-lo aqui.
                </p>
            )}

            {/* Filtros e busca */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between mb-6">
                <div className="flex gap-2">
                    {FILTROS.map((f) => (
                        <button
                            key={f.valor}
                            type="button"
                            onClick={() => setFiltro(f.valor)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm ${
                                filtro === f.valor
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {f.rotulo}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="Buscar por nome ou número..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="border border-gray-300 p-2 rounded-xl outline-none bg-white sm:w-64"
                />
            </div>

            {/* Grade de cartas */}
            {idsVisiveis.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {idsVisiveis.map((id) =>
                        mapaDescobertos[id] ? (
                            <CartaDescoberto key={id} pokemon={mapaDescobertos[id]} />
                        ) : (
                            <CartaBloqueada key={id} id={id} />
                        )
                    )}
                </div>
            ) : (
                <p className="text-center text-gray-600">Nenhum Pokémon encontrado.</p>
            )}

            {descobertos.length > 0 && (
                <div className="text-center mt-8">
                    <button
                        type="button"
                        onClick={limpar}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Limpar Pokédex
                    </button>
                </div>
            )}
        </div>
    );
}

export default Pokedex;