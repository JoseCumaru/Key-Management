function mostrarCampo() {
    const tipoUser = document.getElementById('tipo-usuario').value;
    const matriculaSiapeContainer = document.getElementById('matricula-siape-container');
    const matriculaSiapeLabel = document.getElementById('matricula-siape-label');
    const adicionaAutorizacaoCadastro = document.getElementById('adicionar-autorizacao-cadastro');

    if (tipoUser === 'Professor') {
        matriculaSiapeContainer.style.display = 'block';
        matriculaSiapeLabel.textContent = 'SIAPE:';
    } else if (tipoUser === 'Aluno') {
        matriculaSiapeContainer.style.display = 'block';
        matriculaSiapeLabel.textContent = 'Matrícula:';
    } else {
        matriculaSiapeContainer.style.display = 'none';
    }

    checkFormValidity();
}

function checkFormValidity() {
    const form = document.getElementById('form-cadastrar-usuario');
    const adicionarAutorizacaoCadastro = document.getElementById('adicionar-autorizacao-cadastro');
    const matriculaSiapeContainer = document.getElementById('matricula-siape-container');
    const tipoUsuario = document.getElementById('tipo-usuario').value;
    const matriculaSiape = document.getElementById('nova-matricula-siape');

    let allFieldsValid = form.checkValidity();

    if (tipoUsuario !== 'none' && matriculaSiapeContainer.style.display === 'block') {
        allFieldsValid = allFieldsValid && matriculaSiape.checkValidity();
    }

    adicionarAutorizacaoCadastro.style.display = allFieldsValid ? 'block' : 'none';
}

// Adiciona ouvintes de eventos para cada campo obrigatório
document.querySelectorAll('#form-cadastrar-usuario input[required], #form-cadastrar-usuario select[required]').forEach(input => {
    input.addEventListener('input', checkFormValidity);
});

// Para garantir que o campo esteja atualizado ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    mostrarCampo();
    checkFormValidity();
});

document.getElementById('modal-cadastrar-usuario').addEventListener('show', function () {
    document.getElementById('novo-usuario').value = '';
    document.getElementById('nova-senha').value = '';
});

document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('modal-cadastrar-usuario').style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == document.getElementById('modal-cadastrar-usuario')) {
        document.getElementById('modal-cadastrar-usuario').style.display = 'none';
    }
});

// Lógica de submissão do formulário
document.getElementById('form-cadastrar-usuario').addEventListener('submit', async (event) => {
    event.preventDefault();

    const usuario = document.getElementById('novo-usuario').value;
    const senha = document.getElementById('nova-senha').value;
    const cpf = document.getElementById('novo-cpf').value;
    const email = document.getElementById('novo-email').value;
    const tipo = document.getElementById('tipo-usuario').value;
    const matriculaSiape = document.getElementById('nova-matricula-siape').value;

    console.log({ usuario, senha, cpf, email, tipo, matricula: matriculaSiape });

    try {
        const response = await fetch('http://localhost:3000/cadastrarUsuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha, cpf, email, tipo, matriculaSiape })
        });

        if (response.ok) {
            alert('Usuário cadastrado com sucesso!');
            document.getElementById('modal-cadastrar-usuario').style.display = 'none';
            document.getElementById('form-cadastrar-usuario').reset(); // Limpa o formulário após o cadastro
        } else {
            const errorData = await response.json();
            alert(errorData.error);
        }
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        alert('Ocorreu um erro ao cadastrar o usuário.');
    }
});
