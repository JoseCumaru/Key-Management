const { conectar } = require('../models/db'); 
const mongodb = require('mongodb');


// Função para o Admin autorizar o empréstimo
async function autorizarEmprestimo(req, res) {
  //const { usuario, chave, dataEmprestimo, horaEmprestimo } = req.body;
  const { usuario, chave } = req.body;

  try {
    const db = await conectar();

    const usuarioExistente = await db.collection('externos').findOne({ usuario });

    if (!usuarioExistente) {
      return res.status(400).json({ error: 'Usuário externo não encontrado.' });
    }

    const chaveExistente = await db.collection('chaves').findOne({ tag: chave });

    if (!chaveExistente) {
      return res.status(400).json({ error: 'Chave não encontrada.' });
    }

    // Combina data e hora para criar um objeto Date
    //const dataHoraEmprestimo = new Date(`${dataEmprestimo}T${horaEmprestimo}`);

    // Validação da data e hora (opcional, mas recomendado)
    //if (dataHoraEmprestimo < new Date()) {
    //  return res.status(400).json({ error: 'Data e hora do empréstimo inválidas.' });
    //}

    // Cria um novo documento na coleção "autorizacoes"
    await db.collection('autorizacoes').insertOne({
      usuario,
      tag: chave,
      //dataHoraEmprestimo,
      status: 'Pendente'
    });

    res.json({ message: 'Empréstimo autorizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao autorizar empréstimo:', error);
    res.status(500).json({ error: 'Erro no servidor ao autorizar empréstimo.' });
  }
}


async function realizarEmprestimo(req, res) {
  const { usuario, chave } = req.body;

  try {
    const db = await conectar();

    // Busca a autorização na coleção "autorizacoes"
    const autorizacao = await db.collection('autorizacoes').findOne({
      usuario,
      tag: chave,
      status: 'Pendente' // Verifica se a autorização está pendente
    });

    if (!autorizacao) {
      return res.status(400).json({ error: 'Autorização de empréstimo não encontrada ou já utilizada.' });
    }

    // Insere o empréstimo na coleção "emprestimos"
    await db.collection('emprestimos').insertOne({
      usuario,
      tag: chave,
      dataEmprestimo: new Date()
    });

    // Atualiza o status da chave para 'Emprestada' na coleção 'chaves'
    await db.collection('chaves').updateOne(
      { tag: chave },
      { $set: { status: 'Emprestada' } }
    );

    // Deleta a autorização da coleção "autorizacoes"
    await db.collection('autorizacoes').deleteOne({
      usuario: autorizacao.usuario,
      tag: autorizacao.tag,
      status: autorizacao.status
    });

    res.json({ message: 'Empréstimo registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar empréstimo:', error);
    res.status(500).json({ error: 'Erro no servidor ao registrar empréstimo.' });
  }
}




// Rota para buscar autorizações pendentes
async function buscarAutorizacoesPendentes(req, res){

  try {
      const db = await conectar();
      const autorizacoes = await db.collection('autorizacoes').find({ status: 'Pendente' }).toArray();
      res.json(autorizacoes);
    } catch (error) {
      console.error('Erro ao carregar autorizações pendentes:', error);
      res.status(500).json({ error: 'Erro ao carregar autorizações pendentes' });
    }

}
  




// Função para buscar todos os empréstimos
async function buscarEmprestimos(req, res) {
  try {
    const db = await conectar();
    const emprestimos = await db.collection('emprestimos').find().toArray();
    res.json(emprestimos);
  } catch (error) {
    console.error('Erro ao carregar empréstimos:', error);
    res.status(500).json({ error: 'Erro ao carregar empréstimos' });
  }
}

// Função para registrar a devolução de um empréstimo
async function registrarDevolucao(req, res) {
  const emprestimoId = req.params.id;

  try {
    const db = await conectar();
    const registrosCollection = db.collection('registros');
    const emprestimo = await db.collection('emprestimos').findOne({
      _id: new mongodb.ObjectId(emprestimoId)
    });

    if (!emprestimo) {
      return res.status(400).json({ error: 'Empréstimo não encontrado.' });
    }

    emprestimo.dataDevolucao = new Date();
    await registrosCollection.insertOne(emprestimo);
    await db.collection('emprestimos').deleteOne({ _id: emprestimo._id });
    await db.collection('chaves').updateOne(
      { tag: emprestimo.tag },
      { $set: { status: 'Disponível' } }
    );

    res.json({ message: 'Devolução registrada com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar devolução:', error);
    res.status(500).json({ error: 'Erro no servidor ao registrar devolução.' });
  }
}

module.exports = {
  realizarEmprestimo,
  buscarEmprestimos,
  buscarAutorizacoesPendentes,
  registrarDevolucao,
  autorizarEmprestimo
};
