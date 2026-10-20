import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  href: string;
  color: string;
  bg: string;
  badge?: string;
}

/**
 * Responsive stat-card grid: 1 col → 2 (sm) → 4 (lg) → 5 (xl, only when the
 * super-admin's 5th card is present, so ADMIN's 4 cards never leave an orphan).
 */
export function DashboardStatCards({ cards }: { cards: StatCard[] }) {
  const xlCols = cards.length === 5 ? 'xl:grid-cols-5' : '';
  return (
    <div
      className={`grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${xlCols}`}
    >
      {cards.map((card) => (
        <Link key={card.title} href={card.href} className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <span className={`p-1.5 rounded-md ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </span>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              {card.badge && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  {card.badge}
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
