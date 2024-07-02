const express = require('express');
const cors = require('cors');
const { conectar } = require('./src/models/db');
const chaveController = require('./src/controllers/chaveController');
const usuarioController = require('./src/controllers/usuarioController');
const emprestimoController = require('./src/controllers/emprestimoController');
const authController = require('./src/controllers/authController');

const app = express();
const port = 3000;
app.use(express.json());

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.post('/login', authController.login);

// Rotas para chaves
app.get('/chaves', chaveController.buscarChaves);
app.get('/chaves-disponiveis', chaveController.buscarChavesDisponiveis);
app.post('/chaves', chaveController.cadastrarChave);
app.put('/chaves/:id', chaveController.atualizarChave);
app.delete('/chaves/:id', chaveController.excluirChave);

// Rotas para usuários
app.get('/usuarios', usuarioController.buscarUsuarios);
app.get('/usuarios/:id', usuarioController.buscarUsuario);
app.post('/cadastrarUsuario', usuarioController.cadastrarUsuario);
app.put('/usuarios/:id', usuarioController.atualizarUsuario);
app.delete('/usuarios/:id', usuarioController.excluirUsuario);

// Rotas para empréstimos
app.post('/autorizarEmprestimo', emprestimoController.autorizarEmprestimo);
app.post('/realizarEmprestimo', emprestimoController.realizarEmprestimo);
app.get('/autorizacoesPendentes', emprestimoController.buscarAutorizacoesPendentes);
app.get('/emprestimos', emprestimoController.buscarEmprestimos);
app.post('/devolucao/:id', emprestimoController.registrarDevolucao);

// Rota para buscar histórico de empréstimos
app.get('/historico', async (req, res) => {
  try {
    const db = await conectar();
    const responsavel = req.query.responsavel;
    const dataInicio = req.query.dataInicio;
    const dataFim = req.query.dataFim;
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 6;

    let query = {};

    if (responsavel) {
      query.usuario = { $regex: responsavel, $options: 'i' };
    }

    if (dataInicio) {
      query.dataEmprestimo = { $gte: new Date(dataInicio) };
    }

    if (dataFim) {
      query.dataDevolucao = { $lte: new Date(dataFim) };
    }

    const totalRegistros = await db.collection('registros').countDocuments(query);
    const totalPaginas = Math.ceil(totalRegistros / limite);

    const registros = await db.collection('registros')
      .find(query)
      .skip((pagina - 1) * limite)
      .limit(limite)
      .toArray();

    res.json({
      registros,
      paginaAtual: pagina,
      totalPaginas
    });
  } catch (error) {
    console.error('Erro ao carregar histórico de empréstimos:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico de empréstimos' });
  }
});



app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
