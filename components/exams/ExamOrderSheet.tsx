import React, { useState } from 'react';
import FormSheet from '../ui/FormSheet';
import { useToast } from '../ui/VToast';
import { api } from '../../services/directus';
import { downloadPdf } from '../../utils/downloadPdf';
import ExamPicker, { ExamSelection, emptySelection, selectionToExams } from './ExamPicker';

interface Props {
  visible: boolean;
  petId: string;
  petName: string;
  veterinarian?: string | null;
  clinicalRecordId?: string | null;
  onClose: () => void;
  onCreated?: () => void;
}

// Order exams from the chart: creates one pending exam per choice and downloads the order for the tutor
export default function ExamOrderSheet({ visible, petId, petName, veterinarian, clinicalRecordId, onClose, onCreated }: Props) {
  const toast = useToast();
  const [sel, setSel] = useState<ExamSelection>(emptySelection());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const exams = selectionToExams(sel);
    if (!exams.length) { setError('Elige al menos un examen'); return; }
    setSaving(true); setError(null);
    try {
      const order = await api.labExams.createOrder({ pet_id: petId, clinical_record_id: clinicalRecordId || null, veterinarian: veterinarian || null, exams });
      toast.success(`Orden creada: ${exams.length} ${exams.length === 1 ? 'examen' : 'exámenes'}`);
      setSel(emptySelection());
      onCreated?.();
      onClose();
      await downloadPdf(`/items/lab_exam_orders/${order.order_id}/pdf`, `orden_examenes_${petName}.pdf`).catch((e: any) => toast.error(e?.message || 'No se pudo generar la orden en PDF'));
    } catch (e: any) {
      setError(e?.message || 'No se pudo crear la orden');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet visible={visible} title={`Orden de exámenes · ${petName}`} onClose={onClose} onSubmit={submit} submitLabel="Crear orden y PDF" submitting={saving} error={error}>
      <ExamPicker value={sel} onChange={setSel} />
    </FormSheet>
  );
}
