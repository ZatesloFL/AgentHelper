// Bundled template records (Claude run 1, 2026-10-29) — the fallback
// copy of the Firestore templates collection. Firestore wins whenever
// it has a doc for a slug; these fill the gap until the admin import
// runs, and keep the picker/intake working if Firestore is unreachable.
// Source of truth for content: Basic Memory
// projects/second-look-template-layers/. Import to Firestore from the
// Admin console (POST /api/admin/templates/import).

export const TEMPLATE_RECORDS: any[] = [
 {
  "slug": "trip-planner",
  "title": "Trip Planner",
  "audience": "personal",
  "category": "Planning and travel",
  "version": 2,
  "goalInOneSentence": "I want to plan a memorable trip — whether a dream trip to Egypt or a week in the mountains — with a realistic pace, rest time, and a complete packing and document checklist.",
  "experienceLevel": "Beginner",
  "whatDoneLooksLike": "A day-by-day itinerary with morning and afternoon options, hotel neighborhood advice, visa/passport checklist, and a printable summary.",
  "checkInRhythm": "Weekly while planning a trip; daily quick brief while traveling.",
  "contract": {
   "goal": "I want to plan a memorable trip — whether a dream trip to Egypt or a week in the mountains — with a realistic pace, rest time, and a complete packing and document checklist.",
   "do": [
    "Design a well-paced, realistic itinerary tailored to my energy level and interests.",
    "Include travel times between stops, quiet neighborhood hotel suggestions, local scams to avoid, and a timeline of what to book when.",
    "Give me links and comparisons so I book directly.",
    "Double-check official embassy or airline pages for visa and passport expiration rules.",
    "Respect my mobility, budget, and rest preferences."
   ],
   "do_not": [
    "Never book or charge anything yourself.",
    "Never book flights or hotels with my credit card.",
    "Avoid exhausting \"rush to 6 sights a day\" schedules."
   ],
   "ask_me_before": [
    "Choosing any flight, hotel, or reservation: always present options for me to choose."
   ],
   "report_back": [
    "A day-by-day itinerary with morning and afternoon options, hotel neighborhood advice, visa/passport checklist, and a printable summary.",
    "Weekly while planning a trip; daily quick brief while traveling."
   ],
   "stop_if": [
    "A step would book, reserve, or charge anything: stop and give me the link and the options instead."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Tell your helper where you want to go, who is traveling, what pace you enjoy, and your rough budget.",
   "Step 2 (10 mins): Review a relaxed day-by-day route and swap out anything that looks too rushed.",
   "Step 3 (10 mins): Generate a checklist of passport rules, weather packing needs, and key reservations to book."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Trip Planner\", paste the helper text, and say: \"Remember these as the rules for my Trip Planner helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit)",
    "setupClaims": [
     {
      "text": "Muse remembers what matters and keeps memory in the member's virtual machine, where it can be inspected, edited and downloaded.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Standing instructions live in the Soul file (SOUL.md), edited from the assistant screen > Soul > pencil; Meta's own docs do not describe this path.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     },
     {
      "text": "Side chats exist, created from the menu at top left of Chat.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
      ]
     },
     {
      "text": "Meta's Help Center article on customizing Muse could not be read; no 'projects' or 'custom instructions' feature was found.",
      "tag": "unverified",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     }
    ],
    "fallback": "If Muse does not keep the rules, paste the helper text at the start of each session.",
    "pasteText": "You are my personal Trip Planner. Help me design a well-paced, realistic itinerary tailored to my energy level and interests. Include travel times between stops, quiet neighborhood hotel suggestions, local scams to avoid, and a timeline of what to book when. Never book or charge anything yourself — always present options for me to choose.",
    "memberSteps": [
     "Open a new side chat in Muse and paste the Trip Planner text.",
     "Tell Muse: \"Remember these as the rules for my Trip Planner helper. Never book, reserve or pay for anything.\"",
     "Ask for the day-by-day plan, then ask Muse to make it a printable PDF.",
     "Check visa and passport rules on the official embassy or airline page yourself."
    ],
    "willDo": [
     {
      "text": "Browse the web in its own browser to research destinations, hotels and routes.",
      "tag": "vendor-stated",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Create PDF and Word documents and save them in Library > Artifacts, so a printable itinerary is possible.",
      "tag": "reported",
      "sources": [
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
      ]
     },
     {
      "text": "Set reminders and follow-ups, such as a booking-deadline reminder.",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Muse has shopping and payment connectors (including Shop Pay and PayPal) and an Expedia connector 'coming soon', so it is capable of buying; the no-booking rule depends on the member's instruction, not a product limit.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/the-biggest-news-from-connect-2026/"
      ]
     },
     {
      "text": "No citations by default; ask Muse for its sources.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Some travel and shopping sites block automated assistants (Resy said it would delete accounts using them).",
      "tag": "reported",
      "sources": [
       "https://axios.com/2026/09/08/meta-debuts-muse-personal-ai-agent",
       "https://abcnews.com/Business/metas-muse-ai-agent/story?id=136680507"
      ]
     }
    ],
    "memberDoesByHand": [
     "Book every flight, hotel and tour yourself.",
     "Check visa and passport rules on official pages.",
     "Leave payment connectors off for this helper."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Trip Planner\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Trip Planner with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented)",
    "setupClaims": [
     {
      "text": "Skills are reusable instructions Grok remembers across conversations; you can create one by describing it in chat, uploading a file, writing it, or with the built-in Skill Creator.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     },
     {
      "text": "Projects exist (the vendor FAQ mentions them as a feature some hosts lack), but no vendor page documents them; they launched as Workspaces grouping chats, files and custom instructions.",
      "tag": "reported",
      "sources": [
       "https://docs.x.ai/grok/faq",
       "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/"
      ]
     },
     {
      "text": "Tier availability, menu paths and limits for Projects and Skills are not published.",
      "tag": "unverified",
      "sources": [
       "https://x.ai/news/grok-skills",
       "https://docs.x.ai/grok/faq"
      ]
     }
    ],
    "fallback": "If neither Projects nor Skills appears: paste the helper text at the start of each chat. A global option, Settings > Customize Grok (custom instructions), is reported but not vendor-documented.",
    "pasteText": "You are my personal Trip Planner. Help me design a well-paced, realistic itinerary tailored to my energy level and interests. Include travel times between stops, quiet neighborhood hotel suggestions, local scams to avoid, and a timeline of what to book when. Never book or charge anything yourself — always present options for me to choose.",
    "memberSteps": [
     "Set up the Trip Planner as a Project or a Skill in Grok (see setup).",
     "Tell Grok where, who, pace and budget, then review the route.",
     "Optional while traveling: in Automations, create a daily morning brief for your destination (weather, advisories).",
     "Never press Share on a chat that holds passport or booking details."
    ],
    "willDo": [
     {
      "text": "Search X posts and the web in real time for advisories, weather and crowd tips.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok",
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Run a daily automation at a set time and notify you in the app or by email (free).",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Read uploaded booking confirmations (up to 150 MB per file).",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No booking feature is documented for consumer Grok.",
      "tag": "unverified",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Grok 'may give confidently wrong information… Verify important answers.'",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "Real-time summaries have a record of confident errors and bad citations.",
      "tag": "reported",
      "sources": [
       "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
       "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting"
      ]
     }
    ],
    "memberDoesByHand": [
     "Book everything yourself.",
     "Verify visa rules, advisories and anything time-sensitive on official sources."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Trip\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free",
    "setupClaims": [
     {
      "text": "Projects hold chats, files and their own instructions, and are available on all free and paid plans.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Project instructions apply only inside the project and override your global Custom Instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "The exact label of the project instructions button was not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     }
    ],
    "fallback": "None needed: Projects work on every plan. If the member cannot find Projects, paste the helper text into Settings > Personalization > Custom Instructions (applies to every chat) or at the start of each chat.",
    "pasteText": "You are my personal Trip Planner. Help me design a well-paced, realistic itinerary tailored to my energy level and interests. Include travel times between stops, quiet neighborhood hotel suggestions, local scams to avoid, and a timeline of what to book when. Never book or charge anything yourself — always present options for me to choose.",
    "memberSteps": [
     "Create a Project called \"Trip\" and paste the Trip Planner text as its instructions.",
     "Upload confirmations into the project as you book (Free plans allow 5 files per project).",
     "Ask for the day-by-day plan and a printable summary.",
     "Optional on Plus and up: ask ChatGPT to schedule a daily quick brief while you travel."
    ],
    "willDo": [
     {
      "text": "Keep files and chats for the trip together in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Search the web for flights, hotels and routes (all plans).",
      "tag": "vendor-stated",
      "sources": [
       "https://chatgpt.com/pricing/"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go up to 3 per the same page; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "OpenAI pulled back from in-chat checkout; purchases hand off to third-party apps or sites.",
      "tag": "reported",
      "sources": [
       "https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/"
      ]
     },
     {
      "text": "Tasks created inside a project cannot read that project's files.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     },
     {
      "text": "ChatGPT has given wrong visa advice that stranded a traveller and invented a restaurant.",
      "tag": "reported",
      "sources": [
       "https://www.boston25news.com/news/bad-travel-advice-ai/CKP6DSVK4Q7OZAGDBEDZMZ5VSM/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Book flights and hotels yourself from the links.",
     "Confirm visa and passport rules on the embassy or airline page."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Skills (replacing Gems)",
    "setupPath": "Customize (left menu) > Skills > Create > Create manually > name \"Trip Planner\", a one-line description, and the helper text as instructions. In a chat, type \"/\" and pick the skill.",
    "minimumPlan": "Free (18+, personal Google account, Keep Activity on)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create; options include Create manually (name, description, instructions); use by typing '/'; 18+, personal account, Keep Activity on; no subscription needed.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Gems go read-only on 2026-11-17 and are removed on 2026-12-17 for personal accounts 18+; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "The skills help page shows desktop steps only; skills are said to work in the mobile app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "Under-18 accounts and work or school accounts cannot use skills yet: use a Gem (Sidebar > Gems > New Gem, instructions field) until Google migrates those accounts. If Keep Activity is off, skills are unavailable: paste the helper text at the start of each chat. Optionally add a short standing line in Settings & help > Personal Intelligence > Instructions for Gemini (all users).",
    "pasteText": "You are my personal Trip Planner. Help me design a well-paced, realistic itinerary tailored to my energy level and interests. Include travel times between stops, quiet neighborhood hotel suggestions, local scams to avoid, and a timeline of what to book when. Never book or charge anything yourself — always present options for me to choose.",
    "memberSteps": [
     "Create a Trip Planner skill (Customize > Skills > Create > Create manually) with the Trip Planner text.",
     "In a chat, type \"/\", pick Trip Planner, and describe the trip.",
     "Ask Gemini to compare flights and hotels; open the links to book yourself.",
     "Use Share & export > Export to Docs to make the printable summary."
    ],
    "willDo": [
     {
      "text": "Find and compare flights and hotels using public Google Flights, Hotels and Maps data, and build a route by neighborhood; it links out rather than booking.",
      "tag": "vendor-stated",
      "sources": [
       "https://gemini.google/us/discover/ai-trip-planner/",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Export a response to a new Google Doc in Drive for printing.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Scheduled actions (Plus and up per the tier table) can send a daily travel brief with a push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416",
       "https://support.google.com/gemini/answer/16275805"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It does not book flights or hotels.",
      "tag": "vendor-stated",
      "sources": [
       "https://gemini.google/us/discover/ai-trip-planner/"
      ]
     },
     {
      "text": "A location-based scheduled action uses the location where it was created, so a brief set up at home will not follow you abroad.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "'Walking distances on Google Maps' is not described on any vendor page read.",
      "tag": "unverified",
      "sources": [
       "https://gemini.google/us/discover/ai-trip-planner/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Book flights and hotels yourself.",
     "Check visa and passport rules on official pages.",
     "Create a new scheduled brief at your destination if you want local weather."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Meta warns Muse 'may be inaccurate or take unexpected actions.'",
     "tag": "vendor-stated",
     "sources": [
      "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
     ]
    },
    {
     "text": "Muse gave a YouTuber's home address to a Marketplace buyer without being asked; a travel helper with booking access carries the same kind of risk.",
     "tag": "reported",
     "sources": [
      "https://thenextweb.com/news/meta-muse-facebook-marketplace-address-buyer-robb"
     ]
    },
    {
     "text": "Persistent-instruction path (Soul) is reported, not vendor-documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
     ]
    },
    {
     "text": "Muse is available in the US, Japan and Singapore only.",
     "tag": "vendor-stated",
     "sources": [
      "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
      "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/"
     ]
    }
   ],
   "grok": [
    {
     "text": "Two plan sets are live (The X Subscription and legacy SuperGrok), so members may not know what they have.",
     "tag": "vendor-stated",
     "sources": [
      "https://docs.x.ai/x-subscription/pricing",
      "https://x.ai/news/x-subscription"
     ]
    },
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never Share a chat with passport or booking details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    },
    {
     "text": "Projects and Skills setup is undocumented by the vendor; layer is the weakest of the four.",
     "tag": "unverified",
     "sources": [
      "https://docs.x.ai/grok/faq"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Free: 5 files per project and 3 uploads per day, so a member storing many confirmations will hit limits.",
     "tag": "vendor-stated",
     "sources": [
      "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
      "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
     ]
    },
    {
     "text": "No scheduled daily brief on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
     ]
    },
    {
     "text": "Free and Go show ads; ads can use the chat topic.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Gems retire 2026-12-17 for adult personal accounts; any old Trip Gem becomes a skill and over-limit files are dropped.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/18560919"
     ]
    },
    {
     "text": "Skills need Keep Activity on; with it off, connected apps and skills stop working.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/17094296",
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Scheduled actions are Plus and up per the tier table, though another help page says they are coming to all personal accounts.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16275805",
      "https://support.google.com/gemini/answer/16316416"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://abcnews.com/Business/metas-muse-ai-agent/story?id=136680507",
   "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/",
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://about.fb.com/news/2026/09/the-biggest-news-from-connect-2026/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://axios.com/2026/09/08/meta-debuts-muse-personal-ai-agent",
   "https://chatgpt.com/pricing/",
   "https://docs.x.ai/grok/faq",
   "https://docs.x.ai/x-subscription/pricing",
   "https://gemini.google/us/discover/ai-trip-planner/",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://help.x.com/en/using-x/about-grok",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/18560919",
   "https://thenextweb.com/news/meta-muse-facebook-marketplace-address-buyer-robb",
   "https://www.boston25news.com/news/bad-travel-advice-ai/CKP6DSVK4Q7OZAGDBEDZMZ5VSM/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting",
   "https://x.ai/news/grok-automations",
   "https://x.ai/news/grok-skills",
   "https://x.ai/news/x-subscription",
   "https://x.ai/pricing"
  ]
 },
 {
  "slug": "insurance-bill-appeal",
  "title": "Insurance and Bill Appeal Helper",
  "audience": "personal",
  "category": "Start with these",
  "version": 1,
  "goalInOneSentence": "I want to appeal a rejected insurance claim or confusing medical bill without spending hours on hold or missing a deadline.",
  "experienceLevel": "Complete beginner — no prior AI experience needed.",
  "whatDoneLooksLike": "You have a clear checklist of why the claim was denied, a polite and firm appeal letter citing the exact policy codes ready to mail or upload, and a calendar reminder to follow up in 14 days.",
  "checkInRhythm": "Every 7 days until the appeal is submitted, then a 14-day follow-up prompt to check claim status.",
  "contract": {
   "goal": "I want to appeal a rejected insurance claim or confusing medical bill without spending hours on hold or missing a deadline.",
   "do": [
    "Help me understand why this bill or claim was denied in plain English.",
    "Ask me one question at a time about the denial code, date of service, and what my doctor recommended.",
    "List the 2–3 documents the insurer needs and give me a checklist of attachments to include.",
    "Draft a clear, respectful, firm appeal letter that I can review and send myself.",
    "Remind me to verify any medical procedure codes (CPT codes) with my doctor's billing office before mailing."
   ],
   "do_not": [
    "Never ask for my Social Security number, credit card, or login passwords.",
    "Never mail, upload, or send the letter yourself."
   ],
   "ask_me_before": [
    "Treating any letter as final: I read and approve every letter before it is mailed or uploaded."
   ],
   "report_back": [
    "A clear checklist of why the claim was denied, a polite and firm appeal letter citing the exact policy codes ready to mail or upload, and a calendar reminder to follow up in 14 days.",
    "Every 7 days until the appeal is submitted, then a 14-day follow-up prompt to check claim status."
   ],
   "stop_if": [
    "I share a Social Security number, card number, or password: stop and remind me to remove it."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Cover your Social Security number and account password, then type or photograph the denial reason code into your AI helper.",
   "Step 2 (10 mins): Ask your helper to translate the insurance jargon into plain English and list the 2–3 documents the insurer needs.",
   "Step 3 (10 mins): Have your helper draft a calm, factual appeal letter referencing your doctor’s note and the insurer’s own coverage rules.",
   "Step 4 (10 mins): Review the letter yourself, print or submit it, and set a 2-week follow-up reminder with your helper."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Bill Appeal\", paste the helper text, and say: \"Remember these as the rules for my Bill Appeal helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit)",
    "setupClaims": [
     {
      "text": "Muse remembers what matters and keeps memory in the member's virtual machine, where it can be inspected, edited and downloaded.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Standing instructions live in the Soul file (SOUL.md), edited from the assistant screen > Soul > pencil; Meta's own docs do not describe this path.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     },
     {
      "text": "Side chats exist, created from the menu at top left of Chat.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
      ]
     },
     {
      "text": "Meta's Help Center article on customizing Muse could not be read; no 'projects' or 'custom instructions' feature was found.",
      "tag": "unverified",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     }
    ],
    "fallback": "If Muse does not keep the rules, paste the helper text at the start of each session.",
    "pasteText": "You are my calm, plain-spoken Insurance & Bill Appeal Helper. Help me understand why this bill or claim was denied in plain English. Ask me one question at a time about the denial code, date of service, and what my doctor recommended. Never ask for my Social Security number or login passwords. Draft a clear, respectful, firm appeal letter that I can review and send myself, and give me a checklist of attachments to include.",
    "memberSteps": [
     "Open a new side chat in Muse and paste the Bill Appeal text.",
     "Cover your Social Security number and passwords, then attach the denial letter as a PDF (photo upload in Muse is not confirmed).",
     "Ask Muse to draft the appeal as a Word document or PDF, then read it yourself.",
     "Ask Muse to remind you in 14 days to check the claim."
    ],
    "willDo": [
     {
      "text": "Read PDF, Word, text and spreadsheet files; create PDF and Word documents.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research",
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/"
      ]
     },
     {
      "text": "Set reminders and follow-ups.",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Photo upload of a letter in Muse specifically is not confirmed (the model reads images).",
      "tag": "unverified",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "If the email connector is allowed to send, Muse can send on the member's behalf; keep it read-only for this helper.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/"
      ]
     },
     {
      "text": "Reminder follow-ups often arrived late in one reviewer's test.",
      "tag": "reported",
      "sources": [
       "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything"
      ]
     }
    ],
    "memberDoesByHand": [
     "Print and mail, or upload, the letter yourself.",
     "Verify CPT codes with your doctor's billing office.",
     "Put the follow-up date on your own calendar as a backup."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Bill Appeal\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Bill Appeal with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented)",
    "setupClaims": [
     {
      "text": "Skills are reusable instructions Grok remembers across conversations; you can create one by describing it in chat, uploading a file, writing it, or with the built-in Skill Creator.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     },
     {
      "text": "Projects exist (the vendor FAQ mentions them as a feature some hosts lack), but no vendor page documents them; they launched as Workspaces grouping chats, files and custom instructions.",
      "tag": "reported",
      "sources": [
       "https://docs.x.ai/grok/faq",
       "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/"
      ]
     },
     {
      "text": "Tier availability, menu paths and limits for Projects and Skills are not published.",
      "tag": "unverified",
      "sources": [
       "https://x.ai/news/grok-skills",
       "https://docs.x.ai/grok/faq"
      ]
     }
    ],
    "fallback": "If neither Projects nor Skills appears: paste the helper text at the start of each chat. A global option, Settings > Customize Grok (custom instructions), is reported but not vendor-documented.",
    "pasteText": "You are my calm, plain-spoken Insurance & Bill Appeal Helper. Help me understand why this bill or claim was denied in plain English. Ask me one question at a time about the denial code, date of service, and what my doctor recommended. Never ask for my Social Security number or login passwords. Draft a clear, respectful, firm appeal letter that I can review and send myself, and give me a checklist of attachments to include.",
    "memberSteps": [
     "Set up Bill Appeal as a Project or a Skill in Grok, or paste the text at the start of a chat.",
     "Upload a photo or PDF of the denial with personal numbers covered.",
     "Ask Grok to explain the denial, list documents, and draft the letter.",
     "For the reminder: connect Google Calendar (write must be enabled) or create a one-time Automation in 14 days."
    ],
    "willDo": [
     {
      "text": "Read uploaded images and files (up to 150 MB per file).",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Look up state insurance rules and appeal timelines with web search.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "Create a one-time or recurring automation that notifies you.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Create calendar events when Calendar write permission is enabled; the base connection is read-only.",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Grok 'may give confidently wrong information'; verify any rule or deadline it finds.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "How a consumer turns on Calendar write access is only described for business admins.",
      "tag": "unverified",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar"
      ]
     }
    ],
    "memberDoesByHand": [
     "Mail or upload the letter yourself.",
     "Confirm deadlines and rules with your insurer or state insurance department."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Bill Appeals\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free",
    "setupClaims": [
     {
      "text": "Projects hold chats, files and their own instructions, and are available on all free and paid plans.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Project instructions apply only inside the project and override your global Custom Instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "The exact label of the project instructions button was not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     }
    ],
    "fallback": "None needed: Projects work on every plan. If the member cannot find Projects, paste the helper text into Settings > Personalization > Custom Instructions (applies to every chat) or at the start of each chat.",
    "pasteText": "You are my calm, plain-spoken Insurance & Bill Appeal Helper. Help me understand why this bill or claim was denied in plain English. Ask me one question at a time about the denial code, date of service, and what my doctor recommended. Never ask for my Social Security number or login passwords. Draft a clear, respectful, firm appeal letter that I can review and send myself, and give me a checklist of attachments to include.",
    "memberSteps": [
     "Create a Project called \"Bill Appeals\" and paste the Bill Appeal text as its instructions.",
     "Upload a redacted photo or PDF of the denial letter into the project.",
     "Ask for the plain-English explanation, the document checklist, and the letter.",
     "On Plus and up, ask ChatGPT to remind you in 14 days; on Free, put the date on your own calendar."
    ],
    "willDo": [
     {
      "text": "Read uploaded images and PDFs (images up to 20 MB; files up to 512 MB).",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
      ]
     },
     {
      "text": "Keep the denial letter, policy pages and drafts in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Schedule a one-off reminder task on Plus and up.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     },
     {
      "text": "Create a Google Calendar event once the Google app is connected (the Calendar scope allows writing events).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It 'can even make up things like quotes or citations'; check every policy code it cites.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth"
      ]
     },
     {
      "text": "Free: 3 file uploads per day and 5 files per project.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Calendar event creation from chat is reported by a third party, not documented by OpenAI.",
      "tag": "reported",
      "sources": [
       "https://www.usecarly.com/blog/chatgpt-google-calendar-integration/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Mail or upload the appeal yourself.",
     "Verify CPT codes with the billing office."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Skills (replacing Gems)",
    "setupPath": "Customize (left menu) > Skills > Create > Create manually > name \"Appeal Helper\", a one-line description, and the helper text as instructions. In a chat, type \"/\" and pick the skill.",
    "minimumPlan": "Free (18+, personal Google account, Keep Activity on)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create; options include Create manually (name, description, instructions); use by typing '/'; 18+, personal account, Keep Activity on; no subscription needed.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Gems go read-only on 2026-11-17 and are removed on 2026-12-17 for personal accounts 18+; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "The skills help page shows desktop steps only; skills are said to work in the mobile app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "Under-18 accounts and work or school accounts cannot use skills yet: use a Gem (Sidebar > Gems > New Gem, instructions field) until Google migrates those accounts. If Keep Activity is off, skills are unavailable: paste the helper text at the start of each chat. Optionally add a short standing line in Settings & help > Personal Intelligence > Instructions for Gemini (all users).",
    "pasteText": "You are my calm, plain-spoken Insurance & Bill Appeal Helper. Help me understand why this bill or claim was denied in plain English. Ask me one question at a time about the denial code, date of service, and what my doctor recommended. Never ask for my Social Security number or login passwords. Draft a clear, respectful, firm appeal letter that I can review and send myself, and give me a checklist of attachments to include.",
    "memberSteps": [
     "Create an Appeal Helper skill (Customize > Skills > Create > Create manually) with the Bill Appeal text.",
     "In a chat, type \"/\", pick Appeal Helper, and attach a photo or PDF of the denial with numbers covered.",
     "Use Share & export > Export to Docs to save the drafted letter as a Google Doc for printing.",
     "Ask Gemini to add a calendar event in 14 days to check the claim."
    ],
    "willDo": [
     {
      "text": "Read text in photos of letters (Google Lens technology) and PDFs; up to 10 files, 100 MB each.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/13594961",
       "https://support.google.com/gemini/answer/14903178"
      ]
     },
     {
      "text": "Export the letter to a new Google Doc.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Create a Google Calendar event or a Google Tasks reminder for the follow-up.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236",
       "https://support.google.com/gemini/answer/15230285"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "A subset of chats is read by human reviewers and kept up to 3 years; Google says not to enter confidential information you wouldn't want a reviewer to see.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/13594961"
      ]
     },
     {
      "text": "Gemini 'can make mistakes'; don't rely on it for professional advice.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/13275745"
      ]
     },
     {
      "text": "Calendar events created while Gemini Live runs in the background can't be undone.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     }
    ],
    "memberDoesByHand": [
     "Print and mail, or upload, the letter yourself.",
     "Verify CPT codes with the billing office."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Muse builds pages about people in the member's life, refreshed hourly; medical details shared here may land in memory.",
     "tag": "reported",
     "sources": [
      "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
      "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts"
     ]
    },
    {
     "text": "Deleting a chat does not erase what Muse learned; Reset Muse wipes everything.",
     "tag": "reported",
     "sources": [
      "https://www.aiagentslibrary.com/blog/meta-muse-memory/",
      "https://smartscope.blog/en/blog/meta-muse-memory-md-remembers-view-edit-delete-2026/"
     ]
    },
    {
     "text": "Chats are used for training by default after key personal information is removed; opt out in Settings > Data controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse"
     ]
    }
   ],
   "grok": [
    {
     "text": "Never press Share on an appeal chat: shared Grok chats were indexed by Google in 2025, including uploaded files.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    },
    {
     "text": "Use Private Chat (ghost icon) or turn off 'Improve the Model' if the member does not want the chat used for training.",
     "tag": "reported",
     "sources": [
      "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Consumer chats are used for training unless 'Improve the model for everyone' is turned off (Settings > Data Controls).",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/7730893-data-controls-faq"
     ]
    },
    {
     "text": "Free and Go show ads; no ads appear on health topics.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Old setup copy says to create a Gem; Gems are removed 2026-12-17 for adult personal accounts.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/18560919"
     ]
    },
    {
     "text": "Human review of chats, kept up to 3 years even after deleting activity; members should cover personal numbers and consider what medical detail they share.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://docs.x.ai/grok/connectors/gmail-google-calendar",
   "https://docs.x.ai/grok/faq",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq",
   "https://help.openai.com/en/articles/7730893-data-controls-faq",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://help.x.com/en/using-x/about-grok",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-memory-md-remembers-view-edit-delete-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/14903178",
   "https://support.google.com/gemini/answer/15230285",
   "https://support.google.com/gemini/answer/15305236",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/18560919",
   "https://www.aiagentslibrary.com/blog/meta-muse-memory/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://www.usecarly.com/blog/chatgpt-google-calendar-integration/",
   "https://x.ai/news/grok-automations",
   "https://x.ai/news/grok-skills"
  ]
 },
 {
  "slug": "family-scheduler",
  "title": "Family Scheduler",
  "audience": "personal",
  "category": "Start with these",
  "version": 1,
  "goalInOneSentence": "I want one calm Sunday ritual that turns scattered family texts, school flyers, and appointments into a clear weekly plan for everyone.",
  "experienceLevel": "Beginner — works great with phone voice mode or text.",
  "whatDoneLooksLike": "Every Sunday at 5pm, you have a clean week-at-a-glance summary ready to paste into the family group text, with ride handoffs and dinner nights settled.",
  "checkInRhythm": "Weekly every Sunday afternoon (or your preferred planning day) plus a mid-week Wednesday glance.",
  "contract": {
   "goal": "I want one calm Sunday ritual that turns scattered family texts, school flyers, and appointments into a clear weekly plan for everyone.",
   "do": [
    "Every Sunday, help me gather appointments, rides, and events for our household.",
    "Ask me about each day of the upcoming week.",
    "Check for overlapping times or missing rides, and flag double-booked time slots before finalizing the weekly list.",
    "Write a warm, easy-to-read weekly summary I can copy into our family group text."
   ],
   "do_not": [
    "Never send texts or emails on your own; write the draft so I can copy and send it."
   ],
   "ask_me_before": [
    "Removing or rescheduling any recurring appointment."
   ],
   "report_back": [
    "Every Sunday at 5pm, a clean week-at-a-glance summary ready to paste into the family group text, with ride handoffs and dinner nights settled.",
    "Weekly every Sunday afternoon (or my preferred planning day) plus a mid-week Wednesday glance."
   ],
   "stop_if": [
    "A message would go to anyone automatically: stop and hand me the draft instead."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Tell your helper who is in your household and what regular weekly routines happen (school, doctor visits, club meetings).",
   "Step 2 (10 mins): Snap a photo of any paper flyers or paste the week’s chaotic group text details into your helper.",
   "Step 3 (10 mins): Let the helper spot scheduling conflicts and format a clean Monday–Sunday summary message.",
   "Step 4 (10 mins): Copy the summary into your family text thread after reviewing it."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Family Scheduler\", paste the helper text, and say: \"Remember these as the rules for my Family Scheduler helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit)",
    "setupClaims": [
     {
      "text": "Muse remembers what matters and keeps memory in the member's virtual machine, where it can be inspected, edited and downloaded.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Standing instructions live in the Soul file (SOUL.md), edited from the assistant screen > Soul > pencil; Meta's own docs do not describe this path.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     },
     {
      "text": "Side chats exist, created from the menu at top left of Chat.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
      ]
     },
     {
      "text": "Meta's Help Center article on customizing Muse could not be read; no 'projects' or 'custom instructions' feature was found.",
      "tag": "unverified",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     }
    ],
    "fallback": "If Muse does not keep the rules, paste the helper text at the start of each session.",
    "pasteText": "You are my Family Scheduler helper. Every Sunday, help me gather appointments, rides, and events for our household. Ask me about each day of the upcoming week, check for overlapping times or missing rides, and write a warm, easy-to-read weekly summary I can copy into our family group text. Never send messages on your own.",
    "memberSteps": [
     "Open a side chat in Muse, paste the Family Scheduler text, and ask Muse to remember it.",
     "Connect Google Calendar in Muse. If Muse asks what it may do with your mail or messages, choose read only.",
     "Tell Muse: \"Every Sunday at 4pm, start my family schedule check-in. Every Wednesday, give me a quick look at the rest of the week.\"",
     "Copy the summary into your family group text yourself."
    ],
    "willDo": [
     {
      "text": "Set recurring tasks in plain language (e.g. 'every Sunday at 12 pm').",
      "tag": "reported",
      "sources": [
       "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything"
      ]
     },
     {
      "text": "Connect Google Calendar and Gmail; the member chooses whether Muse only reads or can also send.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/"
      ]
     },
     {
      "text": "Read photos or files of school flyers (file reading reported; photo upload in Muse not confirmed).",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "If allowed to send, Muse can message people for the member; one reviewer's Muse told a buyer 'Yep I'm here!' unprompted.",
      "tag": "reported",
      "sources": [
       "https://thenextweb.com/news/meta-muse-facebook-marketplace-address-buyer-robb"
      ]
     },
     {
      "text": "Reminder follow-ups often arrived late in one reviewer's test.",
      "tag": "reported",
      "sources": [
       "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything"
      ]
     },
     {
      "text": "Apple Calendar support on iPhone is not documented in readable Meta pages.",
      "tag": "unverified",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the weekly summary to your family yourself.",
     "Keep Muse's messaging and email connectors on read-only."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Family Scheduler\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Family Scheduler with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented)",
    "setupClaims": [
     {
      "text": "Skills are reusable instructions Grok remembers across conversations; you can create one by describing it in chat, uploading a file, writing it, or with the built-in Skill Creator.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     },
     {
      "text": "Projects exist (the vendor FAQ mentions them as a feature some hosts lack), but no vendor page documents them; they launched as Workspaces grouping chats, files and custom instructions.",
      "tag": "reported",
      "sources": [
       "https://docs.x.ai/grok/faq",
       "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/"
      ]
     },
     {
      "text": "Tier availability, menu paths and limits for Projects and Skills are not published.",
      "tag": "unverified",
      "sources": [
       "https://x.ai/news/grok-skills",
       "https://docs.x.ai/grok/faq"
      ]
     }
    ],
    "fallback": "If neither Projects nor Skills appears: paste the helper text at the start of each chat. A global option, Settings > Customize Grok (custom instructions), is reported but not vendor-documented.",
    "pasteText": "You are my Family Scheduler helper. Every Sunday, help me gather appointments, rides, and events for our household. Ask me about each day of the upcoming week, check for overlapping times or missing rides, and write a warm, easy-to-read weekly summary I can copy into our family group text. Never send messages on your own.",
    "memberSteps": [
     "Set up Family Scheduler as a Project or Skill in Grok, or paste the text at the start of a chat.",
     "Optional: connect Google Calendar at grok.com/connectors (read-only by default).",
     "Go to Automations > New Automation: Weekly, Sunday 4:00 PM, app notification, with the Sunday check-in instructions. Add a second one for Wednesday.",
     "Paste the week's messy texts, review the summary, and copy it into the group text yourself."
    ],
    "willDo": [
     {
      "text": "Weekly automations at a set time in your timezone, with app or email notification, free for everyone.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Read Google Calendar events and free/busy; the base connection is read-only.",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It cannot change calendar events unless write permission is enabled, which suits the 'check with me first' rule.",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar"
      ]
     },
     {
      "text": "The maximum number of automations is not published.",
      "tag": "unverified",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the summary to the family yourself.",
     "Add or move calendar events yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Family Scheduler\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free",
    "setupClaims": [
     {
      "text": "Projects hold chats, files and their own instructions, and are available on all free and paid plans.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Project instructions apply only inside the project and override your global Custom Instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "The exact label of the project instructions button was not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     }
    ],
    "fallback": "None needed: Projects work on every plan. If the member cannot find Projects, paste the helper text into Settings > Personalization > Custom Instructions (applies to every chat) or at the start of each chat.",
    "pasteText": "You are my Family Scheduler helper. Every Sunday, help me gather appointments, rides, and events for our household. Ask me about each day of the upcoming week, check for overlapping times or missing rides, and write a warm, easy-to-read weekly summary I can copy into our family group text. Never send messages on your own.",
    "memberSteps": [
     "Create a Project called \"Family Scheduler\" and paste the Family Scheduler text as its instructions.",
     "On Plus and up, ask in that chat: \"Every Sunday at 4pm, ask me if I'm ready for our 10-minute family schedule check-in.\" Check the confirmation shows the right day and time.",
     "Optional: connect Google Calendar (Settings > Apps) so ChatGPT can read the week's events.",
     "Copy the summary into your family group text yourself."
    ],
    "willDo": [
     {
      "text": "Recurring scheduled tasks with push or email notification on Plus, Pro, Business, Enterprise (Go up to 3; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     },
     {
      "text": "Google Calendar access with a scope that allows reading and writing events.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq"
      ]
     },
     {
      "text": "Voice conversations for members who prefer talking.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/articles/8400625"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "A specific weekday-and-time schedule (Sunday 4pm) is plausible but not spelled out on the tasks page.",
      "tag": "unverified",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     },
     {
      "text": "Tasks may pause after inactivity and do not run in voice chats.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     },
     {
      "text": "Free plans have no scheduled tasks.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the summary yourself.",
     "On Free, set your own phone reminder for Sunday."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Skills (replacing Gems)",
    "setupPath": "Customize (left menu) > Skills > Create > Create manually > name \"Family Scheduler\", a one-line description, and the helper text as instructions. In a chat, type \"/\" and pick the skill.",
    "minimumPlan": "Free (18+, personal Google account, Keep Activity on)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create; options include Create manually (name, description, instructions); use by typing '/'; 18+, personal account, Keep Activity on; no subscription needed.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Gems go read-only on 2026-11-17 and are removed on 2026-12-17 for personal accounts 18+; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "The skills help page shows desktop steps only; skills are said to work in the mobile app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "Under-18 accounts and work or school accounts cannot use skills yet: use a Gem (Sidebar > Gems > New Gem, instructions field) until Google migrates those accounts. If Keep Activity is off, skills are unavailable: paste the helper text at the start of each chat. Optionally add a short standing line in Settings & help > Personal Intelligence > Instructions for Gemini (all users).",
    "pasteText": "You are my Family Scheduler helper. Every Sunday, help me gather appointments, rides, and events for our household. Ask me about each day of the upcoming week, check for overlapping times or missing rides, and write a warm, easy-to-read weekly summary I can copy into our family group text. Never send messages on your own.",
    "memberSteps": [
     "Create a Family Scheduler skill with the Family Scheduler text.",
     "Connect Google Workspace in Customize > Connectors so Gemini can see your Google Calendar.",
     "On Google AI Plus and up, ask: \"Every Sunday at 4pm, start my family schedule check-in\" and check the Scheduled page.",
     "Copy the summary into your family group text yourself."
    ],
    "willDo": [
     {
      "text": "Read Google Calendar events, including shared calendars.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Scheduled actions (max 10 active) with push notification on mobile; Plus and up per the tier table.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416",
       "https://support.google.com/gemini/answer/16275805"
      ]
     },
     {
      "text": "Gemini Live voice works with Calendar for members who prefer talking.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "There is no read-only mode: Gemini can create, reschedule, rename and delete events, so the 'ask before changing' rule must be in the instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "It cannot add guests or set a location or description.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Apple Calendar is not in the connected apps list.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/table/17434654"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the summary yourself.",
     "Apple Calendar users paste or photograph their week instead."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Muse builds pages about each important person in the member's life, including children who never use Muse.",
     "tag": "reported",
     "sources": [
      "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
      "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts"
     ]
    },
    {
     "text": "Muse requires the member to be 18 or older.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "A payment card is required at signup, even for the free tier.",
     "tag": "reported",
     "sources": [
      "https://techcrunch.com/?p=3161372"
     ]
    }
   ],
   "grok": [
    {
     "text": "Grok's 'Customize' instructions path is reported, not documented; members may not find a Projects option.",
     "tag": "reported",
     "sources": [
      "https://www.thetechoutlook.com/news/web-social-media/new-custom-instructions-feature-added-for-x-platforms-grok-ai-on-web/"
     ]
    },
    {
     "text": "Common Sense Media rates Grok 'Unacceptable' and says no one under 18 should use it; keep children off the family's Grok account.",
     "tag": "reported",
     "sources": [
      "https://www.commonsensemedia.org/ai-reviews/grok-by-xai"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Old setup copy promises a Sunday 4pm scheduled task; Free members cannot do this.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
     ]
    },
    {
     "text": "Read aloud now sits in the overflow menu, which beginners may not find.",
     "tag": "reported",
     "sources": [
      "https://community.openai.com/t/read-aloud-feature-hidden/1393959"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Old setup copy says 'Calendar extension in read-only mode'; no such mode exists and extensions are now Connected Apps.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/15305236",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Connected apps need Keep Activity on; with it off, Calendar access stops.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13695044",
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Scheduled actions may switch off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/",
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://chatgpt.com/pricing/",
   "https://community.openai.com/t/read-aloud-feature-hidden/1393959",
   "https://docs.x.ai/grok/connectors/gmail-google-calendar",
   "https://docs.x.ai/grok/faq",
   "https://help.openai.com/articles/8400625",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/15274899",
   "https://support.google.com/gemini/answer/15305236",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/18560919",
   "https://support.google.com/gemini/table/17434654",
   "https://techcrunch.com/?p=3161372",
   "https://thenextweb.com/news/meta-muse-facebook-marketplace-address-buyer-robb",
   "https://www.commonsensemedia.org/ai-reviews/grok-by-xai",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://www.thetechoutlook.com/news/web-social-media/new-custom-instructions-feature-added-for-x-platforms-grok-ai-on-web/",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://x.ai/news/grok-automations",
   "https://x.ai/news/grok-skills"
  ]
 },
 {
  "slug": "daily-news-podcast",
  "title": "Daily News Podcast",
  "audience": "personal",
  "category": "Start with these",
  "version": 1,
  "goalInOneSentence": "I want a calm 7-minute morning update on the exact topics I care about — read aloud while I drink my coffee — without clickbait or outrage.",
  "experienceLevel": "Complete beginner — if you can tap a play button, you can use this.",
  "whatDoneLooksLike": "Every morning with coffee, you tap one button and hear a calm, balanced briefing on local Tallahassee news, your favorite sports team, gardening, or science.",
  "checkInRhythm": "Daily each morning with your coffee, with a monthly check-in to refresh your topics.",
  "contract": {
   "goal": "I want a calm 7-minute morning update on the exact topics I care about — read aloud while I drink my coffee — without clickbait or outrage.",
   "do": [
    "Prepare a calm, factual, 5-minute morning update covering only my chosen topics.",
    "Cite reputable sources for every news item so I can verify facts.",
    "Keep the language clear so it sounds great read aloud.",
    "End with one interesting historical fact or practical tip for the day."
   ],
   "do_not": [
    "Avoid sensationalism, clickbait, or doomscrolling tone.",
    "Never cover topics on my \"skip list\".",
    "Never sign me up for paid newsletters or external subscriptions."
   ],
   "ask_me_before": [
    "Changing my topic list (we refresh it at the monthly check-in)."
   ],
   "report_back": [
    "A calm, balanced briefing every morning on my chosen topics.",
    "Daily each morning with my coffee, with a monthly check-in to refresh my topics."
   ],
   "stop_if": [
    "A news item has no reputable source to cite: leave it out."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Pick 3 to 5 topics you genuinely want to know about (e.g., Florida gardening, ACC sports, space exploration, local community news) and 2 topics you want to skip.",
   "Step 2 (10 mins): Save your custom \"Morning Brief\" prompt inside a pinned conversation on your phone.",
   "Step 3 (10 mins): Test Voice Mode so your helper reads the morning brief aloud in a warm, natural voice."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Morning Brief\", paste the helper text, and say: \"Remember these as the rules for my Morning Brief helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit)",
    "setupClaims": [
     {
      "text": "Muse remembers what matters and keeps memory in the member's virtual machine, where it can be inspected, edited and downloaded.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Standing instructions live in the Soul file (SOUL.md), edited from the assistant screen > Soul > pencil; Meta's own docs do not describe this path.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     },
     {
      "text": "Side chats exist, created from the menu at top left of Chat.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
      ]
     },
     {
      "text": "Meta's Help Center article on customizing Muse could not be read; no 'projects' or 'custom instructions' feature was found.",
      "tag": "unverified",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
      ]
     }
    ],
    "fallback": "If Muse does not keep the rules, paste the helper text at the start of each session.",
    "pasteText": "You are my Morning News Brief host. Prepare a calm, factual, 5-minute morning update covering only my chosen topics. Avoid sensationalism, clickbait, or doomscrolling tone. End with one interesting historical fact or practical tip for the day. Keep the language clear so it sounds great read aloud.",
    "memberSteps": [
     "Open a side chat in Muse, paste the Morning Brief text, and add your topics and skip list.",
     "Tell Muse: \"Every weekday at 7am, give me my Morning Brief with a source link for each item.\"",
     "Read the brief yourself, or use your phone's own read-aloud setting; Muse voice mode is not confirmed live."
    ],
    "willDo": [
     {
      "text": "Browse the web for current news.",
      "tag": "vendor-stated",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Run recurring tasks set in plain language, such as a weekday morning briefing.",
      "tag": "reported",
      "sources": [
       "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Meta demonstrated a Muse voice mode at Connect 2026 without a release date.",
      "tag": "vendor-stated",
      "sources": [
       "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/"
      ]
     },
     {
      "text": "Whether voice, read-aloud or any audio output is live in Muse today could not be confirmed.",
      "tag": "unverified",
      "sources": [
       "https://www.testingcatalog.com/meta-prepares-custom-voices-and-model-upgrades-for-muse/"
      ]
     },
     {
      "text": "No citations by default; the instructions must ask for sources.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     }
    ],
    "memberDoesByHand": [
     "Listen with your phone's own read-aloud feature, or read the brief.",
     "Check any surprising headline at its source."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Morning Brief\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Morning Brief with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented)",
    "setupClaims": [
     {
      "text": "Skills are reusable instructions Grok remembers across conversations; you can create one by describing it in chat, uploading a file, writing it, or with the built-in Skill Creator.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     },
     {
      "text": "Projects exist (the vendor FAQ mentions them as a feature some hosts lack), but no vendor page documents them; they launched as Workspaces grouping chats, files and custom instructions.",
      "tag": "reported",
      "sources": [
       "https://docs.x.ai/grok/faq",
       "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/"
      ]
     },
     {
      "text": "Tier availability, menu paths and limits for Projects and Skills are not published.",
      "tag": "unverified",
      "sources": [
       "https://x.ai/news/grok-skills",
       "https://docs.x.ai/grok/faq"
      ]
     }
    ],
    "fallback": "If neither Projects nor Skills appears: paste the helper text at the start of each chat. A global option, Settings > Customize Grok (custom instructions), is reported but not vendor-documented.",
    "pasteText": "You are my Morning News Brief host. Prepare a calm, factual, 5-minute morning update covering only my chosen topics. Avoid sensationalism, clickbait, or doomscrolling tone. End with one interesting historical fact or practical tip for the day. Keep the language clear so it sounds great read aloud.",
    "memberSteps": [
     "Go to Automations > New Automation: Daily, 7:00 AM your time, app notification, with the Morning Brief text, topics and skip list. Use Run now to test.",
     "Each morning, open the notification, or ask Grok in voice mode to read the brief to you.",
     "Check one source link a day until you trust it."
    ],
    "willDo": [
     {
      "text": "Daily automations at a set time with app notification, free; xAI's own example is a morning brief at 8:00.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Real-time search of X posts and the web.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "Voice mode on Free.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "A read-aloud button for text replies is not documented.",
      "tag": "unverified",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Worst citation accuracy of 8 AI search tools in the Tow Center study (94% wrong) and confident errors on breaking news.",
      "tag": "reported",
      "sources": [
       "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
       "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting"
      ]
     },
     {
      "text": "Our inference, not tested: pulling from X posts may bring in the 'shouting match' content the member wants to skip, so the skip list must be explicit.",
      "tag": "unverified",
      "sources": []
     }
    ],
    "memberDoesByHand": [
     "Verify important items at the source.",
     "Trim the skip list at the monthly check-in."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Morning Brief\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free",
    "setupClaims": [
     {
      "text": "Projects hold chats, files and their own instructions, and are available on all free and paid plans.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Project instructions apply only inside the project and override your global Custom Instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "The exact label of the project instructions button was not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     }
    ],
    "fallback": "None needed: Projects work on every plan. If the member cannot find Projects, paste the helper text into Settings > Personalization > Custom Instructions (applies to every chat) or at the start of each chat.",
    "pasteText": "You are my Morning News Brief host. Prepare a calm, factual, 5-minute morning update covering only my chosen topics. Avoid sensationalism, clickbait, or doomscrolling tone. End with one interesting historical fact or practical tip for the day. Keep the language clear so it sounds great read aloud.",
    "memberSteps": [
     "Create a Project called \"Morning Brief\" with the Morning Brief text, your topics and skip list.",
     "On Plus and up, ask: \"Every morning at 7am, prepare my Morning Brief.\" You get a push notification.",
     "Open the brief and tap the voice icon to talk, or use Read aloud (now in the ⋯ menu under a reply).",
     "On Free, open the project each morning and ask for today's brief."
    ],
    "willDo": [
     {
      "text": "Daily scheduled tasks with push or email notification on Plus and up (Go up to 3; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     },
     {
      "text": "Web search on all plans.",
      "tag": "vendor-stated",
      "sources": [
       "https://chatgpt.com/pricing/"
      ]
     },
     {
      "text": "Voice conversations start from the voice icon.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/articles/8400625"
      ]
     },
     {
      "text": "Daily voice allowances vary by plan (Plus 3 hours, Free limited).",
      "tag": "reported",
      "sources": [
       "https://www.tokenpost.com/news/technology/33561"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No podcast-style audio output was found.",
      "tag": "unverified",
      "sources": [
       "https://help.openai.com/articles/8400625"
      ]
     },
     {
      "text": "It can make up citations; the brief's source links need spot checks.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth"
      ]
     },
     {
      "text": "AI assistants' news answers had significant issues 45% of the time in an EBU and BBC study (2025, older models).",
      "tag": "reported",
      "sources": [
       "https://www.thedailystar.net/news/world/europe/news/ai-not-reliable-source-news-eu-media-study-says-4016021"
      ]
     }
    ],
    "memberDoesByHand": [
     "Spot-check sources.",
     "On Free, start the brief yourself each morning."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Skills (replacing Gems)",
    "setupPath": "Customize (left menu) > Skills > Create > Create manually > name \"Morning Brief\", a one-line description, and the helper text as instructions. In a chat, type \"/\" and pick the skill.",
    "minimumPlan": "Free (18+, personal Google account, Keep Activity on)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create; options include Create manually (name, description, instructions); use by typing '/'; 18+, personal account, Keep Activity on; no subscription needed.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Gems go read-only on 2026-11-17 and are removed on 2026-12-17 for personal accounts 18+; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "The skills help page shows desktop steps only; skills are said to work in the mobile app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "Under-18 accounts and work or school accounts cannot use skills yet: use a Gem (Sidebar > Gems > New Gem, instructions field) until Google migrates those accounts. If Keep Activity is off, skills are unavailable: paste the helper text at the start of each chat. Optionally add a short standing line in Settings & help > Personal Intelligence > Instructions for Gemini (all users).",
    "pasteText": "You are my Morning News Brief host. Prepare a calm, factual, 5-minute morning update covering only my chosen topics. Avoid sensationalism, clickbait, or doomscrolling tone. End with one interesting historical fact or practical tip for the day. Keep the language clear so it sounds great read aloud.",
    "memberSteps": [
     "Create a Morning Brief skill with the Morning Brief text, your topics and skip list.",
     "On Google AI Plus and up, ask: \"Every day at 7am, give me my Morning Brief\" (it is prepared up to an hour early).",
     "Tap Listen under the brief to hear it read aloud, or open Gemini Live to ask follow-ups.",
     "Optional: ask for an Audio Overview of a report for a podcast-style version (3 to 5 minutes)."
    ],
    "willDo": [
     {
      "text": "Scheduled actions with push notification on mobile; prepared within the hour before delivery.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "A Listen button reads any response aloud; Gemini Live lets you interrupt by talking.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Audio Overviews make a podcast-style recording from a file, Canvas or Deep Research report.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16047373"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Gems do not work in Gemini Live.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15146780"
      ]
     },
     {
      "text": "Whether skills work in Gemini Live is not stated, so a spoken brief may lose the helper's rules.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Audio Overviews are not available to under-18 users.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16047373"
      ]
     },
     {
      "text": "Scheduled actions are not on Free per the tier table.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805"
      ]
     }
    ],
    "memberDoesByHand": [
     "On Free, ask for the brief yourself each morning.",
     "Spot-check sources."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29"
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "No confirmed voice or read-aloud: the 'podcast' half of this template is not delivered by Muse today.",
     "tag": "unverified",
     "sources": [
      "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/"
     ]
    },
    {
     "text": "Hallucination rate 32.9% on Artificial Analysis AA-Omniscience (second-hand).",
     "tag": "reported",
     "sources": [
      "https://www.eesel.ai/blog/meta-muse-for-research"
     ]
    }
   ],
   "grok": [
    {
     "text": "Real-time news accuracy is the weakest documented of the four; reported bias toward conservative and pro-Kremlin narratives (NYT and ISD, via Wikipedia).",
     "tag": "reported",
     "sources": [
      "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
      "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting",
      "https://en.wikipedia.org/wiki/Grok_(chatbot)"
     ]
    },
    {
     "text": "Automations are free, so this is one of Grok's strongest layers for scheduling, weakest for accuracy.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Old setup copy says 'tap the headphone icon'; the vendor page calls it the voice icon.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/articles/8400625"
     ]
    },
    {
     "text": "Read aloud moved into the overflow menu.",
     "tag": "reported",
     "sources": [
      "https://community.openai.com/t/read-aloud-feature-hidden/1393959"
     ]
    },
    {
     "text": "No morning schedule on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Scheduled briefs may be up to an hour stale; a schedule may switch itself off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    },
    {
     "text": "Plans pages disagree on whether free accounts get scheduled actions.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16275805",
      "https://support.google.com/gemini/answer/16316416"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://chatgpt.com/pricing/",
   "https://community.openai.com/t/read-aloud-feature-hidden/1393959",
   "https://docs.x.ai/grok/faq",
   "https://en.wikipedia.org/wiki/Grok_(chatbot)",
   "https://help.openai.com/articles/8400625",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://help.x.com/en/using-x/about-grok",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://support.google.com/gemini/answer/15146780",
   "https://support.google.com/gemini/answer/15274899",
   "https://support.google.com/gemini/answer/16047373",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/18560919",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://www.testingcatalog.com/meta-prepares-custom-voices-and-model-upgrades-for-muse/",
   "https://www.thedailystar.net/news/world/europe/news/ai-not-reliable-source-news-eu-media-study-says-4016021",
   "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting",
   "https://www.tokenpost.com/news/technology/33561",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://x.ai/news/grok-automations",
   "https://x.ai/news/grok-skills",
   "https://x.ai/pricing"
  ]
 }
];
