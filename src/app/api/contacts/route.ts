import { getContactList } from "@/lib/contacts/contact-repository";

export async function GET() {
  try {
    const contacts = await getContactList();
    return Response.json({ contacts });
  } catch {
    return Response.json(
      { error: { message: "Unable to load contacts." } },
      { status: 500 },
    );
  }
}