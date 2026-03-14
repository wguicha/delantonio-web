export function OrderPage() {

  return (
    <main className="min-h-screen pt-20 px-4 max-w-7xl mx-auto py-8">
      <h1
        className="text-rock-white mb-8"
        style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          letterSpacing: '0.1em',
        }}
      >
        HACER <span style={{ color: '#dc2626' }}>PEDIDO</span>
      </h1>
      <p className="text-rock-metal-light">
        Sistema de pedidos — Próximamente conectado al backend.
      </p>
    </main>
  );
}
