const express = require('express');
const cors = require('cors');
const { conectar } = require('./src/models/db');
const mongodb = require('mongodb');
const chaveController = require('./src/controllers/chaveController');
const usuarioController = require('./src/controllers/usuarioController');
const emprestimoController = require('./src/controllers/emprestimoController');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
const authController = require('./src/controllers/authController'); // Novo controlador para autenticação
=======
const authController = require('./src/controllers/authController');
>>>>>>> Stashed changes
=======
const authController = require('./src/controllers/authController');
>>>>>>> Stashed changes

const app = express();
const port = 3000;
app.use(express.json());

app.use(cors({
  origin: 'http://127.0.0.1:5500', // front
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
}));


<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Rota para login (movida para o controlador)
=======
// Rota para login 
>>>>>>> Stashed changes
=======
// Rota para login 
>>>>>>> Stashed changes
app.post('/login', authController.login);

// Rotas para chaves
app.get('/chaves', chaveController.buscarChaves);
app.get('/chaves-disponiveis', chaveController.buscarChavesDisponiveis);
app.post('/chaves', chaveController.cadastrarChave);
app.put('/chaves/:id', chaveController.atualizarChave);
app.delete('/chaves/:id', chaveController.excluirChave);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// Rotas para usuários
app.get('/usuarios', usuarioController.buscarUsuarios);
=======
=======
>>>>>>> Stashed changes

// Rotas para usuários
app.get('/usuarios', usuarioController.buscarUsuarios);
app.get('/usuarios/:id', usuarioController.buscarUsuario);
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
app.post('/cadastrarUsuario', usuarioController.cadastrarUsuario);
app.put('/usuarios/:id', usuarioController.atualizarUsuario);
app.delete('/usuarios/:id', usuarioController.excluirUsuario);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
=======

>>>>>>> Stashed changes
// Rotas para empréstimos
app.post('/emprestimo', emprestimoController.registrarEmprestimo);
app.get('/emprestimos', emprestimoController.buscarEmprestimos);
app.post('/devolucao/:id', emprestimoController.registrarDevolucao);



//Rota para buscar hitorico
app.get('/historico', async (req, res) => {
  try {
    const db = await conectar();
    const responsavel = req.query.responsavel;
    const dataInicio = req.query.dataInicio;
    const dataFim = req.query.dataFim;
    const pagina = parseInt(req.query.pagina) || 1; // Número da página (padrão: 1)
    const limite = parseInt(req.query.limite) || 6; // Itens por página (padrão: 10)

    let query = {};

    if (responsavel) {
      query.usuario = { $regex: responsavel, $options: 'i' }; // Busca por correspondência parcial e ignora maiúsculas/minúsculas
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
