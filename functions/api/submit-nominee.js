
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");

  if (origin !== "https://wasanii-dinner-night-site.pages.dev") {
    return Response.json({ error: "Invalid website origin." }, { status: 403 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const {
    category_id,
    nominee_name,
    description,
    submitted_by,
    contact_email,
    turnstile_token
  } = body;

  if (
    !Number.isInteger(Number(category_id)) ||
    !nominee_name?.trim() ||
    !submitted_by?.trim() ||
    !contact_email?.trim() ||
    !turnstile_token
  ) {
    return Response.json({ error: "Please complete all required fields and verification." }, { status: 400 });
  }

  if (
    nominee_name.length > 120 ||
    submitted_by.length > 100 ||
    contact_email.length > 254 ||
    (description && description.length > 1000)
  ) {
    return Response.json({ error: "One or more fields are too long." }, { status: 400 });
  }

  // Verify the visitor with Cloudflare Turnstile
  const verification = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: turnstile_token
      })
    }
  );

  const result = await verification.json();

  if (!result.success) {
    return Response.json({ error: "Verification failed. Please try again." }, { status: 403 });
  }

  // Insert the verified submission into Supabase
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/nominee_submissions`,
    {
      method: "POST",
      headers: {
        "apikey": env.SUPABASE_SECRET_KEY,
       
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        category_id: Number(category_id),
        nominee_name: nominee_name.trim(),
        description: description?.trim() || null,
        submitted_by: submitted_by.trim(),
        contact_email: contact_email.trim(),
        status: "pending"
      })
    }
  );

  if (!response.ok) {
    return Response.json({ error: "Could not save the nominee. Please try again." }, { status: 500 });
  }

  return Response.json({ success: true, message: "Nominee submitted for review." });
}
