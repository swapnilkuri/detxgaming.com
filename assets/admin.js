// admin/admin.js - Complete Dark & Gold Castle Admin Controller

const ADMIN_EMAIL = 'swapnil7kuri@gmail.com';
let currentTab = "dashboard";

// Safe helper to obtain Supabase client instance
function safeGetSupabase() {
  if (typeof getSupabase === "function") {
    try {
      return getSupabase();
    } catch (e) {
      console.warn("Supabase client error:", e);
    }
  }
  return null;
}

// Security Guard: Restrict dashboard access exclusively to ADMIN_EMAIL
async function guardAdminAccess() {
  const sb = safeGetSupabase();
  if (!sb) return false;

  const { data, error } = await sb.auth.getSession();
  const session = data?.session;

  if (error || !session || session.user.email !== ADMIN_EMAIL) {
    window.location.href = '../login.html';
    return false;
  }
  return true;
}

// Tab Switching & UI Navigation
function switchTab(tabName) {
  currentTab = tabName;
  
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("text-yellow-400", "border-b-2", "border-yellow-400");
    btn.classList.add("text-gray-400");
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  const activeBtn = document.getElementById(`btn-${tabName}`);

  if (activeTab) activeTab.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.classList.add("text-yellow-400", "border-b-2", "border-yellow-400");
    activeBtn.classList.remove("text-gray-400");
  }

  loadTabData(tabName);
}

// Router to load tab-specific data dynamically
async function loadTabData(tab) {
  const sb = safeGetSupabase();
  if (!sb) return;

  switch (tab) {
    case "dashboard":
      loadDashboardMetrics(sb);
      break;
    case "enrollments":
    case "orders":
      loadEnrollments(sb);
      break;
    case "customers":
      loadCustomerDirectory(sb);
      break;
    case "coupons":
      loadCouponsList(sb);
      break;
    case "reviews":
      loadReviewsManager(sb);
      break;
    case "courses":
      loadCoursesAdmin(sb);
      break;
    case "messages":
      loadMessages(sb);
      break;
  }
}

// 1. Dashboard Metrics
async function loadDashboardMetrics(sb) {
  const { data: enrollments } = await sb.from("enrollments").select("*");
  const { data: customers } = await sb.from("profiles").select("*");

  const totalRevenue = enrollments?.reduce((acc, o) => {
    const val = Number(o.price_discount || o.price_original || 0);
    return acc + (o.status === "completed" || o.status === "approved" || o.status === "paid" ? val : 0);
  }, 0) || 0;

  if (document.getElementById("metric-revenue")) {
    document.getElementById("metric-revenue").textContent = "BDT " + totalRevenue.toLocaleString();
  }
  if (document.getElementById("metric-orders")) {
    document.getElementById("metric-orders").textContent = enrollments?.length || 0;
  }
  if (document.getElementById("metric-customers")) {
    document.getElementById("metric-customers").textContent = customers?.length || 0;
  }
}

// 2. Enrollments / Orders Queue
async function loadEnrollments(sb) {
  const container = document.getElementById('enrollments-list');
  if (!container) return;

  const { data, error } = await sb.from('enrollments').select('*').order('created_at', { ascending: false });

  if (error || !data || !data.length) {
    container.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No enrollments found.</td></tr>`;
    return;
  }

  container.innerHTML = data.map(item => `
    <tr class="border-b border-zinc-800 hover:bg-zinc-800/50">
      <td class="p-3 font-semibold text-white">${item.full_name || 'N/A'}</td>
      <td class="p-3">${item.email || 'N/A'}</td>
      <td class="p-3">${item.phone || 'N/A'}</td>
      <td class="p-3 text-yellow-400">${item.course_title || item.course_id}</td>
      <td class="p-3">${item.payment_method || 'N/A'} (${item.transaction_id || 'No TxID'})</td>
    </tr>
  `).join('');
}

// 3. Customer Directory & Direct Message / WhatsApp Action
async function loadCustomerDirectory(sb) {
  const list = document.getElementById("customers-list");
  if (!list) return;

  const { data: customers, error } = await sb.from("profiles").select("*").order("created_at", { ascending: false });

  if (error || !customers || !customers.length) {
    list.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-500">No registered customers found.</td></tr>`;
    return;
  }

  list.innerHTML = customers.map(c => `
    <tr class="border-b border-zinc-800 hover:bg-zinc-800/50">
      <td class="p-3">
        <div class="font-bold text-white">${c.full_name || "Anonymous"}</div>
        <div class="text-xs text-gray-400">${c.email}</div>
      </td>
      <td class="p-3">${c.phone || "N/A"}</td>
      <td class="p-3">${c.orders_count || 0}</td>
      <td class="p-3 text-yellow-400 font-semibold">৳${(c.total_spent || 0).toLocaleString()}</td>
      <td class="p-3">${c.city || "N/A"}</td>
      <td class="p-3">
        ${c.phone ? `
          <a href="https://wa.me/${c.phone.replace(/[^0-9]/g, '')}" target="_blank" class="bg-green-600 hover:bg-green-500 text-white text-xs px-2.5 py-1 rounded inline-block">
            WhatsApp / SMS
          </a>
        ` : `<span class="text-xs text-gray-500">No Phone</span>`}
      </td>
    </tr>
  `).join("");
}

// 4. Coupons Controller
async function loadCouponsList(sb) {
  const list = document.getElementById("coupons-list");
  if (!list) return;

  const { data: coupons } = await sb.from("coupons").select("*").order("created_at", { ascending: false });

  if (!coupons || !coupons.length) {
    list.innerHTML = `<p class="text-gray-500 text-center py-4">No coupons created yet.</p>`;
    return;
  }

  list.innerHTML = coupons.map(cp => `
    <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center mb-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-yellow-400 text-lg">${cp.code}</span>
          <span class="text-xs px-2 py-0.5 rounded ${cp.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">
            ${cp.is_active ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-1">
          ${cp.discount_type === 'Percent' ? cp.discount_value + '%' : '৳' + cp.discount_value} OFF • Min Spend: ৳${cp.min_spend}
        </p>
      </div>
      <button onclick="toggleCouponStatus('${cp.id}', ${!cp.is_active})" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded">
        ${cp.is_active ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  `).join("");
}

async function toggleCouponStatus(id, newStatus) {
  const sb = safeGetSupabase();
  if (!sb) return;
  await sb.from("coupons").update({ is_active: newStatus }).eq("id", id);
  loadCouponsList(sb);
}

// 5. Customer Reviews Moderation
async function loadReviewsManager(sb) {
  const list = document.getElementById("reviews-list");
  if (!list) return;

  const { data: reviews } = await sb.from("reviews").select("*").order("created_at", { ascending: false });

  if (!reviews || !reviews.length) {
    list.innerHTML = `<p class="text-gray-500 text-center py-4">No reviews submitted.</p>`;
    return;
  }

  list.innerHTML = reviews.map(r => `
    <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-xl mb-4">
      <div class="flex justify-between items-start mb-2">
        <div>
          <h4 class="font-bold text-white">${r.user_name} <span class="text-xs text-yellow-500 font-normal">on ${r.course_title || "Course"}</span></h4>
          <div class="text-yellow-400 text-xs mt-0.5">${"★".repeat(r.rating || 5)}</div>
        </div>
        <span class="text-xs px-2 py-1 rounded ${r.is_approved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}">
          ${r.is_approved ? 'APPROVED' : 'PENDING'}
        </span>
      </div>
      <p class="text-sm text-gray-300 mb-3">"${r.comment}"</p>
      <div class="flex gap-2 items-center pt-2 border-t border-zinc-800">
        <button onclick="approveReview('${r.id}', ${!r.is_approved})" class="bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded">
          ${r.is_approved ? 'Unapprove' : 'Approve Review'}
        </button>
      </div>
    </div>
  `).join("");
}

async function approveReview(id, status) {
  const sb = safeGetSupabase();
  if (!sb) return;
  await sb.from("reviews").update({ is_approved: status }).eq("id", id);
  loadReviewsManager(sb);
}

// 6. Manage Courses
function toggleCourseForm() {
  const form = document.getElementById('course-form');
  if (form) form.classList.toggle('hidden');
}

async function loadCoursesAdmin(sb) {
  const container = document.getElementById('courses-list');
  if (!container) return;

  const { data, error } = await sb.from('courses').select('*').order('created_at', { ascending: false });

  if (error || !data || !data.length) {
    container.innerHTML = `<p class="text-gray-500 col-span-2">No courses created yet.</p>`;
    return;
  }

  container.innerHTML = data.map(course => `
    <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
      <div>
        <h3 class="font-bold text-white">${course.title}</h3>
        <p class="text-xs text-yellow-400 font-mono">৳${course.price} | Slug: ${course.slug}</p>
      </div>
      <button onclick="deleteCourse('${course.id}')" class="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs px-3 py-1.5 rounded transition">
        Delete
      </button>
    </div>
  `).join('');
}

async function deleteCourse(id) {
  const sb = safeGetSupabase();
  if (!sb) return;

  if (confirm('Are you sure you want to delete this course?')) {
    const { error } = await sb.from('courses').delete().eq('id', id);
    if (!error) loadCoursesAdmin(sb);
  }
}

// 7. Contact Messages
async function loadMessages(sb) {
  const container = document.getElementById('messages-list');
  if (!container) return;

  const { data, error } = await sb.from('messages').select('*').order('created_at', { ascending: false });

  if (error || !data || !data.length) {
    container.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-500">No messages found.</td></tr>`;
    return;
  }

  container.innerHTML = data.map(item => `
    <tr class="border-b border-zinc-800 hover:bg-zinc-800/50">
      <td class="p-3 font-semibold text-white">${item.full_name || 'N/A'}</td>
      <td class="p-3">${item.email || 'N/A'}</td>
      <td class="p-3 text-yellow-400">${item.subject || 'N/A'}</td>
      <td class="p-3">${item.message || 'N/A'}</td>
    </tr>
  `).join('');
}

// Event Listeners
document.getElementById('course-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = safeGetSupabase();
  if (!sb) return;

  const title = document.getElementById('course-title').value;
  const slug = document.getElementById('course-slug').value;
  const price = parseFloat(document.getElementById('course-price').value);
  const thumbnail_url = document.getElementById('course-thumb').value;
  const description = document.getElementById('course-desc').value;

  const { error } = await sb.from('courses').insert([
    { title, slug, price, thumbnail_url, description, is_published: true }
  ]);

  if (error) {
    alert('Error saving course: ' + error.message);
  } else {
    alert('Course added successfully!');
    document.getElementById('course-form').reset();
    toggleCourseForm();
    loadCoursesAdmin(sb);
  }
});

// Main Dashboard Initialization
document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await guardAdminAccess();
  if (!allowed) return;

  switchTab("dashboard");
});
