import ContactForm from "./components/contact-form";
import ContactHero from "./components/contact-hero";
import ContactInfo from "./components/contact-info";

export default function ContactPage() {
  return (
    <div>
      <ContactHero />
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <ContactInfo />
      </div>
      <div className="bg-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
