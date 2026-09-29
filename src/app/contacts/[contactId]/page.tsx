import ContactDetailClient from "@/components/contact-detail/contact-detail-client";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  return <ContactDetailClient contactId={contactId} />;
}
