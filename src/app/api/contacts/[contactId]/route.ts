import { getContactById } from "@/lib/contacts/contact-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ contactId: string }> },
) {
  try {
    const { contactId } = await context.params;
    const contact = await getContactById(contactId);
    if (!contact) {
      return Response.json(
        { error: { message: "Contact not found." } },
        { status: 404 },
      );
    }

    return Response.json({ contact });
  } catch {
    return Response.json(
      { error: { message: "Unable to load contact." } },
      { status: 500 },
    );
  }
}