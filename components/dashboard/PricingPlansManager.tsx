'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Pencil, Trash2, Plus } from 'lucide-react';
import { useNotify } from '@/hooks/useNotify';

export interface PricingPlan {
  name: string;
  durationHours: number;
  rate: number;
}

interface PricingPlansManagerProps {
  title: string;
  description?: string;
  initialPlans?: PricingPlan[];
  onChange: (plans: PricingPlan[]) => void;
  disabled?: boolean;
}

export function PricingPlansManager({
  title,
  description,
  initialPlans = [],
  onChange,
  disabled = false,
}: PricingPlansManagerProps) {
  const { showError, showInfo } = useNotify();

  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans);
  const [baseHourlyRate, setBaseHourlyRate] = useState<string>(() => {
    const hourlyPlan = initialPlans.find((p) => p.name.toLowerCase() === 'hourly');
    return hourlyPlan ? String(hourlyPlan.rate) : '';
  });

  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('');
  const [newPlanRate, setNewPlanRate] = useState('');

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDuration, setEditPlanDuration] = useState('');
  const [editPlanRate, setEditPlanRate] = useState('');

  // Propagate changes up
  useEffect(() => {
    onChange(plans);
  }, [plans, onChange]);

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBaseHourlyRate(val);
    const rate = parseFloat(val);
    if (!isNaN(rate) && rate > 0) {
      setPlans([
        { name: 'Hourly', durationHours: 1, rate: rate },
        { name: 'Daily', durationHours: 8, rate: rate * 8 },
        { name: 'Weekly', durationHours: 56, rate: rate * 8 * 7 },
      ]);
    } else {
      setPlans([]);
    }
  };

  const handleAddPlan = () => {
    if (!newPlanName || !newPlanDuration || !newPlanRate) {
      showInfo('Please fill out all pricing plan fields');
      return;
    }
    const duration = parseInt(newPlanDuration, 10);
    const rate = parseFloat(newPlanRate);

    if (isNaN(duration) || duration <= 0) {
      showError('Duration must be a positive number of hours');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      showError('Rate must be a positive number');
      return;
    }
    if (plans.some((p) => p.name.toLowerCase() === newPlanName.toLowerCase())) {
      showError('A plan with this name already exists');
      return;
    }

    setPlans((prev) => [...prev, { name: newPlanName, durationHours: duration, rate }]);
    setNewPlanName('');
    setNewPlanDuration('');
    setNewPlanRate('');
  };

  const handleSaveEditPlan = (index: number) => {
    if (!editPlanName || !editPlanDuration || !editPlanRate) {
      showInfo('Please fill out all pricing plan fields');
      return;
    }
    const duration = parseInt(editPlanDuration, 10);
    const rate = parseFloat(editPlanRate);

    if (isNaN(duration) || duration <= 0) {
      showError('Duration must be a positive number of hours');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      showError('Rate must be a positive number');
      return;
    }
    if (plans.some((p, idx) => idx !== index && p.name.toLowerCase() === editPlanName.toLowerCase())) {
      showError('A plan with this name already exists');
      return;
    }

    setPlans((prev) => {
      const next = [...prev];
      next[index] = { name: editPlanName, durationHours: duration, rate };
      return next;
    });
    setEditingIndex(null);
  };

  const handleRemovePlan = (nameToRemove: string) => {
    setPlans((prev) => prev.filter((p) => p.name !== nameToRemove));
    if (editingIndex !== null && plans[editingIndex]?.name === nameToRemove) {
      setEditingIndex(null);
    }
  };

  const handleLoadDefaults = () => {
    setBaseHourlyRate('150');
    setPlans([
      { name: 'Hourly', durationHours: 1, rate: 150 },
      { name: 'Daily', durationHours: 8, rate: 1200 },
      { name: 'Weekly', durationHours: 56, rate: 8400 },
    ]);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</Label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLoadDefaults}
          className="gap-1.5 text-xs"
          disabled={disabled}
        >
          <RefreshCw className="h-3 w-3" /> Reset to Defaults
        </Button>
      </div>

      <div className="space-y-2 border-b border-border/60 pb-3 mb-2">
        <Label className="text-xs font-semibold text-foreground">
          Base Hourly Rate (₹/hr) *
        </Label>
        <Input
          type="number"
          placeholder="e.g. 150"
          value={baseHourlyRate}
          onChange={handleHourlyRateChange}
          disabled={disabled}
          className="h-9 bg-background"
        />
        <p className="text-[10px] text-muted-foreground">
          Type an hourly rate to automatically calculate Daily (8 hours) and Weekly (56 hours) plans.
        </p>
      </div>

      {/* List of active plans */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {plans.map((p, idx) => {
          const isEditing = editingIndex === idx;
          if (isEditing) {
            return (
              <div
                key={p.name}
                className="flex flex-col gap-2 p-2.5 rounded-xl border border-warning/30 bg-muted/40 text-sm"
              >
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Name</Label>
                    <Input
                      value={editPlanName}
                      onChange={(e) => setEditPlanName(e.target.value)}
                      disabled={disabled}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Duration (h)</Label>
                    <Input
                      type="number"
                      value={editPlanDuration}
                      onChange={(e) => setEditPlanDuration(e.target.value)}
                      disabled={disabled}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Rate (₹)</Label>
                    <Input
                      type="number"
                      value={editPlanRate}
                      onChange={(e) => setEditPlanRate(e.target.value)}
                      disabled={disabled}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setEditingIndex(null)}
                    disabled={disabled}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs text-warning hover:bg-warning/10"
                    onClick={() => handleSaveEditPlan(idx)}
                    disabled={disabled}
                  >
                    Save
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-4">
                <span className="font-semibold text-foreground min-w-[80px]">{p.name}</span>
                <span className="text-xs text-muted-foreground">
                  Duration: {p.durationHours === 8 ? '1 Day (8h)' : p.durationHours === 56 ? '1 Week (56h)' : `${p.durationHours}h`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary mr-2">₹{p.rate}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingIndex(idx);
                    setEditPlanName(p.name);
                    setEditPlanDuration(String(p.durationHours));
                    setEditPlanRate(String(p.rate));
                  }}
                  className="h-7 w-7 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                  disabled={disabled}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePlan(p.name)}
                  className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                  disabled={disabled}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          );
        })}
        {plans.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No pricing plans defined. Create one below.</p>
        )}
      </div>

      {/* Dynamic plan creator */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Plan Name</Label>
          <Input
            placeholder="e.g. Weekend"
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Duration (Hours)</Label>
          <Input
            type="number"
            placeholder="e.g. 48"
            value={newPlanDuration}
            onChange={(e) => setNewPlanDuration(e.target.value)}
            disabled={disabled}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Rate (₹)</Label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="4000"
              value={newPlanRate}
              onChange={(e) => setNewPlanRate(e.target.value)}
              disabled={disabled}
              className="h-8 text-xs flex-1"
            />
            <Button
              type="button"
              onClick={handleAddPlan}
              className="h-8 w-8 p-0"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
