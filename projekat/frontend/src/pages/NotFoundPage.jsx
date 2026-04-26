export default function NotFoundPage() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'Sora, sans-serif' 
    }}>
      <h1 style={{ color: '#1a6fd4', fontSize: '48px' }}>404</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        Ups! Stranica koju tražiš ne postoji.
      </p>
      <a href="/" style={{ color: '#1a6fd4', marginTop: '20px' }}>
        Vrati se na početnu
      </a>
    </main>
  );
}
