/*
# Trigger para criar perfil de usuário automaticamente

1. Função
   - Criar registro na tabela users quando um usuário se registra
   - Usar dados do auth.users e metadata

2. Trigger
   - Executar após INSERT em auth.users
*/

-- Função para criar perfil de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, coach_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'coach_id' IS NOT NULL 
      AND NEW.raw_user_meta_data->>'coach_id' != '' 
      THEN (NEW.raw_user_meta_data->>'coach_id')::uuid
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();