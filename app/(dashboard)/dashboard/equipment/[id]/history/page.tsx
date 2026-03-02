import {
  getEquipmentById,
  getEquipmentAssignmentHistory,
} from '@/actions/equipment';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, History, CheckCircle, Clock } from 'lucide-react';

interface AssignmentHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EquipmentAssignmentHistoryPage({
  params,
}: AssignmentHistoryPageProps) {
  const { id } = await params;

  const [equipment, history] = await Promise.all([
    getEquipmentById(id).catch(() => null),
    getEquipmentAssignmentHistory(id),
  ]);

  if (!equipment) {
    notFound();
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Link href={`/dashboard/equipment/${id}`}>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Equipment
          </Button>
        </Link>
      </div>

      <div>
        <h1 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
          <History className='h-7 w-7 text-slate-500' />
          Assignment History
        </h1>
        <p className='text-slate-500 mt-1'>
          Chain of custody for:{' '}
          <span className='font-semibold text-slate-700'>{equipment.name}</span>
          {equipment.serialNumber && (
            <span className='text-sm ml-1 text-slate-400'>
              — S/N: {equipment.serialNumber}
            </span>
          )}
        </p>
      </div>

      {/* Summary card */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-slate-800'>
              {history.length}
            </div>
            <p className='text-sm text-slate-500'>Total assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-blue-600'>
              {history.filter((h: any) => !h.returnedAt).length}
            </div>
            <p className='text-sm text-slate-500'>Currently out</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-green-600'>
              {history.filter((h: any) => h.returnedAt).length}
            </div>
            <p className='text-sm text-slate-500'>Returned</p>
          </CardContent>
        </Card>
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Log</CardTitle>
          <CardDescription>
            Every movement of this equipment, most recent first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className='text-center py-12 text-slate-400'>
              <History className='h-10 w-10 mx-auto mb-3 opacity-30' />
              <p className='text-sm'>
                No assignment history found.
                <br />
                This equipment has not been assigned yet, or migration 00004 has
                not been applied.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assigned By</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Checked Out</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row: any) => {
                  const isOut = !row.returnedAt;
                  const daysOut = row.assignedAt
                    ? Math.floor(
                        (Date.now() - new Date(row.assignedAt).getTime()) /
                          86_400_000,
                      )
                    : 0;
                  const isOverdue = isOut && daysOut > 3;

                  return (
                    <TableRow key={row.id}>
                      <TableCell className='font-medium'>
                        {row.assignedTo?.fullName ||
                          row.assignedTo?.email ||
                          '—'}
                      </TableCell>
                      <TableCell className='text-slate-500 text-sm'>
                        {row.assignedBy?.fullName || '—'}
                      </TableCell>
                      <TableCell className='text-slate-500 text-sm'>
                        {row.location || '—'}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {row.assignedAt
                          ? new Date(row.assignedAt).toLocaleDateString(
                              'en-GB',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )
                          : '—'}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {row.returnedAt
                          ? new Date(row.returnedAt).toLocaleDateString(
                              'en-GB',
                              {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {isOut ? (
                          isOverdue ? (
                            <Badge variant='destructive' className='gap-1'>
                              <Clock className='h-3 w-3' />
                              Overdue ({daysOut}d)
                            </Badge>
                          ) : (
                            <Badge variant='warning' className='gap-1'>
                              <Clock className='h-3 w-3' />
                              Out ({daysOut}d)
                            </Badge>
                          )
                        ) : (
                          <Badge variant='success' className='gap-1'>
                            <CheckCircle className='h-3 w-3' />
                            Returned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-slate-500 text-sm max-w-[200px] truncate'>
                        {row.notes || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
