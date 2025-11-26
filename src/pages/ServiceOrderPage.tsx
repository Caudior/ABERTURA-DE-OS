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
import { Input } from '@/components/ui/input';
import { addHours, isBefore, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import Logo from '@/components/Logo'; // Certifique-se de que o Logo está importado aqui

const ServiceOrderPage: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const { serviceOrders } = useServiceOrders();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'Todos' | ServiceOrder['status']>('Todos');
  const [searchOsNumber, setSearchOsNumber] = useState('');
  const [searchClientName, setSearchClientName] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

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

  const isOverdue = (order: ServiceOrder) => {
    if (order.status === 'Pendente') {
      const fortyEightHoursAgo = addHours(new Date(), -48);
      return isBefore(order.issueDate, fortyEightHoursAgo);
    }
    return false;
  };

  const filteredAndSortedOrders = serviceOrders
    .filter(order => {
      const statusMatch = filterStatus === 'Todos' || order.status === filterStatus;
      const osNumberString = order.orderNumber?.toString().padStart(4, '0') || order.id.substring(0, 8);
      const osNumberMatch = searchOsNumber === '' || osNumberString.toLowerCase().includes(searchOsNumber.toLowerCase());
      const clientNameMatch = searchClientName === '' || order.clientName.toLowerCase().includes(searchClientName.toLowerCase());

      let dateRangeMatch = true;
      if (dateRange?.from) {
        const orderLocalDayStart = startOfDay(order.issueDate);
        const filterRangeStart = startOfDay(dateRange.from);
        const filterRangeEnd = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        dateRangeMatch = orderLocalDayStart.getTime() >= filterRangeStart.getTime() && orderLocalDayStart.getTime() <= filterRangeEnd.getTime();
      }

      return statusMatch && osNumberMatch && clientNameMatch && dateRangeMatch;
    })
    .sort((a, b) => {
      // Ordena por orderNumber em ordem crescente
      // Trata undefined/null como 0 para fins de ordenação, colocando-os no início
      const orderA = a.orderNumber ?? 0;
      const orderB = b.orderNumber ?? 0;
      return orderA - orderB;
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
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Input
              placeholder="Pesquisar por OS #"
              value={searchOsNumber}
              onChange={(e) => setSearchOsNumber(e.target.value)}
              className="w-full sm:w-[180px]"
            />
            <Input
              placeholder="Pesquisar por Cliente"
              value={searchClientName}
              onChange={(e) => setSearchClientName(e.target.value)}
              className="w-full sm:w-[180px]"
            />
            <Select
              value={filterStatus}
              onValueChange={(value: 'Todos' | ServiceOrder['status']) => setFilterStatus(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
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
            <DatePickerWithRange
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full sm:w-[240px]"
            />
            <Link to="/service-orders/new">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Ordem
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedOrders.map((order) => {
            const daysOpen = differenceInDays(new Date(), order.issueDate);
            return (
              <Card key={order.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-lg">
                    <span>OS #{order.orderNumber?.toString().padStart(4, '0') || order.id.substring(0, 8)} - {order.clientName}</span>
                    <span
                      className={getStatusClasses(order)}
                    >
                      {order.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2"><strong>Data:</strong> {order.issueDate.toLocaleString('pt-BR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  })}</p>
                  <p className="mb-2"><strong>Dias em Aberto:</strong> <span className="font-bold text-primary">{daysOpen}</span></p>
                  <p className="mb-2"><strong>Descrição:</strong> {order.description}</p>
                  {order.assignedTo && (
                    <p className="mb-2">
                      <strong>Técnico:</strong>{' '}
                      <span className="text-red-600 dark:text-red-400">
                        {order.assignedTo}
                      </span>
                    </p>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Link to={`/service-orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            Nenhuma ordem de serviço encontrada com o status "{filterStatus}".
          </p>
        )}
      </div>
    </div>
  );
};

export default ServiceOrderPage;