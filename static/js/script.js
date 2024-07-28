
import { carregarUsuarios } from './usuarios.js';
import { carregarChaves, carregarChavesLabs, carregarChavesDisponiveis } from './chaves.js';
import { carregarAutorizacoesPendentes } from './emprestimo.js';
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
    sidebar.querySelectorAll('.guardinha').forEach(item => {
      item.style.display = 'none';
    });
  } else {
    sidebar.querySelectorAll('.guardinha').forEach(item => {
      item.style.display = 'block';
    });
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
        console.log("carregarChaves")
        carregarChaves();
        break;
      case 'gerenciar-chaves':
        carregarChaves();
        break;
      case 'gerenciar-emprestimos':
        carregarChavesLabs; // Chame a função
        break;
      case 'historico':
        carregarHistorico();
        btnFiltrarHistorico.addEventListener('click', () => {
          carregarHistoricoFiltro();
        });
        break;
      case 'gerenciar-emprestimos':
          carregarAutorizacoesPendentes();
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
  modalCadastrarUsuario.style.display = 'flex';
  document.getElementById('novo-usuario').value = '';
  document.getElementById('nova-senha').value = '';
});
btnFecharModal.addEventListener('click', () => {
  modalCadastrarUsuario.style.display = 'none';
});



function handleLabClick(event) {
  const chaveSelecionada = event.target.dataset.chave;
  document.getElementById('chave-emprestimo').value = chaveSelecionada; 
}




// --- Inicializações ---
document.addEventListener('DOMContentLoaded', () => {
  verificarLogin();
  const selectChaveEmprestimo = document.getElementById('chave-emprestimo');
  selectChaveEmprestimo.innerHTML = '<option value="">Selecione a chave</option>';
  carregarChavesDisponiveis(); 
});