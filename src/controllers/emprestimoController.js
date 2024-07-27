const { conectar } = require('../models/db'); 
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');


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
  const { matricula, senha, usuario, chave } = req.body;

  console.log('Dados recebidos:', { matricula, senha, usuario, chave });

  try {
    const db = await conectar();
    console.log('Conectado ao banco de dados');

    const usuarioExistente = await db.collection('externos').findOne({ matricula });

    if (!usuarioExistente) {
      console.log('Usuário não encontrado:', matricula);
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuarioExistente.senha);
    if (!senhaValida) {
      console.log('Senha incorreta para o usuário:', usuario);
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // Insere o empréstimo na coleção "emprestimos"
    await db.collection('emprestimos').insertOne({
      usuario,
      matricula: matricula,
      tag: chave,
      dataEmprestimo: new Date()
    });
    console.log('Empréstimo registrado com sucesso');

    // Atualiza o status da chave para 'Emprestada' na coleção 'chaves'
    await db.collection('chaves').updateOne(
      { tag: chave },
      { $set: { status: 'Emprestada' } }
    );
    console.log('Status da chave atualizado para Emprestada');

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
/*async function registrarDevolucao(req, res) {
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
}*/

async function registrarDevolucao(req, res) {
  const { senha, chave, matricula } = req.body;

  try {
    const db = await conectar();

    const usuarioExistente = await db.collection('externos').findOne({ matricula });
    if (!usuarioExistente) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuarioExistente.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const emprestimo = await db.collection('emprestimos').findOne({ tag: chave });
    if (!emprestimo) {
      return res.status(404).json({ error: 'Empréstimo não encontrado.' });
    }

    emprestimo.dataDevolucao = new Date();
    await db.collection('registros').insertOne(emprestimo);
    await db.collection('emprestimos').deleteOne({ _id: emprestimo._id });
    await db.collection('chaves').updateOne(
      { tag: chave },
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
