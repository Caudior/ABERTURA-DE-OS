import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useServiceOrders } from '@/contexts/ServiceOrderContext';
// Removendo a importação de Card, CardContent, CardHeader, CardTitle para o teste
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
      <div className="w-full h-[250px] flex items-center justify-center border rounded-lg"> {/* Substituído Card por div */}
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg"> {/* Substituído Card por div */}
      <div className="p-4 border-b"> {/* Substituído CardHeader por div */}
        <h2 className="text-xl font-bold">Ordens de Serviço por Status</h2> {/* Substituído CardTitle por h2 */}
      </div>
      <div className="h-[250px] p-0"> {/* Substituído CardContent por div */}
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
      </div>
    </div>
  );
};

export default ServiceOrderStatusChart;