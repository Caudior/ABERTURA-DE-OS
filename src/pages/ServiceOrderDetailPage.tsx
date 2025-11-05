"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceOrders, ServiceOrder, statusMapToSupabase, statusMapFromSupabase } from '@/contexts/ServiceOrderContext';
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
import { supabase } from '@/integrations/supabase/client';

const ServiceOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, loading: authLoading, userRole } = useAuth();
  const { serviceOrders, updateServiceOrderStatus, assignTechnician, addServiceOrderHistoryNote } = useServiceOrders();
  const { technicians } = useTechnicians();
  const [order, setOrder] = useState<ServiceOrder | undefined>(undefined);
  const [currentStatus, setCurrentStatus] = useState<ServiceOrder['status'] | undefined>(undefined);
  const [selectedTechnician, setSelectedTechnician] = useState<string | undefined>(undefined);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<any[]>([]); // Novo estado para o histórico

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login");
    }
  }, [session, authLoading, navigate]);

  const fetchServiceOrderHistory = async (orderId: string) => {
    console.log('ServiceOrderDetailPage: Fetching history for orderId:', orderId);
    const { data, error } = await supabase
      .from('service_order_history')
      .select(`
        id,
        created_at,
        status_change_from,
        status_change_to,
        notes,
        changed_by
        // profiles(full_name) // Removido temporariamente para depuração
      `)
      .eq('service_order_id', orderId)
      .order('created_at', { ascending: true }); // Ordenar por data para exibir cronologicamente

    if (error) {
      console.error('ServiceOrderDetailPage: Supabase Error fetching service order history:', error); // Log mais detalhado
      showError('Erro ao carregar histórico da ordem de serviço.');
      setHistoryEntries([]);
    } else {
      console.log('ServiceOrderDetailPage: Successfully fetched service order history (without profiles join):', data);
      // Se a junção com perfis for o problema, precisaremos buscar os nomes separadamente
      // ou reavaliar a política RLS para a tabela 'profiles' em conjunto com a junção.
      setHistoryEntries(data);
    }
  };

  useEffect(() => {
    if (id) {
      const foundOrder = serviceOrders.find((o) => o.id === id);
      setOrder(foundOrder);
      if (foundOrder) {
        setCurrentStatus(foundOrder.status);
        setSelectedTechnician(foundOrder.assignedTo);
        fetchServiceOrderHistory(foundOrder.id); // Chamar a nova função para buscar o histórico
        setTechnicianNotes(''); // Limpar o campo de observações para novas entradas
      }
    }
  }, [id, serviceOrders]);

  const handleSaveNotes = async () => {
    if (!technicianNotes.trim()) {
      showError('Por favor, adicione uma observação antes de salvar.');
      return;
    }
    if (!order || !currentStatus) return;

    setIsSavingNotes(true);
    try {
      await addServiceOrderHistoryNote(order.id, technicianNotes, currentStatus);
      setTechnicianNotes(''); // Limpar o input após salvar
      fetchServiceOrderHistory(order.id); // Re-buscar o histórico para mostrar a nova observação
    } catch (error) {
      console.error('ServiceOrderDetailPage: Error saving technician notes:', error);
      showError('Erro ao salvar observação.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusChange = async (newStatus: ServiceOrder['status']) => {
    if (order && newStatus !== currentStatus) {
      if (newStatus === 'Concluído') {
        if (userRole !== 'admin') {
          showError('Apenas administradores podem finalizar uma ordem de serviço.');
          return;
        }
        if (!technicianNotes.trim()) {
          showError('Por favor, adicione as observações do técnico para finalizar a OS.');
          return;
        }
      }
      await updateServiceOrderStatus(order.id, newStatus, newStatus === 'Concluído' ? technicianNotes : undefined);
      setCurrentStatus(newStatus);
      if (newStatus === 'Concluído') {
        setTechnicianNotes(''); // Limpar notas após finalizar
      }
      fetchServiceOrderHistory(order.id); // Re-buscar o histórico após a mudança de status
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
              <CardDescription>OS #{order.orderNumber?.toString().padStart(4, '0') || order.id.substring(0, 8)}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Número da Ordem</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              #{order.orderNumber?.toString().padStart(4, '0') || order.id.substring(0, 8)}
            </p>
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
                  <SelectItem value="Concluído" disabled={userRole !== 'admin'}>Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {userRole !== 'admin' && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  Apenas administradores podem finalizar uma ordem de serviço.
                </p>
              )}
            </div>
          )}

          {/* Campo de observações do técnico e botão de salvar */}
          {isAdminOrTechnician && (
            <div className="space-y-2">
              <Label htmlFor="technicianNotes">Adicionar Observação</Label>
              <Textarea
                id="technicianNotes"
                placeholder="Adicione uma nova observação sobre o serviço..."
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                rows={4}
                disabled={isSavingNotes || (isCompleted && userRole !== 'admin')}
                className={isCompleted && userRole !== 'admin' ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
              />
              <Button
                onClick={handleSaveNotes}
                disabled={isSavingNotes || !technicianNotes.trim() || (isCompleted && userRole !== 'admin')}
                className="w-full"
              >
                {isSavingNotes ? 'Salvando...' : 'Salvar Observação'}
              </Button>
              {isCompleted && userRole !== 'admin' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Apenas administradores podem adicionar observações a OSs concluídas.
                </p>
              )}
            </div>
          )}

          {/* Seção para atribuição de técnico - visível apenas para administradores */}
          {userRole === 'admin' && (
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

          {/* Seção de Histórico da Ordem de Serviço */}
          {historyEntries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico da Ordem</h3>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                {historyEntries.map((entry, index) => (
                  <div key={entry.id} className={`mb-3 pb-3 ${index < historyEntries.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.created_at).toLocaleString('pt-BR', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                      })} por <span className="font-medium">{entry.profiles?.full_name || 'Desconhecido'}</span>
                    </p>
                    {entry.status_change_from && entry.status_change_to && entry.status_change_from !== entry.status_change_to && (
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Status alterado de <span className="font-medium">{statusMapFromSupabase[entry.status_change_from]}</span> para <span className="font-medium">{statusMapFromSupabase[entry.status_change_to]}</span>.
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-medium">Obs:</span> {entry.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceOrderDetailPage;