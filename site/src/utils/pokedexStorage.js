// Persistência da Pokédex no navegador (localStorage). Não precisa de banco de dados.

const CHAVE = 'pokedex-descobertos';

export const TOTAL_POKEMON = 1025;

export const spriteUrl = (id) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

// Retorna a lista de Pokémon descobertos: [{ id, name, data }]
export function carregarDescobertos() {
    try {
        const salvo = localStorage.getItem(CHAVE);
        return salvo ? JSON.parse(salvo) : [];
    } catch {
        return [];
    }
}

// Registra um Pokémon como descoberto. Retorna true se for novo, false se já estava na Pokédex.
export function registrarDescoberta({ id, name }) {
    const atuais = carregarDescobertos();
    if (atuais.some((p) => p.id === id)) return false;

    try {
        const novos = [...atuais, { id, name, data: new Date().toISOString() }];
        localStorage.setItem(CHAVE, JSON.stringify(novos));
    } catch {
        // sem localStorage, o jogo continua funcionando
    }
    return true;
}

export function limparDescobertos() {
    try {
        localStorage.removeItem(CHAVE);
    } catch {
        // ignora
    }
}