import React from 'react';
import { ServiceOrder } from '@/contexts/ServiceOrderContext';
import { statusMapFromSupabase } from '@/contexts/ServiceOrderContext';
import Logo from './Logo'; // Importar o componente Logo

interface ServiceOrderPrintProps {
  order: ServiceOrder;
  historyEntries: any[]; // Assumindo a estrutura de historyEntries
}

const ServiceOrderPrint: React.FC<ServiceOrderPrintProps> = ({ order, historyEntries }) => {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '15px', lineHeight: '1.4', color: '#333', fontSize: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
        <Logo />
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: '15px', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
        Ordem de Serviço #{order.orderNumber?.toString().padStart(4, '0') || order.id.substring(0, 8)}
      </h1>

      <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
        <h2 style={{ fontSize: '14px', marginBottom: '8px', color: '#004A99' }}>Detalhes da Ordem</h2>
        <p style={{ marginBottom: '3px' }}><strong>Cliente:</strong> {order.clientName}</p>
        <p style={{ marginBottom: '3px' }}><strong>Data de Abertura:</strong> {order.issueDate}</p>
        <p style={{ marginBottom: '3px' }}><strong>Descrição:</strong> {order.description}</p>
        <p style={{ marginBottom: '3px' }}><strong>Status Atual:</strong> {order.status}</p>
        {order.assignedTo && <p style={{ marginBottom: '3px' }}><strong>Técnico Atribuído:</strong> {order.assignedTo}</p>}
      </div>

      {historyEntries.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '14px', marginBottom: '8px', color: '#004A99' }}>Histórico da Ordem</h2>
          {historyEntries.map((entry, index) => (
            <div key={entry.id} style={{ marginBottom: '10px', paddingBottom: '5px', borderBottom: index < historyEntries.length - 1 ? '1px dashed #eee' : 'none' }}>
              <p style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>
                {new Date(entry.created_at).toLocaleString('pt-BR', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                })} por <span style={{ fontWeight: 'bold' }}>{entry.profiles?.full_name || 'Desconhecido'}</span>
              </p>
              {entry.status_change_from && entry.status_change_to && entry.status_change_from !== entry.status_change_to && (
                <p style={{ fontSize: '12px', marginBottom: '2px' }}>
                  Status alterado de <span style={{ fontWeight: 'bold' }}>{statusMapFromSupabase[entry.status_change_from]}</span> para <span style={{ fontWeight: 'bold' }}>{statusMapFromSupabase[entry.status_change_to]}</span>.
                </p>
              )}
              {entry.notes && (
                <p style={{ fontSize: '12px' }}>
                  <span style={{ fontWeight: 'bold' }}>Obs:</span> {entry.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', color: '#888', borderTop: '1px solid #eee', paddingTop: '8px' }}>
        <p>Documento gerado em {new Date().toLocaleString('pt-BR')}</p>
        <p>Eliel Figueirêdo - Laboratório e Imagem</p>
      </div>
    </div>
  );
};

export default ServiceOrderPrint;