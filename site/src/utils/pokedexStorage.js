// Persistência da Pokédex no navegador (localStorage). Não precisa de banco de dados.
//
// Cada Pokémon descoberto é salvo assim:
// {
//   id, name,
//   data,          // primeira vez que foi descoberto (ISO)
//   ultimaData,    // última vez que foi descoberto (ISO)
//   primeiroModo,  // 'silhouette' | 'termo'
//   contagem,      // { silhouette: 2, termo: 1 }
// }

const CHAVE = 'pokedex-descobertos';

export const TOTAL_POKEMON = 1025;

// Faixa de ids de cada geração
export const GERACOES = [
    { numero: 1, inicio: 1, fim: 151 },
    { numero: 2, inicio: 152, fim: 251 },
    { numero: 3, inicio: 252, fim: 386 },
    { numero: 4, inicio: 387, fim: 493 },
    { numero: 5, inicio: 494, fim: 649 },
    { numero: 6, inicio: 650, fim: 721 },
    { numero: 7, inicio: 722, fim: 809 },
    { numero: 8, inicio: 810, fim: 905 },
    { numero: 9, inicio: 906, fim: 1025 },
];

export const geracaoDoId = (id) =>
    GERACOES.find((g) => id >= g.inicio && id <= g.fim)?.numero ?? null;

export const spriteUrl = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// Retorna a lista de Pokémon descobertos
export function carregarDescobertos() {
    try {
        const salvo = localStorage.getItem(CHAVE);
        return salvo ? JSON.parse(salvo) : [];
    } catch {
        return [];
    }
}

// Registra uma descoberta. `modo` é 'silhouette' ou 'termo'.
// Retorna true se o Pokémon é novo na Pokédex, false se já estava (e só soma mais uma descoberta).
export function registrarDescoberta({ id, name, modo = 'desconhecido' }) {
    const atuais = carregarDescobertos();
    const agora = new Date().toISOString();
    const existente = atuais.find((p) => p.id === id);

    let novos;
    if (existente) {
        novos = atuais.map((p) => {
            if (p.id !== id) return p;
            // Registros antigos não tinham contagem: contam como 1 descoberta de modo desconhecido
            const contagem = { ...(p.contagem || { desconhecido: 1 }) };
            contagem[modo] = (contagem[modo] || 0) + 1;
            return { ...p, ultimaData: agora, contagem };
        });
    } else {
        novos = [
            ...atuais,
            {
                id,
                name,
                data: agora,
                ultimaData: agora,
                primeiroModo: modo,
                contagem: { [modo]: 1 },
            },
        ];
    }

    try {
        localStorage.setItem(CHAVE, JSON.stringify(novos));
    } catch {
        // sem localStorage, o jogo continua funcionando
    }
    return !existente;
}

// Resumo de um registro (funciona também com registros antigos)
export function resumoDescoberta(pokemon) {
    const contagem = pokemon.contagem || { desconhecido: 1 };
    const vezes = Object.values(contagem).reduce((soma, n) => soma + n, 0);
    return {
        contagem,
        vezes,
        primeiroModo: pokemon.primeiroModo || 'desconhecido',
        primeiraData: pokemon.data,
        ultimaData: pokemon.ultimaData || pokemon.data,
    };
}

export function limparDescobertos() {
    try {
        localStorage.removeItem(CHAVE);
    } catch {
        // ignora
    }
}