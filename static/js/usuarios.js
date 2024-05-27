const usuariosTable = document.querySelector('#usuarios tbody');
const btnCadastrarUsuario = document.getElementById('btn-cadastrar-usuario');

export async function carregarUsuarios() {
  try {
    const response = await fetch('http://localhost:3000/usuarios');
    const usuarios = await response.json();

    usuariosTable.innerHTML = '';

    usuarios.forEach(usuario => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${usuario.usuario}</td>
        <td>${usuario.cpf}</td>
        <td>${usuario.email}</td>
        <td>${usuario.tipo}</td>
        <td>
          <button class="btn-editar" data-id="${usuario._id}">Editar</button>
          <button class="btn-excluir" data-id="${usuario._id}">Excluir</button>
        </td>
      `;
      usuariosTable.appendChild(linha);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    alert('Ocorreu um erro ao carregar os usuários.');
  }
}

export function cadastrarUsuario() {
  
}

async function editarUsuario(usuarioId) {
  alert(`Editar usuário com ID: ${usuarioId}`);
}

async function excluirUsuario(usuarioId) {
  if (confirm(`Tem certeza que deseja excluir o usuário com ID ${usuarioId}?`)) {
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Usuário excluído com sucesso!');
        carregarUsuarios(); 
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Ocorreu um erro ao excluir o usuário.');
    }
  }
}

// Event listeners para editar e excluir usuário
usuariosTable.addEventListener('click', async (event) => {
  if (event.target.classList.contains('btn-editar')) {
    const usuarioId = event.target.dataset.id;
    editarUsuario(usuarioId);
  } else if (event.target.classList.contains('btn-excluir')) {
    const usuarioId = event.target.dataset.id;
    excluirUsuario(usuarioId);
  }
});