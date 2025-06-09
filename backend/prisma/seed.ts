import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // Criar empresa principal
  const empresaAcex = await prisma.empresa.upsert({
    where: { cnpj: '12345678000190' },
    update: {},
    create: {
      razaoSocial: 'Acex Capital Ltda',
      nomeFantasia: 'Grupo Acex Capital',
      cnpj: '12345678000190',
      inscEstadual: '123456789',
      endereco: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      telefone: '(11) 3333-4444',
      email: 'contato@acexcapital.com.br',
      website: 'https://www.acexcapital.com.br',
      matriz: true,
      ativa: true,
    },
  });

  console.log('Empresa principal criada:', empresaAcex.id);

  // Criar perfis de usuários
  const perfilAdmin = await prisma.perfil.upsert({
    where: { nome: 'Administrador' },
    update: {},
    create: {
      nome: 'Administrador',
      descricao: 'Acesso completo ao sistema',
    },
  });

  const perfilGerente = await prisma.perfil.upsert({
    where: { nome: 'Gerente' },
    update: {},
    create: {
      nome: 'Gerente',
      descricao: 'Acesso de gerenciamento',
    },
  });

  const perfilOperador = await prisma.perfil.upsert({
    where: { nome: 'Operador' },
    update: {},
    create: {
      nome: 'Operador',
      descricao: 'Acesso operacional básico',
    },
  });

  console.log('Perfis criados:', { admin: perfilAdmin.id, gerente: perfilGerente.id, operador: perfilOperador.id });

  // Criar permissões
  const permissoes = [
    { codigo: 'usuario.criar', descricao: 'Criar usuário' },
    { codigo: 'usuario.editar', descricao: 'Editar usuário' },
    { codigo: 'usuario.visualizar', descricao: 'Visualizar usuário' },
    { codigo: 'usuario.excluir', descricao: 'Excluir usuário' },
    
    { codigo: 'financeiro.criar', descricao: 'Criar movimentos financeiros' },
    { codigo: 'financeiro.editar', descricao: 'Editar movimentos financeiros' },
    { codigo: 'financeiro.visualizar', descricao: 'Visualizar movimentos financeiros' },
    { codigo: 'financeiro.excluir', descricao: 'Excluir movimentos financeiros' },
    
    { codigo: 'ceac.criar', descricao: 'Criar lotes de gado' },
    { codigo: 'ceac.editar', descricao: 'Editar lotes de gado' },
    { codigo: 'ceac.visualizar', descricao: 'Visualizar lotes de gado' },
    { codigo: 'ceac.excluir', descricao: 'Excluir lotes de gado' },
    
    { codigo: 'b3x.criar', descricao: 'Criar serviços B3X' },
    { codigo: 'b3x.editar', descricao: 'Editar serviços B3X' },
    { codigo: 'b3x.visualizar', descricao: 'Visualizar serviços B3X' },
    { codigo: 'b3x.excluir', descricao: 'Excluir serviços B3X' },
    
    { codigo: 'documento.criar', descricao: 'Criar documentos' },
    { codigo: 'documento.editar', descricao: 'Editar documentos' },
    { codigo: 'documento.visualizar', descricao: 'Visualizar documentos' },
    { codigo: 'documento.excluir', descricao: 'Excluir documentos' },
    
    { codigo: 'relatorio.gerar', descricao: 'Gerar relatórios' },
  ];

  for (const permissao of permissoes) {
    await prisma.permissao.upsert({
      where: { codigo: permissao.codigo },
      update: {},
      create: permissao,
    });
  }

  console.log('Permissões criadas');

  // Atribuir permissões aos perfis
  // Administrador tem todas as permissões
  for (const permissao of permissoes) {
    await prisma.perfil.update({
      where: { id: perfilAdmin.id },
      data: {
        permissoes: {
          connect: { codigo: permissao.codigo },
        },
      },
    });
  }

  // Gerente tem permissões de visualização e edição, mas não de exclusão
  const permissoesGerente = permissoes.filter(p => !p.codigo.includes('excluir'));
  for (const permissao of permissoesGerente) {
    await prisma.perfil.update({
      where: { id: perfilGerente.id },
      data: {
        permissoes: {
          connect: { codigo: permissao.codigo },
        },
      },
    });
  }

  // Operador tem apenas permissões de visualização e algumas de criação
  const permissoesOperador = permissoes.filter(p => 
    p.codigo.includes('visualizar') || 
    p.codigo === 'ceac.criar' || 
    p.codigo === 'documento.criar'
  );
  for (const permissao of permissoesOperador) {
    await prisma.perfil.update({
      where: { id: perfilOperador.id },
      data: {
        permissoes: {
          connect: { codigo: permissao.codigo },
        },
      },
    });
  }

  console.log('Permissões atribuídas aos perfis');

  // Criar usuário administrador
  const senhaAdmin = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@acexcapital.com.br' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@acexcapital.com.br',
      senha: senhaAdmin,
      ativo: true,
      cargo: 'Administrador do Sistema',
      departamento: 'TI',
      perfilId: perfilAdmin.id,
      empresaId: empresaAcex.id,
    },
  });

  console.log('Usuário administrador criado:', admin.id);

  // Criar plano de contas básico
  const planoContas = [
    // Ativos
    { codigo: '1', descricao: 'ATIVO', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: false },
    { codigo: '1.1', descricao: 'ATIVO CIRCULANTE', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: false, contaPaiCodigo: '1' },
    { codigo: '1.1.1', descricao: 'DISPONÍVEL', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: false, contaPaiCodigo: '1.1' },
    { codigo: '1.1.1.1', descricao: 'CAIXA', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '1.1.1' },
    { codigo: '1.1.1.2', descricao: 'BANCOS CONTA MOVIMENTO', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '1.1.1' },
    { codigo: '1.1.1.3', descricao: 'APLICAÇÕES FINANCEIRAS', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '1.1.1' },
    { codigo: '1.1.2', descricao: 'CRÉDITOS', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: false, contaPaiCodigo: '1.1' },
    { codigo: '1.1.2.1', descricao: 'CLIENTES', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '1.1.2' },
    { codigo: '1.1.2.2', descricao: 'ADIANTAMENTOS', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '1.1.2' },
    { codigo: '1.1.3', descricao: 'ESTOQUES', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: false, contaPaiCodigo: '1.1' },
    { codigo: '1.1.3.1', descricao: 'GADO PARA REVENDA', tipo: 'ATIVO', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '1.1.3' },
    
    // Passivos
    { codigo: '2', descricao: 'PASSIVO', tipo: 'PASSIVO', natureza: 'CREDORA', analitica: false },
    { codigo: '2.1', descricao: 'PASSIVO CIRCULANTE', tipo: 'PASSIVO', natureza: 'CREDORA', analitica: false, contaPaiCodigo: '2' },
    { codigo: '2.1.1', descricao: 'FORNECEDORES', tipo: 'PASSIVO', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '2.1' },
    { codigo: '2.1.2', descricao: 'OBRIGAÇÕES TRABALHISTAS', tipo: 'PASSIVO', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '2.1' },
    { codigo: '2.1.3', descricao: 'OBRIGAÇÕES FISCAIS', tipo: 'PASSIVO', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '2.1' },
    { codigo: '2.1.4', descricao: 'EMPRÉSTIMOS E FINANCIAMENTOS', tipo: 'PASSIVO', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '2.1' },
    
    // Receitas
    { codigo: '3', descricao: 'RECEITAS', tipo: 'RECEITA', natureza: 'CREDORA', analitica: false },
    { codigo: '3.1', descricao: 'RECEITAS OPERACIONAIS', tipo: 'RECEITA', natureza: 'CREDORA', analitica: false, contaPaiCodigo: '3' },
    { codigo: '3.1.1', descricao: 'VENDA DE GADO', tipo: 'RECEITA', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '3.1' },
    { codigo: '3.1.2', descricao: 'SERVIÇOS DE ASSESSORIA', tipo: 'RECEITA', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '3.1' },
    { codigo: '3.1.3', descricao: 'SERVIÇOS FINANCEIROS', tipo: 'RECEITA', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '3.1' },
    { codigo: '3.2', descricao: 'RECEITAS FINANCEIRAS', tipo: 'RECEITA', natureza: 'CREDORA', analitica: false, contaPaiCodigo: '3' },
    { codigo: '3.2.1', descricao: 'RENDIMENTOS DE APLICAÇÕES', tipo: 'RECEITA', natureza: 'CREDORA', analitica: true, contaPaiCodigo: '3.2' },
    
    // Despesas
    { codigo: '4', descricao: 'DESPESAS', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: false },
    { codigo: '4.1', descricao: 'DESPESAS OPERACIONAIS', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: false, contaPaiCodigo: '4' },
    { codigo: '4.1.1', descricao: 'CUSTO DE GADO VENDIDO', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '4.1' },
    { codigo: '4.1.2', descricao: 'DESPESAS COM PESSOAL', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '4.1' },
    { codigo: '4.1.3', descricao: 'DESPESAS ADMINISTRATIVAS', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '4.1' },
    { codigo: '4.2', descricao: 'DESPESAS FINANCEIRAS', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: false, contaPaiCodigo: '4' },
    { codigo: '4.2.1', descricao: 'JUROS PASSIVOS', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '4.2' },
    { codigo: '4.2.2', descricao: 'DESPESAS BANCÁRIAS', tipo: 'DESPESA', natureza: 'DEVEDORA', analitica: true, contaPaiCodigo: '4.2' },
  ];

  // Primeiro criar contas sem pais
  for (const conta of planoContas.filter(c => !c.contaPaiCodigo)) {
    await prisma.planoContas.upsert({
      where: { codigo: conta.codigo },
      update: {},
      create: {
        codigo: conta.codigo,
        descricao: conta.descricao,
        tipo: conta.tipo,
        natureza: conta.natureza,
        analitica: conta.analitica,
      },
    });
  }

  // Depois criar contas com pais (em ordem)
  const contasCriadasMap = {};
  
  // Processar níveis sequencialmente para garantir que as contas pai existam
  const niveis = [1, 2, 3, 4, 5]; // Até 5 níveis de profundidade
  
  for (const nivel of niveis) {
    for (const conta of planoContas.filter(c => c.contaPaiCodigo && c.codigo.split('.').length === nivel)) {
      // Buscar conta pai pelo código
      const contaPai = await prisma.planoContas.findUnique({
        where: { codigo: conta.contaPaiCodigo },
      });
      
      if (contaPai) {
        const contaCriada = await prisma.planoContas.upsert({
          where: { codigo: conta.codigo },
          update: {},
          create: {
            codigo: conta.codigo,
            descricao: conta.descricao,
            tipo: conta.tipo,
            natureza: conta.natureza,
            analitica: conta.analitica,
            contaPaiId: contaPai.id,
          },
        });
        
        contasCriadasMap[conta.codigo] = contaCriada;
      }
    }
  }

  console.log('Plano de contas criado');

  // Criar centros de custo
  const centrosCusto = [
    { codigo: 'ADM', descricao: 'Administrativo' },
    { codigo: 'COM', descricao: 'Comercial' },
    { codigo: 'CEAC', descricao: 'Operações CEAC' },
    { codigo: 'B3X', descricao: 'Serviços B3X Hub' },
    { codigo: 'FIN', descricao: 'Financeiro' },
  ];

  for (const centro of centrosCusto) {
    await prisma.centroCusto.upsert({
      where: { codigo: centro.codigo },
      update: {},
      create: {
        codigo: centro.codigo,
        descricao: centro.descricao,
        empresaId: empresaAcex.id,
      },
    });
  }

  console.log('Centros de custo criados');

  // Criar pessoas (clientes/fornecedores)
  const pessoas = [
    { 
      nome: 'João da Silva', 
      tipo: 'FISICA', 
      cpfCnpj: '123.456.789-00', 
      relacao: 'CLIENTE',
      email: 'joao.silva@exemplo.com',
      telefone: '(11) 98765-4321'
    },
    { 
      nome: 'Fazenda Boi Feliz Ltda', 
      tipo: 'JURIDICA', 
      cpfCnpj: '12.345.678/0001-90', 
      relacao: 'FORNECEDOR',
      email: 'contato@boifeliz.com.br',
      telefone: '(11) 3456-7890'
    },
    { 
      nome: 'Maria Oliveira', 
      tipo: 'FISICA', 
      cpfCnpj: '987.654.321-00', 
      relacao: 'CLIENTE',
      email: 'maria.oliveira@exemplo.com',
      telefone: '(11) 91234-5678'
    },
  ];

  for (const pessoa of pessoas) {
    const { relacao, ...pessoaData } = pessoa;
    
    const pessoaCriada = await prisma.pessoa.upsert({
      where: { cpfCnpj: pessoa.cpfCnpj },
      update: {},
      create: {
        ...pessoaData,
        ativo: true,
      },
    });
    
    /
