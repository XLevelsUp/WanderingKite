'use client';

import React, { useMemo } from 'react';
import { User, Camera, MapPin, AlertTriangle, Package } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { QuickReturnButton } from './QuickReturnButton';
import type {
  ActiveAssignment,
  EmployeeDeploymentGroup,
} from '@/lib/types/deployments';

interface DeploymentMatrixProps {
  groups: EmployeeDeploymentGroup[];
  isAdmin: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function EmployeeRow({ group }: { group: EmployeeDeploymentGroup }) {
  const initials = useMemo(() => {
    const name = group.employee.fullName ?? group.employee.email;
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? '')
      .join('');
  }, [group.employee]);

  return (
    <tr className='bg-[rgba(255,255,255,0.02)] border-b border-white/5'>
      <td colSpan={5} className='px-4 py-3'>
        <div className='flex items-center gap-3'>
          {/* Avatar */}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold flex-shrink-0
              ${
                group.hasOverdue
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-primary/15 text-primary ring-1 ring-primary/20'
              }`}
          >
            {initials}
          </div>

          <div className='flex items-center gap-2 min-w-0'>
            <User className='w-3.5 h-3.5 text-foreground/40 flex-shrink-0' />
            <span className='text-sm font-semibold text-foreground/90 truncate'>
              {group.employee.fullName ?? group.employee.email}
            </span>
            <span className='text-[10px] text-foreground/35 font-medium uppercase tracking-widest flex-shrink-0'>
              {group.employee.role.replace('_', ' ')}
            </span>
          </div>

          <div className='ml-auto flex items-center gap-2 flex-shrink-0'>
            {group.hasOverdue && (
              <span className='inline-flex items-center gap-1 text-[10px] font-medium text-amber-400'>
                <AlertTriangle className='w-3 h-3' />
                Overdue Items
              </span>
            )}
            <span className='text-xs text-foreground/30'>
              {group.totalItems} item{group.totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );
}

function AssignmentRow({
  assignment,
  isAdmin,
}: {
  assignment: ActiveAssignment;
  isAdmin: boolean;
}) {
  const assignedDate = useMemo(() => {
    const d = new Date(assignment.assignedAt);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [assignment.assignedAt]);

  const expectedDate = useMemo(() => {
    if (!assignment.expectedReturn) return null;
    return new Date(assignment.expectedReturn).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  }, [assignment.expectedReturn]);

  return (
    <tr
      className={`group border-b border-white/[0.03] transition-colors duration-100
        ${
          assignment.isOverdue
            ? 'bg-amber-500/[0.03] hover:bg-amber-500/[0.06]'
            : 'hover:bg-white/[0.02]'
        }`}
    >
      {/* Equipment */}
      <td className='px-4 py-3 pl-14'>
        <div className='flex items-center gap-2.5'>
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0
              ${assignment.isOverdue ? 'bg-amber-500/15' : 'bg-primary/10'}`}
          >
            <Camera
              className={`w-3.5 h-3.5 ${assignment.isOverdue ? 'text-amber-400' : 'text-primary/70'}`}
            />
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-foreground/85 truncate'>
              {assignment.equipment.name}
            </p>
            <p className='text-[10px] text-foreground/35 font-mono tracking-tight'>
              {assignment.equipment.serialNumber}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className='px-4 py-3'>
        <span className='text-xs text-foreground/40'>
          {assignment.equipment.categories?.name ?? '—'}
        </span>
      </td>

      {/* Client / Location */}
      <td className='px-4 py-3'>
        {assignment.client ? (
          <div className='flex items-center gap-1.5'>
            <MapPin className='w-3 h-3 text-foreground/30 flex-shrink-0' />
            <div className='min-w-0'>
              <p className='text-sm text-foreground/70 truncate'>
                {assignment.client.name}
              </p>
              {assignment.location && (
                <p className='text-[10px] text-foreground/35 truncate'>
                  {assignment.location}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className='text-xs text-foreground/30 italic'>
            {assignment.location ?? 'No client assigned'}
          </span>
        )}
      </td>

      {/* Dates */}
      <td className='px-4 py-3'>
        <div className='text-xs'>
          <p className='text-foreground/50'>Out: {assignedDate}</p>
          {expectedDate && (
            <p
              className={`mt-0.5 ${assignment.isOverdue ? 'text-amber-400 font-medium' : 'text-foreground/35'}`}
            >
              Due: {expectedDate}
            </p>
          )}
        </div>
      </td>

      {/* Status + Action */}
      <td className='px-4 py-3 pr-6'>
        <div className='flex items-center justify-between gap-3'>
          <StatusBadge
            status={assignment.status}
            isOverdue={assignment.isOverdue}
          />
          {isAdmin && assignment.status !== 'returned' && (
            <QuickReturnButton
              assignmentId={assignment.id}
              equipmentName={assignment.equipment.name}
            />
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center py-24 gap-4'>
      <div className='flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/8 ring-1 ring-primary/15'>
        <Package className='w-7 h-7 text-primary/50' />
      </div>
      <div className='text-center'>
        <p className='text-sm font-medium text-foreground/60'>
          No active deployments
        </p>
        <p className='text-xs text-foreground/35 mt-1'>
          All equipment is currently in the studio.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Matrix
// ─────────────────────────────────────────────────────────────────────────────

export function DeploymentMatrix({ groups, isAdmin }: DeploymentMatrixProps) {
  const hasData = groups.length > 0;

  return (
    <div className='rounded-xl border border-white/8 bg-[rgba(17,17,22,0.7)] backdrop-blur-sm overflow-hidden'>
      {hasData ? (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm border-collapse'>
            <thead>
              <tr className='border-b border-white/8'>
                <th className='px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-widest'>
                  Equipment
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-widest'>
                  Category
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-widest'>
                  Client / Location
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-widest'>
                  Dates
                </th>
                <th className='px-4 py-3 pr-6 text-left text-[11px] font-semibold text-foreground/35 uppercase tracking-widest'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <React.Fragment key={group.employee.id}>
                  <EmployeeRow group={group} />
                  {group.assignments.map((assignment) => (
                    <AssignmentRow
                      key={assignment.id}
                      assignment={assignment}
                      isAdmin={isAdmin}
                    />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
