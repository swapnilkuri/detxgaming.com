// assets/admin.js
const ADMIN_EMAIL = 'swapnil7kuri@gmail.com';

// Gate the whole page: only the admin account may view/use this dashboard.
// Redirects everyone else to the login page before any data loads.
async function guardAdminAccess() {
  const sb = getSupabase();
  const { data, error } = await sb.auth.getSession();
  const session = data?.session;

  if (error || !session || session.user.email !== ADMIN_EMAIL) {
    window.location.href = '../login.html';
    return false;
  }
  return true;
}

// Tab Switching Functionality
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('text-yellow-400', 'border-b-2', 'border-yellow-400');
    btn.classList.add('text-gray-400');
  });

  document.getElementById(`tab-${tabName}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`btn-${tabName}`);
  activeBtn.classList.add('text-yellow-400', 'border-b-2', 'border-yellow-400');
  activeBtn.classList.remove('text-gray-400');
}

function toggleCourseForm() {
  document.getElementById('course-form').classList.toggle('hidden');
}

// Fetch Enrollments from Supabase
async function loadEnrollments() {
  const sb = getSupabase();
  const { data, error } = await sb.from('enrollments').select('*').order('created_at', { ascending: false });
  const container = document.getElementById('enrollments-list');

  if (error || !data.length) {
    container.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">No enrollments found.</td></tr>`;
    return;
  }

  container.innerHTML = data.map(item => `
    <tr class="border-b border-zinc-800 hover:bg-zinc-800/50">
      <td class="p-3 font-semibold text-white">${item.full_name || 'N/A'}</td>
      <td class="p-3">${item.email || 'N/A'}</td>
      <td class="p-3">${item.phone || 'N/A'}</td>
      <td class="p-3 text-yellow-400">${item.course_title || item.course_id}</td>
      <td class="p-3">${item.payment_method || 'N/A'}</td>
    </tr>
  `).join('');
}

// Fetch Messages from Supabase
async function loadMessages() {
  const sb = getSupabase();
  const { data, error } = await sb.from('messages').select('*').order('created_at', { ascending: false });
  const container = document.getElementById('messages-list');

  if (error || !data.length) {
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

// Load Existing Courses into Admin
async function loadCoursesAdmin() {
  const sb = getSupabase();
  const container = document.getElementById('courses-list');
  const { data, error } = await sb.from('courses').select('*').order('created_at', { ascending: false });

  if (error || !data.length) {
    container.innerHTML = `<p class="text-gray-500 col-span-2">No courses created yet.</p>`;
    return;
  }

  container.innerHTML = data.map(course => `
    <div class="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
      <div>
        <h3 class="font-bold text-white">${course.title}</h3>
        <p class="text-xs text-yellow-400 font-mono">$${course.price} | Slug: ${course.slug}</p>
      </div>
      <button onclick="deleteCourse('${course.id}')" class="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs px-3 py-1.5 rounded transition">
        Delete
      </button>
    </div>
  `).join('');
}

// Add New Course Handler
document.getElementById('course-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const sb = getSupabase();

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
    loadCoursesAdmin();
  }
});

// Delete Course Handler
async function deleteCourse(id) {
  const sb = getSupabase();
  if (confirm('Are you sure you want to delete this course?')) {
    const { error } = await sb.from('courses').delete().eq('id', id);
    if (!error) loadCoursesAdmin();
  }
}

// Initialize Admin Dashboard (only after confirming the user is the admin)
document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await guardAdminAccess();
  if (!allowed) return;

  loadEnrollments();
  loadMessages();
  loadCoursesAdmin();
});
