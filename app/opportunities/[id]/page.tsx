import { supabase } from "@/lib/supabaseClient";
import EventDetailsClient from "@/components/opportunities/EventDetailsClient";
import VolunteerTabs from "@/components/layout/VolunteerTabs";

export async function generateStaticParams() {
  const { data, error } = await supabase.from("events").select("id");
  if (error || !data) return [];
  return data.map((event) => ({
    id: event.id,
  }));
}

export default function OpportunityDetailsPage() {
  return (
    <>
      <EventDetailsClient />
      <VolunteerTabs />
    </>
  );
}