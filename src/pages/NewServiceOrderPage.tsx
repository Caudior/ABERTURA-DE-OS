"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const NewServiceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!clientName || !description) {
      showError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    // Simulate API call for creating a new service order
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      showSuccess('Ordem de serviço criada com sucesso!');
      navigate('/service-orders'); // Redirect to the list of service orders
    } catch (error) {
      showError('Erro ao criar ordem de serviço.');
      console.error('Error creating service order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/service-orders')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
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
                disabled={loading}
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