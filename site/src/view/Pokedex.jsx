import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import {
    TOTAL_POKEMON,
    GERACOES,
    geracaoDoId,
    spriteUrl,
    carregarDescobertos,
    limparDescobertos,
    resumoDescoberta,
} from '../utils/pokedexStorage';

const FILTROS = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'descobertos', rotulo: 'Descobertos' },
    { valor: 'faltando', rotulo: 'Faltando' },
];

const MODOS = {
    silhouette: 'Silhouette',
    termo: 'Termo',
    desconhecido: 'Não registrado',
};

const TIPO_CORES = {
    normal: 'bg-gray-400',
    fire: 'bg-orange-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-400',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-amber-600',
    flying: 'bg-sky-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-stone-500',
    ghost: 'bg-indigo-700',
    dragon: 'bg-violet-600',
    dark: 'bg-neutral-700',
    steel: 'bg-slate-400',
    fairy: 'bg-pink-400',
};

const numero = (id) => `#${String(id).padStart(4, '0')}`;
const idDaUrl = (url) => Number(url.split('/').filter(Boolean).pop());
const formatarData = (iso) =>
    new Date(iso).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });

// Guarda os detalhes já buscados, para não repetir a requisição ao reabrir o mesmo Pokémon
const cacheDetalhes = {};

// Carta de um Pokémon: colorida e clicável se foi descoberto, em preto e branco se não
function Carta({ pokemon, descoberto, aoClicar }) {
    const conteudo = (
        <>
            <span className="text-xs text-gray-500 self-start">{numero(pokemon.id)}</span>
            <img
                src={spriteUrl(pokemon.id)}
                alt={pokemon.name}
                loading="lazy"
                className={`w-20 h-20 object-contain ${descoberto ? '' : 'grayscale opacity-60'}`}
            />
            <span
                className={`text-sm font-bold capitalize text-center ${
                    descoberto ? '' : 'text-gray-500'
                }`}
            >
                {pokemon.name}
            </span>
        </>
    );

    if (descoberto) {
        return (
            <button
                type="button"
                onClick={() => aoClicar(descoberto)}
                className="rounded-xl p-2 flex flex-col items-center bg-white shadow-sm cursor-pointer transition hover:shadow-md hover:-translate-y-0.5"
            >
                {conteudo}
            </button>
        );
    }

    return <div className="rounded-xl p-2 flex flex-col items-center bg-gray-200">{conteudo}</div>;
}

function Info({ rotulo, children, className = '' }) {
    return (
        <div className={className}>
            <p className="text-xs uppercase tracking-wider text-gray-500">{rotulo}</p>
            <p className="font-bold">{children}</p>
        </div>
    );
}

// Pop-up com as informações de um Pokémon descoberto
function ModalPokemon({ registro, aoFechar }) {
    const [detalhes, setDetalhes] = useState(cacheDetalhes[registro.id] || null);
    const [erro, setErro] = useState(false);

    const resumo = resumoDescoberta(registro);
    const geracao = geracaoDoId(registro.id);

    // Busca os dados do Pokémon na PokéAPI
    useEffect(() => {
        if (cacheDetalhes[registro.id]) return;

        let cancelado = false;
        fetch(`https://pokeapi.co/api/v2/pokemon/${registro.id}`)
            .then((resposta) => resposta.json())
            .then((dados) => {
                cacheDetalhes[registro.id] = dados;
                if (!cancelado) setDetalhes(dados);
            })
            .catch((e) => {
                console.error("Erro ao buscar detalhes:", e);
                if (!cancelado) setErro(true);
            });

        return () => {
            cancelado = true;
        };
    }, [registro.id]);

    // Fecha com a tecla Esc
    useEffect(() => {
        const aoApertar = (e) => {
            if (e.key === 'Escape') aoFechar();
        };
        document.addEventListener('keydown', aoApertar);
        return () => document.removeEventListener('keydown', aoApertar);
    }, [aoFechar]);

    const imagem =
        detalhes?.sprites?.other?.['official-artwork']?.front_default || spriteUrl(registro.id);

    const porModo = Object.entries(resumo.contagem)
        .map(([modo, vezes]) => `${MODOS[modo] ?? modo}: ${vezes}x`)
        .join(' · ');

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={aoFechar}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Informações de ${registro.name}`}
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={aoFechar}
                    aria-label="Fechar"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 text-xl leading-none"
                >
                    ×
                </button>

                {/* Cabeçalho */}
                <div className="flex flex-col items-center">
                    <img src={imagem} alt={registro.name} className="w-40 h-40 object-contain" />
                    <h2 className="text-2xl font-bold capitalize">{registro.name}</h2>
                    <p className="text-sm text-gray-500 mb-2">{numero(registro.id)}</p>

                    <div className="flex gap-2 min-h-7">
                        {detalhes?.types.map((t) => (
                            <span
                                key={t.type.name}
                                className={`${TIPO_CORES[t.type.name] ?? 'bg-gray-400'} text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full`}
                            >
                                {t.type.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Sobre o Pokémon */}
                <h3 className="text-sm font-bold text-gray-600 mt-5 mb-2 border-b border-gray-200 pb-1">
                    Sobre o Pokémon
                </h3>
                {erro ? (
                    <p className="text-sm text-gray-600">Não foi possível carregar os detalhes.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Info rotulo="Geração">{geracao}</Info>
                        <Info rotulo="Altura">
                            {detalhes ? `${(detalhes.height / 10).toFixed(1)} m` : '...'}
                        </Info>
                        <Info rotulo="Peso">
                            {detalhes ? `${(detalhes.weight / 10).toFixed(1)} kg` : '...'}
                        </Info>
                        <Info rotulo="Habilidades" className="col-span-2">
                            <span className="capitalize">
                                {detalhes
                                    ? detalhes.abilities.map((a) => a.ability.name.replace('-', ' ')).join(', ')
                                    : '...'}
                            </span>
                        </Info>
                    </div>
                )}

                {/* Sua descoberta */}
                <h3 className="text-sm font-bold text-gray-600 mt-5 mb-2 border-b border-gray-200 pb-1">
                    Sua descoberta
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <Info rotulo="Descoberto em" className="col-span-2">
                        {formatarData(resumo.primeiraData)}
                    </Info>
                    <Info rotulo="Primeiro modo">{MODOS[resumo.primeiroModo] ?? resumo.primeiroModo}</Info>
                    <Info rotulo="Vezes descoberto">{resumo.vezes}x</Info>
                    {resumo.vezes > 1 && (
                        <>
                            <Info rotulo="Última vez" className="col-span-2">
                                {formatarData(resumo.ultimaData)}
                            </Info>
                            <Info rotulo="Por modo" className="col-span-2">{porModo}</Info>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Pokedex() {
    // Lê os descobertos salvos no navegador assim que a página abre
    const [descobertos, setDescobertos] = useState(carregarDescobertos);
    const [lista, setLista] = useState([]);
    const [erro, setErro] = useState(false);
    const [filtro, setFiltro] = useState('todos');
    const [busca, setBusca] = useState('');
    const [selecionado, setSelecionado] = useState(null);

    // Lista com o nome de todos os Pokémon
    useEffect(() => {
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`)
            .then((resposta) => resposta.json())
            .then((dados) => {
                setLista(
                    dados.results.map((p) => ({ id: idDaUrl(p.url), name: p.name }))
                );
            })
            .catch((e) => {
                console.error("Erro ao buscar lista de Pokémon:", e);
                setErro(true);
            });
    }, []);

    const mapaDescobertos = useMemo(() => {
        const mapa = {};
        descobertos.forEach((p) => {
            mapa[p.id] = p;
        });
        return mapa;
    }, [descobertos]);

    const descobertosPorGeracao = useMemo(() => {
        const contagem = {};
        descobertos.forEach((p) => {
            const g = geracaoDoId(p.id);
            contagem[g] = (contagem[g] || 0) + 1;
        });
        return contagem;
    }, [descobertos]);

    const porcentagem = Math.round((descobertos.length / TOTAL_POKEMON) * 100);

    // Pokémon visíveis (filtro + busca), já separados por geração
    const grupos = useMemo(() => {
        const texto = busca.trim().toLowerCase().replace('#', '');

        const visiveis = lista.filter((pokemon) => {
            const descoberto = mapaDescobertos[pokemon.id];

            if (filtro === 'descobertos' && !descoberto) return false;
            if (filtro === 'faltando' && descoberto) return false;

            if (texto) {
                const achouNome = pokemon.name.includes(texto);
                const achouNumero = String(pokemon.id) === texto;
                if (!achouNome && !achouNumero) return false;
            }

            return true;
        });

        return GERACOES.map((g) => ({
            ...g,
            pokemons: visiveis.filter((p) => geracaoDoId(p.id) === g.numero),
        })).filter((g) => g.pokemons.length > 0);
    }, [lista, mapaDescobertos, filtro, busca]);

    const limpar = () => {
        if (window.confirm('Tem certeza que deseja apagar todos os Pokémon descobertos?')) {
            limparDescobertos();
            setDescobertos([]);
            setSelecionado(null);
        }
    };

    return (
        <div className="p-6 bg-gray-100 rounded-2xl max-w-5xl mx-auto shadow-md mt-10 mb-10">
            <h1 className="text-2xl font-bold text-center mb-1">Pokédex</h1>
            <p className="text-sm text-gray-600 text-center mb-4">
                Os Pokémon que você descobriu acertando nos jogos aparecem coloridos. Clique em um deles para ver os detalhes.
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

            {/* Grade de cartas, separada por geração */}
            {erro ? (
                <p className="text-center text-gray-600">
                    Não foi possível carregar a lista de Pokémon. Recarregue a página.
                </p>
            ) : lista.length === 0 ? (
                <p className="text-center text-gray-600">Carregando Pokédex...</p>
            ) : grupos.length > 0 ? (
                grupos.map((grupo) => (
                    <section key={grupo.numero} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-3 mb-3">
                            <h2 className="text-sm font-bold text-gray-600 whitespace-nowrap">
                                Geração {grupo.numero}
                            </h2>
                            <div className="flex-1 h-px bg-gray-300" />
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                {descobertosPorGeracao[grupo.numero] || 0} / {grupo.fim - grupo.inicio + 1}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {grupo.pokemons.map((pokemon) => (
                                <Carta
                                    key={pokemon.id}
                                    pokemon={pokemon}
                                    descoberto={mapaDescobertos[pokemon.id]}
                                    aoClicar={setSelecionado}
                                />
                            ))}
                        </div>
                    </section>
                ))
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

            {selecionado && (
                <ModalPokemon registro={selecionado} aoFechar={() => setSelecionado(null)} />
            )}
        </div>
    );
}

export default Pokedex;