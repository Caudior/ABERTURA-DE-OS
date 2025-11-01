"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data for service orders
interface ServiceOrder {
  id: string;
  clientName: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  issueDate: string;
  description: string;
}

const mockServiceOrders: ServiceOrder[] = [
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

const ServiceOrderPage: React.FC = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ordens de Serviço</h1>
          <Link to="/service-orders/new">
            <Button>
              <span>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Ordem
              </span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServiceOrders.map((order) => (
            <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>{order.id} - {order.clientName}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Pendente'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : order.status === 'Em Andamento'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : order.status === 'Concluído'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {order.status}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2"><strong>Data:</strong> {order.issueDate}</p>
                <p><strong>Descrição:</strong> {order.description}</p>
                <div className="mt-4 flex justify-end">
                  <Link to={`/service-orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockServiceOrders.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            Nenhuma ordem de serviço encontrada. Crie uma nova!
          </p>
        )}
      </div>
    </div>
  );
};

export default ServiceOrderPage;