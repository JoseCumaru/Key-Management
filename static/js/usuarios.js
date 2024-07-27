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
          <button class="btn-editar" data-id="${usuario._id}" data-colecao="${usuario.tipo === 'Externo' ? 'externos' : 'usuarios'}">Editar</button>
          <button class="btn-excluir" data-id="${usuario._id}" data-colecao="${usuario.tipo === 'Externo' ? 'externos' : 'usuarios'}">Excluir</button>
        </td>
      `;
      usuariosTable.appendChild(linha);
    });
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    alert('Ocorreu um erro ao carregar os usuários.');
  }
}

// Função para abrir o modal de edição e preencher os campos
export async function abrirModalEditarUsuario(usuarioId) {
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}?colecao=externos`);
    if (!response.ok) {
      throw new Error('Usuário não encontrado');
    }
    const usuario = await response.json();

    const modalEditarUsuario = document.getElementById('modal-editar-usuario');
    if (modalEditarUsuario) {
      document.getElementById('editar-usuario').value = usuario.usuario;
      document.getElementById('editar-cpf').value = usuario.cpf;
      document.getElementById('editar-email').value = usuario.email;
      document.getElementById('editar-matricula').value = usuario.matricula || '';

      document.getElementById('form-editar-usuario').dataset.id = usuarioId;

      modalEditarUsuario.style.display = 'flex';
    } else {
      console.error('Elemento do modal não encontrado.');
      alert('Ocorreu um erro ao abrir o modal de edição. Por favor, tente novamente mais tarde.');
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    alert('Ocorreu um erro ao buscar os dados do usuário.');
  }
}

async function excluirUsuario(usuarioId) {
  if (confirm(`Tem certeza que deseja excluir o usuário com ID ${usuarioId}?`)) {
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}?colecao=externos`, {
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
    abrirModalEditarUsuario(usuarioId);
  } else if (event.target.classList.contains('btn-excluir')) {
    const usuarioId = event.target.dataset.id;
    excluirUsuario(usuarioId);
  }
});

// Event listener para salvar o usuário editado
document.getElementById('form-editar-usuario').addEventListener('submit', async (event) => {
  event.preventDefault();

  const usuarioId = event.target.dataset.id;

  const usuario = {
    usuario: document.getElementById('editar-usuario').value,
    cpf: document.getElementById('editar-cpf').value,
    email: document.getElementById('editar-email').value,
    matriculaSiape: document.getElementById('editar-matricula').value,
  };

  if (document.getElementById('editar-senha').value) {
    usuario.senha = document.getElementById('editar-senha').value;
  }

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}?colecao=externos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuario),
    });

    if (response.ok) {
      alert('Usuário atualizado com sucesso!');
      document.getElementById('modal-editar-usuario').style.display = 'none';
      carregarUsuarios();
    } else {
      const errorData = await response.json();
      alert(errorData.error);
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    alert('Ocorreu um erro ao atualizar o usuário.');
  }
});