import { motion } from 'motion/react';
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, MessageCircle, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface BlogPostProps {
  postId: number;
  onBack: () => void;
}

const blogPostsData = [
  {
    id: 1,
    title: 'Tendências de Design Gráfico para 2026',
    excerpt: 'Descubra as principais tendências que estão moldando o futuro do design gráfico e como aplicá-las em seus projetos.',
    image: 'https://images.unsplash.com/photo-1710799885122-428e63eff691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB0cmVuZHMlMjBhcnRpY2xlfGVufDF8fHx8MTc2ODk1MzU2Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '15 Jan 2026',
    readTime: '5 min',
    category: 'Tendências',
    content: `
      <p>O mundo do design gráfico está em constante evolução, e 2026 promete trazer mudanças significativas na forma como criamos e consumimos conteúdo visual. Neste artigo, vou compartilhar as principais tendências que estou observando e aplicando em meus projetos.</p>

      <h3>1. Tipografia Experimental e Variável</h3>
      <p>As fontes variáveis estão ganhando cada vez mais espaço, permitindo ajustes dinâmicos de peso, largura e outros atributos. Isso oferece uma flexibilidade sem precedentes para criar designs únicos e responsivos.</p>

      <h3>2. Cores Vibrantes e Gradientes Ousados</h3>
      <p>2026 é o ano das cores vibrantes! Gradientes ousados e combinações de cores saturadas estão dominando o cenário do design, trazendo energia e personalidade para as marcas.</p>

      <h3>3. Elementos 3D e Glassmorphism</h3>
      <p>O uso de elementos tridimensionais e o efeito glass (vidro fosco) continuam em alta, criando profundidade e sofisticação nos designs. Essa tendência adiciona uma camada de realismo e modernidade aos projetos.</p>

      <h3>4. Minimalismo com Propósito</h3>
      <p>O minimalismo não está morto - ele está evoluindo. Agora vemos designs minimalistas que comunicam mensagens poderosas com menos elementos, focando na funcionalidade e clareza.</p>

      <h3>5. Sustentabilidade Visual</h3>
      <p>Designers estão cada vez mais conscientes do impacto ambiental. Cores terrosas, texturas naturais e mensagens eco-friendly estão se tornando parte integral da identidade visual de muitas marcas.</p>

      <h3>Conclusão</h3>
      <p>Essas tendências não são regras rígidas, mas sim ferramentas para expandir sua criatividade. O mais importante é adaptar essas ideias à identidade única de cada projeto e cliente.</p>
    `,
  },
  {
    id: 2,
    title: 'A Psicologia das Cores no Branding',
    excerpt: 'Entenda como as cores influenciam a percepção da sua marca e como escolher a paleta perfeita para seu negócio.',
    image: 'https://images.unsplash.com/photo-1616699732508-c5dd7a8f6e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvciUyMHRoZW9yeSUyMGRlc2lnbnxlbnwxfHx8fDE3Njg5Mjc5ODd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    date: '10 Jan 2026',
    readTime: '7 min',
    category: 'Design Theory',
    content: `
      <p>As cores têm um poder incrível de influenciar nossas emoções e decisões. No branding, escolher a paleta de cores certa pode ser a diferença entre uma marca memorável e uma que passa despercebida.</p>

      <h3>O Poder das Cores</h3>
      <p>Cada cor evoca emoções específicas e comunica mensagens diferentes. Entender essa psicologia é fundamental para criar uma identidade visual eficaz.</p>

      <h3>Vermelho - Energia e Paixão</h3>
      <p>O vermelho é uma cor poderosa que transmite energia, urgência e paixão. Marcas como Coca-Cola e Netflix usam o vermelho para criar impacto imediato e estimular ação.</p>

      <h3>Azul - Confiança e Profissionalismo</h3>
      <p>O azul é a cor da confiança, estabilidade e profissionalismo. Não é à toa que empresas de tecnologia e finanças frequentemente escolhem essa cor para suas marcas.</p>

      <h3>Verde - Natureza e Crescimento</h3>
      <p>O verde simboliza natureza, saúde e crescimento. É ideal para marcas sustentáveis, orgânicas ou relacionadas ao bem-estar.</p>

      <h3>Amarelo - Otimismo e Criatividade</h3>
      <p>O amarelo transmite otimismo, criatividade e alegria. Usado com moderação, pode tornar sua marca mais acessível e amigável.</p>

      <h3>Criando Sua Paleta de Cores</h3>
      <p>Ao criar uma paleta de cores para uma marca, considere:</p>
      <ul>
        <li>O público-alvo e suas preferências culturais</li>
        <li>A personalidade da marca</li>
        <li>O setor de atuação</li>
        <li>A concorrência</li>
        <li>A versatilidade em diferentes aplicações</li>
      </ul>

      <h3>Conclusão</h3>
      <p>A escolha de cores não é apenas estética - é estratégica. Uma paleta bem pensada pode fortalecer sua mensagem e criar conexões emocionais duradouras com seu público.</p>
    `,
  },
  {
    id: 3,
    title: 'Como Criar um Ambiente Criativo Produtivo',
    excerpt: 'Dicas práticas para organizar seu workspace e maximizar sua criatividade e produtividade no dia a dia.',
    image: 'https://images.unsplash.com/photo-1746440160680-2c50206e568a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGluc3BpcmF0aW9uJTIwd29ya3NwYWNlfGVufDF8fHx8MTc2ODk1MzU2N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '5 Jan 2026',
    readTime: '4 min',
    category: 'Produtividade',
    content: `
      <p>Como designer, seu ambiente de trabalho tem um impacto direto na sua criatividade e produtividade. Vou compartilhar estratégias que uso para manter meu workspace inspirador e funcional.</p>

      <h3>1. Iluminação Adequada</h3>
      <p>A iluminação natural é ideal, mas nem sempre possível. Invista em uma boa luz de mesa com temperatura ajustável - luz mais fria para trabalho detalhado e mais quente para momentos de brainstorming.</p>

      <h3>2. Organização Minimalista</h3>
      <p>Um espaço limpo = mente clara. Mantenha apenas o essencial à vista. Use organizadores, gavetas e prateleiras para manter materiais acessíveis mas não visíveis.</p>

      <h3>3. Cor e Inspiração</h3>
      <p>Escolha cores que estimulem sua criatividade. Tenho uma parede com um painel de inspirações - imagens, cores e referências que me motivam.</p>

      <h3>4. Ergonomia Primeiro</h3>
      <p>Uma cadeira confortável e uma mesa na altura certa não são luxos - são necessidades. Seu corpo precisa estar confortável para sua mente criar.</p>

      <h3>5. Zonas de Trabalho</h3>
      <p>Se possível, crie diferentes zonas:</p>
      <ul>
        <li>Zona digital (computador e tablet)</li>
        <li>Zona analógica (sketches e protótipos)</li>
        <li>Zona de descanso (para pausas criativas)</li>
      </ul>

      <h3>6. Plantas e Elementos Naturais</h3>
      <p>Plantas não apenas purificam o ar - elas trazem vida e energia ao espaço. Mesmo pequenas suculentas fazem diferença.</p>

      <h3>Conclusão</h3>
      <p>Seu workspace é uma extensão da sua criatividade. Invista tempo em criar um ambiente que reflita sua personalidade e apoie seu processo criativo.</p>
    `,
  },
  {
    id: 4,
    title: 'Minimalismo vs. Maximalismo: Qual Escolher?',
    excerpt: 'Explorando dois estilos opostos de design e quando cada um deles é mais apropriado para seu projeto.',
    image: 'https://images.unsplash.com/photo-1681694826758-5d7cec6215e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dvJTIwZGVzaWduJTIwbW9ja3VwfGVufDF8fHx8MTc2ODgzOTc2OHww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '28 Dez 2025',
    readTime: '6 min',
    category: 'Estilos',
    content: `
      <p>No design gráfico, dois estilos dominam o cenário: minimalismo e maximalismo. Mas qual escolher para seu projeto? A resposta não é tão simples quanto parece.</p>

      <h3>O Minimalismo</h3>
      <p>O minimalismo prega que "menos é mais". É sobre remover tudo que não é essencial, deixando apenas o necessário para comunicar a mensagem.</p>

      <h4>Vantagens do Minimalismo:</h4>
      <ul>
        <li>Comunicação clara e direta</li>
        <li>Atemporal e elegante</li>
        <li>Carrega rapidamente (web)</li>
        <li>Fácil de escalar e adaptar</li>
      </ul>

      <h4>Quando Usar Minimalismo:</h4>
      <ul>
        <li>Marcas premium ou de luxo</li>
        <li>Produtos tecnológicos</li>
        <li>Quando a simplicidade é parte da mensagem</li>
        <li>Públicos que valorizam sofisticação</li>
      </ul>

      <h3>O Maximalismo</h3>
      <p>O maximalismo celebra a abundância - cores vibrantes, padrões complexos, elementos sobrepostos. É ousado, energético e impossível de ignorar.</p>

      <h4>Vantagens do Maximalismo:</h4>
      <ul>
        <li>Altamente expressivo e único</li>
        <li>Captura atenção imediatamente</li>
        <li>Perfeito para contar histórias complexas</li>
        <li>Transmite energia e personalidade forte</li>
      </ul>

      <h4>Quando Usar Maximalismo:</h4>
      <ul>
        <li>Marcas jovens e ousadas</li>
        <li>Indústria criativa e entretenimento</li>
        <li>Quando você quer se destacar da concorrência</li>
        <li>Públicos que buscam experiências visuais ricas</li>
      </ul>

      <h3>A Terceira Via</h3>
      <p>Não precisa ser 8 ou 80! Muitos designs bem-sucedidos combinam elementos de ambos - um equilíbrio cuidadoso entre simplicidade e riqueza visual.</p>

      <h3>Conclusão</h3>
      <p>A escolha entre minimalismo e maximalismo deve ser guiada pela mensagem que você quer comunicar, seu público-alvo e a personalidade da marca. Não há resposta certa ou errada - apenas a solução mais adequada para cada projeto.</p>
    `,
  },
  {
    id: 5,
    title: 'Tipografia: A Arte de Escolher Fontes',
    excerpt: 'Aprenda os fundamentos da tipografia e como selecionar as combinações de fontes perfeitas para seus designs.',
    image: 'https://images.unsplash.com/photo-1505356822725-08ad25f3ffe4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0eXBvZ3JhcGh5JTIwYXJ0fGVufDF8fHx8MTc2ODkyNjI1NHww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '20 Dez 2025',
    readTime: '8 min',
    category: 'Tipografia',
    content: `
      <p>A tipografia é uma das ferramentas mais poderosas do design. Uma boa escolha de fontes pode transformar um design comum em algo extraordinário.</p>

      <h3>Os Fundamentos da Tipografia</h3>
      <p>Antes de escolher fontes, é importante entender alguns conceitos básicos:</p>

      <h4>1. Categorias de Fontes</h4>
      <ul>
        <li><strong>Serif:</strong> Fontes com serifas (pequenos traços nas extremidades). Transmitem tradição e confiabilidade.</li>
        <li><strong>Sans-serif:</strong> Fontes sem serifas. Modernas, limpas e diretas.</li>
        <li><strong>Script:</strong> Fontes cursivas. Elegantes e pessoais.</li>
        <li><strong>Display:</strong> Fontes decorativas para títulos e destaques.</li>
      </ul>

      <h3>Princípios para Combinar Fontes</h3>

      <h4>1. Contraste é Fundamental</h4>
      <p>Combine fontes que sejam diferentes, mas complementares. Por exemplo, uma serif elegante com uma sans-serif moderna.</p>

      <h4>2. Limite-se a 2-3 Fontes</h4>
      <p>Usar muitas fontes diferentes cria confusão visual. Geralmente, duas fontes são suficientes: uma para títulos e outra para corpo de texto.</p>

      <h4>3. Estabeleça Hierarquia</h4>
      <p>Use tamanho, peso e estilo para criar níveis de importância visual. Seus olhos devem saber instantaneamente o que ler primeiro.</p>

      <h4>4. Considere o Mood</h4>
      <p>Cada fonte transmite uma personalidade. Uma fonte geométrica é moderna e técnica, enquanto uma script é elegante e pessoal.</p>

      <h3>Dicas Práticas</h3>

      <h4>Para Legibilidade:</h4>
      <ul>
        <li>Tamanho mínimo de 16px para texto web</li>
        <li>Altura de linha de 1.5-1.6 para conforto de leitura</li>
        <li>Evite linhas muito longas (50-75 caracteres ideal)</li>
      </ul>

      <h4>Para Impacto:</h4>
      <ul>
        <li>Fontes display para títulos chamativos</li>
        <li>Peso bold para destacar informações importantes</li>
        <li>Espaçamento generoso entre letras para elegância</li>
      </ul>

      <h3>Recursos Recomendados</h3>
      <p>Algumas das minhas fontes favoritas gratuitas:</p>
      <ul>
        <li>Google Fonts - biblioteca vasta e gratuita</li>
        <li>Font Squirrel - fontes de alta qualidade</li>
        <li>Adobe Fonts - incluído com Creative Cloud</li>
      </ul>

      <h3>Conclusão</h3>
      <p>A tipografia é uma habilidade que se desenvolve com prática e observação. Estude designs que você admira, experimente combinações diferentes e, acima de tudo, sempre priorize a legibilidade.</p>
    `,
  },
  {
    id: 6,
    title: 'Design Sustentável: O Futuro é Verde',
    excerpt: 'Como incorporar práticas sustentáveis no design gráfico e criar projetos mais conscientes ambientalmente.',
    image: 'https://images.unsplash.com/photo-1748765968965-7e18d4f7192b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHBhY2thZ2luZyUyMGRlc2lnbnxlbnwxfHx8fDE3Njg5NTM1MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    date: '15 Dez 2025',
    readTime: '5 min',
    category: 'Sustentabilidade',
    content: `
      <p>Como designers, temos a responsabilidade de considerar o impacto ambiental do nosso trabalho. O design sustentável não é apenas uma tendência - é uma necessidade.</p>

      <h3>O Que é Design Sustentável?</h3>
      <p>Design sustentável é criar soluções visuais que minimizam o impacto ambiental, considerando todo o ciclo de vida do produto - da concepção ao descarte.</p>

      <h3>Práticas Sustentáveis no Design Digital</h3>

      <h4>1. Otimização de Arquivos</h4>
      <p>Arquivos menores = menos energia para transferir e armazenar. Comprima imagens, use formatos eficientes como WebP, e otimize código.</p>

      <h4>2. Dark Mode</h4>
      <p>Designs em modo escuro consomem menos energia, especialmente em telas OLED. Ofereça essa opção sempre que possível.</p>

      <h4>3. Hospedagem Verde</h4>
      <p>Escolha servidores que usam energia renovável. Cada site armazenado e cada visualização consome energia.</p>

      <h3>Práticas Sustentáveis no Design Impresso</h3>

      <h4>1. Escolha de Materiais</h4>
      <ul>
        <li>Papel reciclado ou certificado FSC</li>
        <li>Tintas à base de soja ou vegetais</li>
        <li>Acabamentos sem plástico</li>
      </ul>

      <h4>2. Design Econômico</h4>
      <ul>
        <li>Minimize o uso de tinta (mais branco no design)</li>
        <li>Evite sangrias desnecessárias</li>
        <li>Otimize tamanhos para aproveitar melhor o papel</li>
      </ul>

      <h4>3. Longevidade</h4>
      <p>Crie designs atemporais que não precisem ser reimpressos frequentemente. Qualidade sobre quantidade.</p>

      <h3>Comunicando Sustentabilidade</h3>
      <p>Se você está trabalhando com marcas sustentáveis, reflita esses valores no design:</p>
      <ul>
        <li>Use cores terrosas e naturais</li>
        <li>Incorpore texturas orgânicas</li>
        <li>Escolha fotografia que celebra a natureza</li>
        <li>Seja transparente sobre práticas sustentáveis</li>
      </ul>

      <h3>O Impacto Coletivo</h3>
      <p>Individualmente, cada mudança pode parecer pequena. Mas quando designers ao redor do mundo adotam práticas sustentáveis, o impacto é significativo.</p>

      <h3>Conclusão</h3>
      <p>O design sustentável não significa comprometer a qualidade ou criatividade. Significa ser mais intencional, mais consciente e mais responsável. É nosso futuro, e começa agora.</p>
    `,
  },
];

export function BlogPost({ postId, onBack }: BlogPostProps) {
  const post = blogPostsData.find(p => p.id === postId);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!post) {
    return null;
  }

  // Generate shareable URL (in production, this would be the actual post URL)
  const postUrl = `https://edilianodesigner.com.br/blog/${post.id}`;
  const shareText = `${post.title} - Ediliano Designer`;

  const handleShare = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl).then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    setShowShareMenu(false);
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: MessageCircle, platform: 'whatsapp', color: 'hover:bg-green-500' },
    { name: 'Facebook', icon: Facebook, platform: 'facebook', color: 'hover:bg-blue-600' },
    { name: 'Twitter', icon: Twitter, platform: 'twitter', color: 'hover:bg-sky-500' },
    { name: 'LinkedIn', icon: Linkedin, platform: 'linkedin', color: 'hover:bg-blue-700' },
    { name: copySuccess ? 'Copiado!' : 'Copiar Link', icon: LinkIcon, platform: 'copy', color: 'hover:bg-lime-400 hover:text-black' },
  ];

  return (
    <section className="min-h-screen py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onBack}
          className="flex items-center gap-2 text-lime-400 hover:text-lime-300 mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao Blog
        </motion.button>

        {/* Post Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-block px-4 py-2 bg-lime-400/10 text-lime-400 text-sm font-semibold rounded-full mb-6">
            {post.category}
          </span>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{post.readTime} de leitura</span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 hover:text-lime-400 transition-colors"
              >
                <Share2 size={18} />
                <span>Compartilhar</span>
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowShareMenu(false)}
                  />
                  
                  {/* Share Options */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 right-0 bg-zinc-900 border border-lime-400/20 rounded-xl shadow-xl overflow-hidden z-50 min-w-[200px]"
                  >
                    {shareOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleShare(option.platform)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-white transition-all ${option.color} ${
                          index !== shareOptions.length - 1 ? 'border-b border-lime-400/10' : ''
                        }`}
                      >
                        <option.icon size={18} />
                        <span className="text-sm font-medium">{option.name}</span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl overflow-hidden mb-12 aspect-video"
        >
          <ImageWithFallback
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Post Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="prose prose-invert prose-lime max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            '--tw-prose-body': '#d1d5db',
            '--tw-prose-headings': '#ffffff',
            '--tw-prose-links': '#1AFF25',
            '--tw-prose-bold': '#ffffff',
            '--tw-prose-bullets': '#1AFF25',
          } as React.CSSProperties}
        />

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-lime-400/20"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400">Gostou do conteúdo? Compartilhe!</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"
                title="Compartilhar no WhatsApp"
              >
                <MessageCircle size={18} />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                title="Compartilhar no Facebook"
              >
                <Facebook size={18} />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"
                title="Compartilhar no Twitter"
              >
                <Twitter size={18} />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 rounded-full bg-blue-700/10 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all"
                title="Compartilhar no LinkedIn"
              >
                <Linkedin size={18} />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-10 h-10 rounded-full bg-lime-400/10 flex items-center justify-center hover:bg-lime-400 hover:text-black transition-all"
                title={copySuccess ? 'Link copiado!' : 'Copiar link'}
              >
                <LinkIcon size={18} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Back to Blog Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 border-2 border-lime-400 text-lime-400 px-8 py-4 rounded-full font-semibold hover:bg-lime-400 hover:text-black transition-all"
          >
            <ArrowLeft size={20} />
            Ver Todos os Artigos
          </button>
        </motion.div>
      </div>
    </section>
  );
}