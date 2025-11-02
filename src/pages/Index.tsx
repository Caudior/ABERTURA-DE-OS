import { MadeWithDyad } from "@/components/made-with-dyad";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { session, loading, username, logout } = useAuth(); // Importar a função logout
  const navigate = useNavigate();

  // Adicionando log para testar o carregamento de variáveis de ambiente
  useEffect(() => {
    console.log('VITE_TEST_VARIABLE:', import.meta.env.VITE_TEST_VARIABLE);
    console.log('VITE_SUPABASE_URL (from Index.tsx):', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY (from Index.tsx):', import.meta.env.VITE_SUPABASE_ANON_KEY);
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [session, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center space-y-6">
        <Logo />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Bem-vindo ao ServiceFlow!
        </h1>
        {username && (
          <p className="text-2xl font-semibold text-primary dark:text-primary-foreground">
            Olá, {username}!
          </p>
        )}
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Sua plataforma para gerenciar ordens de serviço.
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Navegue usando o menu lateral (em breve) ou comece a gerenciar suas tarefas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link to="/service-orders">
            <Button>
              Ver Ordens de Serviço
            </Button>
          </Link>
          {username && (
            <Link to="/technician-dashboard">
              <Button variant="secondary">
                Minhas Ordens ({username})
              </Button>
            </Link>
          )}
          <Link to="/register-technician">
            <Button variant="outline">
              Cadastrar Técnico
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Versão: V.10.0.0.1
      </p>
      <MadeWithDyad />
    </div>
  );
};

export default Index;