// assets/app.js

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function money(n) {
  return "৳" + Number(n || 0).toLocaleString("en-US");
}

function setYear() {
  const y = qs("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function safeGetSupabase() {
  if (typeof getSupabase === "function") {
    try {
      return getSupabase();
    } catch (e) {
      console.warn("Supabase client not ready:", e);
    }
  }
  return null;
}

function renderSocials() {
  const wrap = qs("[data-socials]");
  if (!wrap || !window.DETX?.socials) return;
  wrap.innerHTML = DETX.socials
    .map(s => `<a class="chip" href="${s.href}" target="_blank" rel="noopener">${s.label}</a>`)
    .join("");
}

function navActive() {
  const path = location.pathname.split("/").pop() || "index.html";
  qsa("[data-nav]").forEach(a => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

function campaignRemaining() {
  if (!window.DETX?.campaign?.endsAt) return { diff: 0, d: 0, h: 0, m: 0, s: 0 };
  const ends = new Date(DETX.campaign.endsAt).getTime();
  const now = Date.now();
  const diff = Math.max(0, ends - now);

  const d = Math.floor(diff / (24 * 3600 * 1000));
  const h = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  const m = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
  const s = Math.floor((diff % (60 * 1000)) / 1000);

  return { diff, d, h, m, s };
}

function renderUrgency() {
  const host = qs("[data-urgency]");
  if (!host || !window.DETX?.campaign) return;

  host.innerHTML = `
    <div class="urgencyBar">
      <div class="urgencyLeft">
        <span class="saleBadge">${DETX.campaign.label}</span>
        <span class="muted">${DETX.campaign.note}</span>
      </div>
      <div class="timerPill" id="saleTimer">Loading...</div>
    </div>
  `;

  const el = qs("#saleTimer");
  const tick = () => {
    const r = campaignRemaining();
    if (r.diff <= 0) {
      el.textContent = "Sale ended";
      return;
    }
    el.textContent = `${String(r.d).padStart(2,"0")}d : ${String(r.h).padStart(2,"0")}h : ${String(r.m).padStart(2,"0")}m : ${String(r.s).padStart(2,"0")}s`;
  };
  setInterval(tick, 1000);
  tick();
}

function getCourseById(id) {
  return window.DETX?.courses?.find(c => c.id === id);
}

function encodeImagePath(path) {
  if (!path) return "";
  let cleanPath = path.trim();
  if (!cleanPath.startsWith("http") && !cleanPath.startsWith("/")) {
    cleanPath = "/" + cleanPath;
  }
  return encodeURI(cleanPath).replace(/\+/g, "%2B");
}

// Local Cart State
let CART = JSON.parse(localStorage.getItem("DETX_CART") || "[]");

function saveCart() {
  localStorage.setItem("DETX_CART", JSON.stringify(CART));
  updateCartUI();
}

function toggleCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  if (drawer) {
    drawer.classList.toggle("hidden");
  }
}

function addToCart(courseId) {
  const course = getCourseById(courseId);
  if (!course) return;

  const exists = CART.find(item => item.id === courseId);
  if (!exists) {
    CART.push({
      id: course.id,
      title: course.title,
      price: course.discountPrice || course.originalPrice,
      image: course.image
    });
    saveCart();
  }
  toggleCartDrawer();
}

function removeFromCart(courseId) {
  CART = CART.filter(item => item.id !== courseId);
  saveCart();
}

function updateCartUI() {
  const countEl = document.getElementById("cartCount");
  const itemsContainer = document.getElementById("cartItemsList");
  const subtotalEl = document.getElementById("cartSubtotal");

  if (countEl) countEl.textContent = CART.length;

  if (itemsContainer) {
    if (CART.length === 0) {
      itemsContainer.innerHTML = `<p class="text-gray-500 text-center py-8 text-sm">Your cart is empty.</p>`;
    } else {
      itemsContainer.innerHTML = CART.map(item => `
        <div class="flex items-center justify-between bg-black/40 border border-zinc-800 p-3 rounded-lg gap-3">
          <img src="${encodeImagePath(item.image)}" alt="${item.title}" class="w-12 h-12 object-cover rounded" />
          <div class="flex-1 min-w-0">
            <h5 class="text-xs font-bold text-white truncate">${item.title}</h5>
            <span class="text-yellow-400 font-semibold text-xs">${money(item.price)}</span>
          </div>
          <button onclick="removeFromCart('${item.id}')" class="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded">
            Remove
          </button>
        </div>
      `).join("");
    }
  }

  const total = CART.reduce((acc, item) => acc + Number(item.price), 0);
  if (subtotalEl) subtotalEl.textContent = money(total);
}

function proceedToCheckout() {
  if (CART.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  const firstItem = CART[0];
  window.location.href = `course.html?id=${encodeURIComponent(firstItem.id)}`;
}

function courseCard(c) {
  const badgeText = c.badge || "50% OFF";
  return `
  <article class="card courseCard">
    <div>
      <div class="courseThumb">
        ${c.image ? `<img src="${encodeImagePath(c.image)}" alt="${c.title}" loading="lazy" onerror="this.closest('.courseThumb').classList.add('noImg'); this.style.display='none';"/>` : ""}
      </div>

      <div class="badgeRow">
        <span class="badge">${c.track || "Course"}</span>
        <span class="muted" style="font-size:12px;">${c.level || "Beginner"} • ${c.duration || ""}</span>
      </div>

      <div class="tag">${badgeText}</div>

      <h3 class="cardTitle">${c.title}</h3>
      <p class="muted" style="margin:0;">${c.outcome || ""}</p>
    </div>

    <div class="priceRow flex items-center justify-between mt-4">
      <div class="price">
        <span class="old">${money(c.originalPrice)}</span>
        <span class="new">${money(c.discountPrice)}</span>
      </div>
      <div class="flex gap-2">
        <button onclick="addToCart('${c.id}')" class="btn bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-2 rounded-lg">
          + Cart
        </button>
        <a class="btn bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs px-3 py-2 rounded-lg" href="course.html?id=${encodeURIComponent(c.id)}">
          View
        </a>
      </div>
    </div>
  </article>`;
}

function renderFeaturedCourses() {
  const wrap = qs("[data-featured-courses]");
  if (!wrap || !window.DETX?.courses) return;
  wrap.innerHTML = DETX.courses.slice(0, 6).map(courseCard).join("");
}

function renderCoursesPage() {
  const wrap = qs("[data-courses]");
  if (!wrap || !window.DETX?.courses) return;
  wrap.innerHTML = `<div class="grid">${DETX.courses.map(courseCard).join("")}</div>`;
}

function renderCourseDetails() {
  const root = qs("[data-course-detail]");
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const c = getCourseById(id);

  if (!c) {
    root.innerHTML = `<div class="empty">Course not found.</div>`;
    return;
  }

  if (qs("[data-course-title]")) qs("[data-course-title]").textContent = c.title;
  if (qs("[data-course-track]")) qs("[data-course-track]").textContent = c.track;
  if (qs("[data-course-level]")) qs("[data-course-level]").textContent = c.level;
  if (qs("[data-course-duration]")) qs("[data-course-duration]").textContent = c.duration;
  if (qs("[data-course-desc]")) qs("[data-course-desc]").textContent = c.description;
  if (qs("[data-course-outcome]")) qs("[data-course-outcome]").textContent = c.outcome;
  if (qs("[data-course-old]")) qs("[data-course-old]").textContent = money(c.originalPrice);
  if (qs("[data-course-new]")) qs("[data-course-new]").textContent = money(c.discountPrice);

  const thumbWrap = qs("[data-course-thumb]");
  if (thumbWrap) {
    if (c.image) {
      thumbWrap.innerHTML = `<img src="${encodeImagePath(c.image)}" alt="${c.title}" onerror="this.closest('[data-course-thumb]').classList.add('noImg'); this.style.display='none';"/>`;
    } else {
      thumbWrap.classList.add("noImg");
    }
  }

  const inc = qs("[data-course-includes]");
  if (inc && c.includes) inc.innerHTML = c.includes.map(x => `<li>${x}</li>`).join("");

  const del = qs("[data-course-delivery]");
  if (del) del.textContent = c.delivery || "";

  const sup = qs("[data-course-support]");
  if (sup) sup.textContent = c.support || "";

  const instantBtn = qs("#instantBuyBtn");
  if (instantBtn) {
    if (c.checkoutUrl && !c.checkoutUrl.includes("PAYHIP")) {
      instantBtn.href = c.checkoutUrl;
      instantBtn.style.display = "inline-flex";
    } else {
      instantBtn.href = "#";
      instantBtn.style.display = "inline-flex";
      instantBtn.textContent = "Instant Buy (Add Checkout Link)";
    }
  }

  const enrollBtn = qs("#enrollBtn");
  if (enrollBtn) enrollBtn.addEventListener("click", () => openEnrollModal(c));
}

function openEnrollModal(course) {
  const modal = qs("#enrollModal");
  if (!modal) return;
  modal.classList.add("open");

  if (qs("#modalCourseTitle")) qs("#modalCourseTitle").textContent = course.title;
  if (qs("#modalPriceOld")) qs("#modalPriceOld").textContent = money(course.originalPrice);
  if (qs("#modalPriceNew")) qs("#modalPriceNew").textContent = money(course.discountPrice);

  const form = qs("#enrollForm");
  if (form) {
    form.dataset.courseId = course.id;
    form.dataset.courseTitle = course.title;
    form.dataset.priceOriginal = String(course.originalPrice);
    form.dataset.priceDiscount = String(course.discountPrice);

    form.reset();
  }
  if (qs("#enrollStatus")) qs("#enrollStatus").textContent = "";
}

function closeEnrollModal() {
  const modal = qs("#enrollModal");
  if (modal) modal.classList.remove("open");
}

function wireModal() {
  const modal = qs("#enrollModal");
  if (!modal) return;

  modal.addEventListener("click", (e) => { if (e.target === modal) closeEnrollModal(); });
  const closeBtn = qs("[data-modal-close]");
  if (closeBtn) closeBtn.addEventListener("click", closeEnrollModal);

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeEnrollModal(); });
}

async function handleEnrollSubmit() {
  const form = qs("#enrollForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = qs("#enrollStatus");
    if (status) status.textContent = "Submitting...";

    try {
      const sb = safeGetSupabase();
      if (!sb) throw new Error("Supabase is not initialized.");

      const payload = {
        course_id: form.dataset.courseId,
        course_title: form.dataset.courseTitle,
        full_name: qs("#fullName").value.trim(),
        country: qs("#country").value.trim(),
        email: qs("#email").value.trim(),
        phone: qs("#phone").value.trim(),
        payment_method: qs("#paymentMethod").value,
        transaction_id: (qs("#transactionId").value.trim() || null),
        screenshot_url: null,
        price_original: parseInt(form.dataset.priceOriginal, 10),
        price_discount: parseInt(form.dataset.priceDiscount, 10),
        status: "pending"
      };

      const file = qs("#paymentScreenshot")?.files[0];
      if (file) {
        const ext = file.name.split(".").pop().toLowerCase();
        const safeName = `${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
        const path = `${payload.course_id}/${safeName}`;

        const { error: upErr } = await sb.storage
          .from("payment_screenshots")
          .upload(path, file, { upsert: false });

        if (upErr) throw upErr;

        const { data: pub } = sb.storage.from("payment_screenshots").getPublicUrl(path);
        payload.screenshot_url = pub.publicUrl;
      }

      const { error } = await sb.from("enrollments").insert(payload);
      if (error) throw error;

      if (status) status.textContent = "✅ Submitted! Redirecting...";
      setTimeout(() => { window.location.href = "success.html"; }, 500);
    } catch (err) {
      console.error(err);
      if (status) status.textContent = "❌ Failed. Check Supabase keys or try again.";
    }
  });
}

function youtubeEmbed(playlistId) {
  if (!playlistId || String(playlistId).includes("PASTE")) {
    return `<div class="empty">Add your playlist ID in <b>assets/data.js</b>.</div>`;
  }
  return `
    <div class="card">
      <iframe
        style="width:100%;height:420px;border:0;border-radius:14px;"
        src="https://www.youtube.com/embed/videoseries?list=${playlistId}"
        title="YouTube playlist"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>
    </div>
  `;
}

async function fetchPlaylistRSS(playlistId) {
  const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("RSS fetch failed");
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");
  const entries = Array.from(xml.getElementsByTagName("entry"));

  return entries.map((e) => {
    const title = e.getElementsByTagName("title")[0]?.textContent?.trim() || "Video";
    const vid = e.getElementsByTagNameNS("http://www.youtube.com/xml/schemas/2015", "videoId")[0]?.textContent?.trim();
    return { title, videoId: vid };
  }).filter(x => x.videoId);
}

function renderShelf({ title, playlistId }) {
  const shelf = document.createElement("section");
  shelf.className = "shelf";
  const playAllLink = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;

  shelf.innerHTML = `
    <div class="shelfHead">
      <h3 class="shelfTitle">${title}</h3>
      <a class="playAll" href="${playAllLink}" target="_blank" rel="noopener">▶ Play all</a>
    </div>
    <div class="rowScroll" data-row></div>
    <div class="muted" data-fallback style="display:none;margin-top:10px;"></div>
  `;
  return shelf;
}

function videoCardHTML({ title, videoId }) {
  const watch = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const thumb = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;

  return `
    <a class="videoCard" href="${watch}" target="_blank" rel="noopener">
      <div class="thumb">
        <img src="${thumb}" alt="">
        <div class="thumbBadge">Watch</div>
      </div>
      <div class="vBody">
        <div class="vTitle">${title}</div>
        <div class="vMeta"><span>Detx Gaming</span><span>•</span><span>YouTube</span></div>
      </div>
    </a>
  `;
}

async function renderWatchShelves() {
  const root = qs("[data-watch-shelves]");
  if (!root || !window.DETX?.youtube) return;

  const shelves = [
    { title: "Highlights", playlistId: DETX.youtube.highlightsPlaylistId },
    { title: "Shorts", playlistId: DETX.youtube.shortsPlaylistId },
    { title: "Live Streams", playlistId: DETX.youtube.livePlaylistId },
    { title: "Featured", playlistId: DETX.youtube.featuredPlaylistId },
  ];

  root.innerHTML = "";

  for (const s of shelves) {
    const section = renderShelf(s);
    root.appendChild(section);

    const row = section.querySelector("[data-row]");
    const fallback = section.querySelector("[data-fallback]");

    if (!s.playlistId || String(s.playlistId).includes("PASTE")) {
      fallback.style.display = "block";
      fallback.innerHTML = `Add playlist ID in <b>assets/data.js</b> for <b>${s.title}</b>.`;
      continue;
    }

    try {
      const items = await fetchPlaylistRSS(s.playlistId);
      row.innerHTML = items.slice(0, 12).map(videoCardHTML).join("");
    } catch (err) {
      fallback.style.display = "block";
      fallback.innerHTML = `Showing playlist embed instead:<div style="margin-top:10px;">${youtubeEmbed(s.playlistId)}</div>`;
    }
  }
}

function injectBrand() {
  if (!window.DETX?.brand?.name) return;
  qsa("[data-brand]").forEach(el => el.textContent = DETX.brand.name);
}

async function loadPublicCourses() {
  const container = document.getElementById('courses-grid');
  if (!container) return;

  const sb = safeGetSupabase();
  if (!sb) return;

  const { data: courses, error } = await sb
    .from('courses')
    .select('*')
    .eq('is_published', true);

  if (error || !courses || !courses.length) {
    container.innerHTML = `<p class="text-gray-400">No courses available right now.</p>`;
    return;
  }

  container.innerHTML = courses.map(course => `
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition">
      <img src="${encodeImagePath(course.thumbnail_url)}" alt="${course.title}" class="w-full h-48 object-cover" onerror="this.style.display='none';" />
      <div class="p-5">
        <h3 class="text-xl font-bold text-white mb-2">${course.title}</h3>
        <p class="text-sm text-gray-400 mb-4 line-clamp-2">${course.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-yellow-400 font-bold text-lg">৳${Number(course.price).toLocaleString()}</span>
          <a href="course.html?id=${course.slug}" class="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 transition">
            View Details
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

async function checkAuthNavState() {
  const sb = safeGetSupabase();
  if (!sb) return;

  const { data: { session } } = await sb.auth.getSession();
  
  // Find the header buttons container (where Login / Sign Up usually live)
  const authButtonsContainer = document.querySelector('header .flex.items-center.gap-2') || document.querySelector('header nav + div') || document.querySelector('header .flex.items-center');
  
  if (session && authButtonsContainer) {
    // Replace login/signup with My Account button
    authButtonsContainer.innerHTML = `
      <a href="account.html" class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2">
        👤 My Account
      </a>
    `;
  }
}

async function loadHomepageReviews() {
  const container = document.getElementById("homepage-reviews-grid");
  if (!container) return;

  const sb = safeGetSupabase();
  if (!sb) return;

  const { data: reviews, error } = await sb
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !reviews || !reviews.length) {
    container.innerHTML = `<p class="text-gray-500 col-span-3 text-center">No reviews yet.</p>`;
    return;
  }

  // Auth Routing for "My Account" Button
window.handleAccountClick = async function() {
  const sb = safeGetSupabase();
  if (!sb) {
    window.location.href = "login.html";
    return;
  }

  const { data: { session } } = await sb.auth.getSession();
  
  if (session) {
    // If logged in as admin, go to admin panel, otherwise go to student account
    if (session.user.email === 'swapnil7kuri@gmail.com') {
      window.location.href = "admin/index.html";
    } else {
      window.location.href = "account.html";
    }
  } else {
    // Not logged in
    window.location.href = "login.html";
  }
};

  container.innerHTML = reviews.map(r => `
    <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-bold text-white">${r.user_name}</h4>
        <span class="text-yellow-400 text-sm">${"★".repeat(r.rating)}</span>
      </div>
      <p class="text-xs text-yellow-500 mb-2">${r.course_title || "Course Student"}</p>
      <p class="text-sm text-gray-300 mb-3">"${r.comment}"</p>
      ${r.reply_text ? `
        <div class="bg-black/50 border-l-2 border-yellow-500 p-2.5 rounded text-xs text-gray-400 mt-2">
          <span class="font-semibold text-yellow-400 block mb-1">Detx Gaming Reply:</span>
          ${r.reply_text}
        </div>
      ` : ""}
    </div>
  `).join("");
}

function boot() {
  setYear();
  injectBrand();
  renderSocials();
  navActive();
  renderUrgency();

  renderFeaturedCourses();
  renderCoursesPage();
  renderCourseDetails();
  renderWatchShelves();

  wireModal();
  handleEnrollSubmit();
  loadPublicCourses();
  loadHomepageReviews();
  updateCartUI();
  checkAuthNavState(); // <-- Add this here
}

document.addEventListener("DOMContentLoaded", boot);
