"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTechnicians } from '@/contexts/TechnicianContext';
import { showError } from '@/utils/toast';
import Logo from '@/components/Logo';

const TechnicianRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { addTechnician } = useTechnicians();
  const [technicianName, setTechnicianName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login");
    }
  }, [session, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!technicianName.trim()) {
      showError('Por favor, insira o nome do técnico.');
      setLoading(false);
      return;
    }

    try {
      addTechnician(technicianName.trim());
      setTechnicianName(''); // Limpar o campo após o cadastro
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular atraso de rede
      navigate('/service-orders'); // Redirecionar para a lista de OS após o cadastro
    } catch (error) {
      console.error('Error adding technician:', error);
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
              <CardDescription>Adicione um novo técnico à equipe.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="technicianName">Nome do Técnico</Label>
              <Input
                id="technicianName"
                type="text"
                placeholder="Nome completo do técnico"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
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