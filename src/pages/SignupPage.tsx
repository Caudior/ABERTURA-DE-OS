"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTechnicians } from '@/contexts/TechnicianContext'; // Importar useTechnicians
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox'; // Importar Checkbox
import { showSuccess, showError } from '@/utils/toast';
import Logo from '@/components/Logo';

const SignupPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Novo estado para o e-mail
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTechnician, setIsTechnician] = useState(false); // Novo estado para a checkbox
  const { login, loading } = useAuth();
  const { addTechnician } = useTechnicians(); // Usar o hook de técnicos
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) { // Validar e-mail também
      showError('Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      showError('As senhas não coincidem.');
      return;
    }
    try {
      // Simular cadastro e login
      await login(username); 
      
      // Se for técnico, adicioná-lo à lista de técnicos
      if (isTechnician) {
        addTechnician(username, email); // Adicionar o técnico com nome de usuário e e-mail
      }

      showSuccess('Cadastro realizado com sucesso! Você foi logado automaticamente.');
      navigate('/');
    } catch (error) {
      showError('Falha no cadastro. Tente novamente.');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl font-bold mt-4">Cadastre-se</CardTitle>
          <CardDescription>
            Crie sua conta para começar a gerenciar suas ordens de serviço.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="seu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu_email@example.com"
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTechnician"
                checked={isTechnician}
                onCheckedChange={(checked) => setIsTechnician(!!checked)}
                disabled={loading}
              />
              <Label htmlFor="isTechnician">Sou Técnico de Manutenção</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <a href="/login" className="text-blue-500 hover:underline">
              Entrar
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;