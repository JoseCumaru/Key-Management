import { carregarUsuarios } from './usuarios.js';
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form-cadastrar-usuario');
    const adicionarAutorizacaoCadastro = document.getElementById('adicionar-autorizacao-cadastro');
    const matriculaSiapeContainer = document.getElementById('matricula-siape-container');
    const tipoUsuario = document.getElementById('tipo-usuario');
    const matriculaSiape = document.getElementById('nova-matricula-siape');
    const modalCadastrarUsuario = document.getElementById('modal-cadastrar-usuario');
    const closeButton = document.querySelector('.close-button');

    window.mostrarCampo = function() {
        const tipoUser = tipoUsuario.value;
        const matriculaSiapeLabel = document.getElementById('matricula-siape-label');

        if (tipoUser === 'Professor') {
            //matriculaSiapeContainer.style.display = 'block';
            matriculaSiapeLabel.textContent = 'SIAPE:';
        } else if (tipoUser === 'Aluno') {
            //matriculaSiapeContainer.style.display = 'block';
            matriculaSiapeLabel.textContent = 'Matrícula:';
        } else {
            matriculaSiapeContainer.style.display = 'none';
        }

        checkFormValidity();
    }

    function checkFormValidity() {
        let allFieldsValid = form.checkValidity();

        if (tipoUsuario.value !== 'none' && matriculaSiapeContainer.style.display === 'block') {
            allFieldsValid = allFieldsValid && matriculaSiape.checkValidity();
        }

        adicionarAutorizacaoCadastro.style.display = allFieldsValid ? 'block' : 'none';
    }

    // Adiciona ouvintes de eventos para cada campo obrigatório
    document.querySelectorAll('#form-cadastrar-usuario input[required], #form-cadastrar-usuario select[required]').forEach(input => {
        input.addEventListener('input', checkFormValidity);
    });

    // Para garantir que o campo esteja atualizado ao carregar a página
    mostrarCampo();
    checkFormValidity();

    modalCadastrarUsuario.addEventListener('show', function () {
        document.getElementById('novo-usuario').value = '';
        document.getElementById('nova-senha').value = '';
    });

    closeButton.addEventListener('click', () => {
        modalCadastrarUsuario.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modalCadastrarUsuario) {
            modalCadastrarUsuario.style.display = 'none';
        }
    });

    // Lógica de submissão do formulário
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario = document.getElementById('novo-usuario').value;
        const senha = document.getElementById('nova-senha').value;
        const cpf = document.getElementById('novo-cpf').value;
        const email = document.getElementById('novo-email').value;
        const tipo = tipoUsuario.value;
        const matricula = matriculaSiape.value;

        console.log({ usuario, senha, cpf, email, tipo, matricula });

        try {
            const response = await fetch('http://localhost:3000/cadastrarUsuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, senha, cpf, email, tipo, matriculaSiape: matricula })
            });

            if (response.ok) {
                alert('Usuário cadastrado com sucesso!');
                carregarUsuarios();
                modalCadastrarUsuario.style.display = 'none';
                form.reset();
            } else {
                const errorData = await response.json();
                alert(errorData.error);
            }
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Ocorreu um erro ao cadastrar o usuário.');
        }
    });
});
