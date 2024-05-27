

export async function carregarHistorico(){
    try {
      const response = await fetch('http://localhost:3000/historico');
      const registros = await response.json();
  
      const tabelaHistorico = document.querySelector('#historico tbody');
      tabelaHistorico.innerHTML = '';
  
      registros.forEach(emprestimo => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${emprestimo.tag}</td>
          <td>${emprestimo.usuario}</td>
          <td>${emprestimo.dataEmprestimo}</td>
          <td>${emprestimo.dataDevolucao}</td>
        `;
        tabelaHistorico.appendChild(linha);
      });
    } catch (error) {
      console.error('Erro ao carregar histórico de empréstimos:', error);
      alert('Ocorreu um erro ao carregar o histórico de empréstimos.');
    }
 
}

export async function carregarHistoricoFiltro(){
    const responsavel = document.getElementById('responsavel-filtro').value;
    const dataInicio = document.getElementById('data-inicio-filtro').value;
    const dataFim = document.getElementById('data-fim-filtro').value;
  
    try {
      const response = await fetch(`http://localhost:3000/historico?responsavel=${responsavel}&dataInicio=${dataInicio}&dataFim=${dataFim}`); // URL com filtros
      const emprestimos = await response.json();
      
      const tabelaHistorico = document.querySelector('#historico tbody');
      tabelaHistorico.innerHTML = '';
  
      emprestimos.forEach(emprestimo => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${emprestimo.tag}</td>
          <td>${emprestimo.usuario}</td>
          <td>${emprestimo.dataEmprestimo}</td>
          <td>${emprestimo.dataDevolucao}</td>
        `;
        tabelaHistorico.appendChild(linha);
      });
     
    } catch (error) {
      console.error('Erro ao filtrar histórico de empréstimos:', error);
      alert('Ocorreu um erro ao filtrar o histórico de empréstimos.');
    }
}