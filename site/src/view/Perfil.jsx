import { useState } from 'react'
import { useNavigate } from 'react-router'

const VAZIO = { usuario: '', email: '', senha: '', confirmar: '' };

const REGRAS_SENHA = [
    { id: 'tamanho', texto: 'Pelo menos 8 caracteres', ok: (s) => s.length >= 8 },
    { id: 'maiuscula', texto: 'Uma letra maiúscula', ok: (s) => /[A-Z]/.test(s) },
    { id: 'minuscula', texto: 'Uma letra minúscula', ok: (s) => /[a-z]/.test(s) },
    { id: 'numero', texto: 'Um número', ok: (s) => /[0-9]/.test(s) },
    { id: 'especial', texto: 'Um caractere especial (ex: ! @ # $ %)', ok: (s) => /[^A-Za-z0-9]/.test(s) },
];

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_USUARIO = /^[A-Za-z0-9_]{3,20}$/;

// Retorna a mensagem de erro de cada campo (ou "" se estiver válido)
function validar({ usuario, email, senha, confirmar }) {
    return {
        usuario: !usuario
            ? 'Informe um nome de usuário.'
            : !REGEX_USUARIO.test(usuario)
            ? 'Use de 3 a 20 caracteres: letras, números ou _.'
            : '',
        email: !email
            ? 'Informe um e-mail.'
            : !REGEX_EMAIL.test(email)
            ? 'Digite um e-mail válido (ex: nome@exemplo.com).'
            : '',
        senha: !senha
            ? 'Informe uma senha.'
            : !REGRAS_SENHA.every((r) => r.ok(senha))
            ? 'A senha não atende a todos os requisitos.'
            : '',
        confirmar: !confirmar
            ? 'Confirme a senha.'
            : confirmar !== senha
            ? 'As senhas não são iguais.'
            : '',
    };
}

function Campo({ id, rotulo, tipo = 'text', valor, aoMudar, aoSair, erro, invalido, placeholder, autoComplete }) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="font-bold text-sm">{rotulo}</label>
            <input
                id={id}
                name={id}
                type={tipo}
                value={valor}
                onChange={aoMudar}
                onBlur={aoSair}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={erro ? 'true' : 'false'}
                className={`border p-2 rounded-xl outline-none ${
                    erro || invalido ? 'border-red-500' : 'border-gray-300 focus:border-blue-600'
                }`}
            />
            {erro && <p className="text-xs text-red-600">{erro}</p>}
        </div>
    );
}

function Perfil() {
    const navigate = useNavigate();
    const [valores, setValores] = useState(VAZIO);
    const [tocados, setTocados] = useState({});
    const [enviou, setEnviou] = useState(false);

    const erros = validar(valores);
    const mostrarErro = (campo) => (tocados[campo] || enviou ? erros[campo] : '');

    // Requisitos da senha que ainda não foram cumpridos (só aparecem depois de tentar)
    const requisitosFaltando = REGRAS_SENHA.filter((regra) => !regra.ok(valores.senha));
    const mostrarRequisitos = (tocados.senha || enviou) && valores.senha !== '';

    const aoMudar = (e) => {
        const { name, value } = e.target;
        setValores((anterior) => ({ ...anterior, [name]: value }));
    };

    const aoSair = (e) => {
        const { name } = e.target;
        setTocados((anterior) => ({ ...anterior, [name]: true }));
    };

    const registrar = (e) => {
        e.preventDefault();
        setEnviou(true);

        // Se algum campo estiver inválido, não conclui
        if (Object.values(erros).some((erro) => erro)) return;

        // Registro hipotético: nada é salvo em lugar nenhum. Leva para o Termo.
        navigate('/termo');
    };

    return (
        <div className="flex justify-center">
            <form
                onSubmit={registrar}
                noValidate
                className="flex flex-col gap-4 bg-white m-10 w-full max-w-md p-8 rounded-2xl shadow-md"
            >
                <h3 className="text-2xl font-bold">Registrar</h3>

                <Campo
                    id="usuario"
                    rotulo="Usuário"
                    valor={valores.usuario}
                    aoMudar={aoMudar}
                    aoSair={aoSair}
                    erro={mostrarErro('usuario')}
                    placeholder="Seu nome de treinador"
                    autoComplete="username"
                />

                <Campo
                    id="email"
                    rotulo="E-mail"
                    tipo="email"
                    valor={valores.email}
                    aoMudar={aoMudar}
                    aoSair={aoSair}
                    erro={mostrarErro('email')}
                    placeholder="nome@exemplo.com"
                    autoComplete="email"
                />

                <div className="flex flex-col gap-2">
                    <Campo
                        id="senha"
                        rotulo="Senha"
                        tipo="password"
                        valor={valores.senha}
                        aoMudar={aoMudar}
                        aoSair={aoSair}
                        erro={valores.senha ? '' : mostrarErro('senha')}
                        invalido={mostrarRequisitos && requisitosFaltando.length > 0}
                        placeholder="Crie uma senha segura"
                        autoComplete="new-password"
                    />

                    {/* Só aparecem os requisitos que a senha ainda não cumpre */}
                    {mostrarRequisitos && requisitosFaltando.length > 0 && (
                        <ul className="text-xs text-red-600 flex flex-col gap-1">
                            {requisitosFaltando.map((regra) => (
                                <li key={regra.id}>✗ {regra.texto}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <Campo
                    id="confirmar"
                    rotulo="Confirmar senha"
                    tipo="password"
                    valor={valores.confirmar}
                    aoMudar={aoMudar}
                    aoSair={aoSair}
                    erro={mostrarErro('confirmar')}
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                />

                <button
                    type="submit"
                    className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition"
                >
                    Registrar
                </button>
            </form>
        </div>
    );
}

export default Perfil;