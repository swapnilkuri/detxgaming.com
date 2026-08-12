// assets/admin.js - Dark & Gold Castle Admin Controller

const ADMIN_EMAIL = 'swapnil7kuri@gmail.com';
let currentTab = "dashboard";

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

async function guardAdminAccess() {
  const sb = safeGetSupabase();
  if (!sb) return true;

  try {
    const { data, error } = await sb.auth.getSession();
    const session = data?.session;

    if (error || !session || session.user.email !== ADMIN_EMAIL) {
      window.location.href = '../login.html';
      return false;
    }
  } catch (err) {
    console.warn("Auth check warning:", err);
  }
  return true;
}

window.handleAdminLogout = async function() {
  const sb = safeGetSupabase();
  if (sb) {
    try { await sb.auth.signOut(); } catch (e) {}
  }
  window.location.href = '../login.html';
};

window.toggleCourseForm = function() {
  const form = document.getElementById('course-form');
  if (form) {
    form.classList.toggle('hidden');
    // Clear edit state
    delete form.dataset.editId;
    form.querySelector('button[type="submit"]').textContent = "Save Course";
    form.reset();
  }
};

window.switchTab = function(tabName) {
  currentTab = tabName;
  
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("text-yellow-400", "bg-zinc-900", "border-l-2", "border-yellow-400", "font-semibold");
    btn.classList.add("text-gray-400");
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  const activeBtn = document.getElementById(`btn-${tabName}`);

  if (activeTab) activeTab.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.classList.add("text-yellow-400", "bg-zinc-900", "border-l-2", "border-yellow-400", "font-semibold");
    activeBtn.classList.remove("text-gray-400");
  }

  loadTabData(tabName);
};

// 1-Click Sync Local Courses from assets/data.js into Supabase
window.syncLocalCoursesToDatabase = async function() {
  const sb = safeGetSupabase();
  if (!sb) {
    alert("Supabase client is not connected.");
    return;
  }

  if (!window.DETX?.courses) {
    alert("No local courses found in assets/data.js");
    return;
  }

  const coursePayloads = window.DETX.courses.map(c => ({
    title: c.title,
    slug: c.id,
    price: c.discountPrice || c.originalPrice,
    original_price: c.originalPrice,
    thumbnail_url: c.image,
    description: c.description,
    level: c.level || "Beginner",
    duration: c.duration || "1 Hour",
    is_published: true,
    is_featured: true
  }));

  const { error } = await sb.from("courses").upsert(coursePayloads, { onConflict: "slug" });

  if (error) {
    alert("Failed to sync courses: " + error.message);
  } else {
    alert("✅ Successfully synced 12 local courses to Supabase Database!");
    loadTabData(currentTab);
  }
};

async function loadTabData(tab) {
  const sb = safeGetSupabase();
  if (!sb) return;

  try {
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
        loadCategoriesDropdown(sb);
        loadCoursesAdmin(sb);
        break;
      case "categories":
        loadCategoriesList(sb);
        break;
      case "messages":
        loadMessages(sb);
        break;
    }
  } catch (err) {
    console.error(`Error loading tab [${tab}]:`, err);
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
    document.getElementById("metric-revenue").textContent = "৳" + totalRevenue.toLocaleString();
  }
  if (document.getElementById("metric-orders")) {
    document.getElementById("metric-orders").textContent = enrollments?.length || 0;
  }
  if (document.getElementById("metric-customers")) {
    document.getElementById("metric-customers").textContent = customers?.length || 0;
  }
}

// 2. Orders & Enrollments Queue
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
      <td class="p-3">৳${Number(item.price_discount || 0).toLocaleString()}</td>
    </tr>
  `).join('');
}

// 3. Customer Directory
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

window.toggleCouponStatus = async function(id, newStatus) {
  const sb = safeGetSupabase();
  if (!sb) return;
  await sb.from("coupons").update({ is_active: newStatus }).eq("id", id);
  loadCouponsList(sb);
};

document.getElementById("coupon-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const sb = safeGetSupabase();
  if (!sb) return;

  const code = document.getElementById("coupon-code").value.trim().toUpperCase();
  const discount_type = document.getElementById("coupon-type").value;
  const discount_value = parseFloat(document.getElementById("coupon-value").value);
  const min_spend = parseFloat(document.getElementById("coupon-min").value) || 0;

  const { error } = await sb.from("coupons").insert([{ code, discount_type, discount_value, min_spend, is_active: true }]);

  if (error) {
    alert("Error creating coupon: " + error.message);
  } else {
    alert("Coupon created!");
    document.getElementById("coupon-form").reset();
    document.getElementById("coupon-form").classList.add("hidden");
    loadCouponsList(sb);
  }
});

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

window.approveReview = async function(id, status) {
  const sb = safeGetSupabase();
  if (!sb) return;
  await sb.from("reviews").update({ is_approved: status }).eq("id", id);
  loadReviewsManager(sb);
};

// 6. Categories Manager
async function loadCategoriesList(sb) {
  const container = document.getElementById("categories-list");
  if (!container) return;

  const { data: categories } = await sb.from("categories").select("*");

  if (!categories || !categories.length) {
    container.innerHTML = `<p class="text-gray-500 col-span-3">No categories created yet.</p>`;
    return;
  }

  container.innerHTML = categories.map(cat => `
    <div class="bg-black/50 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
      <div>
        <h4 class="font-bold text-white">${cat.name}</h4>
        <p class="text-xs text-yellow-500 font-mono">slug: ${cat.slug}</p>
      </div>
      <button onclick="deleteCategory('${cat.id}')" class="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded">Delete</button>
    </div>
  `).join("");
}

window.deleteCategory = async function(id) {
  const sb = safeGetSupabase();
  if (!sb) return;
  if (confirm("Delete this category?")) {
    await sb.from("categories").delete().eq("id", id);
    loadCategoriesList(sb);
  }
};

document.getElementById("category-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const sb = safeGetSupabase();
  if (!sb) return;

  const name = document.getElementById("category-name").value.trim();
  const slug = document.getElementById("category-slug").value.trim();

  const { error } = await sb.from("categories").insert([{ name, slug }]);

  if (error) {
    alert("Error adding category: " + error.message);
  } else {
    alert("Category added!");
    document.getElementById("category-form").reset();
    document.getElementById("category-form").classList.add("hidden");
    loadCategoriesList(sb);
    loadCategoriesDropdown(sb);
  }
});

async function loadCategoriesDropdown(sb) {
  const select = document.getElementById("course-category");
  if (!select) return;
  const { data: categories } = await sb.from("categories").select("*");
  if (!categories) return;

  select.innerHTML = `<option value="">Select Category</option>` + categories.map(cat => `
    <option value="${cat.id}">${cat.name}</option>
  `).join("");
}

// 7. Manage Courses & Live Editing
async function loadCoursesAdmin(sb) {
  const container = document.getElementById('courses-list');
  if (!container) return;

  const { data, error } = await sb.from('courses').select('*, categories(name)').order('created_at', { ascending: false });

  if (error || !data || !data.length) {
    container.innerHTML = `<p class="text-gray-500 col-span-2">No courses found in database. Click "Import Local Courses" above.</p>`;
    return;
  }

  container.innerHTML = data.map(course => `
    <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
      <div>
        <h3 class="font-bold text-white">${course.title}</h3>
        <p class="text-xs text-yellow-400 font-mono">৳${course.price} | Slug: ${course.slug} ${course.categories?.name ? `| Category: <b>${course.categories.name}</b>` : ''}</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editCourse('${course.id}')" class="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded transition">
          Edit
        </button>
        <button onclick="deleteCourse('${course.id}')" class="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs px-3 py-1.5 rounded transition">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

window.editCourse = async function(id) {
  const sb = safeGetSupabase();
  if (!sb) return;

  const { data: course, error } = await sb.from('courses').select('*').eq('id', id).single();
  if (error || !course) return alert("Course not found");

  document.getElementById('course-title').value = course.title;
  document.getElementById('course-slug').value = course.slug;
  document.getElementById('course-price').value = course.price;
  document.getElementById('course-thumb').value = course.thumbnail_url || '';
  document.getElementById('course-desc').value = course.description || '';
  if (document.getElementById('course-category')) {
    document.getElementById('course-category').value = course.category_id || '';
  }

  const form = document.getElementById('course-form');
  form.dataset.editId = course.id;
  form.querySelector('button[type="submit"]').textContent = "Update Course";
  form.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteCourse = async function(id) {
  const sb = safeGetSupabase();
  if (!sb) return;

  if (confirm('Are you sure you want to delete this course?')) {
    const { error } = await sb.from('courses').delete().eq('id', id);
    if (!error) loadCoursesAdmin(sb);
  }
};

// Course Form Submit Handler (Handles both Create and Edit with auto-database sync)
document.getElementById('course-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = safeGetSupabase();
  if (!sb) return;

  const form = e.target;
  const editId = form.dataset.editId;

  const title = document.getElementById('course-title').value;
  const slug = document.getElementById('course-slug').value;
  const price = parseFloat(document.getElementById('course-price').value);
  const thumbnail_url = document.getElementById('course-thumb').value;
  const description = document.getElementById('course-desc').value;
  const category_id = document.getElementById('course-category')?.value || null;

  let error;
  if (editId) {
    // Update existing course in database
    const res = await sb.from('courses').update({
      title, slug, price, original_price: price, thumbnail_url, description, category_id
    }).eq('id', editId);
    error = res.error;
  } else {
    // Insert new course into database
    const res = await sb.from('courses').insert([{
      title, slug, price, original_price: price, thumbnail_url, description, category_id, is_published: true
    }]);
    error = res.error;
  }

  if (error) {
    alert('Error saving course: ' + error.message);
  } else {
    alert(editId ? 'Course updated successfully!' : 'Course added successfully!');
    form.reset();
    delete form.dataset.editId;
    form.querySelector('button[type="submit"]').textContent = "Save Course";
    toggleCourseForm();
    loadCoursesAdmin(sb);
  }
});

// 8. Contact Messages
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

document.addEventListener('DOMContentLoaded', async () => {
  await guardAdminAccess();
  switchTab("dashboard");
});
