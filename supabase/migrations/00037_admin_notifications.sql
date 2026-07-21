-- 1. Create the admin_notifications table
CREATE TABLE public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- e.g., 'BOOKING_REQUEST', 'ID_PROOF'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Super Admins
CREATE POLICY "Super admins can view all notifications"
ON public.admin_notifications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN'
  )
);

CREATE POLICY "Super admins can update notifications"
ON public.admin_notifications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN'
  )
);

-- 4. Turn on Realtime for the new table
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;


-- 5. Trigger Function: Generate notification for new Bookings
CREATE OR REPLACE FUNCTION public.notify_admin_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name TEXT;
  v_service_type TEXT;
  v_notif_title TEXT;
  v_notif_message TEXT;
BEGIN
  -- Fetch client name safely, defaulting if not found
  SELECT COALESCE(name, 'Unknown Client') INTO v_client_name 
  FROM public.clients WHERE id = NEW.client_id;
  
  IF TG_TABLE_NAME = 'photography_bookings' THEN
    v_service_type := 'Photography';
  ELSIF TG_TABLE_NAME = 'studio_bookings' THEN
    v_service_type := 'Studio';
  ELSIF TG_TABLE_NAME = 'rental_bookings' THEN
    v_service_type := 'Rental';
  END IF;

  v_notif_title := 'New booking from ' || v_client_name || ' — ' || v_service_type;
  v_notif_message := 'A new booking request has been received.';

  INSERT INTO public.admin_notifications (type, title, message, reference_id, client_id)
  VALUES ('BOOKING_REQUEST', v_notif_title, v_notif_message, NEW.id, NEW.client_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Booking Triggers
CREATE TRIGGER photography_booking_notify
AFTER INSERT ON public.photography_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_booking();

CREATE TRIGGER studio_booking_notify
AFTER INSERT ON public.studio_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_booking();

CREATE TRIGGER rental_booking_notify
AFTER INSERT ON public.rental_bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_booking();


-- 7. Trigger Function: Generate notification for ID Proofs
CREATE OR REPLACE FUNCTION public.notify_admin_on_id_proof()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name TEXT;
BEGIN
  -- Only trigger on INSERT or when an UPDATE changes the status to 'PENDING'
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'PENDING' AND NEW.status = 'PENDING') THEN
    
    SELECT COALESCE(name, 'Unknown Client') INTO v_client_name 
    FROM public.clients WHERE id = NEW.client_id;
    
    INSERT INTO public.admin_notifications (type, title, message, reference_id, client_id)
    VALUES (
        'ID_PROOF', 
        'ID Verification Required', 
        v_client_name || ' has uploaded a new ID document for review.', 
        NEW.id, 
        NEW.client_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Attach ID Proof Trigger
CREATE TRIGGER id_proof_notify
AFTER INSERT OR UPDATE ON public.client_id_proofs
FOR EACH ROW EXECUTE FUNCTION public.notify_admin_on_id_proof();
