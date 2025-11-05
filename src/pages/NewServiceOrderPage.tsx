"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceOrders } from '@/contexts/ServiceOrderContext';
import Logo from '@/components/Logo';

const NewServiceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, username, loading: authLoading } = useAuth(); // Obter username diretamente
  const { addServiceOrder } = useServiceOrders();
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login");
    } else if (session && username) { // Usar username do contexto
      setClientName(username);
    }
  }, [session, authLoading, navigate, username]); // Adicionar username às dependências

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!clientName || !description) {
      showError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    console.log('NewServiceOrderPage: Calling addServiceOrder with:', { clientName, description });

    try {
      await addServiceOrder({ clientName, description });
      showSuccess('Ordem de serviço criada com sucesso!');
      navigate('/service-orders');
    } catch (error) {
      showError('Erro ao criar ordem de serviço.');
      console.error('NewServiceOrderPage: Error creating service order:', error);
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
    // Se não há sessão e não está carregando, o useEffect já deveria ter redirecionado.
    // Retornar null aqui pode ser um problema se o redirecionamento falhar por algum motivo.
    // É melhor garantir que o redirecionamento ocorra antes de renderizar qualquer coisa.
    return null; 
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/service-orders')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Logo />
            <div>
              <CardTitle className="text-2xl font-bold">Nova Ordem de Serviço</CardTitle>
              <CardDescription>Preencha os detalhes para criar uma nova ordem.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                type="text"
                placeholder="Nome completo do cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                readOnly
                disabled={loading}
                className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Problema/Serviço</Label>
              <Textarea
                id="description"
                placeholder="Descreva o serviço a ser realizado ou o problema."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Ordem de Serviço'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewServiceOrderPage;