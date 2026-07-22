'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createNewClient } from '@/actions/clients';

export interface ClientOption {
  id: string;
  name: string;
}

/** clients.email is unique + required — generate a placeholder so a
 * name-only quick-add still satisfies the schema. Editable later from
 * the Clients page. */
function placeholderEmail(name: string) {
  const slug =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'client';
  const unique = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${slug}-${unique}@noemail.placeholder`;
}

/**
 * Type-to-search client picker. If nothing matches the typed name, an
 * "Add as new client" row creates the client immediately — just the
 * name is needed, a placeholder email fills the schema's required field.
 */
export function ClientCombobox({
  value,
  onValueChange,
  clients,
  onClientCreated,
  allowCreate = true,
}: {
  value: string;
  onValueChange: (value: string) => void;
  clients: ClientOption[];
  onClientCreated: (client: ClientOption) => void;
  /** Hide the "Add as new client" quick-add row — used where new clients are entered via their own dedicated form instead. */
  allowCreate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = clients.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, query]);

  const closeAll = () => {
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) closeAll();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const openDropdown = () => {
    setOpen(true);
    setQuery('');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectClient = (c: ClientOption) => {
    onValueChange(c.id);
    closeAll();
  };

  const createClient = async () => {
    const name = query.trim();
    if (!name) return;
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('email', placeholderEmail(name));

      const created = await createNewClient(formData);
      if ('error' in created && created.error) {
        toast.error(created.error);
        return;
      }
      const option: ClientOption = { id: created.client.id, name: created.client.name };
      onClientCreated(option);
      onValueChange(option.id);
      toast.success(`Client "${option.name}" created`);
      closeAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create client');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {open ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeAll();
              else if (e.key === 'Enter' && filtered.length === 1) selectClient(filtered[0]);
            }}
            placeholder={selected?.name ?? 'Type to search clients…'}
            className="flex h-9 w-full rounded-md border border-input bg-transparent py-2 pl-9 pr-3 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={openDropdown}
          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected?.name ?? 'Select a client'}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
          <ul className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                No clients match &ldquo;{query}&rdquo;.
              </p>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selectClient(c)}
                    className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="truncate">{c.name}</span>
                    {c.id === value && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>

          {allowCreate && query.trim() && (
            <button
              type="button"
              disabled={busy}
              onClick={createClient}
              className="flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm font-medium text-primary outline-none hover:bg-accent disabled:opacity-50"
            >
              <Plus className="h-4 w-4 shrink-0" />
              {busy
                ? 'Creating…'
                : `Add "${query.trim()}" as new client`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
