'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Pencil,
  UserX,
  UserCheck,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { deactivateEmployee, reactivateEmployee } from '@/actions/hr/employees';
import type { HREmployee } from '@/lib/types/hr';
import { useNotifications } from '@/components/ui/useNotifications';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN:
    'bg-[rgba(168,85,247,0.15)] text-purple-300 border border-[rgba(168,85,247,0.30)]',
  ADMIN:
    'bg-[rgba(59,130,246,0.15)] text-blue-300 border border-[rgba(59,130,246,0.30)]',
  EMPLOYEE:
    'bg-[rgba(16,185,129,0.15)] text-emerald-300 border border-[rgba(16,185,129,0.30)]',
};

const EMPLOYMENT_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: 'Full-Time',
  PART_TIME: 'Part-Time',
  CONTRACT: 'Contract',
  INTERN: 'Intern',
};

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  const initials = (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  if (url) {
    return (
      <img
        src={url}
        alt={name ?? 'Employee'}
        className='w-9 h-9 rounded-full object-cover ring-1 ring-primary/20'
      />
    );
  }

  return (
    <div className='w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-primary/20 flex-shrink-0'>
      {initials}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HREmployeeTableProps {
  employees: HREmployee[];
  currentUserRole: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function HREmployeeTable({
  employees,
  currentUserRole,
}: HREmployeeTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const { showModal, removeModal, showLoader, hideLoader, showError, showSuccess } = useNotifications();

  const canManage = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';

  // Client-side filtering
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchRole = roleFilter === 'ALL' || e.role === roleFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && (e.contract?.isActive ?? true)) ||
        (statusFilter === 'INACTIVE' && e.contract?.isActive === false);
      const matchSearch =
        !globalFilter ||
        (e.fullName ?? '').toLowerCase().includes(globalFilter.toLowerCase()) ||
        e.email.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (e.phone ?? '').includes(globalFilter) ||
        (e.contract?.jobTitle ?? '').toLowerCase().includes(globalFilter.toLowerCase());
      return matchRole && matchStatus && matchSearch;
    });
  }, [employees, roleFilter, statusFilter, globalFilter]);

  function handleToggleStatus(employee: HREmployee) {
    const isActive = employee.contract?.isActive ?? true;

    if (isActive) {
      const modalId = showModal({
        title: 'Deactivate Employee',
        description: `Are you sure you want to deactivate ${employee.fullName || 'this employee'}? They will be signed out and lose access to the system immediately.`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        onCancel: () => removeModal(modalId),
        onConfirm: async () => {
          showLoader('Deactivating...');
          const res = await deactivateEmployee(employee.id);
          if (res?.error) showError(res.error);
          else showSuccess('Employee deactivated');
          hideLoader();
          removeModal(modalId);
          router.refresh();
        },
      });
    } else {
      const modalId = showModal({
        title: 'Reactivate Employee',
        description: `Are you sure you want to reactivate ${employee.fullName || 'this employee'}?`,
        confirmText: 'Reactivate',
        cancelText: 'Cancel',
        onCancel: () => removeModal(modalId),
        onConfirm: async () => {
          showLoader('Reactivating...');
          const res = await reactivateEmployee(employee.id);
          if (res?.error) showError(res.error);
          else showSuccess('Employee reactivated');
          hideLoader();
          removeModal(modalId);
          router.refresh();
        }
      });
    }
  }

  const columns: ColumnDef<HREmployee>[] = [
    {
      id: 'employee',
      header: 'Employee',
      cell: ({ row }) => {
        const e = row.original;
        const age = e.dateOfBirth
          ? Math.floor((Date.now() - new Date(e.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : null;
        return (
          <div className='flex items-center gap-3'>
            <Avatar
              name={e.fullName}
              url={e.contract?.avatarUrl ?? null}
            />
            <div>
              <div className='flex items-center gap-1.5'>
                <p className='font-medium text-foreground text-sm'>
                  {e.fullName ?? '—'}
                </p>
                {age !== null && (
                  <span className='text-[10px] text-foreground/30 font-medium'>{age}y</span>
                )}
              </div>
              <p className='text-xs text-foreground/50'>{e.email}</p>
              {e.phone && (
                <p className='text-xs text-foreground/35 hidden md:block'>{e.phone}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'jobTitle',
      header: 'Role / Title',
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div>
            <p className='text-sm text-foreground/85'>
              {e.contract?.jobTitle ?? <span className='text-foreground/30 italic text-xs'>—</span>}
            </p>
            <p className='text-xs text-foreground/40'>
              {e.contract
                ? EMPLOYMENT_TYPE_LABEL[e.contract.employmentType] ?? ''
                : ''}
            </p>
          </div>
        );
      },
    },
    {
      id: 'systemRole',
      header: 'Access',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[row.original.role] ?? ''}`}
        >
          {row.original.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      id: 'salary',
      header: 'Base Salary',
      cell: ({ row }) => {
        const s = row.original.contract?.baseSalary;
        return s != null ? (
          <span className='font-mono text-sm text-foreground/80'>
            ₹{s.toLocaleString('en-IN')}
          </span>
        ) : (
          <span className='text-foreground/30 italic text-xs'>—</span>
        );
      },
    },
    {
      id: 'branch',
      header: 'Branch',
      cell: ({ row }) => (
        <span className='text-sm text-foreground/60'>
          {row.original.branch?.name ?? (
            <span className='text-foreground/30 italic text-xs'>—</span>
          )}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.contract?.isActive;
        const hasContract = row.original.contract !== null;

        if (!hasContract) {
          return (
            <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-white/5 text-foreground/35 border border-white/10'>
              No Contract
            </span>
          );
        }

        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`}
            />
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const e = row.original;
        const isActive = e.contract?.isActive ?? true;

        return (
          <div className='flex items-center justify-end gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-8 px-3 hidden sm:flex text-xs font-medium'
              onClick={() => router.push(`/admin/employees/${e.id}`)}
            >
              View
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0 text-primary/60 hover:text-primary hover:bg-primary/10'
                >
                  <span className='sr-only'>Open menu</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='bg-[rgba(17,17,22,0.98)] border border-primary/18 backdrop-blur-xl text-foreground'
              >
                <DropdownMenuLabel className='text-primary text-xs uppercase tracking-widest opacity-70'>
                  Actions
                </DropdownMenuLabel>
                {currentUserRole === 'SUPER_ADMIN' ? (
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/employees/${e.id}`)}
                    className='text-foreground hover:text-foreground focus:text-foreground hover:bg-primary/10 focus:bg-primary/10 cursor-pointer'
                  >
                    <Pencil className='mr-2 h-4 w-4 text-primary' />
                    Edit Employee
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/employees/${e.id}`)}
                    className='text-foreground hover:text-foreground focus:text-foreground hover:bg-primary/10 focus:bg-primary/10 cursor-pointer'
                  >
                    <ExternalLink className='mr-2 h-4 w-4 text-primary' />
                    View Details
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    showLoader('Loading Payroll...');
                    router.push(`/admin/employees/${e.id}/payroll`);
                  }}
                  className='text-foreground hover:text-foreground focus:text-foreground hover:bg-primary/10 focus:bg-primary/10 cursor-pointer'
                >
                  <ExternalLink className='mr-2 h-4 w-4 text-primary' />
                  View Payroll
                </DropdownMenuItem>
                {canManage && e.contract && (
                  <>
                    <DropdownMenuSeparator className='bg-primary/12' />
                    <DropdownMenuItem
                      className={`cursor-pointer ${
                        isActive
                          ? 'text-amber-400 hover:bg-amber-500/10 focus:bg-amber-500/10'
                          : 'text-emerald-400 hover:bg-emerald-500/10 focus:bg-emerald-500/10'
                      }`}
                      onClick={() => handleToggleStatus(e)}
                      disabled={isPending}
                    >
                      {isActive ? (
                        <>
                          <UserX className='mr-2 h-4 w-4' />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className='mr-2 h-4 w-4' />
                          Reactivate
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredEmployees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className='space-y-4'>
      {/* Filter bar */}
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/35' />
          <input
            placeholder='Search by name, email or title…'
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className='w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-foreground/85 placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all'
          />
        </div>

        {/* Role filter */}
        <div className='flex items-center gap-1.5'>
          <Filter className='h-4 w-4 text-foreground/35 flex-shrink-0' />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className='px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all [&>option]:bg-[#1a1a24]'
          >
            <option value='ALL'>All Roles</option>
            <option value='SUPER_ADMIN'>Super Admin</option>
            <option value='ADMIN'>Admin</option>
            <option value='EMPLOYEE'>Employee</option>
          </select>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-foreground/80 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all [&>option]:bg-[#1a1a24]'
        >
          <option value='ALL'>All Status</option>
          <option value='ACTIVE'>Active</option>
          <option value='INACTIVE'>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className='rounded-xl border border-primary/15 bg-[rgba(17,17,22,0.85)] backdrop-blur-md overflow-x-auto'>
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow className='border-b border-primary/12 hover:bg-transparent'>
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className='text-primary font-semibold text-xs uppercase tracking-widest opacity-80 py-4'
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-28 text-center text-foreground/40 text-sm'
                >
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className='border-b border-primary/8 hover:bg-primary/6 transition-colors duration-150'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='py-4'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer row count */}
        <div className='px-4 py-3 border-t border-primary/10 text-xs text-foreground/35'>
          {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}
          {employees.length !== filteredEmployees.length &&
            ` (filtered from ${employees.length})`}
        </div>
      </div>
    </div>
  );
}
