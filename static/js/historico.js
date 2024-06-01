
export async function carregarHistorico(pagina = 1, limite = 6) {
  try {
    const response = await fetch(`http://localhost:3000/historico?pagina=${pagina}&limite=${limite}`);
    const data = await response.json();

<<<<<<< Updated upstream
export async function carregarHistorico(pagina = 1, limite = 6) {
  try {
    const response = await fetch(`http://localhost:3000/historico?pagina=${pagina}&limite=${limite}`);
    const data = await response.json();

=======
>>>>>>> Stashed changes
    const tabelaHistorico = document.querySelector('#historico tbody');
    tabelaHistorico.innerHTML = '';

    if (data.registros.length === 0) {
      const linha = document.createElement('tr');
      linha.innerHTML = '<td colspan="4">Nenhum registro encontrado.</td>';
      tabelaHistorico.appendChild(linha);
    } else {
      data.registros.forEach(emprestimo => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${emprestimo.tag}</td>
          <td>${emprestimo.usuario}</td>
          <td>${new Date(emprestimo.dataEmprestimo).toLocaleString()}</td>
          <td>${emprestimo.dataDevolucao ? new Date(emprestimo.dataDevolucao).toLocaleString() : '-'}</td>
        `;
        tabelaHistorico.appendChild(linha);
      });
    }

    criarControlesPaginacao(data.paginaAtual, data.totalPaginas, limite);
  } catch (error) {
    console.error('Erro ao carregar histórico de empréstimos:', error);
    alert('Ocorreu um erro ao carregar o histórico de empréstimos.');
  }
}

<<<<<<< Updated upstream
export async function carregarHistoricoFiltro(pagina = 1, limite = 4) {
=======
export async function carregarHistoricoFiltro(pagina = 1, limite = 6) {
>>>>>>> Stashed changes
  const responsavel = document.getElementById('responsavel-filtro').value;
  const dataInicio = document.getElementById('data-inicio-filtro').value;
  const dataFim = document.getElementById('data-fim-filtro').value;

  try {
    const response = await fetch(`http://localhost:3000/historico?responsavel=${responsavel}&dataInicio=${dataInicio}&dataFim=${dataFim}&pagina=${pagina}&limite=${limite}`);
    const data = await response.json();

    const tabelaHistorico = document.querySelector('#historico tbody');
    tabelaHistorico.innerHTML = '';

    if (data.registros.length === 0) {
      const linha = document.createElement('tr');
      linha.innerHTML = '<td colspan="4">Nenhum registro encontrado.</td>';
      tabelaHistorico.appendChild(linha);
    } else {
      data.registros.forEach(emprestimo => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${emprestimo.tag}</td>
          <td>${emprestimo.usuario}</td>
          <td>${new Date(emprestimo.dataEmprestimo).toLocaleString()}</td>
          <td>${emprestimo.dataDevolucao ? new Date(emprestimo.dataDevolucao).toLocaleString() : '-'}</td>
        `;
        tabelaHistorico.appendChild(linha);
      });
    }

    criarControlesPaginacao(data.paginaAtual, data.totalPaginas, limite);
  } catch (error) {
    console.error('Erro ao filtrar histórico de empréstimos:', error);
    alert('Ocorreu um erro ao filtrar o histórico de empréstimos.');
  }
}

function criarControlesPaginacao(paginaAtual, totalPaginas, limite) {
  const paginationContainer = document.getElementById('paginacao');
  paginationContainer.innerHTML = '';

  if (totalPaginas > 1) {
    for (let i = 1; i <= totalPaginas; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.disabled = i === paginaAtual;

      button.addEventListener('click', () => {
        if (document.getElementById('responsavel-filtro').value || document.getElementById('data-inicio-filtro').value || document.getElementById('data-fim-filtro').value) {
          carregarHistoricoFiltro(i, limite);
        } else {
          carregarHistorico(i, limite);
        }
      });

      paginationContainer.appendChild(button);
    }
  }
}