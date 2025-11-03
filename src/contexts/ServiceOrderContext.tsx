"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { supabase } from '@/integrations/supabase/client'; // Temporariamente comentado
// import { useAuth } from '@/contexts/AuthContext'; // Temporariamente comentado
// import { showSuccess, showError } from '@/utils/toast'; // Temporariamente comentado

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
  loadingServiceOrders: boolean;
}

const ServiceOrderContext = createContext<ServiceOrderContextType | undefined>(undefined);

export const ServiceOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('ServiceOrderProvider is rendering (simplified for diagnosis)'); // Log atualizado
  // const { session, username, userRole, loading: authLoading } = useAuth(); // Temporariamente comentado
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loadingServiceOrders, setLoadingServiceOrders] = useState(false); // Definido como false para teste

  // Funções dummy para evitar erros de tipo
  const addServiceOrder = async (order: any) => { console.log('addServiceOrder dummy called'); };
  const updateServiceOrderStatus = async (id: string, newStatus: ServiceOrder['status'], notes?: string) => { console.log('updateServiceOrderStatus dummy called'); };
  const assignTechnician = async (id: string, technicianName: string) => { console.log('assignTechnician dummy called'); };

  // Removendo o useEffect que busca dados do Supabase
  // useEffect(() => {
  //   // Lógica de busca de dados removida para diagnóstico
  // }, [session, authLoading]);

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