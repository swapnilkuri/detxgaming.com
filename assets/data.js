// assets/data.js
window.DETX = {
  brand: {
    name: "Detx Gaming",
    tagline: "Gaming creator + social media growth",
  },

  // Global discount campaign (urgency timer)
  campaign: {
    endsAt: "2026-03-01T23:59:59+06:00",
    label: "🔥 50% OFF Creator Sale",
    note: "Sale ends soon. Price goes back up after timer ends.",
    discountPercent: 50
  },

  socials: [
    { label: "YouTube", href: "https://www.youtube.com/@detxgamingyt" },
    { label: "Join Discord", href: "https://discord.gg/Mm74e4WHhU" },
    { label: "Discord DM", href: "https://discordapp.com/users/794883241680044054" },

    // Add later
    { label: "Facebook", href: "https://facebook.com/YOURPAGE" },
    { label: "Instagram", href: "https://instagram.com/YOURHANDLE" },
    { label: "TikTok", href: "https://tiktok.com/@YOURHANDLE" },
    { label: "Threads", href: "https://threads.net/@YOURHANDLE" },
    { label: "Reddit", href: "https://reddit.com/user/YOURUSERNAME" },
  ],

  youtube: {
    featuredPlaylistId: "PL2gip3RqVaHdYQ2aelFRwaExsKCE6RtY_",
    highlightsPlaylistId: "PL2gip3RqVaHc7p8dILPwS1Ke2nW5NIXc4",
    shortsPlaylistId: "PL2gip3RqVaHdB5EBHCt1SPG_4ifssHVIT",
    livePlaylistId: "PL2gip3RqVaHfKpGTDwUsNpjsT5wRRcf_6",
  },

  courses: [
    {
      id: "yt-journey-starter",
      track: "YouTube Starter",
      level: "Beginner",
      duration: "1.5 hours",
      badge: "Best for new creators",
      title: "How to Start YouTube Journey (Gaming)",
      image: "assets/courses/start-your-youtube-journey.png",
      outcome: "Upload your first 10 videos with a repeatable system.",
      description:
        "From channel setup to your first upload pipeline. For gaming creators who keep overthinking.",
      originalPrice: 999,
      discountPrice: 499,
      includes: [
        "Channel setup checklist",
        "10 video ideas for gaming",
        "Upload + title formula",
        "Pinned comment + end screen flow",
      ],
      delivery: "Instant access (Unlisted YouTube playlist) after checkout",
      support: "Discord support community included",
      checkoutUrl: "https://PAYHIP_OR_GUMROAD_LINK_HERE"
    },

    {
      id: "yt-seo-gaming",
      track: "YouTube Growth",
      level: "Intermediate",
      duration: "2 hours",
      badge: "Most useful",
      title: "YouTube SEO for Gaming (ChatGPT + VidIQ style)",
      image: "assets/courses/youtube-seo-mastery.png",
      outcome: "Get searchable titles, tags, descriptions that pull views.",
      description:
        "Practical SEO: keywords, packaging, retention basics, and the AI workflow you’ll use daily.",
      originalPrice: 1599,
      discountPrice: 799,
      includes: [
        "Title formulas (Shorts + Long)",
        "Tag strategy (gaming)",
        "Description template",
        "AI prompt pack (copy/paste)",
      ],
      delivery: "Instant access (Unlisted YouTube playlist) after checkout",
      support: "Discord support community included",
      checkoutUrl: "https://PAYHIP_OR_GUMROAD_LINK_HERE"
    },

    {
      id: "ig-algorithm-gaming",
      track: "Instagram Growth",
      level: "Beginner",
      duration: "1.2 hours",
      badge: "Reels focused",
      title: "Learn Instagram Algorithm (Gaming Reels)",
      image: "assets/courses/instagram-algorithm-playbook.png",
      outcome: "Make reels that get pushed instead of dying at 200 views.",
      description:
        "Hooks, pacing, overlays, posting rhythm, and growth mechanics for gaming clips.",
      originalPrice: 1199,
      discountPrice: 599,
      includes: [
        "7 hook types that work",
        "Reels structure (0–3s rule)",
        "Caption formula",
        "Posting schedule mini-plan",
      ],
      delivery: "Instant access (Unlisted YouTube playlist) after checkout",
      support: "Discord support community included",
      checkoutUrl: "https://PAYHIP_OR_GUMROAD_LINK_HERE"
    },

    {
      id: "pro-live-stream",
      track: "Streaming",
      level: "Beginner",
      duration: "1.5 hours",
      badge: "Live setup",
      title: "How to Start Professional Live Stream (Streamlabs)",
      image: "assets/courses/pro-live-streaming-setup.png",
      outcome: "Go live with clean overlays, alerts, audio, and stability.",
      description:
        "Setup that looks pro without expensive gear: scenes, alerts, mic filters, bitrate rules.",
      originalPrice: 1699,
      discountPrice: 849,
      includes: [
        "Scene setup blueprint",
        "Audio clarity checklist",
        "Basic alert setup",
        "Stream settings for stability",
      ],
      delivery: "Instant access (Unlisted YouTube playlist) after checkout",
      support: "Discord support community included",
      checkoutUrl: "https://PAYHIP_OR_GUMROAD_LINK_HERE"
    },

    {
      id: "capcut-gaming-edit",
      track: "Editing",
      level: "Beginner",
      duration: "1.3 hours",
      badge: "Fast edits",
      title: "CapCut Editing for Gaming (Shorts/Reels)",
      image: "assets/courses/capcut-editing.png",
      outcome: "Edit clips fast with a consistent style.",
      description:
        "Cuts, captions, zooms, sound design basics — gaming optimized.",
      originalPrice: 999,
      discountPrice: 499,
      includes: [
        "CapCut workflow for gaming",
        "Subtitle style settings",
        "Sound effects pack idea",
        "Export settings",
      ],
      delivery: "Instant access (Unlisted YouTube playlist) after checkout",
      support: "Discord support community included",
      checkoutUrl: "https://PAYHIP_OR_GUMROAD_LINK_HERE"
    },

    {
      id: "thumb-1min",
      track: "Thumbnails",
      level: "Beginner",
      duration: "45 mins",
      badge: "Quick win",
      title: "Generate Thumbnail in 1 Minute (Fast Method)",
      image: "assets/courses/1-minute-thumbnail-method.png",
      outcome: "Make thumbnails fast without getting stuck.",
      description:
        "Simple layout rules + template approach so you can upload daily.",
      originalPrice: 799,
      discountPrice: 399,
      includes: [
        "3 thumbnail templates",
        "Fast text rules",
        "Gaming thumbnail structure",
        "Export sizes",
      ],
      delivery: "Instant access (Unlisted YouTube playlist) after checkout",
      support: "Discord support community included",
      checkoutUrl: "https://PAYHIP_OR_GUMROAD_LINK_HERE"
    },

    {
      id: "thumb-pro-canva-ai",
      track: "Thumbnails",
      level: "Intermediate",
      duration: "1.1 hours",
      badge: "Pro look",
      title: "Professional Thumbnail using Canva + AI (Gemini style)",
      image: "assets/courses/pro-thumbnail-canva-ai.png",
      outcome: "High CTR thumbnails that look like real gaming creators.",
      description:
        "Design rules + AI workflow to speed up idea + execution.",
      originalPrice: 1799,
      discountPrice: 899,
      includes: [
        "Canva pro layout rules",
        "AI prompt pack for thumbnail ideas",
        "Color/contrast rules",
        "Before/after examples",
      ],
      delivery: "Instant access (Unlisted YouTube playlist) after checkout",
      support: "Discord support community included",
      checkoutUrl: "https://PAYHIP_OR_GUMROAD_LINK_HERE"
    },
  ],

  shop: {
    affiliateNote:
      "Affiliate shop: if you buy from these links, Detx Gaming may earn a commission (no extra cost to you).",
    categories: [
      {
        title: "Creator Gear Picks",
        items: [
          { name: "Gaming Headset", note: "Budget + clear mic", link: "https://amazon.com/PASTE" },
          { name: "USB Microphone", note: "Best starter upgrade", link: "https://amazon.com/PASTE" },
        ],
      },
    ],
  },
};
