import { getEquipmentById, getEquipmentAssignmentHistory, getCategories, getBranches } from '@/actions/equipment';
import { EditEquipmentDialog, QuickImageUpload } from './EditEquipmentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Tag,
  Hash,
  CircleDollarSign,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Package,
  History,
  Wrench,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  AVAILABLE: { label: 'Available',    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  RENTED:    { label: 'Rented',       color: 'bg-violet-500/10  text-violet-400  border-violet-500/20',  icon: Package },
  IN_USE:    { label: 'In Use',       color: 'bg-blue-500/10    text-blue-400    border-blue-500/20',    icon: Package },
  MAINTENANCE:{ label: 'Maintenance', color: 'bg-amber-500/10   text-amber-400   border-amber-500/20',   icon: Wrench },
  LOST:      { label: 'Lost',         color: 'bg-red-500/10     text-red-400     border-red-500/20',     icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status, color: 'bg-white/5 text-foreground/40 border-white/10', icon: Info,
  };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

// ── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [equipment, categoriesRaw, branchesRaw] = await Promise.all([
    getEquipmentById(id).catch(() => null),
    getCategories().catch(() => []),
    getBranches().catch(() => []),
  ]);
  if (!equipment) notFound();

  const history = await getEquipmentAssignmentHistory(id).catch(() => []);

  const category = (equipment.categories as any)?.name as string | undefined;
  const branch   = (equipment.branches  as any)?.name as string | undefined;
  const specs    = Array.isArray(equipment.specs) ? equipment.specs as string[] : [];
  const imageUrl = ((equipment as any).image_url ?? (equipment as any).imageUrl) as string | null;
  const rentalPrice = Number((equipment as any).rental_price ?? (equipment as any).rentalPrice ?? 0);
  const weeklyPrice = Number((equipment as any).weekly_price ?? (equipment as any).weeklyPrice ?? 0);

  // Minimal shape needed by the edit dialog
  const equipmentForEdit = {
    id: equipment.id,
    name: equipment.name,
    serialNumber: (equipment as any).serialNumber,
    categoryId: (equipment as any).categoryId ?? null,
    branchId: (equipment as any).branchId ?? null,
    rental_price: rentalPrice,
    weekly_price: weeklyPrice,
    image_url: imageUrl,
    specs,
    description: equipment.description ?? null,
  };

  return (
    <div className="space-y-8">
      {/* Back nav + Edit button */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/equipment">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Equipment
          </Button>
        </Link>
        <EditEquipmentDialog
          equipment={equipmentForEdit}
          categories={categoriesRaw as { id: string; name: string }[]}
          branches={branchesRaw as { id: string; name: string }[]}
        />
      </div>

      {/* Hero card */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Image panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full bg-muted/40">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={equipment.name}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {/* Status banner */}
            <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-3">
              <StatusBadge status={equipment.status} />
              <span className="text-xs text-muted-foreground font-mono">{(equipment as any).serialNumber}</span>
            </div>
          </Card>

          {/* Quick image upload panel */}
          <QuickImageUpload
            equipmentId={equipment.id}
            currentImageUrl={imageUrl}
            equipmentName={equipment.name}
            serialNumber={(equipment as any).serialNumber}
            categoryId={(equipment as any).categoryId ?? null}
            branchId={(equipment as any).branchId ?? null}
            rentalPrice={rentalPrice}
            weeklyPrice={weeklyPrice}
            specs={specs}
            description={equipment.description ?? null}
          />
        </div>

        {/* Details panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div>
            {category && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20">
                <Tag className="h-3 w-3" />
                {category}
              </span>
            )}
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-foreground">
              {equipment.name}
            </h1>
            {equipment.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {equipment.description}
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{rentalPrice.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Weekly Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{weeklyPrice.toLocaleString('en-IN')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info rows */}
          <Card>
            <CardContent className="pt-4 pb-2">
              <InfoRow icon={Hash}            label="Serial Number" value={(equipment as any).serialNumber} />
              {category && <InfoRow icon={Tag}  label="Category"      value={category} />}
              {branch   && <InfoRow icon={MapPin} label="Branch"      value={branch} />}
              <InfoRow
                icon={CalendarDays}
                label="Added On"
                value={new Date((equipment as any).createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              />
              <InfoRow
                icon={Clock}
                label="Last Updated"
                value={new Date((equipment as any).updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              />
            </CardContent>
          </Card>

          {/* Specs */}
          {specs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {specs.map((spec, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assignment history */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
            <History className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Assignment History</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chain of custody — all past deployments
            </p>
          </div>
          <div className="ml-auto">
            <Link href={`/dashboard/equipment/${id}/history`}>
              <Button variant="outline" size="sm">Full History</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No assignment history yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                This equipment has never been deployed
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {record.assignedTo?.fullName ?? record.assignedTo?.email ?? 'Unknown'}
                      </p>
                      {record.returnedAt ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Returned
                        </span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-blue-400">
                          <AlertCircle className="h-3 w-3" /> Active
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Out:{' '}
                        {new Date(record.assignedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                      {record.returnedAt && (
                        <span>
                          In:{' '}
                          {new Date(record.returnedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      )}
                      {record.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {record.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {history.length > 5 && (
                <Link href={`/dashboard/equipment/${id}/history`}>
                  <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                    View all {history.length} records →
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
