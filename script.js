
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
