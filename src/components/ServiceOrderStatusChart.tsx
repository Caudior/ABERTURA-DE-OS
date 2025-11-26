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
const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  // Calcula o raio para posicionar o rótulo dentro da fatia
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5; // Meio da fatia
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white" // Cor branca para alto contraste dentro da fatia
      textAnchor="middle" // Centraliza o texto horizontalmente
      dominantBaseline="central" // Centraliza o texto verticalmente
      fontSize="12px" // Tamanho da fonte explícito
      fontWeight="bold" // Negrito para destaque
    >
      {`${(percent * 100).toFixed(1)}%`} {/* Alterado para 1 casa decimal */}
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
      <div className="h-[250px] p-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false} // Desabilita a linha do rótulo, já que o texto estará dentro
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={CustomPieLabel} // Usando o componente de rótulo personalizado
                paddingAngle={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" height={70} /> {/* Aumentado a altura para 70 */}
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