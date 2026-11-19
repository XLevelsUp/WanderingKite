// Service terms copy, shared by ServiceTerms (client) and the photography hub (server).

// Defined types for service-specific content logic
export type ServiceType = 'photography' | 'rentals' | 'studio';

export interface TermItem {
  title: string;
  details: string;
}

export const termsData: Record<ServiceType, { header: string; items: TermItem[] }> = {
  photography: {
    header: 'Photography Service Agreement',
    items: [
      {
        title: 'Usage License',
        details:
          'Standard personal and commercial usage rights are granted upon full payment. Attribution is appreciated but not mandatory for commercial licenses.',
      },
      {
        title: 'Booking Requirement',
        details:
          'For events and weddings, we recommend booking at least 30 days in advance. Bookings are on a first-come, first-served basis.',
      },
      {
        title: 'ID Verification',
        details:
          'MANDATORY: Submission of a valid ID proof and two active mobile numbers is required for final session confirmation.',
      },
    ],
  },
  rentals: {
    header: 'Equipment Rental Policy',
    items: [
      {
        title: 'Security Deposit',
        details:
          'High-value gear rentals require the submission of a Blank Cheque as a mandatory security measure.',
      },
      {
        title: 'Liability',
        details:
          'The renter assumes 100% liability for repair or replacement costs in the event of equipment damage or loss during the rental period.',
      },
      {
        title: 'Mandatory Documentation',
        details:
          'Original ID proof (Aadhar or Voter ID) and two secondary contact numbers must be provided at the time of pickup.',
      },
    ],
  },
  studio: {
    header: 'Studio Space Regulations',
    items: [
      {
        title: 'Access Control',
        details:
          'Entry is strictly restricted to the booked hours. Early arrivals or late departures may incur additional hourly charges.',
      },
      {
        title: 'Personal Belongings',
        details:
          'The studio is not responsible for any personal belongings. Clients are advised to secure their valuables during the session.',
      },
      {
        title: 'Studio Conduct',
        details:
          'Submission of a personal information form and two mobile numbers is mandatory for all individuals entering the Coimbatore studio space.',
      },
    ],
  },
};
