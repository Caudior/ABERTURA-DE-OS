import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ServiceOrder {
  id: string;
  clientName: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  issueDate: string; // Agora armazenará data e hora
  description: string;
}

interface ServiceOrderContextType {
  serviceOrders: ServiceOrder[];
  addServiceOrder: (order: Omit<ServiceOrder, 'id' | 'issueDate' | 'status'>) => void;
}

const ServiceOrderContext = createContext<ServiceOrderContextType | undefined>(undefined);

const initialServiceOrders: ServiceOrder[] = [
  {
    id: 'OS001',
    clientName: 'João Silva',
    status: 'Em Andamento',
    issueDate: '26/10/2023 10:30:00', // Exemplo com data e hora
    description: 'Manutenção preventiva do equipamento X.',
  },
  {
    id: 'OS002',
    clientName: 'Maria Oliveira',
    status: 'Pendente',
    issueDate: '25/10/2023 14:00:00', // Exemplo com data e hora
    description: 'Instalação de novo software no servidor.',
  },
  {
    id: 'OS003',
    clientName: 'Carlos Souza',
    status: 'Concluído',
    issueDate: '24/10/2023 09:15:00', // Exemplo com data e hora
    description: 'Reparo de hardware na estação de trabalho.',
  },
  {
    id: 'OS004',
    clientName: 'Ana Costa',
    status: 'Cancelado',
    issueDate: '23/10/2023 16:45:00', // Exemplo com data e hora
    description: 'Orçamento para upgrade de rede.',
  },
];

export const ServiceOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(initialServiceOrders);

  const addServiceOrder = (newOrderData: Omit<ServiceOrder, 'id' | 'issueDate' | 'status'>) => {
    const newId = `OS${String(serviceOrders.length + 1).padStart(3, '0')}`;
    const now = new Date();
    // Formata a data e hora para um formato legível (ex: "26/10/2023 10:30:00")
    const issueDate = now.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Usa formato de 24 horas
    });

    const newServiceOrder: ServiceOrder = {
      id: newId,
      issueDate,
      status: 'Pendente', // Novas ordens começam como 'Pendente'
      ...newOrderData,
    };
    setServiceOrders((prevOrders) => [...prevOrders, newServiceOrder]);
  };

  return (
    <ServiceOrderContext.Provider value={{ serviceOrders, addServiceOrder }}>
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