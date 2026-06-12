import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Film, Home } from 'lucide-react';

interface ServiceCardProps {
  type: 'PHOTOGRAPHY' | 'RENTALS' | 'STUDIO_SPACE';
  onAdd: () => void;
  isLoading: boolean;
}

const serviceDetails = {
  PHOTOGRAPHY: {
    title: 'Photography Sessions',
    description: 'Book premium event photography, weddings, portraits, and product shoots with our creative directors.',
    icon: Camera,
  },
  RENTALS: {
    title: 'Equipment Rentals',
    description: 'Rent professional camera bodies, lenses, lighting, and audio equipment for your own productions.',
    icon: Film,
  },
  STUDIO_SPACE: {
    title: 'Studio Spaces',
    description: 'Reserve our state-of-the-art cyclorama wall or acoustically treated studio spaces for high-end shoots.',
    icon: Home,
  },
};

export default function ServiceCard({ type, onAdd, isLoading }: ServiceCardProps) {
  const details = serviceDetails[type];
  const Icon = details.icon;

  return (
    <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-base font-semibold text-white">{details.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <CardDescription className="text-xs text-slate-400 leading-relaxed">
          {details.description}
        </CardDescription>
        <Button
          onClick={onAdd}
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-500 border border-amber-500/20 hover:border-transparent font-medium py-1.5 rounded-xl transition-all duration-300"
        >
          {isLoading ? 'Subscribing...' : `Add ${details.title.split(' ')[0]}`}
        </Button>
      </CardContent>
    </Card>
  );
}
