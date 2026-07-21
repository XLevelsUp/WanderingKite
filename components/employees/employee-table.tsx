'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteEmployee } from '@/actions/employees';
import { useState } from 'react';
import { useNotifications } from '@/components/ui/useNotifications';

interface Employee {
  id: string;
  fullName: string | null;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
  branchId: string | null;
  branches: { name: string } | null;
}

interface EmployeeTableProps {
  employees: Employee[];
  currentUserRole: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE';
}

const roleBadge: Record<Employee['role'], string> = {
  SUPER_ADMIN:
    'bg-[rgba(168,85,247,0.15)] text-purple-300 border border-[rgba(168,85,247,0.30)]',
  ADMIN:
    'bg-[rgba(59,130,246,0.15)] text-blue-300 border border-[rgba(59,130,246,0.30)]',
  EMPLOYEE:
    'bg-[rgba(16,185,129,0.15)] text-emerald-300 border border-[rgba(16,185,129,0.30)]',
};

export function EmployeeTable({
  employees,
  currentUserRole,
}: EmployeeTableProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const { showModal, removeModal, showLoader, hideLoader, showError, showSuccess } = useNotifications();

  const handleDelete = (id: string, name: string | null) => {
    const modalId = showModal({
      title: 'Delete Employee',
      description: `Are you sure you want to delete ${name || 'this employee'}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onCancel: () => removeModal(modalId),
      onConfirm: async () => {
        removeModal(modalId);
        setIsDeleting(true);
        showLoader('Deleting Employee...');
        const result = await deleteEmployee(id);
        setIsDeleting(false);
        hideLoader();

        if (result.error) {
          showError(result.error);
        } else {
          showSuccess('Employee deleted successfully');
          router.refresh();
        }
      },
    });
  };

  return (
    <div className="rounded-xl border border-primary/15 bg-[rgba(17,17,22,0.85)] backdrop-blur-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-primary/12 hover:bg-transparent">
            <TableHead className="text-primary font-semibold text-xs uppercase tracking-widest opacity-80 py-4">
              Name
            </TableHead>
            <TableHead className="text-primary font-semibold text-xs uppercase tracking-widest opacity-80">
              Email
            </TableHead>
            <TableHead className="text-primary font-semibold text-xs uppercase tracking-widest opacity-80">
              Role
            </TableHead>
            <TableHead className="text-primary font-semibold text-xs uppercase tracking-widest opacity-80">
              Branch
            </TableHead>
            {currentUserRole === 'SUPER_ADMIN' && (
              <TableHead className="text-primary font-semibold text-xs uppercase tracking-widest opacity-80 text-right">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-foreground/50"
              >
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow
                key={employee.id}
                className="border-b border-primary/8 hover:bg-primary/6 transition-colors duration-150"
              >
                <TableCell className="font-medium text-foreground py-4">
                  {employee.fullName || 'N/A'}
                </TableCell>
                <TableCell className="text-foreground/75">
                  {employee.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[employee.role]}`}
                  >
                    {employee.role.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className="text-foreground/65">
                  {employee.branches?.name || (
                    <span className="text-foreground/35 italic text-xs">—</span>
                  )}
                </TableCell>
                {currentUserRole === 'SUPER_ADMIN' && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 hidden sm:flex text-xs font-medium"
                        onClick={() => {
                          setViewingId(employee.id);
                          router.push(`/admin/employees/${employee.id}?from=dashboard`);
                        }}
                        disabled={viewingId === employee.id}
                      >
                        {viewingId === employee.id ? (
                          <>
                            <Loader2 className="animate-spin h-3 w-3 mr-1.5" />
                            Loading...
                          </>
                        ) : 'View'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-[rgba(239,68,68,0.10)]"
                        onClick={() => handleDelete(employee.id, employee.fullName)}
                        disabled={isDeleting}
                        title="Delete Employee"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
