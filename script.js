
// WASANII DINNER NIGHT 2026
// Supabase database connection

const SUPABASE_URL = "https://kfydopclkujgwqfrpvht.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-xuexKxxgMeAR3NlmTn9fA_9FpBAVB_";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const root = document.getElementById("categories");

async function loadCategories() {
  root.innerHTML = "<p>Loading award categories...</p>";

  const { data, error } = await db
    .from("categories")
    .select("name, vote_price_kes")
    .eq("is_active", true)
    .order("id");

  if (error) {
    console.error("Could not load categories:", error);
    root.innerHTML =
      "<p>Unable to load categories. Please try again later.</p>";
    return;
  }

  root.innerHTML = data.map((category, index) => `
    <article class="category">
      <span class="number">
        ${String(index + 1).padStart(2, "0")} / CATEGORY
      </span>
      <h3>${escapeHTML(category.name)}</h3>
      <span class="price">
        KSh ${Number(category.vote_price_kes).toFixed(2)} per vote
      </span>
    </article>
  `).join("");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

loadCategories();

// WASANII DINNER NIGHT - Nominee Submission

async function loadNomineeCategories() {
  const categorySelect = document.getElementById("nominee-category");

  if (!categorySelect) return;

  const { data, error } = await db
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("id");

  if (error) {
    console.error("Could not load nominee categories:", error);
    return;
  }

  categorySelect.innerHTML =
    '<option value="">Choose a category</option>';

  data.forEach(category => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

loadNomineeCategories();

const nomineeForm = document.getElementById("nominee-form");
const nomineeMessage = document.getElementById("nominee-message");

if (nomineeForm) {
  nomineeForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nominee = {
      category_id: Number(document.getElementById("nominee-category").value),
      nominee_name: document.getElementById("nominee-name").value.trim(),
      description: document.getElementById("nominee-description").value.trim() || null,
      submitted_by: document.getElementById("submitted-by").value.trim(),
      contact_email: document.getElementById("contact-email").value.trim(),
      status: "pending"
    };

    if (!nominee.category_id || !nominee.nominee_name ||
        !nominee.submitted_by || !nominee.contact_email) {
      nomineeMessage.textContent = "Please complete all required fields.";
      return;
    }

    const submitButton = nomineeForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    nomineeMessage.textContent = "Submitting nominee...";

    const turnstileToken = document.querySelector(
  '[name="cf-turnstile-response"]'
)?.value;

if (!turnstileToken) {
  submitButton.disabled = false;
  nomineeMessage.textContent =
    "Please complete the security verification.";
  return;
}

let response;
let result;

try {
  response = await fetch("/api/submit-nominee", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...nominee,
      turnstile_token: turnstileToken
    })
  });

  result = await response.json();
} catch (error) {
  console.error("Submission request failed:", error);
  nomineeMessage.textContent =
    "Connection problem. Please try again.";
  submitButton.disabled = false;
  return;
}

submitButton.disabled = false;

if (!response.ok) {
  console.error("Submission error:", result);
  nomineeMessage.textContent =
    result.error || "Submission failed. Please try again.";

  if (window.turnstile) {
    window.turnstile.reset();
  }
  return;
}
    

    nomineeMessage.textContent =
      "Nominee submitted successfully! Awaiting admin review.";

    nomineeForm.reset();
  });
}
