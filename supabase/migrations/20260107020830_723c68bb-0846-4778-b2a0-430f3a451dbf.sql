-- Create enums for various statuses
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.rsvp_status AS ENUM ('pending', 'attending', 'not_attending', 'maybe');
CREATE TYPE public.wedding_phase AS ENUM ('proposal_engagement', 'pre_wedding', 'wedding_day', 'post_wedding');

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Weddings table
CREATE TABLE public.weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_name_1 TEXT NOT NULL,
  partner_name_2 TEXT NOT NULL,
  wedding_date DATE,
  venue_name TEXT,
  total_budget DECIMAL(12, 2) DEFAULT 0,
  current_phase wedding_phase DEFAULT 'proposal_engagement',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weddings" ON public.weddings
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own weddings" ON public.weddings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own weddings" ON public.weddings
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own weddings" ON public.weddings
  FOR DELETE USING (auth.uid() = owner_id);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  budget_allocated DECIMAL(12, 2) DEFAULT 0,
  budget_spent DECIMAL(12, 2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories of own weddings" ON public.categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = categories.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can insert categories to own weddings" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = categories.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can update categories of own weddings" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = categories.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can delete categories of own weddings" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = categories.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending',
  priority task_priority DEFAULT 'medium',
  due_date DATE,
  phase wedding_phase,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks of own weddings" ON public.tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = tasks.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can insert tasks to own weddings" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = tasks.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can update tasks of own weddings" ON public.tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = tasks.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can delete tasks of own weddings" ON public.tasks
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = tasks.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Budget items table
CREATE TABLE public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  estimated_cost DECIMAL(12, 2) DEFAULT 0,
  actual_cost DECIMAL(12, 2) DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view budget items of own weddings" ON public.budget_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = budget_items.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can insert budget items to own weddings" ON public.budget_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = budget_items.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can update budget items of own weddings" ON public.budget_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = budget_items.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can delete budget items of own weddings" ON public.budget_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = budget_items.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Guests table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rsvp_status rsvp_status DEFAULT 'pending',
  dietary_preferences TEXT,
  plus_one BOOLEAN DEFAULT false,
  plus_one_name TEXT,
  table_assignment TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view guests of own weddings" ON public.guests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = guests.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can insert guests to own weddings" ON public.guests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = guests.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can update guests of own weddings" ON public.guests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = guests.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can delete guests of own weddings" ON public.guests
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = guests.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  contract_signed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vendors of own weddings" ON public.vendors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = vendors.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can insert vendors to own weddings" ON public.vendors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = vendors.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can update vendors of own weddings" ON public.vendors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = vendors.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can delete vendors of own weddings" ON public.vendors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = vendors.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Timeline events table (for wedding day schedule)
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID REFERENCES public.weddings(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT,
  assigned_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timeline events of own weddings" ON public.timeline_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = timeline_events.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can insert timeline events to own weddings" ON public.timeline_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = timeline_events.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can update timeline events of own weddings" ON public.timeline_events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = timeline_events.wedding_id AND weddings.owner_id = auth.uid())
  );

CREATE POLICY "Users can delete timeline events of own weddings" ON public.timeline_events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.weddings WHERE weddings.id = timeline_events.wedding_id AND weddings.owner_id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON public.weddings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timeline_events_updated_at BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();