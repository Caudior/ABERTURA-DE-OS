import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useServiceOrders } from '@/contexts/ServiceOrderContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']; // Cores para os status

// Componente de rótulo personalizado para o gráfico de pizza
const CustomPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  // Posição do rótulo um pouco mais afastada da fatia
  const radius = outerRadius + 25; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#333" // Cor escura para o texto, visível em fundos claros
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12px" // Tamanho da fonte explícito
      fontWeight="bold" // Negrito para destaque
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
      <div className="w-full h-[250px] flex items-center justify-center border rounded-lg">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Ordens de Serviço por Status</h2>
      </div>
      <div className="h-[250px] p-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100} // Aumentado o raio externo para dar mais espaço aos rótulos
                fill="#8884d8"
                dataKey="value"
                label={CustomPieLabel} // Usando o componente de rótulo personalizado
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