import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ServiceOrder {
  id: string;
  clientName: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado' | 'Em Deslocamento' | 'Chegou'; // Adicionado novos status
  issueDate: string; // Agora armazenará data e hora
  description: string;
  assignedTo?: string; // Novo campo para o técnico atribuído
}

interface ServiceOrderContextType {
  serviceOrders: ServiceOrder[];
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'issueDate' | 'status' | 'assignedTo'>) => void;
  updateServiceOrderStatus: (id: string, newStatus: ServiceOrder['status']) => void;
  assignTechnician: (id: string, technicianName: string) => void; // Nova função para atribuir técnico
}

const ServiceOrderContext = createContext<ServiceOrderContextType | undefined>(undefined);

const initialServiceOrders: ServiceOrder[] = [
  {
    id: 'OS001',
    clientName: 'João Silva',
    status: 'Em Andamento',
    issueDate: '26/10/2023 10:30:00',
    description: 'Manutenção preventiva do equipamento X.',
    assignedTo: 'Técnico A', // Exemplo de técnico atribuído
  },
  {
    id: 'OS002',
    clientName: 'Maria Oliveira',
    status: 'Pendente',
    issueDate: '25/10/2023 14:00:00',
    description: 'Instalação de novo software no servidor.',
  },
  {
    id: 'OS003',
    clientName: 'Carlos Souza',
    status: 'Concluído',
    issueDate: '24/10/2023 09:15:00',
    description: 'Reparo de hardware na estação de trabalho.',
    assignedTo: 'Técnico B',
  },
  {
    id: 'OS004',
    clientName: 'Ana Costa',
    status: 'Cancelado',
    issueDate: '23/10/2023 16:45:00',
    description: 'Orçamento para upgrade de rede.',
  },
];

export const ServiceOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(initialServiceOrders);

  const addServiceOrder = (newOrderData: Omit<ServiceOrder, 'id' | 'issueDate' | 'status' | 'assignedTo'>) => {
    const newId = `OS${String(serviceOrders.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const issueDate = now.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const newServiceOrder: ServiceOrder = {
      id: newId,
      issueDate,
      status: 'Pendente',
      ...newOrderData,
    };
    setServiceOrders((prevOrders) => [...prevOrders, newServiceOrder]);
  };

  const updateServiceOrderStatus = (id: string, newStatus: ServiceOrder['status']) => {
    setServiceOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const assignTechnician = (id: string, technicianName: string) => {
    setServiceOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, assignedTo: technicianName } : order
      )
    );
  };

  return (
    <ServiceOrderContext.Provider value={{ serviceOrders, addServiceOrder, updateServiceOrderStatus, assignTechnician }}>
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