import { MadeWithDyad } from "@/components/made-with-dyad";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { session, loading, username } = useAuth();
  const navigate = useNavigate();

  console.log('Index.tsx: Rendering Index. Loading:', loading, 'Session:', session?.user?.id);

  useEffect(() => {
    console.log('Index.tsx: useEffect triggered. Loading:', loading, 'Session:', session?.user?.id);
    if (!loading && !session) {
      console.log('Index.tsx: Navigating to /login');
      navigate("/login");
    }
  }, [session, loading, navigate]);

  if (loading) {
    console.log('Index.tsx: Displaying loading state. Current loading:', loading);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  console.log('Index.tsx: Loading is false. Session:', session?.user?.id);

  if (!session) {
    console.log('Index.tsx: No session, returning null (should have navigated).');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
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
          Use o menu lateral para navegar pelas funcionalidades do sistema.
        </p>
      </div>
      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Versão: V.10.0.0.1
      </p>
      <MadeWithDyad />
    </div>
  );
};

export default Index;