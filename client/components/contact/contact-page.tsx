import { HomeFooter } from "@/components/site/home-footer";
import { HomeHeader } from "@/components/site/home-header";
import { InquiryForm } from "@/components/forms/inquiry-form";

const contactDetails = [
  {
    label: "Warehouse",
    value: "12353 104 Ave, Surrey BC V3V 3H2",
  },
  {
    label: "Office",
    value: "7575 Alderbridge Way, Richmond BC V6X 4L1",
  },
  {
    label: "Email",
    value: "bruce@allicoindustries.ca",
    href: "mailto:bruce@allicoindustries.ca",
  },
  {
    label: "Phone",
    value: "604-781-8659",
    href: "tel:6047818659",
  },
];

type ContactPageProps = {
  showCustomOrderNotice?: boolean;
};

async function ContactPage({
  showCustomOrderNotice = false,
}: ContactPageProps) {
  return (
    <div className="min-h-screen bg-background-light text-text-light">
      <HomeHeader activePage="contact" />

      <div className="bg-primary py-1 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground">
        Send us a message and our team will follow up as soon as possible
      </div>

      <main>
        <section className="border-b border-gray-200 bg-white py-6 md:py-7">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl border-l-4 border-primary pl-4 md:pl-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Contact Us
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-black uppercase leading-tight text-gray-900 md:text-4xl">
                Get In Touch With Allico Industries
              </h1>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 md:py-18">
          <div className="container mx-auto px-4">
            <div id="contact-form" className="mx-auto max-w-4xl">
              {showCustomOrderNotice ? (
                <div className="mb-6 border-l-4 border-primary bg-zinc-50 px-5 py-4">
                  <p className="text-base leading-7 text-gray-700">
                    Can&apos;t find that product you like, or you want customization?
                    Let us know we will get the job done at the best price.
                  </p>
                </div>
              ) : null}

              <div className="border border-gray-200 bg-white p-8 shadow-sm md:p-12">
                <InquiryForm
                  action="/api/inquiries"
                  description="Fill out the form below and tell us how we can help. All fields are required."
                  formName="Contact Us"
                  helperText="Email delivery will go live once the Resend account and environment variables are configured."
                  source="contact-page"
                  submitLabel="Send Message"
                  successMessage="Thanks for reaching out. Your message has been submitted."
                  title="Send Us a Message"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-zinc-50 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl border border-gray-200 bg-white p-8 shadow-sm md:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Company Contact Information
                </p>
                <h2 className="mt-2 font-display text-3xl font-black uppercase text-gray-900">
                  Reach Us Directly
                </h2>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {contactDetails.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-sm border border-gray-200 bg-white px-5 py-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        className="mt-3 block text-base font-medium leading-7 text-gray-700 transition hover:text-primary"
                        href={item.href}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-3 text-base leading-7 text-gray-700">
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}

export { ContactPage };
