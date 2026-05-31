import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  section?: string;
}

export function SEO({
  title = 'Ediliano Designer - Design Gráfico Profissional | Itapicuru, BA',
  description = 'Designer gráfico profissional especializado em identidade visual, branding, criação de logotipos, material publicitário e design digital. Atendimento em Itapicuru, BA e todo Brasil.',
  keywords = 'design gráfico, designer gráfico, identidade visual, branding, logo, logotipo, criação de marca, material publicitário, design digital, designer Bahia, designer Itapicuru',
  image = 'https://edilianodesigner.com.br/favicon.png',
  url = 'https://edilianodesigner.com.br',
  type = 'website',
  section,
}: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);

    // Twitter
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', url);

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', section ? `${url}#${section}` : url);

    // Add structured data for specific sections
    if (section) {
      addSectionStructuredData(section);
    }
  }, [title, description, keywords, image, url, type, section]);

  return null;
}

function addSectionStructuredData(section: string) {
  // Remove existing section structured data
  const existingScript = document.getElementById('section-structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  let structuredData = null;

  switch (section) {
    case 'portfolio':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        'name': 'Portfólio - Ediliano Designer',
        'description': 'Confira projetos de design gráfico, identidade visual, branding e muito mais.',
        'creator': {
          '@type': 'Person',
          'name': 'Ediliano Designer',
          'url': 'https://edilianodesigner.com.br'
        }
      };
      break;

    case 'services':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'serviceType': 'Design Gráfico Profissional',
        'provider': {
          '@type': 'ProfessionalService',
          'name': 'Ediliano Designer',
          'telephone': '+5575936184057',
          'email': 'contato@edilianodesigner.com.br'
        },
        'areaServed': {
          '@type': 'Country',
          'name': 'Brasil'
        },
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'Serviços de Design',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Identidade Visual',
                'description': 'Criação completa de identidade visual para sua marca'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Criação de Logotipos',
                'description': 'Design de logos profissionais e memoráveis'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': 'Material Publicitário',
                'description': 'Criação de peças publicitárias para diversos canais'
              }
            }
          ]
        }
      };
      break;

    case 'blog':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        'name': 'Blog - Ediliano Designer',
        'description': 'Artigos e dicas sobre design gráfico, tendências e boas práticas.',
        'author': {
          '@type': 'Person',
          'name': 'Ediliano Designer'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Ediliano Designer',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://edilianodesigner.com.br/favicon.png'
          }
        }
      };
      break;

    case 'contact':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        'name': 'Contato - Ediliano Designer',
        'description': 'Entre em contato para solicitar orçamento ou tirar dúvidas sobre serviços de design gráfico.',
        'mainEntity': {
          '@type': 'ProfessionalService',
          'name': 'Ediliano Designer',
          'telephone': '+5575936184057',
          'email': 'contato@edilianodesigner.com.br',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Itapicuru',
            'addressRegion': 'BA',
            'addressCountry': 'BR'
          }
        }
      };
      break;
  }

  if (structuredData) {
    const script = document.createElement('script');
    script.id = 'section-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}

// Predefined SEO configurations for each section
export const SEOConfigs = {
  home: {
    title: 'Ediliano Designer - Design Gráfico Profissional | Itapicuru, BA',
    description: 'Designer gráfico profissional especializado em identidade visual, branding, criação de logotipos, material publicitário e design digital. Atendimento em Itapicuru, BA e todo Brasil.',
    keywords: 'design gráfico, designer gráfico, identidade visual, branding, logo, designer Itapicuru, designer Bahia',
    section: 'home',
  },
  portfolio: {
    title: 'Portfólio - Projetos de Design Gráfico | Ediliano Designer',
    description: 'Confira meu portfólio com projetos de identidade visual, branding, logotipos, material publicitário e design digital. Trabalhos realizados para clientes em todo Brasil.',
    keywords: 'portfólio design gráfico, projetos de design, trabalhos de design, portfolio designer, cases de design',
    section: 'portfolio',
  },
  services: {
    title: 'Serviços de Design Gráfico Profissional | Ediliano Designer',
    description: 'Oferecemos serviços completos de design gráfico: identidade visual, criação de logotipos, branding, material publicitário, design editorial e social media. Solicite seu orçamento!',
    keywords: 'serviços de design, criação de logo, identidade visual, branding profissional, design publicitário, orçamento design',
    section: 'services',
  },
  blog: {
    title: 'Blog - Dicas e Tendências de Design Gráfico | Ediliano Designer',
    description: 'Artigos sobre design gráfico, tendências, dicas profissionais, ferramentas e boas práticas para designers e empresários que buscam melhorar sua comunicação visual.',
    keywords: 'blog design gráfico, artigos design, tendências design, dicas de design, design tips',
    section: 'blog',
  },
  contact: {
    title: 'Contato - Solicite seu Orçamento | Ediliano Designer',
    description: 'Entre em contato para solicitar orçamento de design gráfico, identidade visual ou branding. Atendemos Itapicuru, Bahia e todo Brasil. WhatsApp: +55 75 93618-4057',
    keywords: 'contato designer, orçamento design, solicitar orçamento, contratar designer gráfico, designer Itapicuru contato',
    section: 'contact',
  },
};
