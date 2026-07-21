-- =============================================================================
-- Migration: 00025_client_dashboard_phase_2_triggers.sql (Part 2: Triggers)
-- =============================================================================
-- Purpose:
--   1. Implement PostgreSQL triggers for conflict prevention:
--      - Rental equipment stock/double-booking validation.
--      - Studio space booking overlap validation (with 30m turnaround buffer).
--      - Photography booking exact datetime overlap validation.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Trigger functions for conflict prevention at the database layer
-- =============================================================================

-- 1. Rental Equipment double-booking / stock capacity checking trigger function (pointing to common equipment)
CREATE OR REPLACE FUNCTION public.check_rental_equipment_availability()
RETURNS TRIGGER AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_status public."RentalStatus";
  v_equip_name TEXT;
  v_occupied INT;
BEGIN
  -- Get the booking details
  SELECT start_date, end_date, status INTO v_start, v_end, v_status
  FROM public.rental_bookings
  WHERE id = NEW."A";

  -- Get the equipment name
  SELECT name INTO v_equip_name
  FROM public.equipment
  WHERE id = NEW."B";

  -- Validate active bookings (PENDING or CONFIRMED)
  IF v_status IN ('PENDING', 'CONFIRMED') THEN
    -- Count other active bookings that overlap in dates and contain this specific physical equipment item B
    SELECT COUNT(*)::INT INTO v_occupied
    FROM public.rental_bookings rb
    JOIN public."_RentalBookingToEquipment" re ON rb.id = re."A"
    WHERE re."B" = NEW."B"
      AND rb.id <> NEW."A"
      AND rb.status IN ('PENDING', 'CONFIRMED')
      AND rb.start_date < v_end
      AND rb.end_date > v_start;

    IF v_occupied >= 1 THEN
      RAISE EXCEPTION 'Equipment "%" (ID: %) is already booked for the selected dates.', v_equip_name, NEW."B";
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_rental_equipment_availability ON public."_RentalBookingToEquipment";
CREATE TRIGGER trg_check_rental_equipment_availability
  BEFORE INSERT OR UPDATE ON public."_RentalBookingToEquipment"
  FOR EACH ROW EXECUTE FUNCTION public.check_rental_equipment_availability();

-- Validate changes to booking status/dates for rental equipment stock
CREATE OR REPLACE FUNCTION public.check_rental_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  r RECORD;
  v_equip_name TEXT;
  v_occupied INT;
BEGIN
  -- Only validate if status is updated to PENDING/CONFIRMED, or dates are modified
  IF (NEW.status IN ('PENDING', 'CONFIRMED')) AND (OLD.status NOT IN ('PENDING', 'CONFIRMED') OR NEW.start_date <> OLD.start_date OR NEW.end_date <> OLD.end_date) THEN
    FOR r IN 
      SELECT "B" AS equip_id FROM public."_RentalBookingToEquipment" WHERE "A" = NEW.id
    LOOP
      SELECT name INTO v_equip_name
      FROM public.equipment
      WHERE id = r.equip_id;

      SELECT COUNT(*)::INT INTO v_occupied
      FROM public.rental_bookings rb
      JOIN public."_RentalBookingToEquipment" re ON rb.id = re."A"
      WHERE re."B" = r.equip_id
        AND rb.id <> NEW.id
        AND rb.status IN ('PENDING', 'CONFIRMED')
        AND rb.start_date < NEW.end_date
        AND rb.end_date > NEW.start_date;

      IF v_occupied >= 1 THEN
        RAISE EXCEPTION 'Cannot update booking. Equipment "%" (ID: %) is already booked for the selected dates.', v_equip_name, r.equip_id;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_rental_booking_status_change ON public.rental_bookings;
CREATE TRIGGER trg_check_rental_booking_status_change
  BEFORE UPDATE ON public.rental_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_rental_booking_status_change();


-- 2. Studio Space overlap checks trigger function (including 30-minute cleaning turnaround buffer)
CREATE OR REPLACE FUNCTION public.check_studio_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_overlap_exists BOOLEAN;
  v_new_start TIMESTAMPTZ := NEW.date_time;
  v_new_end TIMESTAMPTZ := NEW.date_time + (NEW.duration_hours * INTERVAL '1 hour') + INTERVAL '30 minutes';
BEGIN
  IF NEW.status IN ('PENDING', 'CONFIRMED') THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.studio_bookings sb
      WHERE sb.id <> NEW.id
        AND sb.status IN ('PENDING', 'CONFIRMED')
        AND sb.date_time < v_new_end
        AND (sb.date_time + (sb.duration_hours * INTERVAL '1 hour') + INTERVAL '30 minutes') > v_new_start
    ) INTO v_overlap_exists;

    IF v_overlap_exists THEN
      RAISE EXCEPTION 'Studio booking overlap detected. The requested time slot (including a 30-minute cleaning buffer) conflicts with an existing active booking.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_studio_booking_overlap ON public.studio_bookings;
CREATE TRIGGER trg_check_studio_booking_overlap
  BEFORE INSERT OR UPDATE ON public.studio_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_studio_booking_overlap();


-- 3. Photography booking exact datetime overlap checks trigger function
CREATE OR REPLACE FUNCTION public.check_photography_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
  v_overlap_exists BOOLEAN;
BEGIN
  IF NEW.status IN ('PENDING', 'CONFIRMED') THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.photography_bookings pb
      WHERE pb.id <> NEW.id
        AND pb.status IN ('PENDING', 'CONFIRMED')
        AND pb.date_time = NEW.date_time
    ) INTO v_overlap_exists;

    IF v_overlap_exists THEN
      RAISE EXCEPTION 'Photography booking overlap detected. Another active booking is already scheduled at the exact same date and time.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_photography_booking_overlap ON public.photography_bookings;
CREATE TRIGGER trg_check_photography_booking_overlap
  BEFORE INSERT OR UPDATE ON public.photography_bookings
  FOR EACH ROW EXECUTE FUNCTION public.check_photography_booking_overlap();

COMMIT;
