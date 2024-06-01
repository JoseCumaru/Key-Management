const { conectar } = require('../models/db');
const mongodb = require('mongodb');
const bcrypt = require('bcrypt');

// Função para buscar todos os usuários
async function buscarUsuarios(req, res) {
  try {
    const db = await conectar();

    // Buscar usuários da coleção 'usuarios'
    const usuariosInternos = await db.collection('usuarios').find().toArray();

    // Buscar usuários da coleção 'externos'
    const usuariosExternos = await db.collection('externos').find().toArray();

    // Combinar os resultados
    const todosUsuarios = usuariosInternos.concat(usuariosExternos);

    res.json(todosUsuarios);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
}

async function buscarUsuario(req, res) {
  const usuarioId = req.params.id;
  const colecao = req.query.colecao;

  try {
    const db = await conectar();
    const usuario = await db.collection(colecao).findOne({ _id: new mongodb.ObjectId(usuarioId) });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
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
    const colecao = tipo === 'Externo' ? 'externos' : 'usuarios';

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
  const colecao = req.query.colecao;
  const { usuario, senha, cpf, email, tipo } = req.body;

  try {
    const db = await conectar();
    
    const updateData = { usuario, cpf, email, tipo };
    if (senha) {
      // Criptografa a nova senha
      const saltRounds = 10;
      updateData.senha = await bcrypt.hash(senha, saltRounds);
    }

    const result = await db.collection(colecao).updateOne(
      { _id: new mongodb.ObjectId(usuarioId) },
      { $set: updateData }
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
  const colecao = req.query.colecao;

  try {
    const db = await conectar();
    const result = await db.collection(colecao).deleteOne({ _id: new mongodb.ObjectId(usuarioId) });

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
  excluirUsuario,
  buscarUsuario
};
