import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ServiceOrder {
  id: string;
  clientName: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  issueDate: string;
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
    issueDate: '2023-10-26',
    description: 'Manutenção preventiva do equipamento X.',
  },
  {
    id: 'OS002',
    clientName: 'Maria Oliveira',
    status: 'Pendente',
    issueDate: '2023-10-25',
    description: 'Instalação de novo software no servidor.',
  },
  {
    id: 'OS003',
    clientName: 'Carlos Souza',
    status: 'Concluído',
    issueDate: '2023-10-24',
    description: 'Reparo de hardware na estação de trabalho.',
  },
  {
    id: 'OS004',
    clientName: 'Ana Costa',
    status: 'Cancelado',
    issueDate: '2023-10-23',
    description: 'Orçamento para upgrade de rede.',
  },
];

export const ServiceOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>(initialServiceOrders);

  const addServiceOrder = (newOrderData: Omit<ServiceOrder, 'id' | 'issueDate' | 'status'>) => {
    const newId = `OS${String(serviceOrders.length + 1).padStart(3, '0')}`;
    const today = new Date();
    const issueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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