const labGrid = document.getElementById('lab-grid');
const blocosGrid = document.getElementById('blocos-grid');
const btnVoltarBlocos = document.getElementById('btn-voltar-blocos');
const modalEmprestimo = document.getElementById('modal-emprestimo');
const modalDevolucao = document.getElementById('modal-devolucao');
const formEmprestimo = document.getElementById('form-emprestimo');
const formDevolucao = document.getElementById('form-devolucao');
const verificarMatriculaBtn = document.getElementById('verificar-matricula');
const usuarioInfo = document.getElementById('usuario-info');
const nomeUsuarioSpan = document.getElementById('nome-usuario');
const divMatricula = document.getElementById('matricula-emprestimo');

function fecharModal(modal) {
  modal.style.display = 'none';
  formEmprestimo.reset();
  formDevolucao.reset();
  usuarioInfo.style.display = 'none';
  divMatricula.style.display = 'block';
}

document.querySelectorAll('.close').forEach(btn => btn.addEventListener('click', () => {
  fecharModal(modalEmprestimo);
  fecharModal(modalDevolucao);
}));

window.addEventListener('click', (event) => {
  if (event.target == modalEmprestimo) {
    fecharModal(modalEmprestimo);
  }
  if (event.target == modalDevolucao) {
    fecharModal(modalDevolucao);
  }
});

formEmprestimo.addEventListener('submit', async (event) => {
  event.preventDefault();
  const matricula = document.getElementById('matricula').value;
  const senha = document.getElementById('senha').value;
  const chave = document.getElementById('chave-emprestimo').value;
  const nomeUsuario = nomeUsuarioSpan.textContent;

  try {
    const response = await fetch('http://localhost:3000/realizarEmprestimo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matricula, senha, usuario: nomeUsuario, chave })
    });

    if (response.ok) {
      alert('Empréstimo realizado com sucesso!');
      labGrid.style.display = 'none';
      blocosGrid.style.display = 'grid';
      btnVoltarBlocos.style.display = 'none';
      fecharModal(modalEmprestimo);
    } else {
      const errorData = await response.json();
      alert(errorData.error);
    }
  } catch (error) {
    console.error('Erro ao realizar empréstimo:', error);
    alert('Ocorreu um erro ao realizar o empréstimo.');
  }
});

formDevolucao.addEventListener('submit', async (event) => {
  event.preventDefault();
  const senha = document.getElementById('senha-devolucao').value;
  const chave = document.getElementById('chave-devolucao').value;
  const matricula = document.getElementById('matricula-devolucao').value;

  try {
    const response = await fetch('http://localhost:3000/devolucao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha, chave, matricula })
    });

    if (response.ok) {
      alert('Devolução registrada com sucesso!');
      labGrid.style.display = 'none';
      blocosGrid.style.display = 'grid';
      btnVoltarBlocos.style.display = 'none';
      fecharModal(modalDevolucao);
    } else {
      const errorData = await response.json();
      alert(errorData.error);
    }
  } catch (error) {
    console.error('Erro ao registrar devolução:', error);
    alert('Ocorreu um erro ao registrar a devolução.');
  }
});

verificarMatriculaBtn.addEventListener('click', async () => {
  const matricula = document.getElementById('matricula').value;

  try {
    const response = await fetch(`http://localhost:3000/verificarMatricula/${matricula}`);
    const data = await response.json();

    if (response.ok) {
      nomeUsuarioSpan.textContent = data.nome;
      usuarioInfo.style.display = 'flex';
      usuarioInfo.style.flexDirection = 'column';
      divMatricula.style.display = 'none';
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Erro ao verificar matrícula:', error);
    alert('Ocorreu um erro ao verificar a matrícula.');
  }
});

export async function carregarChaves() {
  try {
    const response = await fetch('http://localhost:3000/chaves');
    const chaves = await response.json();

    const tabelaChaves = document.querySelector('#gerenciar-chaves tbody');
    tabelaChaves.innerHTML = '';

    chaves.forEach(chave => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${chave.tag}</td>
        <td>${chave.descricao}</td>
        <td>${chave.status}</td>
      `;
      tabelaChaves.appendChild(linha);
    });
  } catch (error) {
    console.error('Erro ao carregar chaves:', error);
    alert('Ocorreu um erro ao carregar as chaves.');
  }
}

export async function carregarChavesLabs() {
  async function renderizarLabs(labs) {
    labGrid.innerHTML = '';

    labs.forEach(lab => {
      const labSquare = document.createElement('div');
      labSquare.classList.add('lab-square');
      labSquare.textContent = lab.tag;
      labSquare.dataset.chave = lab.tag;

      labSquare.classList.add(lab.status === 'Disponível' ? 'disponivel' : 'indisponivel');
      labSquare.addEventListener('click', handleLabClick);
      labGrid.appendChild(labSquare);
    });

    labGrid.style.display = 'grid';
    blocosGrid.style.display = 'none';
    btnVoltarBlocos.style.display = 'block';
  }

  async function handleLabClick(event) {
    const chaveSelecionada = event.target.dataset.chave;
    if (event.target.classList.contains('disponivel')) {
      document.getElementById('chave-emprestimo').value = chaveSelecionada;
      modalEmprestimo.style.display = 'flex';
    } else {
      try {
        const response = await fetch(`http://localhost:3000/emprestimos/${chaveSelecionada}`);
        const data = await response.json();
        if (response.ok) {
          document.getElementById('chave-devolucao').value = chaveSelecionada;
          document.getElementById('matricula-devolucao').value = data.matricula;
          document.getElementById('info-usuario-devolucao').textContent = `Responsável: ${data.usuario}`;
          modalDevolucao.style.display = 'flex';
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error('Erro ao buscar informações do empréstimo:', error);
        alert('Ocorreu um erro ao buscar informações do empréstimo.');
      }
    }
  }

  btnVoltarBlocos.addEventListener('click', () => {
    labGrid.style.display = 'none';
    blocosGrid.style.display = 'grid';
    btnVoltarBlocos.style.display = 'none';
  });

  document.querySelectorAll('.bloco').forEach(button => {
    button.addEventListener('click', async (event) => {
      const bloco = event.target.dataset.bloco;
      try {
        const response = await fetch(`http://localhost:3000/chaves`);
        const labs = await response.json();
        const labsBlocoSelecionado = labs.filter(lab => lab.bloco === bloco);
        await renderizarLabs(labsBlocoSelecionado);
      } catch (error) {
        console.error('Erro ao carregar chaves laboratoriais:', error);
        alert('Ocorreu um erro ao carregar as chaves laboratoriais.');
      }
    });
  });
}

export async function carregarChavesDisponiveis() {
  try {
    const response = await fetch('http://localhost:3000/chaves-disponiveis');
    const chaves = await response.json();

    const selectChaveEmprestimo = document.getElementById('chave-emprestimo');
    selectChaveEmprestimo.innerHTML = '<option value="">Selecione a chave</option>';

    chaves.forEach(chave => {
      const option = document.createElement('option');
      option.value = chave.tag;
      option.textContent = `${chave.tag} - ${chave.descricao}`;
      selectChaveEmprestimo.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar chaves disponíveis:', error);
    alert('Ocorreu um erro ao carregar as chaves disponíveis.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarChavesDisponiveis();
  carregarChaves();
  carregarChavesLabs();
});
