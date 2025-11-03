"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceOrders, ServiceOrder, statusMapToSupabase } from '@/contexts/ServiceOrderContext'; // Importar statusMapToSupabase
import { useTechnicians } from '@/contexts/TechnicianContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client'; // Importar supabase client

const ServiceOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, loading: authLoading, userRole } = useAuth();
  const { serviceOrders, updateServiceOrderStatus, assignTechnician } = useServiceOrders();
  const { technicians } = useTechnicians();
  const [order, setOrder] = useState<ServiceOrder | undefined>(undefined);
  const [currentStatus, setCurrentStatus] = useState<ServiceOrder['status'] | undefined>(undefined);
  const [selectedTechnician, setSelectedTechnician] = useState<string | undefined>(undefined);
  const [technicianNotes, setTechnicianNotes] = useState('');

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login");
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      const foundOrder = serviceOrders.find((o) => o.id === id);
      setOrder(foundOrder);
      if (foundOrder) {
        setCurrentStatus(foundOrder.status);
        setSelectedTechnician(foundOrder.assignedTo);

        // Carregar observações existentes se a OS já estiver concluída
        if (foundOrder.status === 'Concluído') {
          fetchTechnicianNotes(foundOrder.id);
        }
      }
    }
  }, [id, serviceOrders]);

  const fetchTechnicianNotes = async (orderId: string) => {
    const { data, error } = await supabase
      .from('service_order_history')
      .select('notes')
      .eq('service_order_id', orderId)
      .eq('status_change_to', statusMapToSupabase['Concluído'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Error fetching technician notes:', error);
    } else if (data) {
      setTechnicianNotes(data.notes || '');
    }
  };

  const handleStatusChange = async (newStatus: ServiceOrder['status']) => {
    if (order && newStatus !== currentStatus) {
      if (newStatus === 'Concluído' && !technicianNotes.trim()) {
        showError('Por favor, adicione as observações do técnico para finalizar a OS.');
        return;
      }
      await updateServiceOrderStatus(order.id, newStatus, newStatus === 'Concluído' ? technicianNotes : undefined);
      setCurrentStatus(newStatus);
      // Não limpar as notas aqui, pois elas podem ter sido salvas e devem ser exibidas
      // O useEffect de carregamento de notas cuidará de preencher se a página for recarregada
    }
  };

  const handleAssignTechnician = () => {
    if (order && selectedTechnician && selectedTechnician !== order.assignedTo) {
      assignTechnician(order.id, selectedTechnician);
    } else if (order && !selectedTechnician) {
      showError('Por favor, selecione um técnico para atribuir.');
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Ordem de Serviço Não Encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              A ordem de serviço com ID "{id}" não foi encontrada.
            </p>
            <Link to="/service-orders">
              <Button>Voltar para Ordens de Serviço</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusClasses = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Em Deslocamento': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Chegou': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'Concluído': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const isAdminOrTechnician = userRole === 'admin' || userRole === 'technician';
  const isCompleted = currentStatus === 'Concluído';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/service-orders')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">Detalhes da Ordem de Serviço</CardTitle>
              <CardDescription>Informações e atualização da OS {order.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ID da Ordem</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome do Cliente</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.clientName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Data de Abertura</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{order.issueDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Descrição</p>
            <p className="text-lg text-gray-800 dark:text-gray-200">{order.description}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status Atual</p>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(currentStatus || 'Pendente')}`}>
                {currentStatus}
              </span>
            </div>
          </div>
          {isAdminOrTechnician && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Atualizar Status</p>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um novo status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Em Deslocamento">Em Deslocamento</SelectItem>
                  <SelectItem value="Chegou">Chegou</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Campo de observações do técnico - visível e editável apenas para admin/technician ao finalizar */}
          {isAdminOrTechnician && (
            <div className="space-y-2">
              <Label htmlFor="technicianNotes">Observações do Técnico (ao finalizar)</Label>
              <Textarea
                id="technicianNotes"
                placeholder="Descreva as observações finais ou o que foi feito para concluir o serviço."
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                rows={4}
                disabled={isCompleted && userRole !== 'admin'}
                className={isCompleted && userRole !== 'admin' ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
              />
            </div>
          )}

          {/* Seção para atribuição de técnico - visível apenas para administradores */}
          {isAdminOrTechnician && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Técnico Atribuído</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {order.assignedTo || 'Nenhum técnico atribuído'}
              </p>
              <div className="flex gap-2 mt-2">
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger className="flex-grow">
                    <SelectValue placeholder="Atribuir Técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.name}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssignTechnician} disabled={!selectedTechnician || selectedTechnician === order.assignedTo}>
                  Atribuir
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceOrderDetailPage;