const chavesTable = document.querySelector('#gerenciar-chaves tbody');
const btnCadastrarChave = document.getElementById('btn-cadastrar-chave');
const emprestimoForm = document.getElementById('emprestimo-form');
const emprestimosTable = document.querySelector('#registrar-devolucao-chaves tbody');

export async function carregarChaves() {
  try {
    const response = await fetch('http://localhost:3000/chaves');
    const chaves = await response.json();

    const tabelaChaves = document.querySelector('#chaves tbody');
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

export async function realizarEmprestimo(event) {
  event.preventDefault();

  const usuarioEmprestimo = document.getElementById('usuario-emprestimo').value;
  const chaveEmprestimo = document.getElementById('chave-emprestimo').value;

  try {
    const response = await fetch('http://localhost:3000/emprestimo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuarioEmprestimo, chave: chaveEmprestimo })
    });

    if (response.ok) {
      alert('Empréstimo realizado com sucesso!');
      carregarChavesDisponiveis();
      emprestimoForm.reset(); 
    } else {
      const errorData = await response.json();
      alert(errorData.error);
    }
  } catch (error) {
    console.error('Erro ao realizar empréstimo:', error);
    alert('Ocorreu um erro ao realizar o empréstimo.');
  }
}

async function carregarEmprestimos() {
  try {
    const response = await fetch('http://localhost:3000/emprestimos');
    const emprestimos = await response.json();

    emprestimosTable.innerHTML = '';

    if(!emprestimos){
      const linha = document.createElement('h1');
      linha.innerHTML = `Não há emprestimos`
        }
    
    emprestimos.forEach(emprestimo => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${emprestimo.tag}</td> 
        <td>${new Date(emprestimo.dataEmprestimo).toLocaleString()}</td> 
        <td>${emprestimo.usuario}</td> 
        <td>
          <button class="btn-registrar-devolucao" data-emprestimo-id="${emprestimo._id}">Registrar Devolução</button>
        </td>
      `;
      emprestimosTable.appendChild(linha);
    });

    

  } catch (error) {
    console.error('Erro ao carregar empréstimos:', error);
    alert('Ocorreu um erro ao carregar os empréstimos.');
  }
}

async function registrarDevolucao(emprestimoId) {
  if (confirm('Confirmar devolução?')) {
    try {
      const response = await fetch(`http://localhost:3000/devolucao/${emprestimoId}`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('Devolução registrada com sucesso!');
        carregarEmprestimos(); 
        carregarChavesDisponiveis();
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }

    } catch (error) {
      console.error('Erro ao registrar devolução:', error);
      alert('Ocorreu um erro ao registrar a devolução.');
    }
  }
}

// Event listeners 
document.addEventListener('DOMContentLoaded', carregarChavesDisponiveis);
emprestimoForm.addEventListener('submit', realizarEmprestimo); 
document.getElementById('btn-registrar-devolucao-chaves').addEventListener('click', carregarEmprestimos);

emprestimosTable.addEventListener('click', async (event) => {
  if (event.target.classList.contains('btn-registrar-devolucao')) {
    const emprestimoId = event.target.dataset.emprestimoId; 
    registrarDevolucao(emprestimoId);
  }
});

