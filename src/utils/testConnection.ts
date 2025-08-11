import { supabase } from '@/lib/supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Erro na conexão:', error);
      return false;
    }

    console.log('✅ Conexão com Supabase estabelecida!');
    console.log('📊 Dados de teste:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    return false;
  }
}

export async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste...');
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        full_name: 'Usuário Teste',
        cpf: '123.456.789-00',
        password: '1234',
        is_blocked: false,
        monthly_payment_status: 'paid'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return null;
    }

    console.log('✅ Usuário de teste criado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
    return null;
  }
}