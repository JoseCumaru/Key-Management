import { carregarAreaPrincipal } from './script.js';
const loginSection = document.getElementById('login-section');
const mainSection = document.getElementById('main-section');

export async function fazerLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById('username').value;
  const senha = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('tipoUsuario', data.tipo);
      carregarAreaPrincipal(data.tipo);
    } else {
      const errorData = await response.json();
      alert(errorData.error);
    }
  } catch (error) {
    console.error('Erro durante o login:', error);
    alert('Ocorreu um erro durante o login. Verifique sua conexão e tente novamente.');
  }
}

export function fazerLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('tipoUsuario');
  loginSection.style.display = 'block';
  mainSection.style.display = 'none';
}

// Função para verificar se o usuário está logado
export function verificarLogin() {
  const token = localStorage.getItem('token');
  const tipoUsuario = localStorage.getItem('tipoUsuario');
  if (token) {
    carregarAreaPrincipal(tipoUsuario);
  }
}
