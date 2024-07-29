const { conectar } = require('../models/db');
const mongodb = require('mongodb');



// Função para buscar autorizações ativas para o guardinha logado
async function buscarAutorizacoesGuardinha(req, res) {
  try {
    const db = await conectar();
    const guardinhaId = req.user.id; // ID do guardinha obtido do token JWT

    // Buscar autorizações ativas para qualquer guardinha (status: "ativa" e dataFim ainda não atingida)
    const autorizacoes = await db.collection('autorizacoes').aggregate([
      {
        $lookup: { // Junta as informações do usuário externo
          from: 'externos',
          localField: 'usuarioId',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      { $unwind: '$usuario' }, // Desmembra o array 'usuario' para ter acesso direto aos campos
      {
        $lookup: { // Junta as informações da chave
          from: 'chaves',
          localField: 'chaveId',
          foreignField: '_id',
          as: 'chave'
        }
      },
      { $unwind: '$chave' },
      {
        $match: { // Filtra as autorizações ativas
          status: 'ativa',
          dataFim: { $gte: new Date() }
        }
      },
      {
        $project: { // Projeta os campos que serão retornados
          _id: 1,
          usuario: {
            _id: '$usuario._id',
            usuario: '$usuario.usuario',
            cpf: '$usuario.cpf',
            email: '$usuario.email'
          },
          chave: {
            _id: '$chave._id',
            tag: '$chave.tag',
            descricao: '$chave.descricao'
          },
          dataInicio: 1,
          dataFim: 1
        }
      }
    ]).toArray();

    res.json(autorizacoes);
  } catch (error) {
    console.error('Erro ao buscar autorizações:', error);
    res.status(500).json({ error: 'Erro ao buscar autorizações' });
  }
}

module.exports = {
  autorizarEmprestimo,
  buscarAutorizacoesGuardinha
};
