import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";

interface ContactFormData {
  name: string;
  email: string;
  mobile: string;
  purpose: string;
  message?: string;
}

interface ContactRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  purpose: string;
  message: string;
  createdAt: string;
  notified: boolean;
}

export default async (req: Request, context: Context) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body: ContactFormData = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.mobile || !body.purpose) {
      return new Response(JSON.stringify({ error: "All required fields must be filled" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the contacts store
    const store = getStore("contacts");

    // Generate a unique ID for this contact
    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();

    // Create the contact record
    const contactRecord: ContactRecord = {
      id: contactId,
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      purpose: body.purpose,
      message: body.message || '',
      createdAt,
      notified: false
    };

    // Store the contact in Netlify Blobs
    await store.setJSON(contactId, contactRecord);

    // Try to send email notification
    let emailSent = false;
    const ownerEmail = Netlify.env.get("OWNER_EMAIL") || "ilurulokesh@gmail.com";
    const resendApiKey = Netlify.env.get("RESEND_API_KEY");

    if (resendApiKey) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Contact Form <onboarding@resend.dev>",
            to: ownerEmail,
            subject: `New Contact Form Submission: ${body.purpose}`,
            html: `
              <h2>New Contact Form Submission</h2>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Mobile:</strong> ${body.mobile}</p>
              <p><strong>Purpose:</strong> ${body.purpose}</p>
              <p><strong>Message:</strong> ${body.message || 'No message provided'}</p>
              <p><strong>Submitted at:</strong> ${new Date(createdAt).toLocaleString()}</p>
              <hr>
              <p><em>This message was sent from your portfolio contact form.</em></p>
            `
          })
        });

        if (emailResponse.ok) {
          emailSent = true;
          // Update the record to mark as notified
          contactRecord.notified = true;
          await store.setJSON(contactId, contactRecord);
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Contact form submitted successfully",
      emailSent
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Failed to process your request. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const config: Config = {
  path: "/api/contact"
};
