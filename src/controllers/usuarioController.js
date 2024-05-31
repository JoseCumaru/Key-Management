const { conectar } = require('../models/db'); 
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');

// Função para buscar todos os usuários
async function buscarUsuarios(req, res) {
  try {
    const db = await conectar();
    const usuarios = await db.collection('usuarios').find().toArray();
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
}

// Função para cadastrar um novo usuário
async function cadastrarUsuario(req, res) {
  const { usuario, senha, cpf, email, tipo } = req.body;

  try {
    const db = await conectar();

    // Verifica se o usuário já existe em qualquer coleção
    const usuarioExistente = await db.collection('usuarios').findOne({ usuario }) || await db.collection('externos').findOne({ usuario });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Usuário já existe!' });
    }

    // Criptografa a senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Determina a coleção correta com base no tipo de usuário
    const colecao = tipo === 'Externo' ? 'Externos' : 'usuarios';

    // Insere o novo usuário na coleção correta
    const result = await db.collection(colecao).insertOne({
      usuario,
      senha: senhaHash,
      cpf,
      email,
      tipo
    });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      usuario: {
        _id: result.insertedId,
        usuario,
        tipo
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
}

// Função para atualizar um usuário existente
async function atualizarUsuario(req, res) {
  const usuarioId = req.params.id;
  const { usuario, senha, cpf, email, tipo } = req.body;

  try {
    const db = await conectar();
    const result = await db.collection('usuarios').updateOne(
      { _id: new mongodb.ObjectId(usuarioId) },
      { $set: { usuario, senha, cpf, email, tipo } }
    );

    if (result.modifiedCount === 1) {
      res.json({ message: 'Usuário atualizado com sucesso!' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

// Função para excluir um usuário
async function excluirUsuario(req, res) {
  const usuarioId = req.params.id;

  try {
    const db = await conectar();
    const result = await db.collection('usuarios').deleteOne({ _id: new mongodb.ObjectId(usuarioId) });

    if (result.deletedCount === 1) {
      res.json({ message: 'Usuário excluído com sucesso!' });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
}

module.exports = {
  buscarUsuarios,
  cadastrarUsuario,
  atualizarUsuario,
  excluirUsuario
};
