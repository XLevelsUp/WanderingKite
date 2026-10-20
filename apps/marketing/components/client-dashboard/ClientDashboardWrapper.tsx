'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Film, Home, User, Mail, Phone, Calendar, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PhotographyTab from './PhotographyTab';
import RentalsTab from './RentalsTab';
import StudioTab from './StudioTab';
import ServiceCard from './ServiceCard';
import { useAddServiceModal } from './AddServiceModal';

interface IdProof {
  id: string;
  idType: string;
  fileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectReason: string | null;
}

interface ClientProfile {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  isActive: boolean;
}

interface ClientDashboardWrapperProps {
  client: ClientProfile;
  initialServices: ('PHOTOGRAPHY' | 'RENTALS' | 'STUDIO_SPACE')[];
  initialIdProof: IdProof | null;
}

export default function ClientDashboardWrapper({
  client,
  initialServices,
  initialIdProof,
}: ClientDashboardWrapperProps) {
  const router = useRouter();
  const [subscribedServices, setSubscribedServices] = useState<string[]>(initialServices);
  const [activeTab, setActiveTab] = useState<string>(
    initialServices[0] || 'PHOTOGRAPHY'
  );

  useEffect(() => {
    const saved = sessionStorage.getItem('client_dashboard_active_tab');
    if (saved && initialServices.includes(saved as any)) {
      setActiveTab(saved);
    }
  }, [initialServices]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem('client_dashboard_active_tab', tab);
  };

  const handleAddServiceSuccess = (service: 'PHOTOGRAPHY' | 'RENTALS' | 'STUDIO_SPACE') => {
    setSubscribedServices((prev) => [...prev, service]);
    handleTabChange(service);
    // Trigger Server Component re-fetch to keep everything in sync
    router.refresh();
  };

  const { openAddServiceModal } = useAddServiceModal({
    onSuccess: handleAddServiceSuccess,
  });

  const availableServicesToSubscribe = (['PHOTOGRAPHY', 'RENTALS', 'STUDIO_SPACE'] as const).filter(
    (s) => !subscribedServices.includes(s)
  );

  const clientName = client.name || `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Column: Profile Card & Tab Navigation */}
      <div className="lg:col-span-1 space-y-6">
        {/* Profile Card */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
            <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
              Active
            </Badge>
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-amber-500" />
              Client Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-slate-300">
            <div className="space-y-1">
              <div className="text-slate-400 font-medium">Name</div>
              <div className="text-white font-semibold text-sm">{clientName}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-400 font-medium">Email</div>
              <div className="text-white truncate" title={client.email}>{client.email}</div>
            </div>
            {client.phone && (
              <div className="space-y-1">
                <div className="text-slate-400 font-medium">Phone</div>
                <div className="text-white">{client.phone}</div>
              </div>
            )}
            {client.dateOfBirth && (
              <div className="space-y-1">
                <div className="text-slate-400 font-medium">Date of Birth</div>
                <div className="text-white">
                  {formatDateStable(client.dateOfBirth)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tab switcher navigation (Vertical on desktop) */}
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md p-2">
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 scrollbar-none [mask-image:linear-gradient(to_right,black_85%,transparent_100%)] lg:[mask-image:none]">
            {subscribedServices.includes('PHOTOGRAPHY') && (
              <button
                onClick={() => handleTabChange('PHOTOGRAPHY')}
                data-no-track
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 text-left w-full ${
                  activeTab === 'PHOTOGRAPHY'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Camera className="h-4 w-4 shrink-0" />
                <span>Photography</span>
              </button>
            )}

            {subscribedServices.includes('RENTALS') && (
              <button
                onClick={() => handleTabChange('RENTALS')}
                data-no-track
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 text-left w-full ${
                  activeTab === 'RENTALS'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Film className="h-4 w-4 shrink-0" />
                <span>Equipment Rentals</span>
              </button>
            )}

            {subscribedServices.includes('STUDIO_SPACE') && (
              <button
                onClick={() => handleTabChange('STUDIO_SPACE')}
                data-no-track
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 text-left w-full ${
                  activeTab === 'STUDIO_SPACE'
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Home className="h-4 w-4 shrink-0" />
                <span>Studio Spaces</span>
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Right Column: Active Tab Content & Marketplace Addons */}
      <div className="lg:col-span-3 space-y-10">
        {/* Render Selected Panel */}
        <Card className="bg-slate-900/20 border-slate-800 backdrop-blur-sm p-6 rounded-2xl min-h-[400px]">
          {activeTab === 'PHOTOGRAPHY' && subscribedServices.includes('PHOTOGRAPHY') && (
            <PhotographyTab />
          )}
          {activeTab === 'RENTALS' && subscribedServices.includes('RENTALS') && (
            <RentalsTab clientName={clientName} initialIdProof={initialIdProof} />
          )}
          {activeTab === 'STUDIO_SPACE' && subscribedServices.includes('STUDIO_SPACE') && (
            <StudioTab />
          )}
        </Card>

        {/* Marketplace Section: "Add More Services" */}
        {availableServicesToSubscribe.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
              Add More Services
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Subscribe to additional creative interests. Once confirmed, their respective booking lists and forms will unlock immediately on your dashboard.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {availableServicesToSubscribe.map((service) => (
                <ServiceCard
                  key={service}
                  type={service}
                  onAdd={() => openAddServiceModal(service)}
                  isLoading={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatDateStable = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};
