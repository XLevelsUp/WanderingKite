import { getHREmployee } from '@/actions/hr/employees';
import { ContractEditForm } from '@/components/hr/ContractEditForm';
import { PersonalDetailsEditForm } from '@/components/hr/PersonalDetailsEditForm';
import {
  ArrowLeft, BadgeCheck, Building2, Mail, Calendar,
  Phone, Cake, Droplets, CreditCard, User2,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Employee Detail — Admin' };

const ROLE_BADGES: Record<string, string> = {
  SUPER_ADMIN: 'bg-[rgba(168,85,247,0.15)] text-purple-300 border border-purple-500/25',
  ADMIN:       'bg-[rgba(59,130,246,0.15)] text-blue-300 border border-blue-500/25',
  EMPLOYEE:    'bg-[rgba(16,185,129,0.15)] text-emerald-300 border border-emerald-500/25',
};

const GENDER_LABEL: Record<string, string> = {
  MALE:             'Male',
  FEMALE:           'Female',
  OTHER:            'Other',
  PREFER_NOT_TO_SAY: 'Prefer not to say',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between py-2.5 border-b border-white/5 last:border-0'>
      <span className='text-xs text-foreground/40 font-medium uppercase tracking-wider w-36 flex-shrink-0'>{label}</span>
      <span className='text-sm text-foreground/80 text-right flex-1'>{value ?? <span className='text-foreground/25 italic text-xs'>Not set</span>}</span>
    </div>
  );
}

function calcAge(dob: string | null): string {
  if (!dob) return '—';
  const d = new Date(dob);
  const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${age} yrs`;
}

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const employee = await getHREmployee(id);

  if (!employee) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isSuperAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'DEVELOPER';

  const { contract } = employee;
  const initials = (employee.fullName ?? employee.email)
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');

  const hasMissingPersonalDetails =
    !employee.phone || !employee.dateOfBirth || !employee.gender;

  const sp = await searchParams;
  const fromDashboard = sp?.from === 'dashboard';

  return (
    <div className='p-6 md:p-8 max-w-4xl mx-auto space-y-8'>
      {/* Back */}
      <Link
        href={fromDashboard ? '/dashboard/employees' : '/admin/employees'}
        className='inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors'
      >
        <ArrowLeft className='h-4 w-4' />
        {fromDashboard ? 'Back to Dashboard' : 'Back to Employees'}
      </Link>

      {/* ── Profile header card ───────────────────────────────────────────── */}
      <div className='rounded-2xl border border-primary/12 bg-[rgba(17,17,22,0.85)] backdrop-blur-md p-6'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-5'>
          {/* Avatar */}
          {contract?.avatarUrl ? (
            <img
              src={contract.avatarUrl}
              alt={employee.fullName ?? ''}
              className='w-20 h-20 rounded-full object-cover ring-2 ring-primary/25 flex-shrink-0'
            />
          ) : (
            <div className='w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary ring-2 ring-primary/20 flex-shrink-0'>
              {initials}
            </div>
          )}

          {/* Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex flex-wrap items-center gap-2 mb-1'>
              <h1 className='text-2xl font-bold text-foreground'>{employee.fullName ?? '—'}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  ROLE_BADGES[employee.role] ?? ROLE_BADGES.EMPLOYEE
                }`}
              >
                {employee.role.replace('_', ' ')}
              </span>
              {!contract?.isActive && (
                <span className='inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20'>
                  Inactive
                </span>
              )}
            </div>

            <div className='flex flex-wrap gap-x-5 gap-y-1 mt-1.5'>
              <span className='flex items-center gap-1.5 text-xs text-foreground/45'>
                <Mail className='w-3.5 h-3.5' /> {employee.email}
              </span>
              {employee.phone && (
                <span className='flex items-center gap-1.5 text-xs text-foreground/45'>
                  <Phone className='w-3.5 h-3.5' /> {employee.phone}
                </span>
              )}
              {employee.dateOfBirth && (
                <span className='flex items-center gap-1.5 text-xs text-foreground/45'>
                  <Cake className='w-3.5 h-3.5' /> {calcAge(employee.dateOfBirth)}
                </span>
              )}
            </div>

            {contract && (
              <div className='flex flex-wrap gap-4 mt-2'>
                <span className='flex items-center gap-1.5 text-xs text-foreground/40'>
                  <BadgeCheck className='w-3.5 h-3.5' /> {contract.jobTitle}
                </span>
                <span className='flex items-center gap-1.5 text-xs text-foreground/40'>
                  <Building2 className='w-3.5 h-3.5' /> {contract.employmentType.replace('_', '-')}
                </span>
                <span className='flex items-center gap-1.5 text-xs text-foreground/40'>
                  <Calendar className='w-3.5 h-3.5' />
                  Joined{' '}
                  {new Date(contract.joiningDate).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Payroll link */}
          <Link
            href='/admin/payroll'
            className='flex-shrink-0 px-4 py-2 rounded-xl border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/8 transition-all'
          >
            View Payroll →
          </Link>
        </div>
      </div>

      {/* ── Personal Details card ────────────────────────────────────────── */}
      <div className='rounded-2xl border border-primary/12 bg-[rgba(17,17,22,0.85)] backdrop-blur-md p-6'>
        <div className='flex items-center gap-2 mb-6'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1 flex items-center gap-1.5'>
              <User2 className='w-3 h-3' /> Personal Details
            </p>
            <h2 className='text-xl font-bold text-foreground'>Profile Information</h2>
          </div>
          {hasMissingPersonalDetails && (
            <span className='ml-auto text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1'>
              Incomplete
            </span>
          )}
        </div>

        {/* View row */}
        <div className='mb-6 rounded-xl bg-white/[0.02] border border-white/6 px-4 py-1'>
          <InfoRow
            label='Date of Birth'
            value={
              employee.dateOfBirth
                ? `${new Date(employee.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} (${calcAge(employee.dateOfBirth)})`
                : null
            }
          />
          <InfoRow label='Gender' value={employee.gender ? GENDER_LABEL[employee.gender] : null} />
          <InfoRow label='Phone' value={employee.phone} />
          <InfoRow
            label='Blood Group'
            value={
              employee.bloodGroup ? (
                <span className='inline-flex items-center gap-1'>
                  <Droplets className='w-3 h-3 text-red-400' />
                  {employee.bloodGroup}
                </span>
              ) : null
            }
          />
          <InfoRow
            label='PAN'
            value={
              employee.panNumber ? (
                <span className='font-mono text-xs'>
                  {employee.panNumber.slice(0, 3)}XX{employee.panNumber.slice(5, 7)}XXX{employee.panNumber.slice(10)}
                </span>
              ) : null
            }
          />
        </div>

        {/* Edit form */}
        <PersonalDetailsEditForm employee={employee} readOnly={!isSuperAdmin} />
      </div>

      {/* ── Contract card ────────────────────────────────────────────────── */}
      {contract ? (
        <div className='rounded-2xl border border-primary/12 bg-[rgba(17,17,22,0.85)] backdrop-blur-md p-6'>
          <div className='mb-6'>
            <p className='text-[10px] font-semibold uppercase tracking-[0.22em] text-primary opacity-70 mb-1'>Contract</p>
            <h2 className='text-xl font-bold text-foreground'>
              {isSuperAdmin ? 'Edit Contract' : 'Contract Details'}
            </h2>
          </div>
          <ContractEditForm contract={contract} readOnly={!isSuperAdmin} />
        </div>
      ) : (
        <div className='rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-sm text-amber-400'>
          This employee does not have an HR contract yet.{' '}
          <Link href='/admin/employees/new' className='underline hover:text-amber-300'>
            Create one
          </Link>
          .
        </div>
      )}
    </div>
  );
}
