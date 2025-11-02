"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import Logo from '@/components/Logo';

const TechnicianRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading, signup } = useAuth(); // Usar a função signup do AuthContext
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login");
    }
  }, [session, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      showError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      showError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      // Chamar a função signup do AuthContext, definindo isTechnician como true
      await signup(fullName.trim(), email.trim(), password, true); 
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      showSuccess(`Técnico "${fullName.trim()}" cadastrado com sucesso! Um e-mail de confirmação foi enviado.`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular atraso de rede
      navigate('/'); // Redirecionar para a página inicial
    } catch (error: any) {
      console.error('Error registering technician:', error);
      showError(error.message || 'Erro ao cadastrar técnico. Verifique se o e-mail já está em uso.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Logo />
            <div>
              <CardTitle className="text-2xl font-bold">Cadastrar Técnico</CardTitle>
              <CardDescription>Crie uma nova conta para um técnico.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nome completo do técnico"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicianEmail">E-mail do Técnico</Label>
              <Input
                id="technicianEmail"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar Técnico'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianRegistrationPage;