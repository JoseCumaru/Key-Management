const { conectar } = require('../models/db'); 
const mongodb = require('mongodb');

// Função para buscar todas as chaves
async function buscarChaves(req, res) {
  try {
    const db = await conectar();
    const chaves = await db.collection('chaves').find().toArray();
    res.json(chaves);
  } catch (error) {
    console.error('Erro ao carregar chaves:', error);
    res.status(500).json({ error: 'Erro ao carregar chaves' });
  }
}

// Função para buscar chaves disponíveis (status: "Disponível")
async function buscarChavesDisponiveis(req, res) {
  try {
    const db = await conectar();
    const chaves = await db.collection('chaves').find({ status: 'Disponível' }).toArray();
    res.json(chaves);
  } catch (error) {
    console.error('Erro ao carregar chaves disponíveis:', error);
    res.status(500).json({ error: 'Erro ao carregar chaves disponíveis' });
  }
}

// Função para cadastrar uma nova chave
async function cadastrarChave(req, res) {
  const { tag, descricao } = req.body;

  try {
    const db = await conectar();
    const chaveExistente = await db.collection('chaves').findOne({ tag });

    if (chaveExistente) {
      return res.status(400).json({ error: 'Chave já existe!' });
    }

    const result = await db.collection('chaves').insertOne({ tag, descricao, status: 'Disponível' });

    res.status(201).json({
      message: 'Chave cadastrada com sucesso!',
      chave: {
        _id: result.insertedId,
        tag,
        descricao,
        status: 'Disponível'
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar chave:', error);
    res.status(500).json({ error: 'Erro ao cadastrar chave' });
  }
}

// Função para atualizar uma chave existente
async function atualizarChave(req, res) {
  const chaveId = req.params.id;
  const { tag, descricao, status } = req.body;

  try {
    const db = await conectar();
    const result = await db.collection('chaves').updateOne(
      { _id: new mongodb.ObjectId(chaveId) },
      { $set: { tag, descricao, status } }
    );

    if (result.modifiedCount === 1) {
      res.json({ message: 'Chave atualizada com sucesso!' });
    } else {
      res.status(404).json({ error: 'Chave não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar chave:', error);
    res.status(500).json({ error: 'Erro ao atualizar chave' });
  }
}

// Função para excluir uma chave
async function excluirChave(req, res) {
  const chaveId = req.params.id;

  try {
    const db = await conectar();
    const result = await db.collection('chaves').deleteOne({ _id: new mongodb.ObjectId(chaveId) });

    if (result.deletedCount === 1) {
      res.json({ message: 'Chave excluída com sucesso!' });
    } else {
      res.status(404).json({ error: 'Chave não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao excluir chave:', error);
    res.status(500).json({ error: 'Erro ao excluir chave' });
  }
}

module.exports = {
  buscarChaves,
  buscarChavesDisponiveis,
  cadastrarChave,
  atualizarChave,
  excluirChave
};
