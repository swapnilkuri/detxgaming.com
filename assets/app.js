// assets/app.js

function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function money(n) {
  return "₹" + Number(n).toLocaleString("en-US");
}

function setYear() {
  const y = qs("#year");
  if (y) y.textContent = new Date().getFullYear();
}

function renderSocials() {
  const wrap = qs("[data-socials]");
  if (!wrap) return;
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
  if (!host) return;

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
    requestAnimationFrame(() => {});
  };
  setInterval(tick, 1000);
  tick();
}

function getCourseById(id) {
  return DETX.courses.find(c => c.id === id);
}

// encodeURI leaves "+" untouched, but some static hosts treat a literal "+"
// in a path as an encoded space. Explicitly encode it as %2B to be safe.
function encodeImagePath(path) {
  return encodeURI(path).replace(/\+/g, "%2B");
}

function courseCard(c) {
  return `
  <article class="card courseCard">
    <div>
      <div class="courseThumb">
        ${c.image ? `<img src="${encodeImagePath(c.image)}" alt="${c.title}" loading="lazy" onerror="this.closest('.courseThumb').classList.add('noImg'); this.remove();"/>` : ""}
      </div>

      <div class="badgeRow">
        <span class="badge">${c.track}</span>
        <span class="muted" style="font-size:12px;">${c.level} • ${c.duration}</span>
      </div>

      ${c.badge ? `<div class="tag">50% OFF</div>` : `<div class="tag">50% OFF</div>`}

      <h3 class="cardTitle">${c.title}</h3>
      <p class="muted" style="margin:0;">${c.outcome}</p>
    </div>

    <div class="priceRow">
      <div class="price">
        <span class="old">${money(c.originalPrice)}</span>
        <span class="new">${money(c.discountPrice)}</span>
      </div>
      <a class="btn" href="course.html?id=${encodeURIComponent(c.id)}">View</a>
    </div>
  </article>`;
}

function renderFeaturedCourses() {
  const wrap = qs("[data-featured-courses]");
  if (!wrap) return;
  wrap.innerHTML = DETX.courses.slice(0, 6).map(courseCard).join("");
}

function renderCoursesPage() {
  const wrap = qs("[data-courses]");
  if (!wrap) return;
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

  qs("[data-course-title]").textContent = c.title;
  qs("[data-course-track]").textContent = c.track;
  qs("[data-course-level]").textContent = c.level;
  qs("[data-course-duration]").textContent = c.duration;
  qs("[data-course-desc]").textContent = c.description;
  qs("[data-course-outcome]").textContent = c.outcome;
  qs("[data-course-old]").textContent = money(c.originalPrice);
  qs("[data-course-new]").textContent = money(c.discountPrice);

  const thumbWrap = qs("[data-course-thumb]");
  if (thumbWrap) {
    if (c.image) {
      thumbWrap.innerHTML = `<img src="${encodeImagePath(c.image)}" alt="${c.title}" onerror="this.closest('.courseThumb').classList.add('noImg'); this.remove();"/>`;
    } else {
      thumbWrap.classList.add("noImg");
    }
  }

  const inc = qs("[data-course-includes]");
  inc.innerHTML = c.includes.map(x => `<li>${x}</li>`).join("");

  const del = qs("[data-course-delivery]");
  if (del) del.textContent = c.delivery;

  const sup = qs("[data-course-support]");
  if (sup) sup.textContent = c.support;

  const instantBtn = qs("#instantBuyBtn");
  if (instantBtn) {
    if (c.checkoutUrl && !c.checkoutUrl.includes("PAYHIP")) {
      instantBtn.href = c.checkoutUrl;
      instantBtn.style.display = "inline-flex";
    } else {
      // still show, but user must set link
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
  modal.classList.add("open");

  qs("#modalCourseTitle").textContent = course.title;
  qs("#modalPriceOld").textContent = money(course.originalPrice);
  qs("#modalPriceNew").textContent = money(course.discountPrice);

  const form = qs("#enrollForm");
  form.dataset.courseId = course.id;
  form.dataset.courseTitle = course.title;
  form.dataset.priceOriginal = String(course.originalPrice);
  form.dataset.priceDiscount = String(course.discountPrice);

  form.reset();
  qs("#enrollStatus").textContent = "";
}

function closeEnrollModal() {
  const modal = qs("#enrollModal");
  modal.classList.remove("open");
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
    status.textContent = "Submitting...";

    try {
      const sb = getSupabase();
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

      // optional upload
      const file = qs("#paymentScreenshot").files[0];
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

      status.textContent = "✅ Submitted! Redirecting...";
      setTimeout(() => { window.location.href = "success.html"; }, 500);
    } catch (err) {
      console.error(err);
      status.textContent = "❌ Failed. Check Supabase keys/RLS or try again.";
    }
  });
}

function youtubeEmbed(playlistId) {
  if (!playlistId || playlistId.includes("PASTE")) {
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
  if (!root) return;

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
  qsa("[data-brand]").forEach(el => el.textContent = DETX.brand.name);
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
}

document.addEventListener("DOMContentLoaded", boot);

// Render Live Courses on Storefront
async function loadPublicCourses() {
  const container = document.getElementById('courses-grid'); // Ensure your courses container has this ID in courses.html
  if (!container) return;

  const sb = getSupabase();
  const { data: courses, error } = await sb
    .from('courses')
    .select('*')
    .eq('is_published', true);

  if (error || !courses.length) {
    container.innerHTML = `<p class="text-gray-400">No courses available right now.</p>`;
    return;
  }

  container.innerHTML = courses.map(course => `
    <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition">
      <img src="${course.thumbnail_url}" alt="${course.title}" class="w-full h-48 object-cover" />
      <div class="p-5">
        <h3 class="text-xl font-bold text-white mb-2">${course.title}</h3>
        <p class="text-sm text-gray-400 mb-4 line-clamp-2">${course.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-yellow-400 font-bold text-lg">$${course.price}</span>
          <a href="course.html?id=${course.slug}" class="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 transition">
            View Details
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', loadPublicCourses);
