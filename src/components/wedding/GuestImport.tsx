import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: string;
  onImportComplete: () => void;
}

interface ParsedGuest {
  full_name: string;
  email?: string;
  phone?: string;
  plus_one: boolean;
  plus_one_name?: string;
  dietary_preferences?: string;
  table_assignment?: string;
  isValid: boolean;
  errors: string[];
}

export function GuestImport({ open, onOpenChange, weddingId, onImportComplete }: GuestImportProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  const resetState = useCallback(() => {
    setFile(null);
    setParsedGuests([]);
    setStep('upload');
    setIsProcessing(false);
    setIsImporting(false);
  }, []);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Nombre Completo': 'Juan Pérez',
        'Email': 'juan@ejemplo.com',
        'Teléfono': '+54 11 1234 5678',
        'Tiene Acompañante': 'Sí',
        'Nombre Acompañante': 'María García',
        'Preferencias Alimentarias': 'Vegetariano',
        'Mesa': 'Mesa 1',
      },
      {
        'Nombre Completo': 'Ana López',
        'Email': 'ana@ejemplo.com',
        'Teléfono': '+54 11 8765 4321',
        'Tiene Acompañante': 'No',
        'Nombre Acompañante': '',
        'Preferencias Alimentarias': '',
        'Mesa': '',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invitados');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Nombre Completo
      { wch: 25 }, // Email
      { wch: 18 }, // Teléfono
      { wch: 18 }, // Tiene Acompañante
      { wch: 20 }, // Nombre Acompañante
      { wch: 25 }, // Preferencias Alimentarias
      { wch: 10 }, // Mesa
    ];

    XLSX.writeFile(wb, 'plantilla_invitados.xlsx');
  };

  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const guests: ParsedGuest[] = jsonData.map((row: any) => {
        const errors: string[] = [];
        
        // Try to find the name column with various possible headers
        const fullName = row['Nombre Completo'] || row['Nombre'] || row['Name'] || row['Full Name'] || row['nombre'] || '';
        const email = row['Email'] || row['email'] || row['Correo'] || row['correo'] || '';
        const phone = row['Teléfono'] || row['Telefono'] || row['Phone'] || row['Tel'] || row['telefono'] || '';
        const plusOneValue = row['Tiene Acompañante'] || row['Acompañante'] || row['Plus One'] || row['acompañante'] || '';
        const plusOneName = row['Nombre Acompañante'] || row['Plus One Name'] || row['Nombre del Acompañante'] || '';
        const dietary = row['Preferencias Alimentarias'] || row['Dieta'] || row['Dietary'] || row['preferencias'] || '';
        const table = row['Mesa'] || row['Table'] || row['mesa'] || '';

        // Validate name
        if (!fullName || fullName.trim() === '') {
          errors.push(t('guests.import.errors.nameRequired'));
        }

        // Validate email format if provided
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(t('guests.import.errors.invalidEmail'));
        }

        // Parse plus one boolean
        const plusOne = ['sí', 'si', 'yes', 'true', '1', 'x'].includes(
          String(plusOneValue).toLowerCase().trim()
        );

        return {
          full_name: String(fullName).trim(),
          email: email ? String(email).trim() : undefined,
          phone: phone ? String(phone).trim() : undefined,
          plus_one: plusOne,
          plus_one_name: plusOneName ? String(plusOneName).trim() : undefined,
          dietary_preferences: dietary ? String(dietary).trim() : undefined,
          table_assignment: table ? String(table).trim() : undefined,
          isValid: errors.length === 0 && fullName.trim() !== '',
          errors,
        };
      });

      setParsedGuests(guests);
      setStep('preview');
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast.error(t('guests.import.errors.parseError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      parseExcelFile(droppedFile);
    } else {
      toast.error(t('guests.import.errors.invalidFormat'));
    }
  }, [t]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleImport = async () => {
    const validGuests = parsedGuests.filter(g => g.isValid);
    if (validGuests.length === 0) {
      toast.error(t('guests.import.errors.noValidGuests'));
      return;
    }

    setIsImporting(true);

    try {
      const guestsToInsert = validGuests.map(guest => ({
        wedding_id: weddingId,
        full_name: guest.full_name,
        email: guest.email || null,
        phone: guest.phone || null,
        plus_one: guest.plus_one,
        plus_one_name: guest.plus_one_name || null,
        dietary_preferences: guest.dietary_preferences || null,
        table_assignment: guest.table_assignment || null,
        rsvp_status: 'pending' as const,
      }));

      const { error } = await supabase.from('guests').insert(guestsToInsert);

      if (error) {
        throw error;
      }

      toast.success(t('guests.import.success', { count: validGuests.length }));
      onImportComplete();
      handleClose();
    } catch (error) {
      console.error('Error importing guests:', error);
      toast.error(t('guests.import.errors.importError'));
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedGuests.filter(g => g.isValid).length;
  const invalidCount = parsedGuests.filter(g => !g.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            {t('guests.import.title')}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' ? t('guests.import.uploadDescription') : t('guests.import.previewDescription')}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4 py-4">
            {/* Download template button */}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                {t('guests.import.downloadTemplate')}
              </Button>
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                "hover:border-primary hover:bg-primary/5",
                isProcessing && "pointer-events-none opacity-50"
              )}
              onClick={() => document.getElementById('excel-upload')?.click()}
            >
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">{t('guests.import.processing')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t('guests.import.dropZone')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('guests.import.acceptedFormats')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="glass-card rounded-xl p-4 space-y-2">
              <h4 className="font-medium text-sm">{t('guests.import.instructions.title')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>{t('guests.import.instructions.column1')}</li>
                <li>{t('guests.import.instructions.column2')}</li>
                <li>{t('guests.import.instructions.column3')}</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4 py-4">
            {/* Summary */}
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="outline" className="bg-sage-light text-sage border-sage/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {validCount} {t('guests.import.valid')}
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {invalidCount} {t('guests.import.invalid')}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetState}>
                <X className="h-4 w-4 mr-1" />
                {t('guests.import.changeFile')}
              </Button>
            </div>

            {/* Preview table */}
            <ScrollArea className="flex-1 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{t('guests.fullName')}</TableHead>
                    <TableHead>{t('guests.emailOptional')}</TableHead>
                    <TableHead>{t('guests.phoneOptional')}</TableHead>
                    <TableHead>{t('guests.hasPlusOne')}</TableHead>
                    <TableHead>{t('guests.import.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedGuests.map((guest, index) => (
                    <TableRow key={index} className={cn(!guest.isValid && "bg-destructive/5")}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{guest.full_name || '-'}</TableCell>
                      <TableCell>{guest.email || '-'}</TableCell>
                      <TableCell>{guest.phone || '-'}</TableCell>
                      <TableCell>{guest.plus_one ? t('common.yes') : t('common.no')}</TableCell>
                      <TableCell>
                        {guest.isValid ? (
                          <Badge variant="outline" className="bg-sage-light text-sage border-sage/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('guests.import.ready')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {guest.errors.join(', ')}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleImport} disabled={validCount === 0 || isImporting}>
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {t('guests.import.importGuests', { count: validCount })}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}