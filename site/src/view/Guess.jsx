import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar';
function Guess() {
    const [pokemonSorteado, setPokemonSorteado] = useState(null);
    const [tentativa, setTentativa] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tentativasRestantes, setTentativasRestantes] = useState(5);
    const [acertou, setAcertou] = useState(false);
    const [listaPokemon, setListaPokemon] = useState([]);
    const [sugestoes, setSugestoes] = useState([]);
    const [pokemonDetalhes, setPokemonDetalhes] = useState({});

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // 1. Quando o componente abre, buscamos um Pokémon aleatório (ex: ID entre 1 e 151)
    useEffect(() => {
        const idAleatorio = Math.floor(Math.random() * 1025) + 1;

        fetch(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}`)
            .then((resposta) => resposta.json())
            .then((dados) => {
                setPokemonSorteado(dados);
            })
            .catch((erro) => console.error("Erro ao buscar Pokémon:", erro));
    }, []);

    useEffect(() => {
        fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
            .then((resposta) => resposta.json())
            .then((dados) => {
                setListaPokemon(dados.results);
            })
            .catch((erro) => {
                console.error("Erro ao buscar lista de Pokémon:", erro);
            });
    }, []);

    const buscarDetalhes = async (pokemon) => {
        // Se já buscamos esse Pokémon, não faz outra requisição
        if (pokemonDetalhes[pokemon.name]) {
            return;
        }

        try {
            const resposta = await fetch(pokemon.url);
            const dados = await resposta.json();

            setPokemonDetalhes((anterior) => ({
                ...anterior,
                [pokemon.name]: dados
            }));
        } catch (erro) {
            console.error("Erro ao buscar detalhes:", erro);
        }
    };

    // 2. Função para verificar se o palpite está correto
    const verificarPalpite = (e) => {
        e.preventDefault();

        // Bloqueia palpites se o jogo já acabou (acertou ou Game Over)
        if (!pokemonSorteado || acertou) return;

        // Compara o que o aluno digitou com o nome do Pokémon da API (em letras minúsculas)
        if (tentativa.toLowerCase().trim() === pokemonSorteado.name.toLowerCase()) {
            setMensagem("🎉 Parabéns! Você acertou o Pokémon!");
            setAcertou(true);
        } else {
            setTentativasRestantes(tentativasRestantes - 1);
            setMensagem("❌ Errou! Tente novamente.");
            if (tentativasRestantes <= 1) {
                setMensagem(`Game Over! O Pokémon era: ${capitalize(pokemonSorteado.name)}`);
                setAcertou(true);
            }
        }
        setTentativa("");
        setSugestoes([]);
    };

    // Enquanto a API não respondeu, mostra um carregando
    if (!pokemonSorteado) {
        return <div className="p-6 text-center font-bold">Carregando o Pokémon do dia...</div>;
    }
    return (
        <div className='min-h-screen flex flex-col'>
            <Navbar></Navbar>
            <div className="bg-yellow-200">
                <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-2xl max-w-md mx-auto shadow-md mt-20 mb-39">
                    <h1 className="text-2xl font-bold mb-4">Adivinhe o Pokémon!</h1>

                    {/* Exibição da imagem misteriosa (silhueta ou oculta) */}
                    <img
                        src={pokemonSorteado.sprites.front_default}
                        alt="Pokémon misterioso"
                        className={`w-40 h-40 object-contain mb-4 filter ${acertou ? "" : "brightness-0"}`} // 'brightness-0' deixa a silhueta preta
                    />

                    <p className="text-sm text-gray-600 mb-2">Tentativas restantes: {tentativasRestantes}</p>

                    {/* Formulário de palpite */}
                    <form onSubmit={verificarPalpite} className="flex gap-2 w-full">

                        <div className="relative flex-1">

                            <input
                                type="text"
                                placeholder="Digite o nome do Pokémon..."
                                value={tentativa}
                                disabled={acertou}
                                onChange={(e) => {
                                    const valor = e.target.value.toLowerCase();

                                    setTentativa(valor);

                                    if (valor.length > 0) {
                                        const resultados = listaPokemon
                                            .filter((pokemon) =>
                                                pokemon.name.startsWith(valor)
                                            )
                                            .slice(0, 5);

                                        setSugestoes(resultados);

                                        resultados.forEach((pokemon) => {
                                            buscarDetalhes(pokemon);
                                        });
                                    } else {
                                        setSugestoes([]);
                                    }
                                }}
                                className="border border-gray-300 p-2 rounded-xl w-full outline-none disabled:bg-gray-200 disabled:cursor-not-allowed"
                            />

                            {!acertou && sugestoes.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-xl shadow-lg mt-1 z-10 overflow-hidden">

                                    {sugestoes.map((pokemon) => {
                                        const detalhes = pokemonDetalhes[pokemon.name];

                                        return (
                                            <button
                                                key={pokemon.name}
                                                type="button"
                                                onClick={() => {
                                                    setTentativa(pokemon.name);
                                                    setSugestoes([]);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-left"
                                            >

                                                {detalhes && (
                                                    <img
                                                        src={detalhes.sprites.front_default}
                                                        alt={pokemon.name}
                                                        className="w-12 h-12 object-contain"
                                                    />
                                                )}

                                                <div>
                                                    <p className="font-bold capitalize">
                                                        {pokemon.name}
                                                    </p>

                                                    {detalhes && (
                                                        <div className="flex gap-1">
                                                            {detalhes.types.map((tipo) => (
                                                                <span
                                                                    key={tipo.type.name}
                                                                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                                                                >
                                                                    {tipo.type.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                </div>

                                            </button>
                                        );
                                    })}

                                </div>
                            )}

                        </div>

                        <button
                            type="submit"
                            disabled={acertou}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Chutar
                        </button>

                    </form>


                    {/* Mensagem de feedback */}
                    {mensagem && <p className="mt-4 font-bold text-center text-lg">{mensagem}</p>}
                </div>
            </div>
            <footer className='bg-gray-900 text-white'>aa</footer>
        </div>
    )
}

export default Guess;