const emprestimosTable = document.querySelector('#registrar-devolucao-chaves tbody');
const autorizacoesTable = document.querySelector('#gerenciar-emprestimos tbody');

// Função para autorizar empréstimo (não usada, mas mantida para referência)
export async function autorizarEmprestimo(event) {
    event.preventDefault();
  
    const usuarioEmprestimo = document.getElementById('usuario-emprestimo').value;
    const chaveEmprestimo = document.getElementById('chave-emprestimo').value;
  
    try {
      const response = await fetch('http://localhost:3000/autorizarEmprestimo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioEmprestimo, chave: chaveEmprestimo })
      });
  
      if (response.ok) {
        alert('Empréstimo autorizado com sucesso!');
        // modalAutorizarEmprestimo.style.display = 'none'; // Linha removida
      } else {
        const errorData = await response.json();
        alert(errorData.error);
      }
    } catch (error) {
      console.error('Erro ao autorizar empréstimo:', error);
      alert('Ocorreu um erro ao autorizar o empréstimo.');
    }
  }
  

export async function carregarAutorizacoesPendentes() {
  try {
    const response = await fetch('http://localhost:3000/autorizacoesPendentes');
    const autorizacoes = await response.json();
  
    const autorizacoesTable = document.querySelector('#gerenciar-emprestimos tbody');
    autorizacoesTable.innerHTML = '';
  
    if (autorizacoes.length === 0) {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td colspan="3">Não há autorizações no momento.</td>
      `;
      autorizacoesTable.appendChild(linha);
    } else {
      autorizacoes.forEach(autorizacao => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${autorizacao.usuario}</td>
          <td>${autorizacao.tag}</td>
          <td>
            <button class="btn-realizar-emprestimo" data-usuario="${autorizacao.usuario}" data-chave="${autorizacao.tag}">Realizar Empréstimo</button>
          </td>
        `;
        autorizacoesTable.appendChild(linha);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar autorizações pendentes:', error);
    alert('Ocorreu um erro ao carregar as autorizações pendentes.');
  }
}

async function carregarEmprestimos() {
  try {
    const response = await fetch('http://localhost:3000/emprestimos');
    const emprestimos = await response.json();
  
    emprestimosTable.innerHTML = '';
  
    if (!emprestimos || emprestimos.length === 0) {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td colspan="4">Não há empréstimos no momento.</td>
      `;
      emprestimosTable.appendChild(linha);
    } else {
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
    }
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

// Verificar se os elementos DOM existem antes de adicionar event listeners
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('btn-registrar-devolucao-chaves')) {
    document.getElementById('btn-registrar-devolucao-chaves').addEventListener('click', carregarEmprestimos);
  }

  if (emprestimosTable) {
    emprestimosTable.addEventListener('click', async (event) => {
      if (event.target.classList.contains('btn-registrar-devolucao')) {
        const emprestimoId = event.target.dataset.emprestimoId;
        registrarDevolucao(emprestimoId);
      }
    });
  }

  if (autorizacoesTable) {
    autorizacoesTable.addEventListener('click', async (event) => {
      if (event.target.classList.contains('btn-realizar-emprestimo')) {
        const usuario = event.target.dataset.usuario;
        const tag = event.target.dataset.chave;
        realizarEmprestimo(usuario, tag);
      }
    });
  }
});
