import React, { useState, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react";
import { useCreateLead } from "@/hooks/useLeads";
import { toast } from "sonner";

// Lazy-load the map to keep initial JS small (improves LCP/TTI)
const InteractiveMap = lazy(() => import("@/components/ui/interactive-map"));

const SITE = "https://tvanamm.com";

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    // Honeypot field to deter simple bots
    company: "",
  });

  const createLead = useCreateLead();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.company.trim() !== "") {
      toast.error("Submission blocked. Please try again.");
      return;
    }

    // Basic India phone validation (optional)
    const phoneOk =
      !formData.phone ||
      /^(?:\+?91[-\s]?)?[6-9]\d{9}$/.test(formData.phone.replace(/\s+/g, ""));

    if (!phoneOk) {
      toast.error("Please enter a valid Indian phone number.");
      return;
    }

    createLead.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        source: "contact_page",
      },
      {
        onSuccess: () => {
          toast.success("Thanks! We’ll get back to you shortly.");
          // GA lead event (safe check)
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", "generate_lead", {
              event_category: "engagement",
              event_label: "contact_page",
              value: 1,
            });
          }
          setFormData({
            name: "",
            email: "",
            phone: "",
            message: "",
            company: "",
          });
        },
        onError: () => {
          toast.error("Couldn’t send your message. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Page-level SEO */}
      <Helmet>
        <title>Contact T VANAMM | Tea Franchise Enquiries & Support</title>
        <meta
          name="description"
          content="Contact T VANAMM for tea franchise enquiries, sourcing and support across Telangana & Andhra Pradesh. Call +91 90000 08479 or email tvanamm@gmail.com."
        />
        <link rel="canonical" href={`${SITE}/contact`} />
        {/* Open Graph / Twitter */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Contact T VANAMM" />
        <meta
          property="og:description"
          content="Talk to our team about tea & chai franchise opportunities in Telangana and Andhra Pradesh."
        />
        <meta property="og:url" content={`${SITE}/contact`} />
        <meta property="og:image" content={`${SITE}/tea-og-image.webp`} />
        <meta name="twitter:card" content="summary_large_image" />
        {/* Optional preconnect if this page calls APIs directly */}
        {/* <link rel="preconnect" href="https://xvojnnbjnleakecogqnd.supabase.co" crossOrigin="" /> */}

        {/* JSON-LD: Breadcrumbs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
              { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE}/contact` },
            ],
          })}
        </script>

        {/* JSON-LD: Contact Page + Organization contactPoint */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact T VANAMM",
            url: `${SITE}/contact`,
            mainEntity: {
              "@type": "Organization",
              name: "T VANAMM",
              url: `${SITE}/`,
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+91-90000-08479",
                  contactType: "customer service",
                  areaServed: "IN",
                  availableLanguage: ["en", "hi", "te"],
                },
              ],
            },
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch with T VANAMM. We&apos;re here to help with tea franchise
            enquiries, sourcing and support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Our Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-muted-foreground">
                  Plot No. 12, Rd Number 8, Gayatri Nagar,<br />
                  Vivekananda Nagar, Kukatpally,<br />
                  Hyderabad, Telangana 500072, India
                </address>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-1">
                <p>
                  <a href="tel:+919390658544" className="underline">
                    +91&nbsp;93906&nbsp;58544
                  </a>
                </p>
                <p>
                  <a href="tel:+919000008479" className="underline">
                    +91&nbsp;90000&nbsp;08479
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href="mailto:tvanamm@gmail.com" className="text-muted-foreground underline">
                  tvanamm@gmail.com
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Honeypot (hidden) */}
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="hidden"
                />

                <div>
                  <label htmlFor="name" className="sr-only">Your Name</label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="sr-only">Your Email</label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="sr-only">Your Phone Number</label>
                  <Input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Your Phone Number (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    pattern="^(?:\+?91[-\s]?)?[6-9]\d{9}$"
                    title="Valid Indian mobile number, e.g. +91 9000000000 or 9000000000"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="sr-only">Your Message</label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your requirement or city of interest…"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={createLead.isPending}>
                  {createLead.isPending ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to be contacted by T VANAMM about franchise or product enquiries.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map Section (lazy) */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle>Find Us</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-64 w-full bg-muted animate-pulse rounded-lg" />}>
                <InteractiveMap
                  address="Plot No. 12, Rd Number 8, Gayatri Nagar, Vivekananda Nagar, Kukatpally, Hyderabad, Telangana 500072"
                  googleMapsLink="https://share.google.com/jCvevKPrXRy6yicgP"
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
