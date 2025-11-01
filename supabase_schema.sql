-- Tabela para perfis de usuário (Administrador, Técnico, Cliente)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'client', -- 'admin', 'technician', 'client'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) para a tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela users
CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow authenticated users to update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admins to manage all user profiles" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- Tabela para clientes
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  company_name TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Habilitar RLS para a tabela clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela clients
CREATE POLICY "Allow authenticated users to read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage clients" ON public.clients FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow clients to read their own client data" ON public.clients FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'client' AND created_by = auth.uid()));


-- Tabela para Ordens de Serviço (OS)
CREATE TYPE service_order_status AS ENUM ('open', 'in_progress', 'in_transit', 'completed', 'not_completed');

CREATE TABLE public.service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  status service_order_status DEFAULT 'open' NOT NULL,
  assigned_technician_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  not_completed_reason TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Habilitar RLS para a tabela service_orders
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela service_orders
CREATE POLICY "Allow authenticated users to read service orders" ON public.service_orders FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage service orders" ON public.service_orders FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow technicians to update their assigned service orders" ON public.service_orders FOR UPDATE USING (auth.uid() = assigned_technician_id AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'technician'));
CREATE POLICY "Allow clients to create their own service orders" ON public.service_orders FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'client' AND created_by = auth.uid()));
CREATE POLICY "Allow clients to read their own service orders" ON public.service_orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid()));


-- Tabela para histórico de status e deslocamento da OS
CREATE TABLE public.service_order_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE NOT NULL,
  status_change_from service_order_status,
  status_change_to service_order_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  -- Campos para geolocalização (opcional)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- Habilitar RLS para a tabela service_order_history
ALTER TABLE public.service_order_history ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para a tabela service_order_history
CREATE POLICY "Allow authenticated users to read service order history" ON public.service_order_history FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage service order history" ON public.service_order_history FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow technicians to insert history for their assigned service orders" ON public.service_order_history FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.service_orders WHERE id = service_order_id AND assigned_technician_id = auth.uid()));
CREATE POLICY "Allow clients to read history for their service orders" ON public.service_order_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_orders so JOIN public.clients c ON so.client_id = c.id WHERE so.id = service_order_id AND c.created_by = auth.uid()));