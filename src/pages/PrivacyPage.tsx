import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <main className="pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-rock-red hover:text-rock-red-bright text-sm transition-colors">
            ← Volver al inicio
          </Link>
        </div>

        <h1
          className="text-rock-white mb-2"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '3rem', letterSpacing: '0.08em' }}
        >
          POLÍTICA DE <span style={{ color: '#dc2626' }}>PRIVACIDAD</span>
        </h1>
        <p className="text-rock-metal text-sm mb-10">Última actualización: enero de 2025</p>

        <div className="prose prose-invert max-w-none space-y-8 text-rock-metal-light leading-relaxed">

          <section aria-labelledby="responsable">
            <h2 id="responsable" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              1. RESPONSABLE DEL TRATAMIENTO
            </h2>
            <p>
              <strong className="text-rock-white">Pizzería Del Antonio</strong><br />
              Dirección: Málaga, España<br />
              Email de contacto: privacidad@pizzeriadelantonio.es
            </p>
          </section>

          <section aria-labelledby="datos">
            <h2 id="datos" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              2. DATOS QUE RECOGEMOS
            </h2>
            <p>Al realizar un pedido recopilamos únicamente los datos mínimos necesarios:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-rock-white">Nombre</strong>: para identificar tu pedido.</li>
              <li><strong className="text-rock-white">Número de teléfono</strong>: como identificador único y para enviarte la confirmación por WhatsApp.</li>
              <li><strong className="text-rock-white">Hora de recogida</strong>: para preparar tu pedido a tiempo.</li>
            </ul>
            <p className="mt-2">No recogemos datos de pago, direcciones de envío ni ningún otro dato personal innecesario.</p>
          </section>

          <section aria-labelledby="finalidad">
            <h2 id="finalidad" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              3. FINALIDAD DEL TRATAMIENTO
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Gestión y preparación de tu pedido.</li>
              <li>Confirmación del pedido por WhatsApp.</li>
              <li>Autocompletar tu nombre en futuros pedidos (si vuelves a usar el mismo teléfono).</li>
              <li>Detección de pedidos fraudulentos.</li>
            </ul>
          </section>

          <section aria-labelledby="base-legal">
            <h2 id="base-legal" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              4. BASE LEGAL
            </h2>
            <p>
              El tratamiento se basa en tu <strong className="text-rock-white">consentimiento explícito</strong> marcado en el formulario de pedido (art. 6.1.a RGPD) y en la <strong className="text-rock-white">ejecución del contrato</strong> (art. 6.1.b RGPD).
            </p>
          </section>

          <section aria-labelledby="retencion">
            <h2 id="retencion" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              5. PLAZO DE RETENCIÓN
            </h2>
            <p>
              Los datos de pedidos se conservan durante <strong className="text-rock-white">2 años</strong> desde el último pedido, en cumplimiento de las obligaciones contables y fiscales. Transcurrido ese plazo, se eliminan automáticamente.
            </p>
          </section>

          <section aria-labelledby="derechos">
            <h2 id="derechos" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              6. TUS DERECHOS
            </h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-rock-white">Acceso</strong>: conocer qué datos tenemos sobre ti.</li>
              <li><strong className="text-rock-white">Rectificación</strong>: corregir datos inexactos.</li>
              <li><strong className="text-rock-white">Supresión</strong> (derecho al olvido): solicitar el borrado de tus datos.</li>
              <li><strong className="text-rock-white">Portabilidad</strong>: recibir tus datos en formato electrónico.</li>
              <li><strong className="text-rock-white">Oposición</strong>: oponerte al tratamiento.</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, escribe a <strong className="text-rock-white">privacidad@pizzeriadelantonio.es</strong> con tu número de teléfono. Responderemos en un plazo máximo de 30 días.
            </p>
            <p className="mt-2">
              También puedes presentar una reclamación ante la <a href="https://www.aepd.es" className="text-rock-red hover:underline" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos (AEPD)</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
