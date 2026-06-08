'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { updateGlobalRentalPolicySettings, updateEquipmentRate } from '@/actions/rental-policy';
import { useNotify } from '@/hooks/useNotify';
import { Edit, Loader2 } from 'lucide-react';

export function RentalSettingsClient({ 
  role, 
  settings, 
  equipment, 
  logs 
}: { 
  role: string, 
  settings: any, 
  equipment: any[], 
  logs: any[] 
}) {
  const { showSuccess, showError } = useNotify();
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  
  // Local state for global settings form
  const [globalSettings, setGlobalSettings] = useState(settings || {
    repeat_client_discount_percentage: '0',
    default_security_deposit: '0',
    default_late_penalty_rate: '0'
  });

  // Local state for equipment form (inline editing)
  const [editingEquipment, setEditingEquipment] = useState<string | null>(null);
  const [equipmentForm, setEquipmentForm] = useState<any>({});

  const handleGlobalSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'SUPER_ADMIN') return;
    setIsUpdatingSettings(true);
    try {
      const formData = new FormData();
      Object.keys(globalSettings).forEach(key => {
        formData.append(key, globalSettings[key]);
      });
      await updateGlobalRentalPolicySettings(formData);
      showSuccess('Global settings updated successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to update settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const [isUpdatingEquipment, setIsUpdatingEquipment] = useState(false);

  const handleEditClick = (item: any) => {
    setEditingEquipment(item.id);
    setEquipmentForm({
      hourly_rate: item.hourly_rate || '',
      daily_rate: item.daily_rate || '',
      weekly_rate: item.weekly_rate || '',
      security_deposit: item.security_deposit || '',
      late_penalty_rate: item.late_penalty_rate || '',
      min_rental_duration_hours: item.min_rental_duration_hours || '',
      condition: item.condition || 'GOOD'
    });
  };

  const handleNumberChange = (field: string, value: string) => {
    let parsed = value.replace(/^0+(?=\d)/, '');
    setGlobalSettings({ ...globalSettings, [field]: parsed });
  };

  const handleEquipmentSubmit = async (equipmentId: string) => {
    setIsUpdatingEquipment(true);
    try {
      const formData = new FormData();
      Object.keys(equipmentForm).forEach(key => {
        const val = equipmentForm[key];
        formData.append(key, val === '' ? '0' : val);
      });
      await updateEquipmentRate(equipmentId, formData);
      setEditingEquipment(null);
      showSuccess('Rates updated successfully.');
    } catch (err: any) {
      showError(err.message || 'Failed to update rates');
    } finally {
      setIsUpdatingEquipment(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── GLOBAL SETTINGS (VIEW FOR ADMIN, EDIT FOR SUPER_ADMIN) ── */}
      <Card>
        <CardHeader>
          <CardTitle>Global Rental Policy Settings</CardTitle>
          <CardDescription>Configure global default rules, limits, and multipliers.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGlobalSettingsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Repeat Client Discount (%)</Label>
                <Input 
                  type="number" step="0.01" 
                  value={globalSettings.repeat_client_discount_percentage} 
                  onChange={e => handleNumberChange('repeat_client_discount_percentage', e.target.value)}
                  disabled={role !== 'SUPER_ADMIN'}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Security Deposit (₹)</Label>
                <Input 
                  type="number" step="1" 
                  value={globalSettings.default_security_deposit} 
                  onChange={e => handleNumberChange('default_security_deposit', e.target.value)}
                  disabled={role !== 'SUPER_ADMIN'}
                />
              </div>
              <div className="space-y-2">
                <Label>Late Penalty Rate (Multiplier)</Label>
                <Input 
                  type="number" step="0.1" 
                  value={globalSettings.default_late_penalty_rate} 
                  onChange={e => handleNumberChange('default_late_penalty_rate', e.target.value)}
                  disabled={role !== 'SUPER_ADMIN'}
                />
              </div>
            </div>
            {role === 'SUPER_ADMIN' && (
              <Button type="submit" disabled={isUpdatingSettings}>
                {isUpdatingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Global Settings
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* APPROVAL QUEUE REMOVED */}

      {/* ── EQUIPMENT RATES GRID ── */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Rates & Rules</CardTitle>
          <CardDescription>Manage individual equipment pricing, deposit, and condition.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Hourly (₹)</TableHead>
                <TableHead>Daily (₹)</TableHead>
                <TableHead>Weekly (₹)</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.serial_number}</div>
                  </TableCell>
                  {editingEquipment === item.id ? (
                    <>
                      <TableCell><Input type="number" value={equipmentForm.hourly_rate} onChange={e => setEquipmentForm({...equipmentForm, hourly_rate: e.target.value})} className="w-20 h-8" /></TableCell>
                      <TableCell><Input type="number" value={equipmentForm.daily_rate} onChange={e => setEquipmentForm({...equipmentForm, daily_rate: e.target.value})} className="w-24 h-8" /></TableCell>
                      <TableCell><Input type="number" value={equipmentForm.weekly_rate} onChange={e => setEquipmentForm({...equipmentForm, weekly_rate: e.target.value})} className="w-24 h-8" /></TableCell>
                      <TableCell>
                        <select 
                          className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background"
                          value={equipmentForm.condition}
                          onChange={e => setEquipmentForm({...equipmentForm, condition: e.target.value})}
                        >
                          <option value="NEW">NEW</option>
                          <option value="GOOD">GOOD</option>
                          <option value="FAIR">FAIR</option>
                        </select>
                      </TableCell>
                      <TableCell className="space-x-2 whitespace-nowrap">
                        <Button size="sm" onClick={() => handleEquipmentSubmit(item.id)} disabled={isUpdatingEquipment}>
                          {isUpdatingEquipment ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null} Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingEquipment(null)} disabled={isUpdatingEquipment}>Cancel</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{item.hourly_rate || '—'}</TableCell>
                      <TableCell>{item.daily_rate || '—'}</TableCell>
                      <TableCell>{item.weekly_rate || '—'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded bg-white/5 text-xs font-semibold">{item.condition || 'GOOD'}</span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(item)}>
                          <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                        </Button>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
