const { conectar } = require('../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { usuario, senha } = req.body;

  try {
    const db = await conectar();
    const usuarioDB = await db.collection('usuarios').findOne({ usuario });

    if (!usuarioDB) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const senhaValida = await bcrypt.compare(senha, usuarioDB.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    // Geração do token JWT com informações do usuário
    const token = jwt.sign({ id: usuarioDB._id, tipo: usuarioDB.tipo }, 'chave_secreta', { expiresIn: '1h' });

    res.json({ message: 'Login realizado com sucesso!', token, tipo: usuarioDB.tipo });
  } catch (error) {
    console.error('Erro durante o login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
}

// Middleware para verificar a autenticidade do token JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do header Authorization

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, 'chave_secreta', (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; // Adiciona as informações do usuário à requisição
    next(); // Passa para o próximo middleware ou rota
  });
}

async function verificarMatricula(req, res) {
  const { matricula } = req.params;
  
  try {
    const db = await conectar();
    const usuario = await db.collection('externos').findOne({ matricula });

    if (!usuario) {
      return res.status(404).json({ error: 'Matrícula não encontrada' });
    }

    res.json({ nome: usuario.usuario });
  } catch (error) {
    console.error('Erro ao verificar matrícula:', error);
    res.status(500).json({ error: 'Erro ao verificar matrícula' });
  }
}

module.exports = {
  login,
  autenticarToken,
  verificarMatricula
};
