import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useWedding } from '@/contexts/WeddingContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Building2, Trash2, Loader2, Mail, Phone, Globe, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Vendors() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wedding, vendors, categories, refreshData, loading: weddingLoading } = useWedding();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category_id: '',
    contact_name: '',
    email: '',
    phone: '',
    website: '',
    notes: '',
    contract_signed: false,
  });

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!wedding && !weddingLoading) return <Navigate to="/onboarding" replace />;

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name.trim() || !wedding) return;

    setSaving(true);
    const { error } = await supabase.from('vendors').insert({
      wedding_id: wedding.id,
      name: newVendor.name.trim(),
      category_id: newVendor.category_id || null,
      contact_name: newVendor.contact_name.trim() || null,
      email: newVendor.email.trim() || null,
      phone: newVendor.phone.trim() || null,
      website: newVendor.website.trim() || null,
      notes: newVendor.notes.trim() || null,
      contract_signed: newVendor.contract_signed,
    });

    if (error) {
      toast.error(t('vendors.toast.failedAdd'));
    } else {
      toast.success(t('vendors.toast.added'));
      setNewVendor({
        name: '',
        category_id: '',
        contact_name: '',
        email: '',
        phone: '',
        website: '',
        notes: '',
        contract_signed: false,
      });
      setDialogOpen(false);
      refreshData();
    }
    setSaving(false);
  };

  const toggleContract = async (vendorId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('vendors')
      .update({ contract_signed: !currentValue })
      .eq('id', vendorId);

    if (error) {
      toast.error(t('vendors.toast.failedUpdate'));
    } else {
      refreshData();
    }
  };

  const deleteVendor = async (vendorId: string) => {
    const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
    if (error) {
      toast.error(t('vendors.toast.failedDelete'));
    } else {
      toast.success(t('vendors.toast.removed'));
      refreshData();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">{t('vendors.title')}</h1>
            <p className="text-muted-foreground">{vendors.length} {t('vendors.vendors')}</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('vendors.addVendor')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{t('vendors.addVendor')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateVendor} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('vendors.businessName')}</Label>
                  <Input
                    placeholder={t('vendors.businessNamePlaceholder')}
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('tasks.category')}</Label>
                  <Select
                    value={newVendor.category_id}
                    onValueChange={(value) => setNewVendor({ ...newVendor, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('vendors.contactNameOptional')}</Label>
                  <Input
                    placeholder={t('vendors.primaryContact')}
                    value={newVendor.contact_name}
                    onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('vendors.email')}</Label>
                    <Input
                      type="email"
                      placeholder="email@ejemplo.com"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('vendors.phone')}</Label>
                    <Input
                      type="tel"
                      placeholder="+54 11 1234 5678"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('vendors.websiteOptional')}</Label>
                  <Input
                    type="url"
                    placeholder="https://ejemplo.com"
                    value={newVendor.website}
                    onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('vendors.addVendor')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vendor list */}
        {vendors.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">{t('vendors.noVendors')}</h3>
            <p className="text-muted-foreground">{t('vendors.addVendorsInfo')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => {
              const category = categories.find(c => c.id === vendor.category_id);
              
              return (
                <div key={vendor.id} className="glass-card rounded-xl p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{vendor.name}</h3>
                      {vendor.contact_name && (
                        <p className="text-sm text-muted-foreground">{vendor.contact_name}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive -mt-1 -mr-2"
                      onClick={() => deleteVendor(vendor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {vendor.email && (
                      <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Mail className="h-4 w-4" />
                        {vendor.email}
                      </a>
                    )}
                    {vendor.phone && (
                      <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="h-4 w-4" />
                        {vendor.phone}
                      </a>
                    )}
                    {vendor.website && (
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Globe className="h-4 w-4" />
                        {t('vendors.website')}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    {category && (
                      <Badge variant="outline" className="text-xs">{category.name}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleContract(vendor.id, vendor.contract_signed || false)}
                      className={cn(
                        "text-xs",
                        vendor.contract_signed ? "text-sage" : "text-muted-foreground"
                      )}
                    >
                      <FileCheck className="h-4 w-4 mr-1" />
                      {vendor.contract_signed ? t('vendors.signed') : t('vendors.noContract')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}