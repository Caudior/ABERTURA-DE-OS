"use client";

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useServiceOrders } from '@/contexts/ServiceOrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']; // Cores para os status

const ServiceOrderStatusChart: React.FC = () => {
  const { serviceOrders, loadingServiceOrders } = useServiceOrders();
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    if (serviceOrders.length > 0) {
      const statusCounts: { [key: string]: number } = {};
      serviceOrders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      const data = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status],
      }));
      setChartData(data);
    } else {
      setChartData([]);
    }
  }, [serviceOrders]);

  if (loadingServiceOrders) {
    return (
      <Card className="w-full h-[250px] flex items-center justify-center"> {/* Altura ajustada */}
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Ordens de Serviço por Status</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] p-0"> {/* Altura ajustada */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80} {/* Raio externo reduzido */}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Nenhuma ordem de serviço para exibir no gráfico.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceOrderStatusChart;