'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createEmployee, updateEmployee } from '@/actions/employees';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from '@/lib/validations/employees';

// Combined schema for form logic, though server actions use separate schemas
// We need to handle password being optional for updates
const formSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .optional()
    .or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE']),
  branch_id: z.string().optional(),
  manager_id: z.string().optional().nullable(),
  can_manage_media_tracker: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Branch {
  id: string;
  name: string;
}

interface Manager {
  id: string;
  fullName: string | null;
}

interface EmployeeFormProps {
  initialData?: any;
  branches?: Branch[];
  managers?: Manager[];
  isEditing?: boolean;
  readOnly?: boolean;
}

export function EmployeeForm({
  initialData,
  branches = [],
  managers = [],
  isEditing = false,
  readOnly = false,
}: EmployeeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: initialData?.fullName || initialData?.full_name || '',
      email: initialData?.email || '',
      role: initialData?.role || 'EMPLOYEE',
      branch_id: initialData?.branch_id || 'no_branch',
      manager_id: initialData?.managerId || 'no_manager',
      can_manage_media_tracker: initialData?.can_manage_media_tracker || false,
      password: '',
    },
  });

  const selectedRole = form.watch('role');

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setError(null);

    const branchId =
      data.branch_id === 'no_branch' || !data.branch_id ? null : data.branch_id;

    try {
      if (isEditing) {
        // Update
        // Remove email and password from update payload as current action implementation might not support them or they are separate
        // Our updateEmployee action supports: full_name, role, branch_id
        const updatePayload = {
          full_name: data.full_name,
          role: data.role,
          branch_id: branchId,
          manager_id:
            data.manager_id === 'no_manager' || !data.manager_id
              ? null
              : data.manager_id,
          can_manage_media_tracker: data.can_manage_media_tracker,
        };

        const result = await updateEmployee(initialData.id, updatePayload);

        if (result.error) {
          setError(result.error);
        } else {
          router.push('/employees');
          router.refresh();
        }
      } else {
        // Create
        if (!data.password) {
          setError('Password is required for new employees');
          setIsLoading(false);
          return;
        }

        const createPayload = {
          email: data.email,
          password: data.password || '',
          full_name: data.full_name,
          role: data.role,
          branch_id: branchId || undefined,
          manager_id:
            data.manager_id === 'no_manager' || !data.manager_id
              ? null
              : data.manager_id,
        };

        const result = await createEmployee(createPayload);

        if (result.error) {
          if (result.error === 'Invalid data' && result.details) {
            // Map field errors back to the form
            const fieldErrors = result.details.fieldErrors;
            Object.keys(fieldErrors).forEach((key) => {
              const errors = (fieldErrors as any)[key];
              const message = errors?.[0];
              if (message) {
                // @ts-ignore
                form.setError(key, { type: 'manual', message });
              }
            });
            setError('Please correct the errors in the form.');
          } else {
            setError(result.error);
          }
        } else {
          router.push('/employees');
          router.refresh();
        }
      }
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={readOnly} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                {/* Email is typically immutable after creation in simple systems, or requires auth change flow */}
                <Input
                  placeholder="john@example.com"
                  {...field}
                  disabled={isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} disabled={readOnly} />
                </FormControl>
                <FormDescription>At least 6 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee (Staff)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Manager)</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Determines access permissions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedRole === 'EMPLOYEE' && (
            <FormField
              control={form.control}
              name="manager_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || 'no_manager'}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign a manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_manager">No Manager</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.fullName || 'Unnamed Admin'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Assign a supervisor.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="branch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                  disabled={readOnly}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no_branch">No Branch / HQ</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && selectedRole === 'EMPLOYEE' && (
          <FormField
            control={form.control}
            name="can_manage_media_tracker"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-normal">
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={readOnly}
                    className="h-4 w-4 rounded border-input"
                  />
                  Media Tracker Manager
                </FormLabel>
                <FormDescription>
                  Grants this employee create/edit/delete rights on the media
                  tracker (records, storage devices, assignments) without
                  changing their role or any other permissions.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!readOnly && (
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : isEditing
                ? 'Update Employee'
                : 'Create Employee'}
          </Button>
        )}
      </form>
    </Form>
  );
}
