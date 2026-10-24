import { useState, useEffect } from 'react'
import { registrarDescoberta } from '../utils/pokedexStorage';

const MAX_TENTATIVAS = 8;
const TOTAL_POKEMON = 1025;

const CORES = {
    certo: 'bg-green-500',
    parcial: 'bg-yellow-500',
    errado: 'bg-red-500',
};

// Data de hoje no fuso do usuário (ex: "2026-10-17")
const dataHoje = () => new Date().toLocaleDateString('en-CA');

// Transforma a data em um número fixo (FNV-1a), então o mesmo dia sempre dá o mesmo Pokémon
const idDoDia = (dia) => {
    let h = 2166136261;
    for (let i = 0; i < dia.length; i++) {
        h ^= dia.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % TOTAL_POKEMON) + 1;
};

const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const idDaUrl = (url) => url.split('/').filter(Boolean).pop();

// Conta quantos Pokémon existem na árvore de evolução
const contarNos = (no) => 1 + no.evolves_to.reduce((soma, filho) => soma + contarNos(filho), 0);

// Busca um JSON e falha com uma mensagem clara se a resposta não for válida
const buscarJson = async (url) => {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status} ao buscar ${url}`);
    return resposta.json();
};

// Tenta de novo algumas vezes se a requisição falhar (a PokéAPI às vezes oscila)
const comTentativas = async (funcao, vezes = 3) => {
    for (let i = 0; i < vezes; i++) {
        try {
            return await funcao();
        } catch (erro) {
            if (i === vezes - 1) throw erro;
            await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
        }
    }
};

// Pokémon do dia já buscado fica guardado no navegador, então reabrir a página não depende da API
const lerAlvoSalvo = (chave) => {
    try {
        const salvo = localStorage.getItem(chave);
        return salvo ? JSON.parse(salvo) : null;
    } catch {
        return null;
    }
};

// Busca tudo que o jogo precisa sobre um Pokémon
const buscarInfoUnica = async (nomeOuId) => {
    const pokemon = await buscarJson(`https://pokeapi.co/api/v2/pokemon/${nomeOuId}`);
    const species = await buscarJson(pokemon.species.url);
    const cadeia = await buscarJson(species.evolution_chain.url);

    return {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites.front_default,
        geracao: Number(idDaUrl(species.generation.url)),
        tipos: pokemon.types.map((t) => t.type.name),
        altura: pokemon.height, // decímetros
        peso: pokemon.weight,   // hectogramas
        // Total de evoluções da família inteira (ex: Charmander, Charmeleon, Charizard = 2)
        evolucoes: contarNos(cadeia.chain) - 1,
    };
};

const buscarInfo = (nomeOuId) => comTentativas(() => buscarInfoUnica(nomeOuId));

function Celula({ cor, children }) {
    return (
        <div className={`${CORES[cor]} flex flex-col items-center justify-center text-white font-bold text-sm rounded-lg p-2 min-h-16 text-center`}>
            {children}
        </div>
    );
}

// Célula de número: mostra o valor chutado e uma seta indicando para onde o Pokémon do dia está
function CelulaNumero({ chute, alvo, formatar = (v) => v }) {
    const igual = chute === alvo;
    return (
        <Celula cor={igual ? 'certo' : 'errado'}>
            <span>{formatar(chute)}</span>
            {!igual && (
                <span title={alvo > chute ? 'O Pokémon do dia é maior' : 'O Pokémon do dia é menor'}>
                    {alvo > chute ? '▲' : '▼'}
                </span>
            )}
        </Celula>
    );
}

function LinhaPalpite({ palpite, alvo }) {
    const tiposIguais =
        palpite.tipos.length === alvo.tipos.length &&
        palpite.tipos.every((t) => alvo.tipos.includes(t));
    const algumTipo = palpite.tipos.some((t) => alvo.tipos.includes(t));
    const corTipo = tiposIguais ? 'certo' : algumTipo ? 'parcial' : 'errado';

    return (
        <div className="grid grid-cols-6 gap-2 min-w-[36rem]">
            <div className="flex flex-col items-center justify-center bg-white rounded-lg p-2 min-h-16 shadow-sm">
                <img src={palpite.sprite} alt={palpite.name} className="w-12 h-12 object-contain" />
                <span className="text-xs font-bold capitalize text-center">{palpite.name}</span>
            </div>

            <CelulaNumero
                chute={palpite.geracao}
                alvo={alvo.geracao}
                formatar={(v) => `Gen ${v}`}
            />

            <Celula cor={corTipo}>
                {palpite.tipos.map((tipo) => (
                    <span key={tipo} className="capitalize">{tipo}</span>
                ))}
            </Celula>

            <CelulaNumero
                chute={palpite.altura}
                alvo={alvo.altura}
                formatar={(v) => `${(v / 10).toFixed(1)} m`}
            />

            <CelulaNumero
                chute={palpite.peso}
                alvo={alvo.peso}
                formatar={(v) => `${(v / 10).toFixed(1)} kg`}
            />

            <CelulaNumero chute={palpite.evolucoes} alvo={alvo.evolucoes} />
        </div>
    );
}

function GuessTermo() {
    const [dia] = useState(dataHoje);
    const chaveSalva = `termo-pokemon-${dia}`;

    const [alvo, setAlvo] = useState(() => lerAlvoSalvo(`termo-alvo-${dataHoje()}`));
    const [erroCarga, setErroCarga] = useState(false);
    const [tentativaCarga, setTentativaCarga] = useState(0);
    const [listaPokemon, setListaPokemon] = useState([]);
    const [tentativa, setTentativa] = useState("");
    const [sugestoes, setSugestoes] = useState([]);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    // Recupera os palpites de hoje, se o jogador já tinha jogado
    const [palpites, setPalpites] = useState(() => {
        try {
            const salvo = localStorage.getItem(`termo-pokemon-${dataHoje()}`);
            return salvo ? JSON.parse(salvo) : [];
        } catch {
            return [];
        }
    });

    // Salva os palpites a cada mudança
    useEffect(() => {
        try {
            localStorage.setItem(chaveSalva, JSON.stringify(palpites));
        } catch {
            // sem localStorage, o jogo continua funcionando
        }
    }, [palpites, chaveSalva]);

    // Pokémon do dia (só busca na API se ainda não estiver salvo)
    useEffect(() => {
        if (alvo) return;

        let cancelado = false;
        buscarInfo(idDoDia(dia))
            .then((info) => {
                if (cancelado) return;
                setAlvo(info);
                try {
                    localStorage.setItem(`termo-alvo-${dia}`, JSON.stringify(info));
                } catch {
                    // sem localStorage, o jogo continua funcionando
                }
            })
            .catch((erro) => {
                console.error("Erro ao buscar o Pokémon do dia:", erro);
                if (!cancelado) setErroCarga(true);
            });
        return () => {
            cancelado = true;
        };
    }, [dia, alvo, tentativaCarga]);

    // Lista de nomes para o autocomplete
    useEffect(() => {
        comTentativas(() => buscarJson(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`))
            .then((dados) => setListaPokemon(dados.results))
            .catch((erro) => console.error("Erro ao buscar lista de Pokémon:", erro));
    }, []);

    const venceu = alvo ? palpites.some((p) => p.name === alvo.name) : false;
    const perdeu = !venceu && palpites.length >= MAX_TENTATIVAS;
    const fim = venceu || perdeu;

    const aoDigitar = (e) => {
        const valor = e.target.value.toLowerCase();
        setTentativa(valor);
        setMensagem("");

        if (valor.length > 0) {
            const jaChutados = palpites.map((p) => p.name);
            const resultados = listaPokemon
                .filter((p) => p.name.startsWith(valor) && !jaChutados.includes(p.name))
                .slice(0, 5);
            setSugestoes(resultados);
        } else {
            setSugestoes([]);
        }
    };

    const chutar = async (e) => {
        e.preventDefault();
        if (fim || carregando || !alvo) return;

        const nome = tentativa.trim().toLowerCase();

        if (!listaPokemon.some((p) => p.name === nome)) {
            setMensagem("Pokémon não encontrado. Escolha um da lista de sugestões.");
            return;
        }
        if (palpites.some((p) => p.name === nome)) {
            setMensagem("Você já chutou esse Pokémon.");
            return;
        }

        setCarregando(true);
        try {
            const info = await buscarInfo(nome);

            // Acertou: registra na Pokédex
            if (info.name === alvo.name) {
                registrarDescoberta({ id: info.id, name: info.name, modo: 'termo' });
            }

            setPalpites((anterior) => [...anterior, info]);
            setMensagem("");
        } catch (erro) {
            console.error("Erro ao buscar o palpite:", erro);
            setMensagem("Erro ao buscar o Pokémon. Tente de novo.");
        } finally {
            setCarregando(false);
            setTentativa("");
            setSugestoes([]);
        }
    };

    if (erroCarga) {
        return (
            <div className="p-6 text-center">
                <p className="font-bold mb-3">Não foi possível carregar o Pokémon do dia.</p>
                <button
                    type="button"
                    onClick={() => {
                        setErroCarga(false);
                        setTentativaCarga((n) => n + 1);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold"
                >
                    Tentar de novo
                </button>
            </div>
        );
    }

    if (!alvo) {
        return <div className="p-6 text-center font-bold">Carregando o Pokémon do dia...</div>;
    }

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 rounded-2xl max-w-3xl mx-auto shadow-md mt-10 mb-10">
            <h1 className="text-2xl font-bold mb-1">Termo Pokémon</h1>
            <p className="text-sm text-gray-600 mb-4 text-center">
                Descubra o Pokémon do dia! Cada palpite mostra pistas sobre geração, tipo, altura, peso e evoluções.
            </p>

            <p className="text-sm text-gray-600 mb-2">
                Tentativa {Math.min(palpites.length + (fim ? 0 : 1), MAX_TENTATIVAS)} de {MAX_TENTATIVAS}
            </p>

            {/* Formulário de palpite */}
            <form onSubmit={chutar} className="flex gap-2 w-full max-w-md">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Digite o nome do Pokémon..."
                        value={tentativa}
                        disabled={fim}
                        onChange={aoDigitar}
                        className="border border-gray-300 p-2 rounded-xl w-full outline-none bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
                    />

                    {!fim && sugestoes.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-xl shadow-lg mt-1 z-10 overflow-hidden">
                            {sugestoes.map((pokemon) => (
                                <button
                                    key={pokemon.name}
                                    type="button"
                                    onClick={() => {
                                        setTentativa(pokemon.name);
                                        setSugestoes([]);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left"
                                >
                                    <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idDaUrl(pokemon.url)}.png`}
                                        alt={pokemon.name}
                                        className="w-10 h-10 object-contain"
                                    />
                                    <p className="font-bold capitalize">{pokemon.name}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={fim || carregando}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {carregando ? '...' : 'Chutar'}
                </button>
            </form>

            {mensagem && <p className="mt-3 text-sm font-bold text-red-600 text-center">{mensagem}</p>}

            {/* Resultado final */}
            {fim && (
                <div className="mt-4 flex flex-col items-center">
                    <img src={alvo.sprite} alt={alvo.name} className="w-28 h-28 object-contain" />
                    <p className="font-bold text-center text-lg">
                        {venceu
                            ? `🎉 Você acertou em ${palpites.length} ${palpites.length === 1 ? 'tentativa' : 'tentativas'}! Era ${capitalize(alvo.name)}.`
                            : `Fim de jogo! O Pokémon do dia era ${capitalize(alvo.name)}.`}
                    </p>
                    <p className="text-sm text-gray-600">Volte amanhã para um novo Pokémon.</p>
                    {venceu && <p className="text-sm text-gray-600">Registrado na sua Pokédex.</p>}
                </div>
            )}

            {/* Tabela de palpites */}
            {palpites.length > 0 && (
                <div className="w-full mt-6 overflow-x-auto">
                    <div className="grid grid-cols-6 gap-2 mb-2 min-w-[36rem] text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                        <span>Pokémon</span>
                        <span>Geração</span>
                        <span>Tipo</span>
                        <span>Altura</span>
                        <span>Peso</span>
                        <span>Evoluções</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {[...palpites].reverse().map((palpite) => (
                            <LinhaPalpite key={palpite.name} palpite={palpite} alvo={alvo} />
                        ))}
                    </div>
                </div>
            )}

            {/* Legenda */}
            <div className="mt-6 text-xs text-gray-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
                <span><span className="inline-block w-3 h-3 rounded bg-green-500 align-middle"></span> Igual</span>
                <span><span className="inline-block w-3 h-3 rounded bg-yellow-500 align-middle"></span> Parcial (só em tipos)</span>
                <span><span className="inline-block w-3 h-3 rounded bg-red-500 align-middle"></span> Diferente</span>
                <span>▲ o do dia é maior</span>
                <span>▼ o do dia é menor</span>
            </div>
        </div>
    );
}

export default GuessTermo;