import { useState } from "react";
import { Calendar, Phone, User, Mail, Clock, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AppointmentBookingProps {
  vehicleId: string;
  sellerId: string;
  vehicleName: string;
}

export function AppointmentBooking({ vehicleId, sellerId, vehicleName }: AppointmentBookingProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    preferred_date: "",
    preferred_time: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name || !form.client_phone) {
      toast.error("Please fill in your name and phone number");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        vehicle_id: vehicleId,
        seller_id: sellerId,
        client_name: form.client_name,
        client_phone: form.client_phone,
        client_email: form.client_email || null,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        message: form.message || null,
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Appointment request sent successfully!");
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setForm({
          client_name: "",
          client_phone: "",
          client_email: "",
          preferred_date: "",
          preferred_time: "",
          message: "",
        });
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send appointment request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="gold"
        size="lg"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Calendar className="h-5 w-5 mr-2" />
        Book a Viewing
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              Book a Viewing Appointment
            </DialogTitle>
            <DialogDescription>
              Request a viewing for {vehicleName}
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center font-medium">Appointment Request Sent!</p>
              <p className="text-center text-sm text-muted-foreground">
                The seller will contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Your Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client_name"
                    placeholder="Your full name"
                    className="pl-9"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client_phone"
                    placeholder="+213 555 00 00 00"
                    className="pl-9"
                    value={form.client_phone}
                    onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email (optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="client_email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="preferred_date">Preferred Date</Label>
                  <Input
                    id="preferred_date"
                    type="date"
                    value={form.preferred_date}
                    onChange={(e) => setForm({ ...form, preferred_date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_time">Preferred Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="preferred_time"
                      type="time"
                      className="pl-9"
                      value={form.preferred_time}
                      onChange={(e) => setForm({ ...form, preferred_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="message"
                    placeholder="Any specific questions or requests..."
                    className="pl-9 min-h-[80px]"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" variant="gold" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
