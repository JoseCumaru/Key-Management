const { conectar } = require('../models/db'); 
const mongodb = require('mongodb');

// Função para registrar um novo empréstimo
async function registrarEmprestimo(req, res) {
  const { usuario, chave } = req.body;

  try {
    const db = await conectar();
    
    //const usuarioExiste = await db.collection('usuarios').findOne({ usuario });

    const usuarioExistente = await db.collection('usuarios').findOne({ usuario }) || await db.collection('externos').findOne({ usuario });

    if (!usuarioExistente) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }

    const chaveExiste = await db.collection('chaves').findOne({ tag: chave });

    if (!chaveExiste || chaveExiste.status !== 'Disponível') {
      return res.status(400).json({ error: 'Chave não disponível para empréstimo.' });
    }

    await db.collection('emprestimos').insertOne({
      usuario,
      tag: chave,
      dataEmprestimo: new Date()
    });

    await db.collection('chaves').updateOne({ tag: chave }, { $set: { status: 'Emprestada' } });

    res.json({ message: 'Empréstimo registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar empréstimo:', error);
    res.status(500).json({ error: 'Erro no servidor ao registrar empréstimo.' });
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
  registrarEmprestimo,
  buscarEmprestimos,
  registrarDevolucao
};
