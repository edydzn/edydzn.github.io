export function PrivacyPolicy() {
  return (
    <div className="prose prose-invert max-w-none">
      <div className="space-y-6 text-gray-300">
        <p className="text-sm text-gray-400">
          <strong>Última atualização:</strong> 21 de Janeiro de 2026
        </p>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">1. Introdução</h3>
          <p className="leading-relaxed">
            A Ediliano Designer ("nós", "nosso" ou "nos") está comprometida em proteger a privacidade 
            de nossos visitantes e clientes. Esta Política de Privacidade descreve como coletamos, 
            usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nosso site 
            e serviços.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">2. Informações que Coletamos</h3>
          <p className="leading-relaxed mb-2">
            Coletamos as seguintes informações quando você utiliza nosso site:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Informações de Contato:</strong> Nome, e-mail, telefone e empresa quando você preenche nossos formulários de contato ou solicitação de orçamento.</li>
            <li><strong>Informações de Projeto:</strong> Descrição do projeto, orçamento, prazo e outras informações fornecidas em solicitações de orçamento.</li>
            <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de navegador, páginas visitadas e tempo de permanência no site.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">3. Como Utilizamos suas Informações</h3>
          <p className="leading-relaxed mb-2">
            Utilizamos suas informações para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Responder às suas solicitações de contato e orçamento</li>
            <li>Fornecer informações sobre nossos serviços de design gráfico</li>
            <li>Melhorar nosso site e experiência do usuário</li>
            <li>Enviar comunicações relacionadas aos seus projetos</li>
            <li>Cumprir obrigações legais e regulamentares</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">4. Armazenamento e Segurança</h3>
          <p className="leading-relaxed">
            Suas informações são armazenadas de forma segura em servidores protegidos fornecidos pela 
            Supabase. Implementamos medidas de segurança técnicas e organizacionais apropriadas para 
            proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">5. Compartilhamento de Informações</h3>
          <p className="leading-relaxed mb-2">
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Quando necessário para fornecer nossos serviços</li>
            <li>Quando exigido por lei ou processo legal</li>
            <li>Com provedores de serviços que nos ajudam a operar nosso site (como serviços de hospedagem)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">6. Cookies e Tecnologias Similares</h3>
          <p className="leading-relaxed">
            Nosso site pode utilizar cookies e tecnologias similares para melhorar sua experiência de 
            navegação e analisar o tráfego do site. Você pode configurar seu navegador para recusar 
            cookies, mas isso pode afetar algumas funcionalidades do site.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">7. Seus Direitos</h3>
          <p className="leading-relaxed mb-2">
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar seu consentimento a qualquer momento</li>
            <li>Solicitar a portabilidade de seus dados</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">8. Retenção de Dados</h3>
          <p className="leading-relaxed">
            Retemos suas informações pessoais apenas pelo tempo necessário para os fins descritos nesta 
            política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">9. Links para Sites de Terceiros</h3>
          <p className="leading-relaxed">
            Nosso site pode conter links para sites de terceiros (como nossas redes sociais). Não somos 
            responsáveis pelas práticas de privacidade desses sites e recomendamos que você leia suas 
            políticas de privacidade.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">10. Alterações a Esta Política</h3>
          <p className="leading-relaxed">
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças 
            significativas publicando a nova política em nosso site com a data de atualização.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-white mb-3">11. Contato</h3>
          <p className="leading-relaxed">
            Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos, 
            entre em contato conosco:
          </p>
          <div className="mt-3 p-4 bg-lime-400/5 border border-lime-400/20 rounded-lg">
            <p className="mb-1"><strong>Email:</strong> contato@edilianodesigner.com.br</p>
            <p className="mb-1"><strong>Telefone/WhatsApp:</strong> +55 (75) 93618-4057</p>
            <p><strong>Localização:</strong> Itapicuru, BA, Brasil</p>
          </div>
        </section>

        <section className="pt-4 mt-6 border-t border-lime-400/20">
          <p className="text-sm text-gray-400 italic">
            Ao utilizar nosso site e serviços, você concorda com os termos desta Política de Privacidade.
          </p>
        </section>
      </div>
    </div>
  );
}
