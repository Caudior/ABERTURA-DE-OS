import { MadeWithDyad } from "@/components/made-with-dyad";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importar Link
import { Button } from "@/components/ui/button"; // Importar Button

const Index = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center space-y-6">
        <Logo />
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Bem-vindo ao ServiceFlow!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Sua plataforma para gerenciar ordens de serviço.
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Navegue usando o menu lateral (em breve) ou comece a gerenciar suas tarefas.
        </p>
        <Link to="/service-orders">
          <Button className="mt-6">
            Ver Ordens de Serviço
          </Button>
        </Link>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;