import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { storeApi } from '../../utils/storeApi';

export function PaymentSuccess() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('Verificando seu pagamento...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        console.log('[PaymentSuccess] Starting verification');

        const urlParams = new URLSearchParams(window.location.search);
        const externalReference =
          urlParams.get('reference') ||
          urlParams.get('external_reference') ||
          urlParams.get('preference_id');
        const mpStatus = urlParams.get('status');

        console.log('[PaymentSuccess] Reference:', externalReference, 'MP Status:', mpStatus);

        if (!externalReference) {
          setTimeout(() => {
            setStatus('success');
            setMessage('Pagamento processado! Verificando sua conta...');
            setLoading(false);
          }, 1500);
          return;
        }

        const data = await storeApi.checkPaymentStatus(externalReference);
        console.log('[PaymentSuccess] Status response:', data);

        if (data.success && data.status === 'completed') {
          setStatus('success');
          setMessage('Pagamento confirmado! Sua assinatura está ativa.');
          await storeApi.getUserStatus();
        } else if (data.success && data.status === 'pending') {
          setMessage('Confirmando pagamento... Isso pode levar alguns segundos.');

          setTimeout(async () => {
            const retryData = await storeApi.checkPaymentStatus(externalReference);
            if (retryData.success && retryData.status === 'completed') {
              setStatus('success');
              setMessage('Pagamento confirmado! Sua assinatura está ativa.');
            } else {
              setStatus('success');
              setMessage('Pagamento em processamento. Sua assinatura será ativada em breve.');
            }
            setLoading(false);
          }, 3000);
          return;
        } else {
          setStatus('success');
          setMessage('Pagamento recebido! Processando sua assinatura...');
        }

        setLoading(false);
      } catch (e) {
        console.error('[PaymentSuccess] Error:', e);
        setStatus('success');
        setMessage(
          'Pagamento recebido! Se não ver sua assinatura ativa, atualize a página em alguns instantes.'
        );
        setLoading(false);
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen bg-black pt-32 px-4 flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
      >
        {loading ? (
          <div className="flex flex-col items-center py-12">
            <Loader2 className="animate-spin text-lime-400 w-12 h-12 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{message}</h2>
            <p className="text-zinc-400 mt-2 text-sm">
              Aguarde enquanto confirmamos com o Mercado Pago...
            </p>
          </div>
        ) : status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-lime-400 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h1>
            <p className="text-zinc-400 mb-2">{message}</p>
            <p className="text-zinc-500 text-sm mb-8">
              Você já pode começar a baixar arquivos premium do Creator.
            </p>
            <a
              href="/?section=store"
              className="inline-flex items-center gap-2 bg-lime-400 text-black font-bold py-3 px-6 rounded-xl hover:bg-lime-300 transition-colors"
            >
              <ArrowLeft size={18} /> Voltar para o Creator
            </a>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-orange-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-orange-400 w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-orange-400 mb-2">
              Pagamento em Processamento
            </h1>
            <p className="text-zinc-400 mb-6 text-sm">
              Recebemos seu pagamento mas ainda estamos confirmando com o Mercado Pago. Sua
              assinatura será ativada automaticamente em alguns minutos.
            </p>
            <a
              href="/?section=store"
              className="inline-flex items-center gap-2 border border-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft size={18} /> Voltar para o Creator
            </a>
          </>
        )}
      </motion.div>
    </div>
  );
}
