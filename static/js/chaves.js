const labGrid = document.getElementById('lab-grid');
const modalAutorizarEmprestimo = document.getElementById('modal-autorizar-emprestimo');
const formAutorizarEmprestimo = document.getElementById('form-autorizar-emprestimo');

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

export async function carregarChavesLabs() {
  const labGrid = document.getElementById('lab-grid');
  const blocosGrid = document.getElementById('blocos-grid');
  const btnVoltarBlocos = document.getElementById('btn-voltar-blocos');
  const modalAutorizarEmprestimo = document.getElementById('modal-autorizar-emprestimo');

  function renderizarLabs(labs) {
    labGrid.innerHTML = ''; // Limpa o conteúdo anterior

    labs.forEach(lab => {
      const labSquare = document.createElement('div');
      labSquare.classList.add('lab-square');
      labSquare.textContent = lab.tag; // Adiciona o texto
      labSquare.dataset.chave = lab.tag; // Armazena a tag

      // Adiciona classe de acordo com o status
      labSquare.classList.add(lab.status === 'Disponível' ? 'disponivel' : 'indisponivel');

      labSquare.addEventListener('click', handleLabClick); // Adiciona evento de clique
      labGrid.appendChild(labSquare); // Adiciona o quadrado ao grid
    });

    // Exibe o grid de laboratórios e oculta os blocos
    labGrid.style.display = 'grid';
    blocosGrid.style.display = 'none';
    btnVoltarBlocos.style.display = 'block';
  }

  function handleLabClick(event) {
    if (event.target.classList.contains('disponivel')) {
      const chaveSelecionada = event.target.dataset.chave;
      document.getElementById('chave-emprestimo').value = chaveSelecionada; // Preenche o campo oculto com a chave selecionada
      modalAutorizarEmprestimo.style.display = 'flex'; // Abre o modal
      // Event listener para fechar o modal ao clicar fora dele
      window.addEventListener('click', (event) => {
        if (event.target == modalAutorizarEmprestimo) {
          modalAutorizarEmprestimo.style.display = 'none'; // Fecha o modal
        }
      });
    }
  }

  // Event listener para o botão "Voltar para Blocos"
  btnVoltarBlocos.addEventListener('click', () => {
    labGrid.style.display = 'none';
    blocosGrid.style.display = 'grid';
    btnVoltarBlocos.style.display = 'none';
  });

// Event listeners para os botões de bloco
document.querySelectorAll('.bloco').forEach(button => {
    button.addEventListener('click', async (event) => {
      const bloco = event.target.dataset.bloco;
      try {
        const response = await fetch(`http://localhost:3000/chaves`);
        const labs = await response.json();
        const labsBlocoSelecionado = labs.filter(lab => lab.bloco === bloco);
        renderizarLabs(labsBlocoSelecionado); // Chama a função para renderizar os quadrados
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

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  carregarChavesDisponiveis();
  carregarChaves(); // Carrega todas as chaves na tabela
  carregarChavesLabs(); // Carrega os quadrados dos laboratórios
});

// Função para lidar com o clique nos laboratórios
function handleLabClick(event) {
  const chaveSelecionada = event.target.dataset.chave;
  document.getElementById('chave-emprestimo').value = chaveSelecionada; // Preenche o campo oculto com a chave selecionada
}
