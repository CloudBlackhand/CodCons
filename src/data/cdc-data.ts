export interface CDCArticle {
  id: string;
  numero: number;
  titulo: string;
  capitulo: string;
  secao?: string;
  texto: string;
  paragrafos?: string[];
  incisos?: string[];
}

export const cdcData: CDCArticle[] = [
  {
    id: 'art1',
    numero: 1,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO I - Disposições Gerais',
    texto: 'O presente código estabelece normas de proteção e defesa do consumidor, de ordem pública e interesse social.',
    paragrafos: [],
    incisos: []
  },
  {
    id: 'art2',
    numero: 2,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO I - Disposições Gerais',
    texto: 'Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final.',
    paragrafos: ['Parágrafo único. Equipara-se a consumidor a coletividade de pessoas, ainda que indetermináveis, que haja intervindo nas relações de consumo.'],
    incisos: []
  },
  {
    id: 'art3',
    numero: 3,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO I - Disposições Gerais',
    texto: 'Fornecedor é toda pessoa física ou jurídica, pública ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividade de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.',
    paragrafos: [
      '§ 1º Produto é qualquer bem, móvel ou imóvel, material ou imaterial.',
      '§ 2º Serviço é qualquer atividade fornecida no mercado de consumo, mediante remuneração, inclusive as de natureza bancária, financeira, de crédito e securitária.'
    ],
    incisos: []
  },
  {
    id: 'art6',
    numero: 6,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO II - Dos Direitos Básicos',
    texto: 'São direitos básicos do consumidor:',
    paragrafos: [],
    incisos: [
      'I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços',
      'II - a educação e divulgação sobre o consumo adequado dos produtos e serviços',
      'III - a informação adequada e clara sobre os diferentes produtos e serviços',
      'IV - a proteção contra a publicidade enganosa e abusiva',
      'V - a modificação das cláusulas contratuais que estabeleçam prestações desproporcionais',
      'VI - a efetiva prevenção e reparação de danos patrimoniais e morais'
    ]
  },
  {
    id: 'art18',
    numero: 18,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO III - Qualidade e Vícios',
    texto: 'Os fornecedores de produtos de consumo duráveis ou não duráveis respondem solidariamente pelos vícios de qualidade que os tornem impróprios ou inadequados ao consumo.',
    paragrafos: [
      '§ 1º Não sendo o vício sanado no prazo máximo de trinta dias, pode o consumidor exigir, alternativamente: a substituição do produto, a restituição da quantia paga ou o abatimento proporcional do preço.'
    ],
    incisos: []
  },
  {
    id: 'art39',
    numero: 39,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO IV - Práticas Abusivas',
    texto: 'É vedado ao fornecedor de produtos ou serviços, dentre outras práticas abusivas:',
    paragrafos: [],
    incisos: [
      'I - condicionar o fornecimento de produto ou de serviço ao fornecimento de outro produto ou serviço',
      'II - recusar atendimento às demandas dos consumidores',
      'III - enviar ou entregar ao consumidor, sem solicitação prévia, qualquer produto',
      'IV - prevalecer-se da fraqueza ou ignorância do consumidor',
      'V - exigir do consumidor vantagem manifestamente excessiva'
    ]
  },
  {
    id: 'art49',
    numero: 49,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO V - Práticas Comerciais',
    texto: 'O consumidor pode desistir do contrato, no prazo de 7 dias a contar de sua assinatura ou do ato de recebimento do produto ou serviço.',
    paragrafos: ['Parágrafo único. Se o consumidor exercitar o direito de arrependimento, os valores pagos serão devolvidos, de imediato, monetariamente atualizados.'],
    incisos: []
  },
  {
    id: 'art51',
    numero: 51,
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulo: 'CAPÍTULO VI - Proteção Contratual',
    texto: 'São nulas de pleno direito as cláusulas contratuais que impossibilitem, exonerem ou atenuem a responsabilidade do fornecedor por vícios.',
    paragrafos: [],
    incisos: []
  }
];

export const cdcTitulos = [
  {
    titulo: 'TÍTULO I - Dos Direitos do Consumidor',
    capitulos: [
      'CAPÍTULO I - Disposições Gerais',
      'CAPÍTULO II - Dos Direitos Básicos',
      'CAPÍTULO III - Qualidade e Vícios',
      'CAPÍTULO IV - Práticas Abusivas',
      'CAPÍTULO V - Práticas Comerciais',
      'CAPÍTULO VI - Proteção Contratual'
    ]
  }
];

