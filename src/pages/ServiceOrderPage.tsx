"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceOrders, ServiceOrder } from '@/contexts/ServiceOrderContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Logo from '@/components/Logo';
import { parse, addHours, isBefore } from 'date-fns'; // Importar funções de data

const ServiceOrderPage: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const { serviceOrders } = useServiceOrders();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'Todos' | ServiceOrder['status']>('Todos');

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login");
    }
  }, [session, authLoading, navigate]);

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

  // Função para verificar se a OS está pendente e há mais de 48 horas
  const isOverdue = (order: ServiceOrder) => {
    if (order.status === 'Pendente') {
      const issueDateTime = parse(order.issueDate, 'dd/MM/yyyy HH:mm:ss', new Date());
      const fortyEightHoursAgo = addHours(new Date(), -48);
      return isBefore(issueDateTime, fortyEightHoursAgo);
    }
    return false;
  };

  const filteredOrders = serviceOrders.filter(order => {
    if (filterStatus === 'Todos') {
      return true;
    }
    return order.status === filterStatus;
  });

  const getStatusClasses = (order: ServiceOrder) => {
    const status = order.status;
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';

    if (isOverdue(order)) {
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
    }

    switch (status) {
      case 'Pendente': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'Em Andamento': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
      case 'Em Deslocamento': return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`;
      case 'Chegou': return `${baseClasses} bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300`;
      case 'Concluído': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'Cancelado': return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
      default: return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ordens de Serviço</h1>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Select
              value={filterStatus}
              onValueChange={(value: 'Todos' | ServiceOrder['status']) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Em Deslocamento">Em Deslocamento</SelectItem>
                <SelectItem value="Chegou">Chegou</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Link to="/service-orders/new">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Ordem
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>{order.id} - {order.clientName}</span>
                  <span
                    className={getStatusClasses(order)} // Usar a nova função getStatusClasses
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

        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            Nenhuma ordem de serviço encontrada com o status "{filterStatus}".
          </p>
        )}
      </div>
    </div>
  );
};

export default ServiceOrderPage;