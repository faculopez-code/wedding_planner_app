import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Tables } from '@/integrations/supabase/types';

type Wedding = Tables<'weddings'>;
type Category = Tables<'categories'>;
type Task = Tables<'tasks'>;
type Guest = Tables<'guests'>;
type BudgetItem = Tables<'budget_items'>;
type Vendor = Tables<'vendors'>;

interface WeddingContextType {
  wedding: Wedding | null;
  categories: Category[];
  tasks: Task[];
  guests: Guest[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  loading: boolean;
  refreshData: () => Promise<void>;
  createWedding: (data: { partner_name_1: string; partner_name_2: string; wedding_date?: string; total_budget?: number }) => Promise<Wedding | null>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeddingData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch wedding
    const { data: weddingData } = await supabase
      .from('weddings')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (weddingData) {
      setWedding(weddingData);

      // Fetch related data
      const [categoriesRes, tasksRes, guestsRes, budgetRes, vendorsRes] = await Promise.all([
        supabase.from('categories').select('*').eq('wedding_id', weddingData.id).order('sort_order'),
        supabase.from('tasks').select('*').eq('wedding_id', weddingData.id).order('due_date'),
        supabase.from('guests').select('*').eq('wedding_id', weddingData.id).order('full_name'),
        supabase.from('budget_items').select('*').eq('wedding_id', weddingData.id),
        supabase.from('vendors').select('*').eq('wedding_id', weddingData.id),
      ]);

      setCategories(categoriesRes.data || []);
      setTasks(tasksRes.data || []);
      setGuests(guestsRes.data || []);
      setBudgetItems(budgetRes.data || []);
      setVendors(vendorsRes.data || []);
    } else {
      setWedding(null);
    }

    setLoading(false);
  };

  const createWedding = async (data: { partner_name_1: string; partner_name_2: string; wedding_date?: string; total_budget?: number }) => {
    if (!user) return null;

    const { data: newWedding, error } = await supabase
      .from('weddings')
      .insert({
        owner_id: user.id,
        partner_name_1: data.partner_name_1,
        partner_name_2: data.partner_name_2,
        wedding_date: data.wedding_date || null,
        total_budget: data.total_budget || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wedding:', error);
      return null;
    }

    // Create default categories
    const defaultCategories = [
      { name: t('categories.venue'), icon: 'building-2', color: 'rose' },
      { name: t('categories.catering'), icon: 'utensils', color: 'sage' },
      { name: t('categories.photography'), icon: 'camera', color: 'gold' },
      { name: t('categories.music'), icon: 'music', color: 'rose' },
      { name: t('categories.flowersDecor'), icon: 'flower-2', color: 'sage' },
      { name: t('categories.attire'), icon: 'shirt', color: 'champagne' },
      { name: t('categories.rings'), icon: 'gem', color: 'gold' },
      { name: t('categories.invitations'), icon: 'mail', color: 'rose' },
      { name: t('categories.transportation'), icon: 'car', color: 'sage' },
      { name: t('categories.honeymoon'), icon: 'plane', color: 'gold' },
    ];

    await supabase.from('categories').insert(
      defaultCategories.map((cat, index) => ({
        wedding_id: newWedding.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        sort_order: index,
      }))
    );

    await fetchWeddingData();
    return newWedding;
  };

  useEffect(() => {
    fetchWeddingData();
  }, [user]);

  return (
    <WeddingContext.Provider value={{
      wedding,
      categories,
      tasks,
      guests,
      budgetItems,
      vendors,
      loading,
      refreshData: fetchWeddingData,
      createWedding,
    }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
}
