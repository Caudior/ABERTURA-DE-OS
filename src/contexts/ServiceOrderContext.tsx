"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/Auth/AuthContext'; // Importar useAuth para obter a role
import { showSuccess, showError } from '@/utils/toast';

// Mapeamento de status da UI para o Supabase (assumindo enum em inglês no DB)
const statusMapToSupabase: Record<ServiceOrder['status'], string> = {
  'Pendente': 'open',
  'Em Andamento': 'in_progress',
  'Em Deslocamento': 'on_the_way',
  'Chegou': 'arrived',
  'Concluído': 'completed',
  'Cancelado': 'cancelled',
};

// Mapeamento de status do Supabase para a UI
const statusMapFromSupabase: Record<string, ServiceOrder['status']> = {
  'open': 'Pendente',
  'in_progress': 'Em Andamento',
  'on_the_way': 'Em Deslocamento',
  'arrived': 'Chegou',
  'completed': 'Concluído',
  'cancelled': 'Cancelado',
};

export interface ServiceOrder {
  id: string;
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
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'issueDate' | 'status' | 'client_id' | 'created_by' | 'assigned_technician_id' | 'assignedTo'>) => Promise<void>;
  updateServiceOrderStatus: (id: string, newStatus: ServiceOrder['status']) => Promise<void>;
  assignTechnician: (id: string, technicianName: string) => Promise<void>;
  loadingServiceOrders: boolean;
}

const ServiceOrderContext = createContext<ServiceOrderContextType | undefined>(undefined);

export const ServiceOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, username, userRole, loading: authLoading } = useAuth(); // Obter userRole
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
        created_at,
        description,
        status,
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

  const addServiceOrder = async (newOrderData: Omit<ServiceOrder, 'id' | 'issueDate' | 'status' | 'client_id' | 'created_by' | 'assigned_technician_id' | 'assignedTo'>) => {
    if (!session?.user?.id) {
      showError('Usuário não autenticado.');
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

    if (clientError && clientError.code !== 'PGRST116') { // PGRST116 = No rows found
      console.error('Error checking client:', clientError);
      showError('Erro ao verificar cliente.');
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
        console.error('Error creating client:', insertClientError);
        showError('Erro ao criar novo cliente.');
        return;
      }
      clientId = newClient.id;
    }

    if (!clientId) {
      showError('Não foi possível determinar o ID do cliente.');
      return;
    }

    // 2. Inserir a ordem de serviço
    const { data: insertedOrder, error: insertOrderError } = await supabase
      .from('service_orders')
      .insert({
        client_id: clientId,
        description: newOrderData.description,
        status: statusMapToSupabase['Pendente'], // Status inicial
        created_by: currentUserId,
      })
      .select(`
        id,
        created_at,
        description,
        status,
        client_id,
        assigned_technician_id,
        created_by
      `)
      .single();

    if (insertOrderError) {
      console.error('Error adding service order:', insertOrderError);
      showError('Erro ao criar ordem de serviço.');
      return;
    }

    // Após inserir, buscar os nomes para o novo item usando os mapas do estado
    const clientName = clientsMap.get(insertedOrder.client_id) || newOrderData.clientName;
    const assignedTo = insertedOrder.assigned_technician_id ? profilesMap.get(insertedOrder.assigned_technician_id) : undefined;

    const newServiceOrder: ServiceOrder = {
      id: insertedOrder.id,
      client_id: insertedOrder.client_id,
      clientName: clientName,
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

  const updateServiceOrderStatus = async (id: string, newStatus: ServiceOrder['status']) => {
    const supabaseStatus = statusMapToSupabase[newStatus];
    const { data, error } = await supabase
      .from('service_orders')
      .update({ status: supabaseStatus })
      .eq('id', id);

    if (error) {
      console.error('Supabase Error updating service order status:', error);
      showError(error.message || 'Erro ao atualizar status da ordem de serviço.');
    } else {
      console.log('Supabase Success updating service order status:', data);
      setServiceOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      showSuccess(`Status da OS ${id} atualizado para "${newStatus}"`);
    }
  };

  const assignTechnician = async (id: string, technicianName: string) => {
    if (userRole !== 'admin') { // Verificação de função
      showError('Apenas administradores podem atribuir técnicos.');
      return;
    }

    // Buscar o ID do técnico pelo nome
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

    console.log(`[DEBUG] ServiceOrderContext: Atribuindo técnico. OS ID: ${id}, Nome do Técnico: ${technicianName}, ID do Técnico (do profiles): ${technicianId}`);

    const { data, error } = await supabase
      .from('service_orders')
      .update({ assigned_technician_id: technicianId })
      .eq('id', id);

    if (error) {
      console.error('Supabase Error assigning technician:', error);
      showError(error.message || 'Erro ao atribuir técnico à ordem de serviço.');
    } else {
      console.log('Supabase Success assigning technician:', data);
      setServiceOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === id ? { ...order, assignedTo: technicianName, assigned_technician_id: technicianId } : order
        )
      );
      showSuccess(`OS ${id} atribuída a ${technicianName}`);
    }
  };

  return (
    <ServiceOrderContext.Provider value={{ serviceOrders, addServiceOrder, updateServiceOrderStatus, assignTechnician, loadingServiceOrders }}>
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