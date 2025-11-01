"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceOrders, ServiceOrder } from '@/contexts/ServiceOrderContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';

const TechnicianDashboardPage: React.FC = () => {
  const { session, username, loading: authLoading } = useAuth();
  const { serviceOrders } = useServiceOrders();
  const navigate = useNavigate();
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    if (!authLoading && !session) {
      navigate("/login");
    }
  }, [session, authLoading, navigate]);

  useEffect(() => {
    if (username) {
      const ordersForTechnician = serviceOrders.filter(
        (order) => order.assignedTo === username
      );
      setFilteredOrders(ordersForTechnician);
    } else {
      setFilteredOrders([]);
    }
  }, [username, serviceOrders]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return null; // Redireciona para login
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Ordens de Serviço</h1>
          </div>
          <Link to="/service-orders">
            <Button variant="outline">
              Ver Todas as Ordens
            </Button>
          </Link>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            Nenhuma ordem de serviço atribuída a você ({username}).
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg">
                    <span>{order.id} - {order.clientName}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2"><strong>Data:</strong> {order.issueDate}</p>
                  <p><strong>Descrição:</strong> {order.description}</p>
                  <p className="mb-2"><strong>Atribuído a:</strong> {order.assignedTo}</p>
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
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboardPage;