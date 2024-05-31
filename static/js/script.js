
import { carregarUsuarios, cadastrarUsuario } from './usuarios.js';
import { carregarChaves, realizarEmprestimo, carregarChavesDisponiveis } from './chaves.js';
import {carregarHistorico, carregarHistoricoFiltro} from './historico.js';
import { fazerLogin, fazerLogout, verificarLogin } from './auth.js';

// Seleciona os elementos do DOM
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');
const loginForm = document.getElementById('login-form');
const sidebar = document.getElementById('sidebar');
const contentSections = document.querySelectorAll('.content-section');
const btnFiltrarHistorico = document.getElementById('btn-filtrar-historico');

// Função para exibir uma seção de conteúdo
function exibirSecao(secaoId) {
  contentSections.forEach(secao => {
    secao.style.display = secao.id === secaoId ? 'block' : 'none';
  });
}

// Função para carregar a área principal após o login
export function carregarAreaPrincipal(tipoUsuario) {
  loginSection.style.display = 'none';
  mainSection.style.display = 'flex';


  if (tipoUsuario === 'Administrador') {
    sidebar.querySelectorAll('.admin').forEach(item => {
      item.style.display = 'block';
    });
  } else {
    sidebar.querySelectorAll('.admin').forEach(item => {
      item.style.display = 'none';
    });
  }

  exibirSecao('dashboard');
}

// Login
loginForm.addEventListener('submit', fazerLogin);

// Logout
document.getElementById('btn-logout').addEventListener('click', fazerLogout);



//        --- Navegação do menu lateral ---

sidebar.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    const secaoId = event.target.id.replace('btn-', '');
    exibirSecao(secaoId);

    switch (secaoId) {
      case 'usuarios':
        carregarUsuarios();
        break;
      case 'chaves':
        carregarChaves();
        break;
      case 'historico':
        carregarHistorico();
        btnFiltrarHistorico.addEventListener('click', () => {
          carregarHistoricoFiltro();
        });
        break;
      default:
        break;
    }
  }
});



//     ---  Gerenciamento de Usuários ---

const modalCadastrarUsuario = document.getElementById('modal-cadastrar-usuario');
const btnFecharModal = document.querySelector('#modal-cadastrar-usuario .close-button');

const btnAbrirModal = document.getElementById('btn-cadastrar-usuario');

btnAbrirModal.addEventListener('click', () => {
  modalCadastrarUsuario.style.display = 'block';
});
btnFecharModal.addEventListener('click', () => {
  modalCadastrarUsuario.style.display = 'none';
});
window.onclick = function(event) {
  if (event.target == modalCadastrarUsuario) {
    modalCadastrarUsuario.style.display = 'none';
  }
}


// Adiciona evento de submit ao formulário de cadastro de usuário
const formCadastrarUsuario = document.getElementById('form-cadastrar-usuario');

formCadastrarUsuario.addEventListener('submit', async (event) => {
  event.preventDefault();

  const novoUsuario = document.getElementById('novo-usuario').value;
  const novaSenha = document.getElementById('nova-senha').value;
  const novoCpf = document.getElementById('novo-cpf').value;
  const novoEmail = document.getElementById('novo-email').value;
  const tipoUsuario = document.getElementById('tipo-usuario').value;

  try {
    const response = await fetch('http://localhost:3000/cadastrarUsuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: novoUsuario, senha: novaSenha, cpf: novoCpf, email: novoEmail, tipo: tipoUsuario })
    });

    if (response.ok) {
      alert('Usuário cadastrado com sucesso!');
      modalCadastrarUsuario.style.display = 'none';
      carregarUsuarios();
      formCadastrarUsuario.reset(); 
    } else {
      const errorData = await response.json();
      alert(errorData.error); 
    }

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    alert('Ocorreu um erro ao cadastrar o usuário.');
  }
});




// --- Inicializações ---
document.addEventListener('DOMContentLoaded', () => {
  verificarLogin();
  const selectChaveEmprestimo = document.getElementById('chave-emprestimo');
  selectChaveEmprestimo.innerHTML = '<option value="">Selecione a chave</option>';
  carregarChavesDisponiveis(); 
});