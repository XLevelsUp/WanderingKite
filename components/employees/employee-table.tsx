'use client';

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
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteEmployee } from '@/actions/employees';
import { useState } from 'react';

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

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this employee? This action cannot be undone.',
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteEmployee(id);
    setIsDeleting(false);

    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className='rounded-xl border border-primary/15 bg-[rgba(17,17,22,0.85)] backdrop-blur-md overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-primary/12 hover:bg-transparent'>
            <TableHead className='text-primary font-semibold text-xs uppercase tracking-widest opacity-80 py-4'>
              Name
            </TableHead>
            <TableHead className='text-primary font-semibold text-xs uppercase tracking-widest opacity-80'>
              Email
            </TableHead>
            <TableHead className='text-primary font-semibold text-xs uppercase tracking-widest opacity-80'>
              Role
            </TableHead>
            <TableHead className='text-primary font-semibold text-xs uppercase tracking-widest opacity-80'>
              Branch
            </TableHead>
            <TableHead className='text-primary font-semibold text-xs uppercase tracking-widest opacity-80 text-right'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className='h-24 text-center text-foreground/50'
              >
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow
                key={employee.id}
                className='border-b border-primary/8 hover:bg-primary/6 transition-colors duration-150'
              >
                <TableCell className='font-medium text-white py-4'>
                  {employee.fullName || 'N/A'}
                </TableCell>
                <TableCell className='text-foreground/75'>
                  {employee.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge[employee.role]}`}
                  >
                    {employee.role.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell className='text-foreground/65'>
                  {employee.branches?.name || (
                    <span className='text-foreground/35 italic text-xs'>—</span>
                  )}
                </TableCell>
                <TableCell className='text-right'>
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
                      className='bg-[rgba(17,17,22,0.98)] border border-primary/18 backdrop-blur-xl text-white'
                    >
                      <DropdownMenuLabel className='text-primary text-xs uppercase tracking-widest opacity-70'>
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/dashboard/employees/${employee.id}`)
                        }
                        className='text-foreground hover:text-white focus:text-white hover:bg-primary/10 focus:bg-primary/10 cursor-pointer'
                      >
                        <Pencil className='mr-2 h-4 w-4 text-primary' />
                        Edit
                      </DropdownMenuItem>
                      {currentUserRole === 'SUPER_ADMIN' && (
                        <>
                          <DropdownMenuSeparator className='bg-primary/12' />
                          <DropdownMenuItem
                            className='text-red-400 hover:text-red-300 focus:text-red-300 hover:bg-[rgba(239,68,68,0.10)] focus:bg-[rgba(239,68,68,0.10)] cursor-pointer'
                            onClick={() => handleDelete(employee.id)}
                            disabled={isDeleting}
                          >
                            <Trash className='mr-2 h-4 w-4' />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
