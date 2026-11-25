export const siteConfig = {
  // Feature switches — set rentals to true to show the Rentals page in nav, links, sitemap and structured data again.
  features: {
    rentals: false,
  },
  name: 'Wandering Kite',
  description:
    'Professional photography services, camera & equipment rentals, studio space, and podcast recording in Coimbatore, Tamil Nadu.',
  url: 'https://www.wanderingkite.in',
  ogImage: 'https://www.wanderingkite.in/og-image.jpg',
  links: {
    instagram: 'https://instagram.com/wanderingkitestudio',
    youtube: 'https://www.youtube.com/@WanderingkitePhotography',
    linkedin: 'https://linkedin.com/company/wanderingkite',
  },
  contact: {
    email: 'hello@wanderingkite.in',
    phone: '+91 70100 92090', // Updated based on footer
    whatsapp: '917010092090',
    studioPhone: '+91 90254 92090',
    studioWhatsapp: '919025492090',
    address: {
      street: 'NO 178, 1st Floor A Ramachandra Road',
      city: 'RS Puram, Coimbatore',
      state: 'Tamil Nadu',
      zip: '641002',
      country: 'IN',
      googleMaps:
        'https://maps.google.com/?q=NO+178+Ramachandra+Road+RS+Puram+Coimbatore',
    },
  },
  /**
   * Opening hours — the single source for the footer and every JSON-LD block. Keep in line with the Google Business Profile.
   * days: 0 = Sunday … 6 = Saturday; times are 24h IST.
   */
  hours: [
    // Matches the Google Business Profile: 9 AM – 8 PM, every day.
    { days: [0, 1, 2, 3, 4, 5, 6], opens: '09:00', closes: '20:00' },
  ],
  /** Opens the Google Business Profile's reviews panel directly (lrd = the listing's id, ",1" = reviews tab). */
  googleReviews: 'https://www.google.com/search?q=Wandering+Kite+Studio#lrd=0x3ba859473373fd57:0x7949fe0a6c2ae094,1',
  /** Permanent Google Maps link to the exact Business Profile (CID of the same listing). */
  googleBusiness: 'https://maps.google.com/?cid=8739795872607035540',
  /** X/Twitter handle for twitter:site (photography brand account). */
  twitter: '@Photography_wk',
  geo: {
    latitude: 11.0168,
    longitude: 76.9558,
  },
  invoice: {
    gstin: '33AAFFW4500N1Z4',
    // Optional — shown in the invoice footer if set.
    bankAccountName: '',
    bankAccountNumber: '',
    bankIFSC: '',
    upiId: '',
  },
};
