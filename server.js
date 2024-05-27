const express = require('express');
const cors = require('cors');
const { conectar } = require('./static/js/db'); 
const mongodb = require('mongodb');

const app = express();
const port = 3000; 

app.use(cors({
  origin: 'http://127.0.0.1:5500' 
}));

app.use(express.json());

// Rota para buscar as chaves
app.get('/chaves', async (req, res) => {
  try {
    const db = await conectar();
    const chaves = await db.collection('chaves').find().toArray();
    res.json(chaves);
  } catch (error) {
    console.error('Erro ao carregar chaves:', error);
    res.status(500).json({ error: 'Erro ao carregar chaves' });
  }
});


app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const db = await conectar();
    const usuarioDB = await db.collection('usuarios').findOne({ usuario, senha });
    if (usuarioDB) {
      res.json({ 
        message: 'Login realizado com sucesso!', 
        token: 'token_temporario_inseguro',
        tipo: usuarioDB.tipo
      }); 
    } else {
      res.status(401).json({ error: 'Usuário ou senha incorretos' });
     
    }
  } catch (error) {
    console.error('Erro durante o login:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});



// Rota para buscar os usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const db = await conectar();
    const usuarios = await db.collection('usuarios').find().toArray();
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao carregar usuarios:', error);
    res.status(500).json({ error: 'Erro ao carregar usuarios' });
  }
});

// Rota para cadastrar usuário
app.post('/cadastrarUsuario', async (req, res) => {
  const { usuario, senha, cpf, email, tipo } = req.body;

  try {
    const db = await conectar();
    // Verifica se o usuário já existe
    const usuarioExistente = await db.collection('usuarios').findOne({ usuario });

    if (usuarioExistente) {
      return res.status(400).json({ error: 'Usuário já existe!' });
    }

    // Insere o novo usuário
    const result = await db.collection('usuarios').insertOne({ usuario, senha, cpf, email, tipo });

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
});




// Rota para excluir um usuário
app.delete('/usuarios/:id', async (req, res) => {
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
});

app.get('/chaves-disponiveis', async (req, res) => {
  try {
    const db = await conectar();
    const chaves = await db.collection('chaves').find({ status: 'Disponível' }).toArray();
    res.json(chaves);
  } catch (error) {
    console.error('Erro ao carregar chaves disponíveis:', error);
    res.status(500).json({ error: 'Erro ao carregar chaves disponíveis' });
  }
});


// Rota para realizar empréstimo
app.post('/emprestimo', async (req, res) => {
  const { usuario, chave } = req.body;

  try {
    // 1. Verificar se o usuário existe
    const db = await conectar();
    const usuarioExiste = await db.collection('usuarios').findOne({ usuario: usuario });

    if (!usuarioExiste) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }

    // 4. Registrar o empréstimo (adicionar lógica para data e hora)
    await db.collection('emprestimos').insertOne({
      usuario: usuario,
      tag: chave,
      dataEmprestimo: new Date() 
      // Adicione campos para data de devolução, etc.
    });

    // 5. Atualizar o status da chave para 'Emprestada'
    await db.collection('chaves').updateOne({ tag: chave }, { $set: { status: 'Emprestada' } });

    res.json({ message: 'Empréstimo registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar empréstimo:', error);
    res.status(500).json({ error: 'Erro no servidor ao registrar empréstimo.' });
  }
});


app.get('/emprestimos', async (req, res) => {
  try {
    const db = await conectar();
    const emprestimos = await db.collection('emprestimos').find().toArray();
    res.json(emprestimos);
  } catch (error) {
    console.error('Erro ao carregar empréstimos:', error);
    res.status(500).json({ error: 'Erro ao carregar empréstimos' });
  }
});



app.post('/devolucao/:id', async (req, res) => {
  const emprestimoId = req.params.id;

  try {
    const db = await conectar();

    // 1. Verifique se a coleção "registros" existe e crie-a se necessário
    const registrosCollection = db.collection('registros');

    // 2. Encontre o empréstimo
    const emprestimo = await db.collection('emprestimos').findOne({ 
      _id: new mongodb.ObjectId(emprestimoId) 
    });

    if (!emprestimo) {
      return res.status(400).json({ error: 'Empréstimo não encontrado.' });
    }

    // 3. Adicione a data de devolução ao objeto do empréstimo
    emprestimo.dataDevolucao = new Date(); // Adicione o campo dataDevolucao com a data atual

    // 4. Insira o empréstimo na coleção "registros"
    await registrosCollection.insertOne(emprestimo);

    // 5. Remova o empréstimo da coleção "emprestimos"
    await db.collection('emprestimos').deleteOne({ _id: emprestimo._id });

    // 6. Atualize o status da chave
    await db.collection('chaves').updateOne(
      { tag: emprestimo.tag }, 
      { $set: { status: 'Disponível' } }
    );

    res.json({ message: 'Devolução registrada com sucesso!' });

  } catch (error) {
    console.error('Erro ao registrar devolução:', error);
    res.status(500).json({ error: 'Erro no servidor ao registrar devolução.' });
  }
});


// Rota para buscar o histórico de empréstimos
app.get('/historico', async (req, res) => {
  try {
    const db = await conectar();
    const responsavel = req.query.responsavel;
    const dataInicio = req.query.dataInicio;
    const dataFim = req.query.dataFim;

    let query = {}; 

    if (responsavel) {
      query.responsavel = responsavel; 
    }

    if (dataInicio) {
      query.dataEmprestimo = { $gte: new Date(dataInicio) };
    }

    if (dataFim) {
      query.dataEmprestimo = { $lte: new Date(dataFim) };
    }

    const registros = await db.collection('registros').find(query).toArray();
    res.json(registros); 
  } catch (error) {
    console.error('Erro ao carregar histórico de empréstimos:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico de empréstimos' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});