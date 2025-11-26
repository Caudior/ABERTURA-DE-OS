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
  // Posição do rótulo ajustada para o tamanho menor do gráfico
  const radius = outerRadius + 20; // Afastar um pouco da fatia
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="black" // Cor preta para alto contraste
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
      <div className="w-full h-[250px] flex items-center justify-center border rounded-lg"> {/* Altura ajustada */}
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg">
      {/* Removido o título "Ordens de Serviço por Status" */}
      <div className="h-[250px] p-0"> {/* Altura ajustada */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={90} // Raio externo ajustado para o tamanho menor
                fill="#8884d8"
                dataKey="value"
                label={CustomPieLabel} // Usando o componente de rótulo personalizado
                paddingAngle={5} // Adiciona um pequeno espaçamento entre as fatias
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" height={36} /> {/* Legenda na parte inferior */}
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