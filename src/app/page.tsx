export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          CredConecta
        </h1>
        
        <p style={{
          color: '#6b7280',
          fontSize: '0.875rem',
          marginBottom: '2rem'
        }}>
          Sistema de Gestão de Empréstimos
        </p>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#374151'
          }}>
            Acesso ao Sistema
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button style={{
              width: '100%',
              height: '3rem',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer'
            }}>
              🛡️ Administrador
            </button>
            
            <button style={{
              width: '100%',
              height: '3rem',
              border: '1px solid #d1d5db',
              color: '#374151',
              borderRadius: '0.5rem',
              fontWeight: '500',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}>
              👤 Usuário
            </button>
          </div>
        </div>

        <p style={{
          fontSize: '0.75rem',
          color: '#9ca3af',
          marginTop: '1.5rem'
        }}>
          Sistema mobile para gestão de empréstimos
        </p>
      </div>
    </div>
  );
}