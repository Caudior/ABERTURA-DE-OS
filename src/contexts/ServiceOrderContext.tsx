"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { showSuccess, showError } from '@/utils/toast';

// Mapeamento de status da UI para o Supabase (assumindo enum em inglês no DB)
export const statusMapToSupabase: Record<ServiceOrder['status'], string> = {
  'Pendente': 'open',
  'Em Andamento': 'in_progress',
  'Em Deslocamento': 'on_the_way',
  'Chegou': 'arrived',
  'Concluído': 'completed',
  'Cancelado': 'cancelled',
};

// Mapeamento de status do Supabase para a UI
export const statusMapFromSupabase: Record<string, ServiceOrder['status']> = {
  'open': 'Pendente',
  'in_progress': 'Em Andamento',
  'on_the_way': 'Em Deslocamento',
  'arrived': 'Chegou',
  'completed': 'Concluído',
  'cancelled': 'Cancelado',
};

export interface ServiceOrder {
  id: string;
  orderNumber?: number; // Adicionado o novo campo para o número sequencial
  client_id: string;
  clientName: string; // Para exibição, derivado de client_id
  description: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado' | 'Em Deslocamento' | 'Chegou';
  issueDate: string; // created_at do Supabase
  assigned_technician_id?: string; // ID do técnico no Supabase
  assignedTo?: string; // Para exibição, nome do técnico
  created_by: string; // ID do usuário que criou a OS
}

interface ServiceOrderContextType {
  serviceOrders: ServiceOrder[];
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'issueDate' | 'status' | 'client_id' | 'created_by' | 'assigned_technician_id' | 'assignedTo' | 'orderNumber'>) => Promise<void>;
  updateServiceOrderStatus: (id: string, newStatus: ServiceOrder['status'], notes?: string) => Promise<void>;
  assignTechnician: (id: string, technicianName: string) => Promise<void>;
  addServiceOrderHistoryNote: (orderId: string, notes: string, currentStatus: ServiceOrder['status']) => Promise<void>; // Nova função
  loadingServiceOrders: boolean;
}

const ServiceOrderContext = createContext<ServiceOrderContextType | undefined>(undefined);

export const ServiceOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, username, userRole, loading: authLoading } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loadingServiceOrders, setLoadingServiceOrders] = useState(true);
  const [clientsMap, setClientsMap] = useState<Map<string, string>>(new Map());
  const [profilesMap, setProfilesMap] = useState<Map<string, string>>(new Map());

  const fetchServiceOrders = async () => {
    if (!session) {
      setServiceOrders([]);
      setLoadingServiceOrders(false);
      return;
    }

    setLoadingServiceOrders(true);
    const { data: serviceOrdersData, error } = await supabase
      .from('service_orders')
      .select(`
        id,
        order_number,
        created_at,
        description,
        status::text,
        client_id,
        assigned_technician_id,
        created_by
      `);

    if (error) {
      console.error('Error fetching service orders:', error);
      showError('Erro ao carregar ordens de serviço.');
      setServiceOrders([]);
    } else {
      const clientIds = [...new Set(serviceOrdersData.map(so => so.client_id))];
      const technicianIds = [...new Set(serviceOrdersData.map(so => so.assigned_technician_id).filter(Boolean))];

      let currentClientsMap = new Map<string, string>();
      if (clientIds.length > 0) {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id, name')
          .in('id', clientIds);
        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        } else {
          clientsData.forEach(client => currentClientsMap.set(client.id, client.name));
        }
      }
      setClientsMap(currentClientsMap);

      let currentProfilesMap = new Map<string, string>();
      if (technicianIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', technicianIds);
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          profilesData.forEach(profile => currentProfilesMap.set(profile.id, profile.full_name || 'Nome Desconhecido'));
        }
      }
      setProfilesMap(currentProfilesMap);

      const mappedOrders: ServiceOrder[] = serviceOrdersData.map((so: any) => ({
        id: so.id,
        orderNumber: so.order_number,
        client_id: so.client_id,
        clientName: currentClientsMap.get(so.client_id) || 'Cliente Desconhecido',
        description: so.description,
        status: statusMapFromSupabase[so.status] || 'Pendente',
        issueDate: new Date(so.created_at).toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
        assigned_technician_id: so.assigned_technician_id,
        assignedTo: so.assigned_technician_id ? currentProfilesMap.get(so.assigned_technician_id) : undefined,
        created_by: so.created_by,
      }));
      setServiceOrders(mappedOrders);
    }
    setLoadingServiceOrders(false);
  };

  useEffect(() => {
    if (!authLoading && session) {
      fetchServiceOrders();
    } else if (!authLoading && !session) {
      setServiceOrders([]);
      setLoadingServiceOrders(false);
    }
  }, [session, authLoading]);

  const addServiceOrder = async (newOrderData: Omit<ServiceOrder, 'id' | 'issueDate' | 'status' | 'client_id' | 'created_by' | 'assigned_technician_id' | 'assignedTo' | 'orderNumber'>) => {
    if (!session?.user?.id) {
      showError('Usuário não autenticado. Por favor, faça login novamente.');
      console.error('addServiceOrder: User not authenticated.');
      return;
    }

    const currentUserId = session.user.id;
    let clientId: string | null = null;

    // 1. Encontrar ou criar o cliente
    const { data: existingClient, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('name', newOrderData.clientName)
      .eq('created_by', currentUserId)
      .single();

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('addServiceOrder: Error checking client:', clientError);
      showError(`Erro ao verificar cliente: ${clientError.message}`);
      return;
    }

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: insertClientError } = await supabase
        .from('clients')
        .insert({ name: newOrderData.clientName, created_by: currentUserId })
        .select('id')
        .single();

      if (insertClientError) {
        console.error('addServiceOrder: Error creating client:', insertClientError);
        showError(`Erro ao criar novo cliente: ${insertClientError.message}`);
        return;
      }
      clientId = newClient.id;
    }

    if (!clientId) {
      console.error('addServiceOrder: Client ID could not be determined.');
      showError('Não foi possível determinar o ID do cliente.');
      return;
    }

    // 2. Inserir a ordem de serviço
    const { data: insertedOrder, error: insertOrderError } = await supabase
      .from('service_orders')
      .insert({
        client_id: clientId,
        description: newOrderData.description,
        status: statusMapToSupabase['Pendente'],
        created_by: currentUserId,
      })
      .select(`
        id,
        order_number,
        created_at,
        description,
        status,
        client_id,
        assigned_technician_id,
        created_by
      `)
      .single();

    if (insertOrderError) {
      console.error('addServiceOrder: Error adding service order:', insertOrderError);
      showError(`Erro ao criar ordem de serviço: ${insertOrderError.message}`);
      return;
    }

    if (!insertedOrder) {
      console.error('addServiceOrder: Inserted order data is null or undefined.');
      showError('Erro inesperado: A ordem de serviço não foi retornada após a criação.');
      return;
    }

    const clientNameForDisplay = newOrderData.clientName;
    const assignedTo = insertedOrder.assigned_technician_id ? profilesMap.get(insertedOrder.assigned_technician_id) : undefined;

    const newServiceOrder: ServiceOrder = {
      id: insertedOrder.id,
      orderNumber: insertedOrder.order_number,
      client_id: insertedOrder.client_id,
      clientName: clientNameForDisplay,
      description: insertedOrder.description,
      status: statusMapFromSupabase[insertedOrder.status] || 'Pendente',
      issueDate: new Date(insertedOrder.created_at).toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      assigned_technician_id: insertedOrder.assigned_technician_id,
      assignedTo: assignedTo,
      created_by: insertedOrder.created_by,
    };

    setServiceOrders((prevOrders) => [...prevOrders, newServiceOrder]);
    showSuccess('Ordem de serviço criada com sucesso!');
  };

  const updateServiceOrderStatus = async (id: string, newStatus: ServiceOrder['status'], notes?: string) => {
    if (!session?.user?.id) {
      showError('Usuário não autenticado.');
      return;
    }
    const currentUserId = session.user.id;
    const supabaseStatus = statusMapToSupabase[newStatus];

    const { data: currentOrderData, error: fetchError } = await supabase
      .from('service_orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrderData) {
      console.error('Error fetching current service order status:', fetchError);
      showError('Erro ao obter status atual da ordem de serviço.');
      return;
    }

    const previousSupabaseStatus = currentOrderData.status;
    const previousUiStatus = statusMapFromSupabase[previousSupabaseStatus] || 'Pendente';

    const { error: updateError } = await supabase
      .from('service_orders')
      .update({ status: supabaseStatus })
      .eq('id', id);

    if (updateError) {
      console.error('Supabase Error updating service order status:', updateError);
      showError(updateError.message || 'Erro ao atualizar status da ordem de serviço.');
      return;
    }

    // Always insert history when status changes
    const { error: historyError } = await supabase
      .from('service_order_history')
      .insert({
        service_order_id: id,
        status_change_from: previousSupabaseStatus,
        status_change_to: supabaseStatus,
        changed_by: currentUserId,
        notes: notes || `Status alterado de '${previousUiStatus}' para '${newStatus}'.`, // Use provided notes or default
      });

    if (historyError) {
      console.error('Supabase Error inserting service order history:', historyError);
      showError('Erro ao registrar histórico da ordem de serviço.');
    }

    setServiceOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
    showSuccess(`Status da OS ${id} atualizado para "${newStatus}"`);
  };

  const assignTechnician = async (id: string, technicianName: string) => {
    if (userRole !== 'admin') {
      showError('Apenas administradores podem atribuir técnicos.');
      return;
    }

    const { data: technicianProfile, error: techError } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', technicianName)
      .eq('role', 'technician')
      .single();

    if (techError || !technicianProfile) {
      console.error('Error finding technician:', techError);
      showError('Técnico não encontrado ou não é um técnico válido.');
      return;
    }

    const technicianId = technicianProfile.id;

    const { error } = await supabase
      .from('service_orders')
      .update({ assigned_technician_id: technicianId })
      .eq('id', id);

    if (error) {
      console.error('Supabase Error assigning technician:', error);
      showError(error.message || 'Erro ao atribuir técnico à ordem de serviço.');
    } else {
      setServiceOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, assignedTo: technicianName, assigned_technician_id: technicianId } : order
        )
      );
      showSuccess(`OS ${id} atribuída a ${technicianName}`);
    }
  };

  const addServiceOrderHistoryNote = async (orderId: string, notes: string, currentStatus: ServiceOrder['status']) => {
    if (!session?.user?.id) {
      showError('Usuário não autenticado.');
      return;
    }
    const currentUserId = session.user.id;
    const supabaseStatus = statusMapToSupabase[currentStatus];

    const { error } = await supabase
      .from('service_order_history')
      .insert({
        service_order_id: orderId,
        status_change_from: supabaseStatus, // Registra o status atual como 'de' e 'para'
        status_change_to: supabaseStatus,
        changed_by: currentUserId,
        notes: notes,
      });

    if (error) {
      console.error('Supabase Error inserting service order history note:', error); // Log detalhado
      showError('Erro ao salvar observação.');
    } else {
      showSuccess('Observação salva com sucesso!');
    }
  };

  return (
    <ServiceOrderContext.Provider value={{ serviceOrders, addServiceOrder, updateServiceOrderStatus, assignTechnician, addServiceOrderHistoryNote, loadingServiceOrders }}>
      {children}
    </ServiceOrderContext.Provider>
  );
};

export const useServiceOrders = () => {
  const context = useContext(ServiceOrderContext);
  if (context === undefined) {
    throw new Error('useServiceOrders must be used within a ServiceOrderProvider');
  }
  return context;
};