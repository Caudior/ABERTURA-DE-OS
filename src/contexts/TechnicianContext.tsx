import React, { createContext, useContext, useState, ReactNode } from 'react';
import { showSuccess, showError } from '@/utils/toast';

export interface Technician {
  id: string;
  name: string;
}

interface TechnicianContextType {
  technicians: Technician[];
  addTechnician: (name: string) => void;
}

const TechnicianContext = createContext<TechnicianContextType | undefined>(undefined);

const initialTechnicians: Technician[] = [
  { id: 'tech1', name: 'Técnico A' },
  { id: 'tech2', name: 'Técnico B' },
  { id: 'tech3', name: 'Técnico C' },
];

export const TechnicianProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);

  const addTechnician = (name: string) => {
    if (technicians.some(tech => tech.name.toLowerCase() === name.toLowerCase())) {
      showError(`O técnico "${name}" já existe.`);
      return;
    }
    const newId = `tech${technicians.length + 1}`;
    const newTechnician: Technician = { id: newId, name };
    setTechnicians((prevTechs) => [...prevTechs, newTechnician]);
    showSuccess(`Técnico "${name}" cadastrado com sucesso!`);
  };

  return (
    <TechnicianContext.Provider value={{ technicians, addTechnician }}>
      {children}
    </TechnicianContext.Provider>
  );
};

export const useTechnicians = () => {
  const context = useContext(TechnicianContext);
  if (context === undefined) {
    throw new Error('useTechnicians must be used within a TechnicianProvider');
  }
  return context;
};