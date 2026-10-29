// Bundled template records (Claude runs 1-5 + v4 runModes amendment,
// 2026-10-29) — the fallback copy of the Firestore templates collection.
// All 15 personal templates at version 4, five platform layers each, with
// structured requirements + two-mode run costs. Firestore wins whenever
// it has a doc for a slug; these fill the gap until the admin import
// runs, and keep the picker/intake working if Firestore is unreachable.
// Source of truth for content: Basic Memory
// projects/second-look-template-layers/. Import to Firestore from the
// Admin console (POST /api/admin/templates/import).
// 2026-10-29 patch (redesign spec section 10): daily-news-podcast
// contract wording fixes — see records-staging/PATCHES-2026-10-29.md.

export const TEMPLATE_RECORDS: any[] = [
 {
  "slug": "trip-planner",
  "title": "Trip Planner",
  "audience": "personal",
  "category": "Planning and travel",
  "version": 4,
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
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
     "Check visa and passport rules on the official embassy or airline page yourself.",
     "Any time, without a schedule: open your Trip Planner side chat in Muse and say \"check my trip plan\"."
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Trip Planner side chat in Muse and say \"check my trip plan\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Trip Planner\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Trip Planner with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
     "Never press Share on a chat that holds passport or booking details.",
     "Any time, without a schedule: open your Trip Planner helper in Grok and say \"check my trip plan\"."
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Trip Planner helper in Grok and say \"check my trip plan\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Trip\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the daily check-in with Tasks (OpenAI's pages conflict on Go)",
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
     "Optional on Plus and up: ask ChatGPT to schedule a daily quick brief while you travel.",
     "Any time, without a schedule: open your \"Trip\" project in ChatGPT and say \"check my trip plan\"."
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
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Trip\" project in ChatGPT and say \"check my trip plan\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Trip\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the daily check-in need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my personal Trip Planner. Help me design a well-paced, realistic itinerary tailored to my energy level and interests. Include travel times between stops, quiet neighborhood hotel suggestions, local scams to avoid, and a timeline of what to book when. Never book or charge anything yourself — always present options for me to choose.",
    "memberSteps": [
     "Create a Project called \"Trip\" and paste the Trip Planner text as its instructions.",
     "Upload confirmations into the project as you book.",
     "Turn on file creation (Settings > Capabilities), then ask for the day-by-day plan and a printable PDF or Word summary.",
     "Optional on Pro and up: set a scheduled task for a daily quick brief while you travel.",
     "Any time, without a schedule: open your \"Trip\" project in Claude and say \"check my trip plan\"."
    ],
    "willDo": [
     {
      "text": "Search the web on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Create Word and PDF files on every plan once file creation is turned on in Settings > Capabilities.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     },
     {
      "text": "Research mode for multi-source trip research, Pro and up.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11088861-use-research-on-claude"
      ]
     },
     {
      "text": "Scheduled tasks (hourly, daily, weekly or weekdays) run in the cloud even when the computer is asleep, on Pro and up only; Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Claude in Chrome (Pro and up, desktop Chrome only) can act on websites, so a member who has it should not use it on booking sites for this helper.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome"
      ]
     },
     {
      "text": "Anthropic says Duet, for members who have it, is weaker on personal errands such as booking tickets than on work tasks.",
      "tag": "vendor-stated",
      "sources": [
       "https://claude.com/resources/articles/claude-duet",
       "https://techcrunch.com/2026/10/22/claude-duet-app-is-anthropics-bet-on-agents/"
      ]
     },
     {
      "text": "Free usage limits vary with demand, so a long planning session can hit the limit.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8602283-about-free-claude-usage"
      ]
     }
    ],
    "memberDoesByHand": [
     "Book flights and hotels yourself from the links.",
     "Confirm visa and passport rules on the embassy or airline page."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Trip\" project in Claude and say \"check my trip plan\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Trip Planner\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Trip Planner. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the weekly and daily scheduled check-ins (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my personal Trip Planner. Help me design a well-paced, realistic itinerary tailored to my energy level and interests. Include travel times between stops, quiet neighborhood hotel suggestions, local scams to avoid, and a timeline of what to book when. Never book or charge anything yourself — always present options for me to choose.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Make the Trip Planner skill (Customize > Skills > Create > Create manually) with the helper text. Add one always-on line in Settings & help > Personal Intelligence > Instructions for Gemini: \"Never book, reserve or pay for anything; give me links and options instead.\"",
     "In a chat, type \"/\", pick Trip Planner, and describe the trip, who is going, your pace and budget. Ask it to compare flights and hotels and to put the packing list in Google Keep. Open the links and book yourself.",
     "When the plan looks right, use Share & export > Export to Docs for the printable summary.",
     "On Google AI Plus ($4.99) and up: ask \"Every Sunday at 6pm, check in on my trip plan\" while planning and \"Every day at 7am, give me a quick brief for today's plans\" while traveling, then turn both off on the Scheduled page when you are home. On Free, open Trip Planner and ask for these yourself.",
     "Any time, without a schedule: in Gemini, type / and pick your Trip Planner skill, then say \"check my trip plan\"."
    ],
    "willDo": [
     {
      "text": "Find and compare flights and hotels from public Google Flights, Hotels and Maps data and build a route by neighborhood; it links out so you book directly.",
      "tag": "vendor-stated",
      "sources": [
       "https://gemini.google/us/discover/ai-trip-planner/",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Keep in Connected Apps creates notes and lists and adds items to an existing list.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230597"
      ]
     },
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "Optional, on Google AI Pro ($19.99): Task mode, which Google labels experimental, can watch flight and hotel prices for you. The helper works without it.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16596215",
       "https://gemini.google/subscriptions/"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It does not book or pay for anything; you open the links and book yourself.",
      "tag": "vendor-stated",
      "sources": [
       "https://gemini.google/us/discover/ai-trip-planner/"
      ]
     },
     {
      "text": "If you try Task mode, Google warns about prompt injection and says not to give it sign-in or payment details, so keep booking in your own hands.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16596215"
      ]
     },
     {
      "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "memberDoesByHand": [
     "Book flights and hotels yourself from the links.",
     "Check visa and passport rules on the embassy or airline page.",
     "On Free, ask for the weekly check-in and the daily travel brief yourself.",
     "Turn off the travel schedules on the Scheduled page when the trip ends (10 can be active at once)."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "In Gemini, type / and pick your Trip Planner skill, then say \"check my trip plan\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
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
     "text": "Muse is available in the US, Canada, Japan and Singapore, not the EU.",
     "tag": "vendor-stated",
     "sources": [
      "https://muse.ai/business",
      "https://www.iphoneincanada.ca/2026/09/18/metas-muse-ai-agent-is-now-available-in-canada/"
     ]
    },
    {
     "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
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
    },
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
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
   "claude": [
    {
     "text": "No scheduled daily brief while travelling on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
      "https://claude.com/pricing"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://about.fb.com/news/2026/09/the-biggest-news-from-connect-2026/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://axios.com/2026/09/08/meta-debuts-muse-personal-ai-agent",
   "https://abcnews.com/Business/metas-muse-ai-agent/story?id=136680507",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://help.x.com/en/using-x/about-grok",
   "https://x.ai/pricing",
   "https://x.ai/news/grok-automations",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://chatgpt.com/pricing/",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/",
   "https://www.boston25news.com/news/bad-travel-advice-ai/CKP6DSVK4Q7OZAGDBEDZMZ5VSM/",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/11088861-use-research-on-claude",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome",
   "https://claude.com/resources/articles/claude-duet",
   "https://techcrunch.com/2026/10/22/claude-duet-app-is-anthropics-bet-on-agents/",
   "https://support.claude.com/en/articles/8602283-about-free-claude-usage",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://gemini.google/us/discover/ai-trip-planner/",
   "https://support.google.com/gemini/answer/15230597",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/16596215",
   "https://thenextweb.com/news/meta-muse-facebook-marketplace-address-buyer-robb",
   "https://muse.ai/business",
   "https://www.iphoneincanada.ca/2026/09/18/metas-muse-ai-agent-is-now-available-in-canada/",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://docs.x.ai/x-subscription/pricing",
   "https://x.ai/news/x-subscription",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/"
  ]
 },
 {
  "slug": "insurance-bill-appeal",
  "title": "Insurance and Bill Appeal Helper",
  "audience": "personal",
  "category": "Start with these",
  "version": 4,
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
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
     "Ask Muse to remind you in 14 days to check the claim.",
     "Any time, without a schedule: open your Bill Appeal side chat in Muse and say \"check on my appeal\"."
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
     },
     {
      "text": "In one reviewer's test, daily and weekly recurring tasks ran as scheduled, with no late or missed reminders reported.",
      "tag": "reported",
      "sources": [
       "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything"
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
      "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
       "https://www.meta.com/help/subscriptions/1021145227643680/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Print and mail, or upload, the letter yourself.",
     "Verify CPT codes with your doctor's billing office.",
     "Put the follow-up date on your own calendar as a backup."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Bill Appeal side chat in Muse and say \"check on my appeal\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Bill Appeal\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Bill Appeal with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
     "For the reminder: connect Google Calendar (write must be enabled) or create a one-time Automation in 14 days.",
     "Any time, without a schedule: open your Bill Appeal helper in Grok and say \"check on my appeal\"."
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Bill Appeal helper in Grok and say \"check on my appeal\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Bill Appeals\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the weekly check-in with Tasks (OpenAI's pages conflict on Go)",
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
     "On Plus and up, ask ChatGPT to remind you in 14 days; on Free, put the date on your own calendar.",
     "Any time, without a schedule: open your \"Bill Appeals\" project in ChatGPT and say \"check on my appeal\"."
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
     },
     {
      "text": "Whether Free and Go accounts can connect the Google Calendar app is not confirmed; OpenAI's plan grid lists app connections from Plus up.",
      "tag": "unverified",
      "sources": [
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "memberDoesByHand": [
     "Mail or upload the appeal yourself.",
     "Verify CPT codes with the billing office."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Bill Appeals\" project in ChatGPT and say \"check on my appeal\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Bill Appeals\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the weekly check-in need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my calm, plain-spoken Insurance & Bill Appeal Helper. Help me understand why this bill or claim was denied in plain English. Ask me one question at a time about the denial code, date of service, and what my doctor recommended. Never ask for my Social Security number or login passwords. Draft a clear, respectful, firm appeal letter that I can review and send myself, and give me a checklist of attachments to include.",
    "memberSteps": [
     "Create a Project called \"Bill Appeals\" and paste the Bill Appeal text as its instructions.",
     "Upload a photo or PDF of the denial letter with your Social Security number and passwords covered.",
     "Ask for the plain-English explanation, the document checklist, and the letter as a Word document or PDF.",
     "On Pro and up, connect Google Calendar on a computer and ask Claude to add a follow-up in 14 days; on Free, put the date on your own calendar.",
     "Any time, without a schedule: open your \"Bill Appeals\" project in Claude and say \"check on my appeal\"."
    ],
    "willDo": [
     {
      "text": "Read uploaded photos and PDFs (up to 500 MB per file and 20 files per chat; PDFs up to 1,000 pages).",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8241126-upload-files-to-claude"
      ]
     },
     {
      "text": "Create the appeal letter as a Word document or PDF on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     },
     {
      "text": "Research mode on Pro and up to look up appeal rules and deadlines.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11088861-use-research-on-claude"
      ]
     },
     {
      "text": "Create a Google Calendar event, asking for approval first by default (clear on Pro and up; the Free gate conflicts).",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Connected apps cannot be added from the phone app; set them up on the web or desktop app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory"
      ]
     },
     {
      "text": "Anthropic's pages disagree on whether Free accounts can connect Google apps: 'all users', 'paid plans only' and 'one tool' all appear.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     }
    ],
    "memberDoesByHand": [
     "Mail or upload the appeal yourself.",
     "Verify CPT codes with the billing office."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Bill Appeals\" project in Claude and say \"check on my appeal\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Appeal Helper\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Appeal Helper. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself, including the 14-day Calendar reminder; Google AI Plus ($4.99) for the weekly scheduled check-in (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my calm, plain-spoken Insurance & Bill Appeal Helper. Help me understand why this bill or claim was denied in plain English. Ask me one question at a time about the denial code, date of service, and what my doctor recommended. Never ask for my Social Security number or login passwords. Draft a clear, respectful, firm appeal letter that I can review and send myself, and give me a checklist of attachments to include.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Make the Appeal Helper skill (Customize > Skills > Create > Create manually) with the helper text. Add one always-on line in Settings & help > Personal Intelligence > Instructions for Gemini: \"Never ask for my Social Security number, card numbers or passwords; if I share one, tell me to remove it.\"",
     "Cover your Social Security number and any card or account numbers. Then in a chat type \"/\", pick Appeal Helper, and attach a photo or PDF of the denial letter.",
     "Read the drafted letter, then use Share & export > Export to Docs to print it or upload it yourself. Ask Gemini to add a Calendar event or Tasks reminder 14 days out called \"Check insurance appeal status\".",
     "On Google AI Plus ($4.99) and up: ask \"Every Monday at 9am, check in with me on my insurance appeal\" and turn it off on the Scheduled page once the letter is sent. On Free, set your own weekly phone reminder.",
     "Any time, without a schedule: in Gemini, type / and pick your Appeal Helper skill, then say \"check on my appeal\"."
    ],
    "willDo": [
     {
      "text": "Up to 10 files per prompt, 100 MB each; reads photos of letters.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14903178",
       "https://support.google.com/gemini/answer/13594961"
      ]
     },
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Create a Google Calendar event or a Google Tasks reminder for the 14-day follow-up.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236",
       "https://support.google.com/gemini/answer/15230285"
      ]
     },
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It won't mail or upload the letter, and a normal Gemini chat can't send email; you send it yourself.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15229592"
      ]
     },
     {
      "text": "Gemini can't add guests, a location or a description to a Calendar event.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Calendar events created while Gemini Live runs in the background can't be undone, so set the reminder in a typed chat.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     }
    ],
    "memberDoesByHand": [
     "Cover your Social Security number and card or account numbers before you upload anything.",
     "Check procedure (CPT) codes with your doctor's billing office.",
     "Print and mail, or upload, the letter yourself.",
     "On Free, set your own weekly reminder until the appeal is sent."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Appeal Helper skill, then say \"check on my appeal\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
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
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
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
    },
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
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
   "claude": [
    {
     "text": "Chats may be used for model training depending on the member's Model Improvement setting; with it on, de-identified chats can be kept up to 5 years. Check Privacy Settings before sharing medical details.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
      "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data"
     ]
    },
    {
     "text": "Memory is on by default; 'Include sensitive topics in memory' is off by default.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/11817273"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://help.x.com/en/using-x/about-grok",
   "https://x.ai/news/grok-automations",
   "https://docs.x.ai/grok/connectors/gmail-google-calendar",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://www.usecarly.com/blog/chatgpt-google-calendar-integration/",
   "https://chatgpt.com/pricing",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/8241126-upload-files-to-claude",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/11088861-use-research-on-claude",
   "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
   "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/14903178",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/15305236",
   "https://support.google.com/gemini/answer/15230285",
   "https://support.google.com/gemini/answer/15229592",
   "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
   "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts",
   "https://www.aiagentslibrary.com/blog/meta-muse-memory/",
   "https://smartscope.blog/en/blog/meta-muse-memory-md-remembers-view-edit-delete-2026/",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://docs.x.ai/x-subscription/pricing",
   "https://help.openai.com/en/articles/7730893-data-controls-faq",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data",
   "https://support.claude.com/en/articles/11817273",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15230597"
  ]
 },
 {
  "slug": "family-scheduler",
  "title": "Family Scheduler",
  "audience": "personal",
  "category": "Start with these",
  "version": 4,
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
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
     "Copy the summary into your family group text yourself.",
     "Any time, without a schedule: open your Family Scheduler side chat in Muse and say \"plan our week\"."
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
     },
     {
      "text": "In one reviewer's test, daily and weekly recurring tasks ran as scheduled, with no late or missed reminders reported.",
      "tag": "reported",
      "sources": [
       "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything"
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
      "text": "Apple Calendar support on iPhone is not documented in readable Meta pages.",
      "tag": "unverified",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     },
     {
      "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
       "https://www.meta.com/help/subscriptions/1021145227643680/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the weekly summary to your family yourself.",
     "Keep Muse's messaging and email connectors on read-only."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Family Scheduler side chat in Muse and say \"plan our week\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Family Scheduler\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Family Scheduler with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
     "Paste the week's messy texts, review the summary, and copy it into the group text yourself.",
     "Any time, without a schedule: open your Family Scheduler helper in Grok and say \"plan our week\"."
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Family Scheduler helper in Grok and say \"plan our week\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Family Scheduler\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the weekly check-in with Tasks (OpenAI's pages conflict on Go)",
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
     "Copy the summary into your family group text yourself.",
     "Any time, without a schedule: open your \"Family Scheduler\" project in ChatGPT and say \"plan our week\"."
    ],
    "willDo": [
     {
      "text": "Recurring scheduled tasks with push or email notification on Plus, Pro, Business, Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
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
     },
     {
      "text": "Whether Free and Go accounts can connect the Google Calendar app is not confirmed; OpenAI's plan grid lists app connections from Plus up.",
      "tag": "unverified",
      "sources": [
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the summary yourself.",
     "On Free, set your own phone reminder for Sunday."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Family Scheduler\" project in ChatGPT and say \"plan our week\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Family Scheduler\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the weekly check-in need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my Family Scheduler helper. Every Sunday, help me gather appointments, rides, and events for our household. Ask me about each day of the upcoming week, check for overlapping times or missing rides, and write a warm, easy-to-read weekly summary I can copy into our family group text. Never send messages on your own.",
    "memberSteps": [
     "Create a Project called \"Family Scheduler\" and paste the Family Scheduler text as its instructions.",
     "On a computer, connect Google Calendar so Claude can read the week; it asks before changing anything.",
     "On Pro and up, set a weekly scheduled task: \"Every Sunday at 4pm, start my family schedule check-in\", and a second one for Wednesday.",
     "Copy the summary into your family group text yourself.",
     "Any time, without a schedule: open your \"Family Scheduler\" project in Claude and say \"plan our week\"."
    ],
    "willDo": [
     {
      "text": "Read Google Calendar events, shared calendars and availability.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     },
     {
      "text": "Scheduled tasks (hourly, daily, weekly or weekdays) run in the cloud even when the computer is asleep, on Pro and up only; Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Two-way voice mode (beta) on every plan, on phone, desktop and web.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "The Calendar connector can create, update and delete events; Claude asks for approval before each action by default, and the 'ask before changing' rule stays in the instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     },
     {
      "text": "A specific clock time for a weekly scheduled task (Sunday 4pm) is not spelled out in the article read.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork"
      ]
     },
     {
      "text": "Connected apps cannot be added from the phone app; set them up on the web or desktop app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the summary yourself.",
     "On Free, set your own phone reminder for Sunday."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Family Scheduler\" project in Claude and say \"plan our week\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Family Scheduler\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Family Scheduler. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the Sunday and Wednesday scheduled check-ins (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     },
     {
      "text": "Calendar in Connected Apps can read, create, reschedule, rename and delete events; there is no read-only mode, so a 'just look' rule can only be an instruction in the helper text.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my Family Scheduler helper. Every Sunday, help me gather appointments, rides, and events for our household. Ask me about each day of the upcoming week, check for overlapping times or missing rides, and write a warm, easy-to-read weekly summary I can copy into our family group text. Never send messages on your own. Only read my calendar; never create, change or delete events unless I ask.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Make the Family Scheduler skill (Customize > Skills > Create > Create manually) with the helper text; it already says to only read your calendar. Add one always-on line in Settings & help > Personal Intelligence > Instructions for Gemini: \"Never send messages for me, and never create, change or delete calendar events unless I ask.\"",
     "Connect Google Calendar in Customize > Connectors > Add (needs Keep Activity on). Apple Calendar can't connect, so paste or photograph that week instead.",
     "On Google AI Plus ($4.99) and up: ask \"Every Sunday at 4pm, start my family week check-in. Only read my calendar.\" and \"Every Wednesday at 6pm, give me a quick look at the rest of the week. Only read my calendar.\" then check the Scheduled page. On Free, type \"/\" and pick Family Scheduler yourself on Sunday and Wednesday.",
     "Snap any school flyers into the chat, check the summary, and copy it into the family group text yourself.",
     "Any time, without a schedule: in Gemini, type / and pick your Family Scheduler skill, then say \"plan our week\"."
    ],
    "willDo": [
     {
      "text": "Read Google Calendar events, including shared and secondary calendars.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Up to 10 files per prompt, 100 MB each; reads photos of letters.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14903178",
       "https://support.google.com/gemini/answer/13594961"
      ]
     },
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Calendar in Connected Apps can read, create, reschedule, rename and delete events; there is no read-only mode, so a 'just look' rule can only be an instruction in the helper text.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Gemini can't add guests, a location or a description to a Calendar event.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "There is no Apple Calendar or Apple Reminders connection.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/13695044",
       "https://support.google.com/gemini/table/17434654"
      ]
     },
     {
      "text": "The pages read don't say whether a scheduled action applies a skill, so the scheduled prompt itself carries the key rules.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/16316416",
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "memberDoesByHand": [
     "Send the summary to the family yourself.",
     "Make any change to a recurring appointment yourself, or say yes when the helper asks.",
     "Apple Calendar users paste or photograph their week.",
     "On Free, start the Sunday and Wednesday check-ins yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Family Scheduler skill, then say \"plan our week\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
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
      "https://muse.ai/terms"
     ]
    },
    {
     "text": "Sources conflict on whether a payment card is needed to start Muse on the free tier: TechCrunch says yes, Engadget says a card is linked only for purchases.",
     "tag": "reported",
     "sources": [
      "https://techcrunch.com/?p=3161372",
      "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
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
    },
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "Grok Bot, the always-on helper with phone Calendar and (iPhone) Reminders access, needs the $30 Premium plan or a linked SuperGrok or X Premium+ plan, a separate app and a Cursor sign-in; it is not on Free or Plus.",
     "tag": "vendor-stated",
     "sources": [
      "https://docs.x.ai/grok-bot/get-started",
      "https://docs.x.ai/grok-bot/mobile",
      "https://docs.x.ai/x-subscription/pricing"
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
    },
    {
     "text": "Plus has no dot. On Pro ($100 and up, 18+, not EEA, UK or Switzerland) or Business Premium, a dot can run its own schedules with a time zone and end date instead of Tasks.",
     "tag": "vendor-stated",
     "sources": [
      "https://learn.chatgpt.com/docs/dots",
      "https://learn.chatgpt.com/docs/dots/tasks-and-memory"
     ]
    }
   ],
   "claude": [
    {
     "text": "No scheduled check-ins on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
      "https://claude.com/pricing"
     ]
    },
    {
     "text": "Claude requires the member to be 18 or older; children should not use the member's account.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/8114491-get-started-with-claude"
     ]
    },
    {
     "text": "Duet's check-ins every few hours would suit this ritual, but only US Pro or Max members admitted from the waitlist have it.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://thenextweb.com/news/meta-muse-facebook-marketplace-address-buyer-robb",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/news/grok-automations",
   "https://docs.x.ai/grok/connectors/gmail-google-calendar",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq",
   "https://help.openai.com/articles/8400625",
   "https://chatgpt.com/pricing/",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/15305236",
   "https://support.google.com/gemini/answer/14903178",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/table/17434654",
   "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
   "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts",
   "https://muse.ai/terms",
   "https://techcrunch.com/?p=3161372",
   "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/",
   "https://www.thetechoutlook.com/news/web-social-media/new-custom-instructions-feature-added-for-x-platforms-grok-ai-on-web/",
   "https://www.commonsensemedia.org/ai-reviews/grok-by-xai",
   "https://docs.x.ai/x-subscription/pricing",
   "https://docs.x.ai/grok-bot/get-started",
   "https://docs.x.ai/grok-bot/mobile",
   "https://community.openai.com/t/read-aloud-feature-hidden/1393959",
   "https://learn.chatgpt.com/docs/dots",
   "https://learn.chatgpt.com/docs/dots/tasks-and-memory",
   "https://support.claude.com/en/articles/8114491-get-started-with-claude",
   "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/15230597",
   "https://support.google.com/gemini/answer/15274899"
  ]
 },
 {
  "slug": "daily-news-podcast",
  "title": "Daily News Podcast",
  "audience": "personal",
  "category": "Start with these",
  "version": 4,
  "goalInOneSentence": "I want a calm 7-minute morning update on the exact topics I care about — read aloud while I drink my coffee — without clickbait or outrage.",
  "experienceLevel": "Complete beginner — if you can tap a play button, you can use this.",
  "whatDoneLooksLike": "Every morning with coffee, you tap one button and hear a calm, balanced briefing on local Tallahassee news, your favorite sports team, gardening, or science.",
  "checkInRhythm": "Daily each morning with your coffee, with a monthly check-in to refresh your topics.",
  "contract": {
   "goal": "I want a calm 5-minute morning update on the exact topics I care about — read aloud while I drink my coffee — without clickbait or outrage.",
   "do": [
    "Prepare a calm, factual, 5-minute morning update covering only my chosen topics.",
    "Cite reputable sources for every news item so I can verify facts.",
    "Keep the language clear so it sounds great read aloud.",
    "End with one interesting historical fact or practical tip for the day.",
    "Leave out any news item that has no reputable source to cite."
   ],
   "do_not": [
    "Never use a sensational, clickbait, or doomscrolling tone.",
    "Never cover topics I have asked you to skip.",
    "Never sign me up for paid newsletters or external subscriptions."
   ],
   "ask_me_before": [
    "Changing my topic list (we refresh it at the monthly check-in)."
   ],
   "report_back": [
    "A calm, balanced briefing every morning on my chosen topics."
   ],
   "stop_if": [
    "You are not sure a story is accurate: stop, tell me what is unverified, and let me decide whether it runs."
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
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
     "Read the brief yourself, or use your phone's own read-aloud setting; Muse voice mode is not confirmed live.",
     "Any time, without a schedule: open your Morning Brief side chat in Muse and say \"give me my morning news brief\"."
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Morning Brief side chat in Muse and say \"give me my morning news brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not ready with your morning coffee."
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Morning Brief\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Morning Brief with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
     "Check one source link a day until you trust it.",
     "Any time, without a schedule: open your Morning Brief helper in Grok and say \"give me my morning news brief\"."
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Morning Brief helper in Grok and say \"give me my morning news brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not ready with your morning coffee."
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Morning Brief\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the daily check-in with Tasks (OpenAI's pages conflict on Go)",
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
     "On Free, open the project each morning and ask for today's brief.",
     "Any time, without a schedule: open your \"Morning Brief\" project in ChatGPT and say \"give me my morning news brief\"."
    ],
    "willDo": [
     {
      "text": "Daily scheduled tasks with push or email notification on Plus and up (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
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
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Morning Brief\" project in ChatGPT and say \"give me my morning news brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not ready with your morning coffee."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Morning Brief\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the daily check-in need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my Morning News Brief host. Prepare a calm, factual, 5-minute morning update covering only my chosen topics. Avoid sensationalism, clickbait, or doomscrolling tone. End with one interesting historical fact or practical tip for the day. Keep the language clear so it sounds great read aloud.",
    "memberSteps": [
     "Create a Project called \"Morning Brief\" with the Morning Brief text, your topics and skip list.",
     "On Pro and up, set a daily scheduled task: \"Every day at 7am, prepare my Morning Brief with a source link for each item.\"",
     "Read the brief, or open voice mode and ask Claude to talk you through it; a read-aloud button is not documented.",
     "On Free, open the project each morning and ask for today's brief.",
     "Any time, without a schedule: open your \"Morning Brief\" project in Claude and say \"give me my morning news brief\"."
    ],
    "willDo": [
     {
      "text": "Search the web on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Scheduled tasks (hourly, daily, weekly or weekdays) run in the cloud even when the computer is asleep, on Pro and up only; Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Two-way voice mode (beta) on every plan, on phone, desktop and web.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "A tap-to-hear read-aloud button for a reply is not documented.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     },
     {
      "text": "Whether a scheduled task notifies the member's phone when the brief is ready is not stated in the article read.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork"
      ]
     }
    ],
    "memberDoesByHand": [
     "Spot-check sources.",
     "On Free, start the brief yourself each morning."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Morning Brief\" project in Claude and say \"give me my morning news brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not ready with your morning coffee."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Morning News Brief\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Morning News Brief. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself each morning; Google AI Plus ($4.99) for the daily scheduled brief (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my Morning News Brief host. Prepare a calm, factual, 5-minute morning update covering only my chosen topics. Avoid sensationalism, clickbait, or doomscrolling tone. End with one interesting historical fact or practical tip for the day. Keep the language clear so it sounds great read aloud.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Make the Morning News Brief skill (Customize > Skills > Create > Create manually) with the helper text, your 3 to 5 topics and your 2 skip topics. Add one always-on line in Settings & help > Personal Intelligence > Instructions for Gemini: \"Leave out any news item you can't link to a reputable source.\"",
     "On Google AI Plus ($4.99) and up: ask \"Every day at 7am, give me my calm 5-minute Morning News Brief on [your topics], skipping [your skip list], with a source for each item.\" It is prepared up to an hour early. On Free, type \"/\" each morning, pick Morning News Brief and ask for today's brief.",
     "Tap Listen under the brief to hear it read aloud, or open Gemini Live to ask follow-ups.",
     "Once a month, review your topics with the helper and update the skill and the scheduled prompt to match.",
     "Any time, without a schedule: in Gemini, type / and pick your Morning News Brief skill, then say \"give me my morning news brief\"."
    ],
    "willDo": [
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "Gemini Live voice conversation on all plans, plus a Listen button that reads a reply aloud.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Audio Overviews (a 3 to 5 minute podcast-style summary) on all plans, not for under-18s.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16047373"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Whether a skill's rules carry into Gemini Live is not stated, so a spoken follow-up may drop your skip list.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "The pages read don't say whether a scheduled action applies a skill, so the scheduled prompt itself carries the key rules.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/16316416",
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Skills don't include Deep Research, so an Audio Overview built from a Deep Research report has to be made in a normal chat.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296",
       "https://support.google.com/gemini/answer/16047373"
      ]
     }
    ],
    "memberDoesByHand": [
     "On Free, ask for the brief yourself each morning.",
     "Spot-check a source link or two.",
     "Refresh your topics and skip list once a month."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "In Gemini, type / and pick your Morning News Brief skill, then say \"give me my morning news brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not ready with your morning coffee."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
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
    },
    {
     "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
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
    },
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
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
    },
    {
     "text": "Plus has no dot. On Pro ($100 and up, 18+, not EEA, UK or Switzerland) or Business Premium, a dot can run its own schedules with a time zone and end date instead of Tasks.",
     "tag": "vendor-stated",
     "sources": [
      "https://learn.chatgpt.com/docs/dots",
      "https://learn.chatgpt.com/docs/dots/tasks-and-memory"
     ]
    }
   ],
   "claude": [
    {
     "text": "No morning schedule on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
      "https://claude.com/pricing"
     ]
    },
    {
     "text": "Read-aloud is not documented, so the 'podcast' half depends on voice mode.",
     "tag": "unverified",
     "sources": [
      "https://support.claude.com/en/articles/11101966-use-voice-mode"
     ]
    },
    {
     "text": "Duet's documented morning brief covers email and calendar; pointing it at news topics is not documented.",
     "tag": "unverified",
     "sources": [
      "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "None of the pages read say how Gemini shows sources for news items; open a few links to check they lead to real articles.",
     "tag": "unverified",
     "sources": [
      "https://support.google.com/gemini/answer/13275745"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/",
   "https://www.testingcatalog.com/meta-prepares-custom-voices-and-model-upgrades-for-muse/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/news/grok-automations",
   "https://help.x.com/en/using-x/about-grok",
   "https://x.ai/pricing",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://chatgpt.com/pricing/",
   "https://help.openai.com/articles/8400625",
   "https://www.tokenpost.com/news/technology/33561",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://www.thedailystar.net/news/world/europe/news/ai-not-reliable-source-news-eu-media-study-says-4016021",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/15274899",
   "https://support.google.com/gemini/answer/16047373",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://en.wikipedia.org/wiki/Grok_(chatbot)",
   "https://docs.x.ai/x-subscription/pricing",
   "https://community.openai.com/t/read-aloud-feature-hidden/1393959",
   "https://learn.chatgpt.com/docs/dots",
   "https://learn.chatgpt.com/docs/dots/tasks-and-memory",
   "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/15230597",
   "https://support.google.com/gemini/answer/15146780"
  ]
 },
 {
  "slug": "bill-renewal-watcher",
  "title": "Bill and Renewal Watcher",
  "audience": "personal",
  "category": "Life admin",
  "version": 4,
  "goalInOneSentence": "I want a simple list of every subscription, insurance policy, and annual bill so I get warned 30 days before any automatic renewal or price jump.",
  "experienceLevel": "Beginner",
  "whatDoneLooksLike": "A clear table of every recurring charge, how much it costs, when it renews, and a 30-day heads-up reminder before you get charged.",
  "checkInRhythm": "First Saturday of each month (10 minutes).",
  "contract": {
   "goal": "I want a simple list of every subscription, insurance policy, and annual bill so I get warned 30 days before any automatic renewal or price jump.",
   "do": [
    "Help me build a clean Subscription & Bill Renewal tracker.",
    "When I tell you a service name, amount, and billing cycle, organize it chronologically.",
    "Calculate the yearly total.",
    "Tell me what date I should set a reminder (14 to 30 days prior) to review or cancel it."
   ],
   "do_not": [
    "Never ask for account numbers or passwords.",
    "Never ask me to connect my bank login or type credit card numbers.",
    "Never cancel a service yourself."
   ],
   "ask_me_before": [
    "Cancelling or changing any service: I log in and decide myself."
   ],
   "report_back": [
    "A clear table of every recurring charge, how much it costs, when it renews, and a 30-day heads-up reminder before you get charged.",
    "First Saturday of each month (10 minutes)."
   ],
   "stop_if": [
    "I type a card number, account number or bank login: stop and remind me to remove it."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Read off the recurring charges from one recent monthly statement (just the company name, amount, and date — no card numbers).",
   "Step 2 (10 mins): Ask your helper to organize them by month and flag any duplicate streaming or software services.",
   "Step 3 (10 mins): Add 30-day advance reminders to your calendar for annual renewals like car insurance, home warranty, or memberships."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Bill Watcher\", paste the helper text, and say: \"Remember these as the rules for my Bill Watcher helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "Help me build a clean Subscription & Bill Renewal tracker. When I tell you a service name, amount, and billing cycle, organize it chronologically, calculate the yearly total, and tell me what date I should set a reminder (14–30 days prior) to review or cancel it. Never ask for account numbers or passwords.",
    "memberSteps": [
     "Open a side chat in Muse, paste the Bill Watcher text, and say: \"Remember these as the rules for my Bill Watcher helper. Never ask for card numbers and never log in to my accounts.\"",
     "Read off each recurring charge from one statement: company, amount, billing cycle and renewal date. No card or account numbers.",
     "Ask Muse for the list sorted by month with the yearly total as a spreadsheet, and to flag duplicate streaming or software services.",
     "Ask Muse to remind you 30 days before each annual renewal and on the first Saturday of each month. Put the biggest renewals on your own calendar too.",
     "Any time, without a schedule: open your Bill Watcher side chat in Muse and say \"run my bill check\"."
    ],
    "willDo": [
     {
      "text": "Create PDF, Word and spreadsheet files.",
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
     },
     {
      "text": "In one reviewer's test, daily and weekly recurring tasks ran as scheduled, with no late or missed reminders reported.",
      "tag": "reported",
      "sources": [
       "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
       "https://www.meta.com/help/subscriptions/1021145227643680/"
      ]
     },
     {
      "text": "Muse has its own web browser and can act on websites as you; every purchase needs your approval, but this helper never cancels anything, so do not give it account logins.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Whether the Google Calendar connector can add events, or only read them, is not documented.",
      "tag": "unverified",
      "sources": [
       "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Cancel or change any service by logging in yourself.",
     "Put the biggest renewals on your own calendar as a backup.",
     "Check your statement for charges you do not recognise."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Bill Watcher side chat in Muse and say \"run my bill check\".",
       "degrades": true,
       "degradesNote": "A bill check you have to remember to start can miss the 30-day window before a renewal charges you, which is the point of the watcher."
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Bill Watcher\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Bill Watcher with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "Help me build a clean Subscription & Bill Renewal tracker. When I tell you a service name, amount, and billing cycle, organize it chronologically, calculate the yearly total, and tell me what date I should set a reminder (14–30 days prior) to review or cancel it. Never ask for account numbers or passwords.",
    "memberSteps": [
     "Set up Bill Watcher as a Project or a Skill in Grok (see setup), or paste the text at the start of a chat.",
     "Type each charge: company, amount, billing cycle and renewal date. No card numbers.",
     "Ask for the list by month with the yearly total, and ask Grok to look up current standard prices for your internet or phone plan.",
     "In Automations, create a yearly automation 30 days before each annual renewal, and a monthly one for your check-in.",
     "Any time, without a schedule: open your Bill Watcher helper in Grok and say \"run my bill check\"."
    ],
    "willDo": [
     {
      "text": "Run automations once, daily, weekdays, weekly, monthly or yearly at a set time, with an email or app notification.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Real-time web search on every plan, Free included.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Built-in skills on every account create Excel spreadsheets, Word documents and PDFs.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Grok 'may give confidently wrong information... Verify important answers.'",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "A 'first Saturday of the month' schedule is not documented; Automations list monthly at a set time.",
      "tag": "unverified",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Adding Calendar events needs write permission, which is described only for business admins.",
      "tag": "unverified",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar.md"
      ]
     }
    ],
    "memberDoesByHand": [
     "Cancel or switch plans yourself on the provider's own site.",
     "Confirm any price Grok finds on the provider's own page."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Bill Watcher helper in Grok and say \"run my bill check\".",
       "degrades": true,
       "degradesNote": "A bill check you have to remember to start can miss the 30-day window before a renewal charges you, which is the point of the watcher."
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Bill Watcher\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the monthly check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "Help me build a clean Subscription & Bill Renewal tracker. When I tell you a service name, amount, and billing cycle, organize it chronologically, calculate the yearly total, and tell me what date I should set a reminder (14–30 days prior) to review or cancel it. Never ask for account numbers or passwords.",
    "memberSteps": [
     "Create a Project called \"Bill Watcher\" and paste the Bill Watcher text as its instructions.",
     "Type each charge with no card numbers, then ask for the table by month, the yearly total and any duplicate services.",
     "On Plus and up, ask: \"On the first Saturday of each month, remind me to review my Bill Watcher table.\" On Free, set that reminder on your phone.",
     "Put the 30-day renewal reminders on your own calendar; Plus allows only 5 active tasks, too few for one per renewal.",
     "Any time, without a schedule: open your \"Bill Watcher\" project in ChatGPT and say \"run my bill check\"."
    ],
    "willDo": [
     {
      "text": "Keep files and chats for this helper together in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     },
     {
      "text": "ChatGPT Work creates documents and spreadsheets: on every plan in the Mac or Windows desktop app, and on Plus and up on the web and phone.",
      "tag": "vendor-stated",
      "sources": [
       "https://openai.com/chatgpt-work/"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Plus allows 5 active tasks (Pro 15), and tasks pause after inactivity, so one task per renewal does not scale.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
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
      "text": "Whether Free and Go accounts can connect the Google Calendar app is not confirmed; OpenAI's plan grid lists app connections from Plus up.",
      "tag": "unverified",
      "sources": [
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "memberDoesByHand": [
     "Set renewal reminders on your own calendar.",
     "Cancel or change any service by logging in yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Bill Watcher\" project in ChatGPT and say \"run my bill check\".",
       "degrades": true,
       "degradesNote": "A bill check you have to remember to start can miss the 30-day window before a renewal charges you, which is the point of the watcher."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Bill Watcher\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) to start it yourself (Anthropic's pages conflict on project instructions for Free); no Claude plan runs a monthly scheduled task, so the reminder is yours",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "Help me build a clean Subscription & Bill Renewal tracker. When I tell you a service name, amount, and billing cycle, organize it chronologically, calculate the yearly total, and tell me what date I should set a reminder (14–30 days prior) to review or cancel it. Never ask for account numbers or passwords.",
    "memberSteps": [
     "Create a Project called \"Bill Watcher\" and paste the Bill Watcher text as its instructions.",
     "Type each charge, then turn on file creation (Settings > Capabilities) and ask for the tracker as an Excel file with the yearly total.",
     "At renewal time, upload both insurance quotes as PDFs and ask what coverage changed.",
     "On a computer, connect Google Calendar and ask Claude to add 30-day reminder events; it asks before adding each one. On Free, add them yourself.",
     "Any time, without a schedule: open your \"Bill Watcher\" project in Claude and say \"run my bill check\"."
    ],
    "willDo": [
     {
      "text": "Create Excel, Word and PDF files on every plan once file creation is on in Settings > Capabilities.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     },
     {
      "text": "Read uploaded PDFs: up to 20 files per chat and 1,000 pages each.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8241126-upload-files-to-claude"
      ]
     },
     {
      "text": "Create Google Calendar events, asking for approval first by default.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Scheduled tasks offer hourly, daily, weekly or weekdays; a monthly schedule is not listed, and Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's pages disagree on whether Free accounts can connect Google apps: 'all users', 'paid plans only' and 'one tool' all appear.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     },
     {
      "text": "Connected apps cannot be added from the phone app; set them up on the web or desktop app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory"
      ]
     }
    ],
    "memberDoesByHand": [
     "Cancel or change any service by logging in yourself.",
     "On Free, put renewal dates on your own calendar."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Bill Watcher\" project in Claude and say \"run my bill check\".",
       "degrades": true,
       "degradesNote": "A bill check you have to remember to start can miss the 30-day window before a renewal charges you, which is the point of the watcher."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": false,
       "fallback": "Put the first Saturday of each month on your own calendar; your helper prepares the review whenever you open the project."
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": false,
     "runFallback": "Put the first Saturday of each month on your own calendar; your helper prepares the review whenever you open the project."
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Bill Watcher\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Bill Watcher. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the monthly scheduled check-in (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "Help me build a clean Subscription & Bill Renewal tracker. When I tell you a service name, amount, and billing cycle, organize it chronologically, calculate the yearly total, and tell me what date I should set a reminder (14–30 days prior) to review or cancel it. Never ask for account numbers or passwords.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create the \"Bill Watcher\" skill with the helper text (see setup). In Instructions for Gemini, add: \"Never ask for card numbers, account numbers or passwords, and never cancel anything for me.\"",
     "In a chat, type \"/\" and pick Bill Watcher. Type each charge from one statement: company, amount, billing cycle and renewal date, with no card numbers. Ask for the table by month with the yearly total and any duplicate services, then save it with Share & export > Export to Sheets.",
     "Connect Google Calendar (Customize > Connectors) and ask Gemini to add an event 30 days before each annual renewal. It can't add a description, so ask for the service and amount in the event title, and check each event in Google Calendar.",
     "On Google AI Plus ($4.99) and up: \"On the first Saturday of each month at 10am, remind me to review my Bill Watcher table.\" On Free, set that monthly reminder on your phone.",
     "Any time, without a schedule: in Gemini, type / and pick your Bill Watcher skill, then say \"run my bill check\"."
    ],
    "willDo": [
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Calendar in Connected Apps can create events, including on shared and secondary calendars.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     },
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Gemini can't add guests, a location or a description to a Calendar event.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Calendar access is read and write with no read-only mode, so Gemini could also move or delete events; ask it only to add renewal reminders.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Whether a scheduled action can repeat on 'the first Saturday of each month' is not stated; Google's examples are daily, weekday and weekly times. Check the Scheduled page after you set it.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "memberDoesByHand": [
     "Cancel or change any service by logging in yourself.",
     "Check each renewal event in Google Calendar after Gemini adds it.",
     "On Free, set your own monthly reminder.",
     "Check your statement for charges you don't recognise."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Bill Watcher skill, then say \"run my bill check\".",
       "degrades": true,
       "degradesNote": "A bill check you have to remember to start can miss the 30-day window before a renewal charges you, which is the point of the watcher."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Chats are used for training by default after key personal information is removed; opt out in Settings > Data controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse",
      "https://muse.ai/terms"
     ]
    },
    {
     "text": "Meta warns Muse 'may be inaccurate or take unexpected actions.'",
     "tag": "vendor-stated",
     "sources": [
      "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
     ]
    }
   ],
   "grok": [
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "Whether chats train Grok depends on 'Improve the Model' (Settings > Data controls), whose default is not documented; Private Chat (ghost icon) keeps a chat out of history and training.",
     "tag": "reported",
     "sources": [
      "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
     ]
    },
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never press Share on a chat that holds personal details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "No scheduled reminders on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
      "https://chatgpt.com/pricing"
     ]
    },
    {
     "text": "Free and Go show ads, and ads can use the current chat and, with memory on, past chats; ad personalisation can be turned off.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    },
    {
     "text": "Consumer chats 'may' be used to improve OpenAI's models; turn this off in Data Controls before sharing financial or personal details.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq"
     ]
    },
    {
     "text": "Plus has no dot. On Pro ($100 and up, 18+, not EEA, UK or Switzerland) or Business Premium, a dot can run its own schedules with a time zone and end date instead of Tasks.",
     "tag": "vendor-stated",
     "sources": [
      "https://learn.chatgpt.com/docs/dots",
      "https://learn.chatgpt.com/docs/dots/tasks-and-memory"
     ]
    }
   ],
   "claude": [
    {
     "text": "No scheduled reminders on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
      "https://claude.com/pricing"
     ]
    },
    {
     "text": "Chats may be used for training depending on the Model Improvement setting; with it on, de-identified chats can be kept up to 5 years. Check Privacy Settings first.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
      "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/news/grok-automations",
   "https://x.ai/pricing",
   "https://help.x.com/en/using-x/about-grok",
   "https://docs.x.ai/grok/connectors/gmail-google-calendar.md",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://openai.com/chatgpt-work/",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/8241126-upload-files-to-claude",
   "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/15305236",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://muse.ai/terms",
   "https://docs.x.ai/x-subscription/pricing",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq",
   "https://learn.chatgpt.com/docs/dots",
   "https://learn.chatgpt.com/docs/dots/tasks-and-memory",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/15230597"
  ]
 },
 {
  "slug": "paperwork-helper",
  "title": "Paperwork Helper",
  "audience": "personal",
  "category": "Life admin",
  "version": 4,
  "goalInOneSentence": "When I get a dense letter, HOA notice, warranty contract, or government form, I want it explained in plain English so I know exactly what I need to do.",
  "experienceLevel": "Complete beginner",
  "whatDoneLooksLike": "You have a 3-bullet summary of what the letter says, whether any deadline applies, and the exact steps required.",
  "checkInRhythm": "On demand whenever mail arrives.",
  "contract": {
   "goal": "When I get a dense letter, HOA notice, warranty contract, or government form, I want it explained in plain English so I know exactly what I need to do.",
   "do": [
    "Read the text I share and explain it as a knowledgeable neighbor would over coffee.",
    "Tell me what this document is asking for.",
    "Tell me any deadlines or fees mentioned.",
    "Tell me what questions I should ask before signing or replying."
   ],
   "do_not": [
    "Never sign or submit forms for me."
   ],
   "ask_me_before": [
    "Any step toward signing, submitting or replying: I do that myself."
   ],
   "report_back": [
    "You have a 3-bullet summary of what the letter says, whether any deadline applies, and the exact steps required.",
    "On demand whenever mail arrives."
   ],
   "stop_if": [
    "A document I share shows an uncovered ID number: stop and remind me to cover it."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Cover personal ID numbers and take a clear photo or paste the text of the letter.",
   "Step 2 (10 mins): Ask for a plain-English translation and a list of any hidden fees, deadlines, or obligations.",
   "Step 3 (10 mins): Make a short checklist of questions to ask the sender before signing anything."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Paperwork\", paste the helper text, and say: \"Remember these as the rules for my Paperwork helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
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
    "pasteText": "You are my plain-spoken Paperwork Helper. Read the text I share and explain it as a knowledgeable neighbor would over coffee. Tell me: 1) What this document is asking for, 2) Any deadlines or fees mentioned, and 3) What questions I should ask before signing or replying.",
    "memberSteps": [
     "Open a side chat in Muse, paste the Paperwork text, and say: \"Remember these as the rules for my Paperwork helper. Never sign or submit anything.\"",
     "Cover ID numbers, then attach the document as a PDF or Word file, or paste the text. Photo upload in Muse is not confirmed; if a photo will not attach, scan it to PDF with your phone.",
     "Ask what it asks for, any deadlines or fees, and what to ask the sender. For long agreements, ask for section-by-section notes.",
     "In approval settings, choose 'always ask', then sign, submit or reply yourself.",
     "Each time: open your Paperwork side chat in Muse and say \"help me with this letter\"."
    ],
    "willDo": [
     {
      "text": "Read PDF, Word, text, spreadsheet and CSV files; no size limit is published, and PowerPoint is not supported.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Create PDF, Word and spreadsheet files.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research",
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/"
      ]
     },
     {
      "text": "The app offers an 'always ask' approval setting.",
      "tag": "reported",
      "sources": [
       "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Photo upload of a letter in Muse is not confirmed.",
      "tag": "unverified",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Muse can fill in forms and make bookings on websites, so it could submit a form if allowed; this helper never does.",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     },
     {
      "text": "Meta warns Muse 'may be inaccurate or take unexpected actions.'",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     }
    ],
    "memberDoesByHand": [
     "Sign, submit or reply yourself.",
     "Confirm any deadline with the sender.",
     "Cover ID numbers before you share."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Paperwork side chat in Muse and say \"help me with this letter\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Paperwork\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Paperwork with these instructions:\" and paste the helper text.",
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
    "pasteText": "You are my plain-spoken Paperwork Helper. Read the text I share and explain it as a knowledgeable neighbor would over coffee. Tell me: 1) What this document is asking for, 2) Any deadlines or fees mentioned, and 3) What questions I should ask before signing or replying.",
    "memberSteps": [
     "Set up Paperwork as a Project or a Skill in Grok (see setup), or paste the text at the start of a chat.",
     "Cover ID numbers, then upload a photo or PDF, or paste the text.",
     "Ask the three questions, then ask Grok to look up the agency's official form instructions and common mistakes.",
     "Never press Share on this chat; sign or submit yourself.",
     "Each time: open your Paperwork helper in Grok and say \"help me with this letter\"."
    ],
    "willDo": [
     {
      "text": "Read uploaded photos (including iPhone HEIC) and PDF, Word and text files, up to 150 MB each.",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Real-time web search on every plan, Free included.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Create a Word or PDF summary with built-in skills on every account.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "PDFs over 100 pages are read for text and key visuals only.",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Grok 'may give confidently wrong information... Verify important answers.'",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "Grok had the worst citation accuracy in a 2025 Tow Center test; use the agency's own page for instructions.",
      "tag": "reported",
      "sources": [
       "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Read the agency's official instructions yourself.",
     "Sign, submit or reply yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Paperwork helper in Grok and say \"help me with this letter\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Paperwork\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
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
    "pasteText": "You are my plain-spoken Paperwork Helper. Read the text I share and explain it as a knowledgeable neighbor would over coffee. Tell me: 1) What this document is asking for, 2) Any deadlines or fees mentioned, and 3) What questions I should ask before signing or replying.",
    "memberSteps": [
     "Create a Project called \"Paperwork\" and paste the Paperwork text as its instructions.",
     "Cover ID numbers, then attach a photo or PDF with the attach button, or paste the text.",
     "Ask the three questions and for a short checklist of questions for the sender.",
     "On Free you get 3 uploads a day; for more, paste the text instead.",
     "Each time: open your \"Paperwork\" project in ChatGPT and say \"help me with this letter\"."
    ],
    "willDo": [
     {
      "text": "Read uploaded photos (up to 20 MB) and files up to 512 MB.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
      ]
     },
     {
      "text": "Keep files and chats for this helper together in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "ChatGPT Work creates documents and spreadsheets: on every plan in the Mac or Windows desktop app, and on Plus and up on the web and phone.",
      "tag": "vendor-stated",
      "sources": [
       "https://openai.com/chatgpt-work/"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It 'can even make up things like quotes or citations'; check every figure and deadline yourself.",
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
      "text": "Agent mode (Plus and up) can act on websites; do not use it for this helper, which never submits forms.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/articles/11752874"
      ]
     }
    ],
    "memberDoesByHand": [
     "Sign, submit or reply yourself.",
     "Check every deadline against the document itself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Paperwork\" project in ChatGPT and say \"help me with this letter\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Paperwork\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro is the safe minimum; Free may work (Anthropic's pages conflict on project instructions for Free)",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my plain-spoken Paperwork Helper. Read the text I share and explain it as a knowledgeable neighbor would over coffee. Tell me: 1) What this document is asking for, 2) Any deadlines or fees mentioned, and 3) What questions I should ask before signing or replying.",
    "memberSteps": [
     "Create a Project called \"Paperwork\" and paste the Paperwork text as its instructions.",
     "Cover ID numbers, then upload the photo or PDF into a chat in the project, or paste the text.",
     "Ask the three questions. For multi-page HOA rules or contractor bids, ask it to highlight the key clauses.",
     "Keep the questions list, and sign or submit yourself.",
     "Each time: open your \"Paperwork\" project in Claude and say \"help me with this letter\"."
    ],
    "willDo": [
     {
      "text": "Read photos and PDFs in a chat: up to 500 MB per file, 20 files per chat, PDFs up to 1,000 pages (visual detail for the first 100).",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8241126-upload-files-to-claude"
      ]
     },
     {
      "text": "Create Word and PDF files on every plan once file creation is turned on in Settings > Capabilities.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     },
     {
      "text": "Search the web on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://claude.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Files saved to a project are capped at 30 MB each, lower than in a chat.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8241126-upload-files-to-claude"
      ]
     },
     {
      "text": "Claude in Chrome (Pro and up, desktop Chrome) can act on web pages; do not use it to fill or submit forms for this helper.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome"
      ]
     },
     {
      "text": "Free usage limits vary with demand, so a long session can hit the limit.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8602283-about-free-claude-usage"
      ]
     }
    ],
    "memberDoesByHand": [
     "Sign, submit or reply yourself.",
     "Confirm deadlines with the sender."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Paperwork\" project in Claude and say \"help me with this letter\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Paperwork\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Paperwork. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free (personal Google account, 18+, Keep Activity on)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my plain-spoken Paperwork Helper. Read the text I share and explain it as a knowledgeable neighbor would over coffee. Tell me: 1) What this document is asking for, 2) Any deadlines or fees mentioned, and 3) What questions I should ask before signing or replying.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create the \"Paperwork\" skill with the helper text (see setup). In Instructions for Gemini, add: \"Never sign, submit or reply to anything for me. If a document shows an ID number, tell me to cover it.\"",
     "Cover ID numbers, then in a chat type \"/\", pick Paperwork, and add a photo or PDF of the letter (up to 10 files at once) or paste the text.",
     "Ask what it asks for, any deadlines or fees, and what to ask the sender. For a long contract or HOA rulebook, ask about one section at a time.",
     "Save the question list with Share & export > Export to Docs, then sign, submit or reply yourself.",
     "Each time: in Gemini, type / and pick your Paperwork skill, then say \"help me with this letter\"."
    ],
    "willDo": [
     {
      "text": "Up to 10 files per prompt, 100 MB each; reads photos of letters.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14903178",
       "https://support.google.com/gemini/answer/13594961"
      ]
     },
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Temporary chat (web, next to New chat) is not saved to your activity and is kept 72 hours, but skills and Connected Apps don't work there, so paste the helper text in.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/13594961",
       "https://support.google.com/gemini/answer/13275745"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Free mostly uses Flash-Lite with a 32k context, so for a long contract or rulebook ask about one section at a time.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17004136",
       "https://support.google.com/gemini/answer/16275805"
      ]
     },
     {
      "text": "Chrome auto browse (Google AI Pro, US only) can click, type and fill in forms on websites; don't use it for this helper, which never submits anything.",
      "tag": "vendor-stated",
      "sources": [
       "https://blog.google/products-and-platforms/products/chrome/gemini-in-chrome-android-auto-browse/"
      ]
     },
     {
      "text": "Skills don't include Canvas, Deep Research or Guided Learning; Connected Apps do work inside a skill.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "memberDoesByHand": [
     "Sign, submit or reply yourself.",
     "Confirm any deadline with the sender or on the document itself.",
     "Cover ID numbers before you share."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Paperwork skill, then say \"help me with this letter\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Chats are used for training by default after key personal information is removed; opt out in Settings > Data controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse",
      "https://muse.ai/terms"
     ]
    },
    {
     "text": "Meta staff access to the member's Muse computer is limited by policy, not prevented; a version Meta cannot read is still in testing.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse"
     ]
    },
    {
     "text": "Deleting a chat does not erase what Muse learned; Reset Muse wipes everything.",
     "tag": "reported",
     "sources": [
      "https://www.aiagentslibrary.com/blog/meta-muse-memory/",
      "https://smartscope.blog/en/blog/meta-muse-memory-md-remembers-view-edit-delete-2026/"
     ]
    }
   ],
   "grok": [
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never press Share on a chat that holds personal details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    },
    {
     "text": "Whether chats train Grok depends on 'Improve the Model' (Settings > Data controls), whose default is not documented; Private Chat (ghost icon) keeps a chat out of history and training.",
     "tag": "reported",
     "sources": [
      "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
     ]
    },
    {
     "text": "Projects and Skills setup is undocumented by the vendor; this layer is the weakest of the four.",
     "tag": "unverified",
     "sources": [
      "https://docs.x.ai/grok/faq"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Consumer chats 'may' be used to improve OpenAI's models; turn this off in Data Controls before sharing financial or personal details.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq"
     ]
    },
    {
     "text": "Free and Go show ads, and ads can use the current chat and, with memory on, past chats; ad personalisation can be turned off.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    },
    {
     "text": "The old setup copy's 'camera icon' path was not confirmed in the OpenAI pages read.",
     "tag": "unverified",
     "sources": [
      "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
     ]
    }
   ],
   "claude": [
    {
     "text": "Chats may be used for training depending on the Model Improvement setting; with it on, de-identified chats can be kept up to 5 years. Check Privacy Settings first.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
      "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data"
     ]
    },
    {
     "text": "Memory is on by default; 'Include sensitive topics in memory' is off by default.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/11817273"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/pricing",
   "https://help.x.com/en/using-x/about-grok",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://openai.com/chatgpt-work/",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://help.openai.com/articles/11752874",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/8241126-upload-files-to-claude",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome",
   "https://support.claude.com/en/articles/8602283-about-free-claude-usage",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14903178",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/17004136",
   "https://support.google.com/gemini/answer/16275805",
   "https://blog.google/products-and-platforms/products/chrome/gemini-in-chrome-android-auto-browse/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://muse.ai/terms",
   "https://www.aiagentslibrary.com/blog/meta-muse-memory/",
   "https://smartscope.blog/en/blog/meta-muse-memory-md-remembers-view-edit-delete-2026/",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data",
   "https://support.claude.com/en/articles/11817273",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/15230597"
  ]
 },
 {
  "slug": "email-inbox-triage",
  "title": "Email Inbox Triage",
  "audience": "personal",
  "category": "Life admin",
  "version": 4,
  "goalInOneSentence": "I want to clear out email overwhelm by sorting what actually needs a reply today and having polite draft responses ready in my own voice.",
  "experienceLevel": "Beginner",
  "whatDoneLooksLike": "The 5 toughest emails in your inbox have warm, clear replies drafted and waiting for your review.",
  "checkInRhythm": "10 minutes each morning or Tuesday/Thursday afternoons.",
  "contract": {
   "goal": "I want to clear out email overwhelm by sorting what actually needs a reply today and having polite draft responses ready in my own voice.",
   "do": [
    "When I share an email and tell you roughly how I want to respond, write a warm, natural reply that sounds like me.",
    "Use no stiff corporate jargon.",
    "Flag suspicious phishing links or urgent payment requests immediately."
   ],
   "do_not": [
    "Never send emails yourself."
   ],
   "ask_me_before": [
    "Any email going out: I copy, review and click Send myself."
   ],
   "report_back": [
    "The 5 toughest emails in your inbox have warm, clear replies drafted and waiting for your review.",
    "10 minutes each morning or Tuesday/Thursday afternoons."
   ],
   "stop_if": [
    "An email has a suspicious link or an urgent payment request: stop and flag it to me first."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Pick 3 emails you have been procrastinating on and paste them into your helper.",
   "Step 2 (10 mins): Tell your helper in one casual sentence what you want to say (\"Tell Bob we can come Saturday, but only until 4pm\").",
   "Step 3 (10 mins): Copy the polished reply into your email app and hit send yourself."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Email Drafts\", paste the helper text, and say: \"Remember these as the rules for my Email Drafts helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "You are my Email Triage & Drafting Helper. When I share an email and tell you roughly how I want to respond, write a warm, natural reply that sounds like me — no stiff corporate jargon. Never send emails yourself.",
    "memberSteps": [
     "Open a side chat in Muse, paste the Email Drafts text, and say: \"Remember these as the rules for my Email Drafts helper. Never send email.\"",
     "Paste up to 3 emails you have been putting off, and say in one sentence what you want to say.",
     "Optional: connect Gmail and choose read-only, so Muse can find the emails itself but cannot send.",
     "Copy the reply into your email app, read it, and press Send yourself.",
     "Any time, without a schedule: open your Email Drafts side chat in Muse and say \"help me with today's emails\"."
    ],
    "willDo": [
     {
      "text": "Connect Gmail and choose whether Muse only reads mail or can also send.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/"
      ]
     },
     {
      "text": "Read and write permissions are separate where the service allows, and Muse asks before sending email.",
      "tag": "vendor-stated",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
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
      "text": "Whether Muse can save a reply as a draft inside Gmail is not documented; plan on copying the reply yourself.",
      "tag": "unverified",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://www.eesel.ai/blog/meta-muse-for-work"
      ]
     },
     {
      "text": "A sent email cannot be taken back, so a reviewer advises never choosing 'Always allow' for anything others will see; keep Gmail read-only here.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-work"
      ]
     },
     {
      "text": "Prompt injection, where text in an email or web page tries to steer the agent, is an open problem Meta acknowledges.",
      "tag": "reported",
      "sources": [
       "https://theneuron.ai/explainer-articles/how-to-get-started-with-meta-muse/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Press Send yourself in your email app.",
     "Check a suspicious link by going to the sender's own website, not by clicking.",
     "Pick which emails to share."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Email Drafts side chat in Muse and say \"help me with today's emails\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Email Drafts\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Email Drafts with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "You are my Email Triage & Drafting Helper. When I share an email and tell you roughly how I want to respond, write a warm, natural reply that sounds like me — no stiff corporate jargon. Never send emails yourself.",
    "memberSteps": [
     "Set up Email Drafts as a Project or a Skill in Grok (see setup), or paste the text at the start of a chat.",
     "Paste up to 3 emails and say in one sentence what you want to say. For a long newsletter, ask for 3 bullet points.",
     "Optional: connect Gmail (Settings > Connectors on the phone) so Grok can search and read your mail; drafting and sending are not documented for personal accounts.",
     "Copy the reply into your email app and press Send yourself.",
     "Any time, without a schedule: open your Email Drafts helper in Grok and say \"help me with today's emails\"."
    ],
    "willDo": [
     {
      "text": "Read access to Gmail (search and read) is the base connection, available to all Grok users.",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar.md",
       "https://docs.x.ai/grok/connectors.md"
      ]
     },
     {
      "text": "Run a scheduled automation each weekday morning to remind you of your email time.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Built-in skills on every account create Excel spreadsheets, Word documents and PDFs.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Gmail drafts and sending need write permissions that the docs say are 'enabled progressively by your organization's administrators'.",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar.md"
      ]
     },
     {
      "text": "Whether a personal Free or Plus account can let Grok create Gmail drafts is unverified; a live account check would settle it.",
      "tag": "unverified",
      "sources": [
       "https://docs.x.ai/grok/connectors/gmail-google-calendar.md"
      ]
     },
     {
      "text": "Automations triggered by incoming email are SuperGrok-only.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     }
    ],
    "memberDoesByHand": [
     "Press Send yourself in your email app.",
     "Check a suspicious link by going to the sender's own website."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Email Drafts helper in Grok and say \"help me with today's emails\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Email Drafts\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the daily check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "You are my Email Triage & Drafting Helper. When I share an email and tell you roughly how I want to respond, write a warm, natural reply that sounds like me — no stiff corporate jargon. Never send emails yourself.",
    "memberSteps": [
     "Create a Project called \"Email Drafts\" with the Email Drafts text, and paste 2 emails you wrote so it matches your tone.",
     "Paste up to 3 emails and say in one sentence what you want to say.",
     "On Plus and up: install the Gmail plugin so ChatGPT can find threads and save reply drafts in Gmail, and tell it \"draft only, never send\". On Free, keep pasting.",
     "Open Gmail, review the draft, and press Send yourself.",
     "Any time, without a schedule: open your \"Email Drafts\" project in ChatGPT and say \"help me with today's emails\"."
    ],
    "willDo": [
     {
      "text": "The Gmail plugin can search and triage threads, create reply drafts, and archive, label or trash messages when you explicitly ask.",
      "tag": "vendor-stated",
      "sources": [
       "https://learn.chatgpt.com/use-cases/manage-your-inbox"
      ]
     },
     {
      "text": "OpenAI's plan grid lists app connections from Plus up; Gmail actions 'depend on your plan and workspace settings'.",
      "tag": "vendor-stated",
      "sources": [
       "https://chatgpt.com/pricing",
       "https://learn.chatgpt.com/use-cases/manage-your-inbox"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "OpenAI's pages read do not say whether ChatGPT sends Gmail itself; TechRadar (June 2026) reports sending after an Allow or Deny prompt on the web for Plus, Pro, Business and Enterprise, not Free, Go or the phone and desktop apps.",
      "tag": "reported",
      "sources": [
       "https://techradar.com/ai-platforms-assistants/chatgpt/i-sent-an-email-without-opening-gmail-thanks-to-chatgpts-new-feature-then-i-found-the-catch"
      ]
     },
     {
      "text": "Whether Free and Go accounts can connect Gmail at all is not confirmed.",
      "tag": "unverified",
      "sources": [
       "https://chatgpt.com/pricing",
       "https://help.openai.com/en/articles/20001256-plugins-in-chatgpt"
      ]
     },
     {
      "text": "The Gmail plugin can move mail to Trash when asked; ask only for drafts.",
      "tag": "vendor-stated",
      "sources": [
       "https://learn.chatgpt.com/use-cases/manage-your-inbox"
      ]
     }
    ],
    "memberDoesByHand": [
     "Press Send yourself in Gmail.",
     "Check a suspicious link by going to the sender's own website.",
     "On Free, copy each reply into your email app."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Email Drafts\" project in ChatGPT and say \"help me with today's emails\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Email Drafts\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the daily check-in need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my Email Triage & Drafting Helper. When I share an email and tell you roughly how I want to respond, write a warm, natural reply that sounds like me — no stiff corporate jargon. Never send emails yourself.",
    "memberSteps": [
     "Create a Project called \"Email Drafts\" with the Email Drafts text, and paste 2 emails you wrote so it matches your voice.",
     "Paste up to 3 emails and say in one sentence what you want to say.",
     "Optional, on a computer: connect Gmail so Claude can read threads and save drafts. If Claude ever asks to send, say no.",
     "Open Gmail, review the draft, and press Send yourself.",
     "Any time, without a schedule: open your \"Email Drafts\" project in Claude and say \"help me with today's emails\"."
    ],
    "willDo": [
     {
      "text": "The Gmail connector can search and read mail, list saved drafts, and draft emails.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     },
     {
      "text": "Claude asks for approval before each send, reply or forward by default.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     },
     {
      "text": "Scheduled tasks (hourly, daily, weekly or weekdays) run in the cloud even when the computer is asleep, on Pro and up only; Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "The connector can also send, reply and forward; for this helper, decline every send request.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     },
     {
      "text": "The connector sees attachment names but not their contents.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     },
     {
      "text": "Anthropic's pages disagree on whether Free accounts can connect Google apps: 'all users', 'paid plans only' and 'one tool' all appear.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     }
    ],
    "memberDoesByHand": [
     "Press Send yourself in Gmail.",
     "Check a suspicious link by going to the sender's own website."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Email Drafts\" project in Claude and say \"help me with today's emails\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Email Drafts\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Email Drafts. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for a scheduled morning reminder (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my Email Triage & Drafting Helper. When I share an email and tell you roughly how I want to respond, write a warm, natural reply that sounds like me — no stiff corporate jargon. Never send emails yourself.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create the \"Email Drafts\" skill with the helper text, and paste 2 emails you wrote into its instructions so it matches your voice. In Instructions for Gemini, add: \"Never send email for me. Flag phishing links and urgent payment requests first.\"",
     "Optional: connect Gmail (Customize > Connectors; Gmail's 'Smart features in other Google products' must be on). Then type \"/\", pick Email Drafts, and ask: \"Find the 5 emails from this week that most need a reply.\" Or paste up to 3 emails yourself.",
     "Say in one sentence what you want to say. Turn the reply into a Gmail draft with Share & export > Draft in Gmail, then open Gmail, read it and press Send yourself.",
     "On Google AI Plus ($4.99) and up: \"Every weekday at 8am, remind me to do my Email Drafts check.\" On Free, set a phone alarm.",
     "Any time, without a schedule: in Gemini, type / and pick your Email Drafts skill, then say \"help me with today's emails\"."
    ],
    "willDo": [
     {
      "text": "In a normal chat Gemini can search and summarize Gmail and turn a reply into a Gmail draft (Share & export > Draft in Gmail); it cannot send from chat.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15229592",
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Gmail in a chat can search, summarize and find information once Gmail's 'Smart features in other Google products' setting is on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15229592"
      ]
     },
     {
      "text": "Connected Apps are added from Customize > Connectors > Add, or by typing '@' in a chat; they need Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "wontDo": [
     {
      "text": "Gemini can't read images in Gmail or count emails, so a message that is mostly a picture can be missed and a 'how many' answer can be wrong.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15229592"
      ]
     },
     {
      "text": "Task mode (Google AI Pro $19.99, experimental) can reply to and forward Gmail, asking before it sends. This helper never needs it; if you try it, say no to every send.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16596215",
       "https://support.google.com/gemini/answer/15229592",
       "https://gemini.google/subscriptions/"
      ]
     },
     {
      "text": "Google's pages don't say whether a scheduled action can search Gmail or Calendar on its own, so use the schedule as a reminder and do the check in a chat.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "memberDoesByHand": [
     "Press Send yourself in Gmail.",
     "Check a suspicious link by going to the sender's own website, not by clicking.",
     "Pick which emails to work on."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Email Drafts skill, then say \"help me with today's emails\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Chats are used for training by default after key personal information is removed; opt out in Settings > Data controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse",
      "https://muse.ai/terms"
     ]
    },
    {
     "text": "Muse builds pages about people in the member's life, refreshed hourly, so names and details shared here may land in memory.",
     "tag": "reported",
     "sources": [
      "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
      "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts"
     ]
    }
   ],
   "grok": [
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "For connected Gmail the docs say 'We do not train on your data' and 'Nothing is stored'.",
     "tag": "vendor-stated",
     "sources": [
      "https://docs.x.ai/grok/connectors/gmail-google-calendar.md"
     ]
    },
    {
     "text": "Grok Bot (Premium $30 and up) sends from its own email address, and email from background work waits as a draft until you press Send; use inside your own Gmail is not documented.",
     "tag": "vendor-stated",
     "sources": [
      "https://docs.x.ai/grok-bot/approvals-security-and-privacy",
      "https://docs.x.ai/grok-bot/get-started"
     ]
    },
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never press Share on a chat that holds personal details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Data from connected Google apps is not used to train OpenAI's general models, but Gmail text you paste into a chat can be.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq"
     ]
    },
    {
     "text": "With memory on, synced Gmail content may personalise answers; on Plus and Pro, Gmail can also be a memory source.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq",
      "https://help-lb.openai.com/en/articles/8590148"
     ]
    },
    {
     "text": "Free and Go show ads, and ads can use the current chat and, with memory on, past chats; ad personalisation can be turned off.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    }
   ],
   "claude": [
    {
     "text": "Raw content from connected apps is excluded from model training; text pasted into a chat may be included, depending on the Model Improvement setting.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training"
     ]
    },
    {
     "text": "Connected apps cannot be added from the phone app; set them up on the web or desktop app.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory"
     ]
    },
    {
     "text": "Duet drafts replies and sends only with approval, which fits this helper, but it is invite-only: a waitlist for US Pro or Max members.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
      "https://claude.com/resources/articles/claude-duet"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://www.eesel.ai/blog/meta-muse-for-work",
   "https://theneuron.ai/explainer-articles/how-to-get-started-with-meta-muse/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://docs.x.ai/grok/connectors/gmail-google-calendar.md",
   "https://docs.x.ai/grok/connectors.md",
   "https://x.ai/news/grok-automations",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://learn.chatgpt.com/use-cases/manage-your-inbox",
   "https://chatgpt.com/pricing",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://techradar.com/ai-platforms-assistants/chatgpt/i-sent-an-email-without-opening-gmail-thanks-to-chatgpts-new-feature-then-i-found-the-catch",
   "https://help.openai.com/en/articles/20001256-plugins-in-chatgpt",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/16596215",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://muse.ai/terms",
   "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
   "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts",
   "https://docs.x.ai/x-subscription/pricing",
   "https://docs.x.ai/grok-bot/approvals-security-and-privacy",
   "https://docs.x.ai/grok-bot/get-started",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq",
   "https://help-lb.openai.com/en/articles/8590148",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
   "https://claude.com/resources/articles/claude-duet",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15230597"
  ]
 },
 {
  "slug": "family-budget-tool",
  "title": "Family Budget Tool",
  "audience": "personal",
  "category": "Life admin",
  "version": 4,
  "goalInOneSentence": "I want a calm monthly picture of our household spending and upcoming big expenses without wrestling with complex spreadsheet formulas.",
  "experienceLevel": "Beginner",
  "whatDoneLooksLike": "A simple 4-bucket household plan (Essentials, Upcoming Projects, Fun/Travel, Savings) with clear monthly targets.",
  "checkInRhythm": "Monthly on the 1st of the month.",
  "contract": {
   "goal": "I want a calm monthly picture of our household spending and upcoming big expenses without wrestling with complex spreadsheet formulas.",
   "do": [
    "Help me organize my monthly fixed costs, everyday spending, and upcoming annual expenses into a simple, stress-free plan.",
    "Use plain math, clear tables, and zero judgment."
   ],
   "do_not": [
    "Never ask for bank account numbers, passwords, or brokerage logins.",
    "Do not give speculative investment picks; focus on practical household budgeting."
   ],
   "ask_me_before": [
    "Moving from budgeting into investments: no speculative picks, stay with practical household budgeting."
   ],
   "report_back": [
    "A simple 4-bucket household plan (Essentials, Upcoming Projects, Fun/Travel, Savings) with clear monthly targets.",
    "Monthly on the 1st of the month."
   ],
   "stop_if": [
    "I share an account number, password or brokerage login: stop and remind me to remove it."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Give your helper your rough monthly fixed bills and the big expenses coming up this year (holidays, car tires, trip).",
   "Step 2 (10 mins): Ask it to calculate how much to set aside each month so nothing catches you off guard.",
   "Step 3 (10 mins): Do a 5-minute monthly check-in to adjust as life changes."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Budget\", paste the helper text, and say: \"Remember these as the rules for my Budget helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "You are my calm Household Budget Helper. Help me organize my monthly fixed costs, everyday spending, and upcoming annual expenses into a simple, stress-free plan. Use plain math, clear tables, and zero judgment. Never ask for bank account numbers.",
    "memberSteps": [
     "Open a side chat in Muse, paste the Budget text, and say: \"Remember these as the rules for my Budget helper. Never ask for account numbers.\"",
     "Give your rough monthly fixed bills and this year's big expenses. Plain numbers only.",
     "Ask for the 4-bucket plan with monthly set-aside amounts as a spreadsheet, plus a short planning journal for projects and gifts.",
     "Ask Muse to remind you on the 1st of each month for your check-in.",
     "Any time, without a schedule: open your Budget side chat in Muse and say \"run my monthly budget check-in\"."
    ],
    "willDo": [
     {
      "text": "Create PDF, Word and spreadsheet files.",
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
     },
     {
      "text": "Keep memory you can inspect, edit and download, which suits a running planning journal.",
      "tag": "vendor-stated",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
       "https://www.meta.com/help/subscriptions/1021145227643680/"
      ]
     },
     {
      "text": "Muse has its own browser and can act on websites; this helper needs none of that, so never give it bank or brokerage logins.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/"
      ]
     },
     {
      "text": "Meta warns Muse 'may be inaccurate or take unexpected actions.'",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check the totals with a calculator.",
     "Move money between accounts yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Budget side chat in Muse and say \"run my monthly budget check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Budget\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Budget with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "You are my calm Household Budget Helper. Help me organize my monthly fixed costs, everyday spending, and upcoming annual expenses into a simple, stress-free plan. Use plain math, clear tables, and zero judgment. Never ask for bank account numbers.",
    "memberSteps": [
     "Set up Budget as a Project or a Skill in Grok (see setup), or paste the text at the start of a chat.",
     "Give your rough monthly bills and this year's big expenses. Plain numbers only.",
     "Ask for the 4-bucket plan as an Excel file, and ask Grok to compare your grocery and utility costs with local averages.",
     "In Automations, create a monthly automation on the 1st for your check-in.",
     "Any time, without a schedule: open your Budget helper in Grok and say \"run my monthly budget check-in\"."
    ],
    "willDo": [
     {
      "text": "Built-in skills on every account create Excel spreadsheets, Word documents and PDFs.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     },
     {
      "text": "Real-time web search on every plan, Free included.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Run a monthly automation at a set time with an email or app notification.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Grok 'may give confidently wrong information... Verify important answers.'",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "Grok had the worst citation accuracy in a 2025 Tow Center test; check one local average against your utility's own page.",
      "tag": "reported",
      "sources": [
       "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check the totals with a calculator.",
     "Move money between accounts yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Budget helper in Grok and say \"run my monthly budget check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Budget\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the monthly check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "You are my calm Household Budget Helper. Help me organize my monthly fixed costs, everyday spending, and upcoming annual expenses into a simple, stress-free plan. Use plain math, clear tables, and zero judgment. Never ask for bank account numbers.",
    "memberSteps": [
     "Create a Project called \"Budget\" and paste the Budget text as its instructions.",
     "Give your numbers and ask for the 4 buckets and monthly set-aside amounts in a clear table.",
     "Ask for a printable budget sheet: ChatGPT Work makes spreadsheets on every plan in the desktop app, and on Plus and up on the web and phone.",
     "On Plus and up, ask ChatGPT to remind you on the 1st of each month; on Free, set a phone reminder.",
     "Any time, without a schedule: open your \"Budget\" project in ChatGPT and say \"run my monthly budget check-in\"."
    ],
    "willDo": [
     {
      "text": "ChatGPT Work creates documents and spreadsheets: on every plan in the Mac or Windows desktop app, and on Plus and up on the web and phone.",
      "tag": "vendor-stated",
      "sources": [
       "https://openai.com/chatgpt-work/"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     },
     {
      "text": "Keep files and chats for this helper together in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It 'can even make up things like quotes or citations'; check every figure and deadline yourself.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth"
      ]
     },
     {
      "text": "Whether a task can repeat monthly is not stated in the pages read.",
      "tag": "unverified",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     },
     {
      "text": "Which download formats ChatGPT Work offers is not stated.",
      "tag": "unverified",
      "sources": [
       "https://help.openai.com/en/articles/20001278-creating-and-editing-documents-spreadsheets-and-presentations-with-chatgpt-work"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check the totals with a calculator.",
     "On Free, set your own monthly reminder."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Budget\" project in ChatGPT and say \"run my monthly budget check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Budget\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) to start it yourself (Anthropic's pages conflict on project instructions for Free); no Claude plan runs a monthly scheduled task, so the reminder is yours",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my calm Household Budget Helper. Help me organize my monthly fixed costs, everyday spending, and upcoming annual expenses into a simple, stress-free plan. Use plain math, clear tables, and zero judgment. Never ask for bank account numbers.",
    "memberSteps": [
     "Create a Project called \"Budget\" and paste the Budget text as its instructions.",
     "Give your rough monthly bills and this year's big expenses. Plain numbers only.",
     "Turn on file creation (Settings > Capabilities), ask for the 4-bucket plan as an Excel file, and ask for what-if versions, such as a renovation or a retirement trip.",
     "Set a phone reminder for the 1st and open the project then; scheduled tasks have no monthly option.",
     "Any time, without a schedule: open your \"Budget\" project in Claude and say \"run my monthly budget check-in\"."
    ],
    "willDo": [
     {
      "text": "Create Excel, Word and PDF files on every plan once file creation is on in Settings > Capabilities.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     },
     {
      "text": "Keep the budget files and chats together in a project; memory across chats is on by default.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://support.claude.com/en/articles/11817273"
      ]
     },
     {
      "text": "Two-way voice mode (beta) on every plan, on phone, desktop and web.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Scheduled tasks offer hourly, daily, weekly or weekdays; a monthly schedule is not listed, and Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Free usage limits vary with demand, so a long session can hit the limit.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8602283-about-free-claude-usage"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check the totals with a calculator.",
     "Set your own monthly reminder."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Budget\" project in Claude and say \"run my monthly budget check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": false,
       "fallback": "Put the 1st of each month on your own calendar; your helper runs the check-in whenever you open the project."
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": false,
     "runFallback": "Put the 1st of each month on your own calendar; your helper runs the check-in whenever you open the project."
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Budget\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Budget. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the monthly scheduled check-in (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my calm Household Budget Helper. Help me organize my monthly fixed costs, everyday spending, and upcoming annual expenses into a simple, stress-free plan. Use plain math, clear tables, and zero judgment. Never ask for bank account numbers.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create the \"Budget\" skill with the helper text (see setup). In Instructions for Gemini, add: \"Never ask for bank account numbers, passwords or brokerage logins, and don't give investment picks.\"",
     "In a chat, type \"/\" and pick Budget. Give your rough monthly bills and this year's big expenses, plain numbers only.",
     "Ask for the 4-bucket plan with monthly set-aside amounts in a table, and save it with Share & export > Export to Sheets.",
     "On Google AI Plus ($4.99) and up: \"On the 1st of every month at 9am, remind me to do my budget check-in.\" On Free, ask Gemini to add a Google Tasks reminder for next month's 1st, or set a phone reminder.",
     "Any time, without a schedule: in Gemini, type / and pick your Budget skill, then say \"run my monthly budget check-in\"."
    ],
    "willDo": [
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Google Tasks in Connected Apps can create tasks and reminders.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230285"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "wontDo": [
     {
      "text": "Whether a scheduled action can repeat on 'the 1st of every month' is not stated; Google's examples are daily, weekday and weekly times. Check the Scheduled page after you set it.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "Free mostly uses Flash-Lite with a 32k context; limits refresh every 5 hours up to a weekly cap.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17004136",
       "https://support.google.com/gemini/answer/16275805"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check the totals with a calculator.",
     "Move money between accounts yourself.",
     "On Free, add next month's reminder each month."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "monthly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Budget skill, then say \"run my monthly budget check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Chats are used for training by default after key personal information is removed; opt out in Settings > Data controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse",
      "https://muse.ai/terms"
     ]
    },
    {
     "text": "Meta says chats are not shared with its ad systems, but the App Store privacy label lists data used for third-party advertising.",
     "tag": "vendor-stated",
     "sources": [
      "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
      "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
     ]
    }
   ],
   "grok": [
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "Whether chats train Grok depends on 'Improve the Model' (Settings > Data controls), whose default is not documented; Private Chat (ghost icon) keeps a chat out of history and training.",
     "tag": "reported",
     "sources": [
      "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
     ]
    },
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never press Share on a chat that holds personal details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "No scheduled reminders on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
      "https://chatgpt.com/pricing"
     ]
    },
    {
     "text": "Free and Go show ads, and ads can use the current chat and, with memory on, past chats; ad personalisation can be turned off.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    },
    {
     "text": "Consumer chats 'may' be used to improve OpenAI's models; turn this off in Data Controls before sharing financial or personal details.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq"
     ]
    }
   ],
   "claude": [
    {
     "text": "Chats may be used for training depending on the Model Improvement setting; with it on, de-identified chats can be kept up to 5 years. Check Privacy Settings first.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
      "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data"
     ]
    },
    {
     "text": "Memory is on by default; 'Include sensitive topics in memory' is off by default.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/11817273"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "With Keep Activity on, activity can be used to improve Google services including AI models; with it off, chats are kept 72 hours.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/pricing",
   "https://x.ai/news/grok-automations",
   "https://help.x.com/en/using-x/about-grok",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://openai.com/chatgpt-work/",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://help.openai.com/en/articles/20001278-creating-and-editing-documents-spreadsheets-and-presentations-with-chatgpt-work",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/11817273",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/8602283-about-free-claude-usage",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/15230285",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/17004136",
   "https://muse.ai/terms",
   "https://docs.x.ai/x-subscription/pricing",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/15230597"
  ]
 },
 {
  "slug": "calendar-prep-agent",
  "title": "Calendar Prep Agent",
  "audience": "personal",
  "category": "Planning and travel",
  "version": 4,
  "goalInOneSentence": "Before any important doctor visit, financial meeting, or contractor walk-through, I want a 1-page prep sheet of what to bring and the best questions to ask.",
  "experienceLevel": "Beginner",
  "whatDoneLooksLike": "You walk into every appointment with 5 smart questions written down and every document you need in your folder.",
  "checkInRhythm": "The evening before any major appointment.",
  "contract": {
   "goal": "Before any important doctor visit, financial meeting, or contractor walk-through, I want a 1-page prep sheet of what to bring and the best questions to ask.",
   "do": [
    "When I tell you about an upcoming doctor visit, contractor estimate, or advisor meeting, help me prepare.",
    "List what documents or notes to bring.",
    "Give me the 5 smartest, clearest questions I should ask.",
    "List the red flags to listen for.",
    "Prepare questions for my doctor or advisor."
   ],
   "do_not": [
    "Never replace professional medical or legal advice.",
    "Never share my notes outside my login."
   ],
   "ask_me_before": [
    "Putting my notes anywhere other than under my own login."
   ],
   "report_back": [
    "Every document I need for my folder, and 5 smart questions written down on a 1-page prep sheet.",
    "The evening before any major appointment."
   ],
   "stop_if": [
    "A question needs a medical or legal answer: stop and tell me to ask my doctor or advisor."
   ]
  },
  "steps": [
   "Step 1 (10 mins): The day before an appointment, tell your helper who you are meeting and why.",
   "Step 2 (10 mins): Answer 3 quick questions from your helper about your goals or symptoms/concerns.",
   "Step 3 (10 mins): Print or save your 5-question checklist for the meeting."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Appointment Prep\", paste the helper text, and say: \"Remember these as the rules for my Appointment Prep helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "You are my Appointment Prep Helper. When I tell you about an upcoming doctor visit, contractor estimate, or advisor meeting, help me prepare: 1) What documents or notes to bring, 2) The 5 smartest, clearest questions I should ask, and 3) Red flags to listen for.",
    "memberSteps": [
     "Open a side chat in Muse for \"Appointment Prep\", paste the helper text, and ask Muse to remember it.",
     "The day before, tell Muse who you are meeting and why, then answer its 3 questions.",
     "Ask for a one-page prep sheet as a PDF with space to write answers by hand, and print it or save it to your phone.",
     "Optional: \"Remind me at 7pm the evening before each big appointment to review my prep sheet.\"",
     "Any time, without a schedule: open your Appointment Prep side chat in Muse and say \"help me prep for tomorrow's appointment\"."
    ],
    "willDo": [
     {
      "text": "Create PDF and Word documents (reported; Meta's Help Center article on artifacts could not be read).",
      "tag": "reported",
      "sources": [
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Connect Google Calendar; Meta lists it as a Muse connector.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/"
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
      "text": "Meta warns Muse 'may be inaccurate or take unexpected actions.'",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     },
     {
      "text": "Whether the Calendar connection can be limited to read only is not documented (Meta documents the read-or-send choice for email).",
      "tag": "unverified",
      "sources": [
       "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/",
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/"
      ]
     },
     {
      "text": "Photo upload in Muse is not confirmed; reading PDF, Word and text files is reported.",
      "tag": "unverified",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     }
    ],
    "memberDoesByHand": [
     "Write your answers on the printed sheet during the visit.",
     "Ask your doctor or advisor, not Muse, about anything medical or legal."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Appointment Prep side chat in Muse and say \"help me prep for tomorrow's appointment\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Appointment Prep\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Appointment Prep with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "You are my Appointment Prep Helper. When I tell you about an upcoming doctor visit, contractor estimate, or advisor meeting, help me prepare: 1) What documents or notes to bring, 2) The 5 smartest, clearest questions I should ask, and 3) Red flags to listen for.",
    "memberSteps": [
     "Set up Appointment Prep as a Project or Skill in Grok, or paste the text at the start of a chat.",
     "The day before, tell Grok who you are meeting and why. For a contractor, ask it to look up the company's reviews and licensing.",
     "Ask for the 5 questions and the bring list, then copy them into your phone's notes or print them.",
     "Optional: create a one-time Automation for the evening before that reminds you to review the list.",
     "Any time, without a schedule: open your Appointment Prep helper in Grok and say \"help me prep for tomorrow's appointment\"."
    ],
    "willDo": [
     {
      "text": "Real-time search of X posts and the web.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "Run a scheduled automation at a set time and notify the member in the app or by email.",
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
      "text": "Grok 'may give confidently wrong information'; check a contractor's license with your state's licensing board.",
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
     "Confirm any license or review finding at its source.",
     "Print or save the sheet yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Appointment Prep helper in Grok and say \"help me prep for tomorrow's appointment\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Appointment Prep\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the scheduled check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "You are my Appointment Prep Helper. When I tell you about an upcoming doctor visit, contractor estimate, or advisor meeting, help me prepare: 1) What documents or notes to bring, 2) The 5 smartest, clearest questions I should ask, and 3) Red flags to listen for.",
    "memberSteps": [
     "Create a Project called \"Appointment Prep\" and paste the helper text as its instructions.",
     "The day before, tell ChatGPT who you are meeting and why, and answer its 3 questions.",
     "If you feel nervous, tap the voice icon and practice the conversation out loud.",
     "On Plus and up, ask: \"Remind me at 7pm tomorrow to review my prep sheet.\" On Free, set your own phone alarm.",
     "Any time, without a schedule: open your \"Appointment Prep\" project in ChatGPT and say \"help me prep for tomorrow's appointment\"."
    ],
    "willDo": [
     {
      "text": "Voice on every plan with rolling daily allowances: Free limited, Go and Plus 3 hours.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/20001274-gpt-live-faq"
      ]
     },
     {
      "text": "Keep files and chats for this helper together in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It 'can even make up things like quotes or citations'; check anything important.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth"
      ]
     },
     {
      "text": "Free plans have no scheduled tasks.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     },
     {
      "text": "Whether Free and Go accounts can connect the Google Calendar app is not confirmed; OpenAI's plan grid lists app connections from Plus up.",
      "tag": "unverified",
      "sources": [
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "memberDoesByHand": [
     "Bring the documents yourself; ChatGPT only lists them.",
     "On Free, set your own reminder for the evening before."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Appointment Prep\" project in ChatGPT and say \"help me prep for tomorrow's appointment\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Appointment Prep\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) to start it yourself (Anthropic's pages conflict on project instructions for Free); no Claude plan runs a one-time evening-before scheduled task, so the reminder is yours",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my Appointment Prep Helper. When I tell you about an upcoming doctor visit, contractor estimate, or advisor meeting, help me prepare: 1) What documents or notes to bring, 2) The 5 smartest, clearest questions I should ask, and 3) Red flags to listen for.",
    "memberSteps": [
     "Create a Project called \"Appointment Prep\" and paste the helper text as its instructions.",
     "Upload your notes from your last three visits into the project and ask for a short timeline.",
     "The day before, tell Claude who you are meeting and why, then ask for the prep sheet as a PDF or Word file to print.",
     "Set a phone alarm for the evening before each appointment; Claude's scheduled tasks have no one-time option on any plan.",
     "Any time, without a schedule: open your \"Appointment Prep\" project in Claude and say \"help me prep for tomorrow's appointment\"."
    ],
    "willDo": [
     {
      "text": "Keep past visit notes as project files so each new chat in the project can use them.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Create Word and PDF files on every plan once file creation is turned on in Settings > Capabilities.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     },
     {
      "text": "Read Google Calendar events, shared calendars and availability once connected.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No scheduled reminders or check-ins on Free.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's pages disagree on whether Free accounts can connect Google apps: 'all users', 'paid plans only' and 'one tool' all appear.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     },
     {
      "text": "Connected apps cannot be added from the phone app; set them up on the web or desktop app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory"
      ]
     }
    ],
    "memberDoesByHand": [
     "Bring the documents yourself.",
     "On Free, set your own reminder for the evening before."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Appointment Prep\" project in Claude and say \"help me prep for tomorrow's appointment\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": false,
       "fallback": "Set a phone alarm for the evening before each appointment; your helper prepares the questions whenever you open the project."
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": false,
     "runFallback": "Set a phone alarm for the evening before each appointment; your helper prepares the questions whenever you open the project."
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Appointment Prep\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Appointment Prep. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for a scheduled weekly reminder (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my Appointment Prep Helper. When I tell you about an upcoming doctor visit, contractor estimate, or advisor meeting, help me prepare: 1) What documents or notes to bring, 2) The 5 smartest, clearest questions I should ask, and 3) Red flags to listen for. Only read my calendar; never create, change or delete events unless I ask.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create the \"Appointment Prep\" skill with the helper text, which includes \"Only read my calendar\". In Instructions for Gemini, add: \"Never give medical or legal answers; tell me to ask my doctor or advisor.\"",
     "Optional: connect Google Calendar (Customize > Connectors). There is no read-only setting, so the \"Only read my calendar\" line is the only guard. The day before, type \"/\", pick Appointment Prep, say who you are meeting and why, and answer its 3 questions.",
     "Ask for a one-page prep sheet and save it with Share & export > Export to Docs to print. If you feel nervous, practice the conversation out loud in Gemini Live.",
     "On Google AI Plus ($4.99) and up: \"Every Sunday at 6pm, remind me to check this week's appointments with Appointment Prep.\" On Free, ask Gemini to add a Google Tasks reminder for 7pm the evening before, or set a phone alarm.",
     "Any time, without a schedule: in Gemini, type / and pick your Appointment Prep skill, then say \"help me prep for tomorrow's appointment\"."
    ],
    "willDo": [
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Gemini Live voice conversation on all plans, plus a Listen button that reads a reply aloud.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Google Tasks in Connected Apps can create tasks and reminders.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230285"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "wontDo": [
     {
      "text": "Calendar in Connected Apps can read, create, reschedule, rename and delete events; there is no read-only mode, so a 'just look' rule can only be an instruction in the helper text.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Events Gemini creates while Live runs in the background can't be undone from Live.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15305236"
      ]
     },
     {
      "text": "Memory needs a Google AI plan, 18+, a personal account and the US, so on Free re-share past visit notes each time.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     }
    ],
    "memberDoesByHand": [
     "Bring the documents yourself; Gemini only lists them.",
     "Ask your doctor or advisor, not Gemini, about anything medical or legal.",
     "On Free, set your own reminder for the evening before."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Appointment Prep skill, then say \"help me prep for tomorrow's appointment\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Muse chats are used for training by default after key personal information is removed; opt out in Settings > Data Controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse",
      "https://muse.ai/terms"
     ]
    },
    {
     "text": "Muse builds pages about people in the member's life, refreshed hourly; health details shared here may land in memory.",
     "tag": "reported",
     "sources": [
      "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
      "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    }
   ],
   "grok": [
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never press Share on a chat that holds personal details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    },
    {
     "text": "Use Private Chat (ghost icon) or turn off 'Improve the Model' in Settings > Data controls if the member does not want chats used for training; the default is not documented.",
     "tag": "reported",
     "sources": [
      "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
     ]
    },
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Consumer chats on Free, Go, Plus and Pro 'may' be used to improve OpenAI's services; opting out applies going forward.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq"
     ]
    },
    {
     "text": "Data from a connected Google app is not used to train OpenAI's general models (feedback and pasted content excepted).",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq"
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
   "claude": [
    {
     "text": "Chats may be used for training depending on the member's Model Improvement setting; with it on, de-identified chats can be kept up to 5 years. Check Privacy Settings before sharing medical details.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
      "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data"
     ]
    },
    {
     "text": "Memory is on by default; 'Include sensitive topics in memory' is off by default.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/11817273"
     ]
    },
    {
     "text": "Duet's morning brief reviews email and calendar, so it could flag an upcoming appointment, but Duet is invite-only (US Pro or Max waitlist).",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://about.fb.com/ja/news/2026/10/muse-personal-ai-agent-launches-in-japan/amp/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://help.x.com/en/using-x/about-grok",
   "https://x.ai/news/grok-automations",
   "https://docs.x.ai/grok/connectors/gmail-google-calendar",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help.openai.com/en/articles/20001274-gpt-live-faq",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/15274899",
   "https://support.google.com/gemini/answer/15230285",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/15305236",
   "https://muse.ai/terms",
   "https://next.ink/260011/meta-muse-se-souvient-de-beaucoup-de-choses-sur-lutilisateur-mais-aussi-ses-proches/",
   "https://aiweekly.co/alerts/metas-muse-builds-hourly-dossiers-on-users-and-their-contacts",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://docs.x.ai/x-subscription/pricing",
   "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq",
   "https://help.openai.com/en/articles/10408842-google-app-for-chatgpt-data-controls-faq",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data",
   "https://support.claude.com/en/articles/11817273",
   "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/15230597"
  ]
 },
 {
  "slug": "meal-planner-grocery",
  "title": "Meal Planner with Grocery List",
  "audience": "personal",
  "category": "Family and home",
  "version": 4,
  "goalInOneSentence": "I want 4 or 5 easy, healthy dinners planned for the week with a grocery list organized by store aisle in under 10 minutes.",
  "experienceLevel": "Complete beginner",
  "whatDoneLooksLike": "A weekly dinner plan and an aisle-by-aisle grocery list on your phone before you head to Publix or Trader Joe’s.",
  "checkInRhythm": "Once a week before grocery shopping.",
  "contract": {
   "goal": "I want 4 or 5 easy, healthy dinners planned for the week with a grocery list organized by store aisle in under 10 minutes.",
   "do": [
    "Suggest simple, delicious dinners for my household using ingredients that overlap so nothing goes to waste.",
    "Once I approve the meals, build a single grocery list grouped by supermarket section.",
    "Always respect food allergies, sodium limits, or doctor-recommended diets."
   ],
   "do_not": [
    "Never order groceries automatically without my explicit checkout."
   ],
   "ask_me_before": [
    "Building the grocery list: I approve the meals first.",
    "Any grocery order: I do the checkout myself."
   ],
   "report_back": [
    "A weekly dinner plan and an aisle-by-aisle grocery list on my phone before I head to the store.",
    "Once a week before grocery shopping."
   ],
   "stop_if": [
    "A step would place a grocery order: stop and leave the checkout to me.",
    "A dinner would break an allergy, a sodium limit or a doctor-recommended diet: leave it out."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Tell your helper what ingredients you already have in the fridge that need using up.",
   "Step 2 (10 mins): Pick 4 dinners from the suggestions and ask for a consolidated grocery list sorted by Produce, Dairy, Meat, and Pantry."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Meal Planner\", paste the helper text, and say: \"Remember these as the rules for my Meal Planner helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "You are my practical Meal Planner. Suggest simple, delicious dinners for my household using ingredients that overlap so nothing goes to waste. Once I approve the meals, build a single grocery list grouped by supermarket section.",
    "memberSteps": [
     "Open a side chat in Muse for \"Meal Planner\", paste the helper text, and add your allergies, diet limits and how many you cook for.",
     "Say: \"Remember my family's favorite recipes as one collection,\" and list them over time.",
     "Each week, list what needs using up, pick 4 dinners, and ask for the list sorted by Produce, Dairy, Meat and Pantry.",
     "If Muse offers to buy anything, say no; you shop or check out yourself.",
     "Any time, without a schedule: open your Meal Planner side chat in Muse and say \"plan this week's dinners\"."
    ],
    "willDo": [
     {
      "text": "Muse keeps memory in the member's own cloud computer, where it can be inspected, edited and downloaded.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Every purchase needs a human to approve it; actions are gated by Meta's approval layer.",
      "tag": "vendor-stated",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Create PDF and Word documents (reported; Meta's Help Center article on artifacts could not be read).",
      "tag": "reported",
      "sources": [
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "An Instacart connection was announced for Muse at Connect (September 2026) as coming soon; it was not confirmed live as of October 1.",
      "tag": "reported",
      "sources": [
       "https://techcrunch.com/2026/09/23/everything-new-coming-to-metas-ai-agent-muse/?type=AI",
       "https://presenc.ai/research/meta-muse-connectors-partner-tracker-2026"
      ]
     },
     {
      "text": "Photo upload in Muse is not confirmed; reading PDF, Word and text files is reported.",
      "tag": "unverified",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Meta warns Muse 'may be inaccurate or take unexpected actions.'",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check every recipe against allergies yourself.",
     "Shop or check out yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Meal Planner side chat in Muse and say \"plan this week's dinners\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Meal Planner\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Meal Planner with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "You are my practical Meal Planner. Suggest simple, delicious dinners for my household using ingredients that overlap so nothing goes to waste. Once I approve the meals, build a single grocery list grouped by supermarket section.",
    "memberSteps": [
     "Set up Meal Planner as a Project or Skill in Grok, or paste the text with your allergies and diet limits at the start of a chat.",
     "Snap a photo of your fridge, then pick 4 dinners and ask for the list sorted by store section.",
     "Mid-recipe and out of something? Open voice mode and ask for a substitute.",
     "Optional: a weekly Automation before your shopping day that asks what needs using up.",
     "Any time, without a schedule: open your Meal Planner helper in Grok and say \"plan this week's dinners\"."
    ],
    "willDo": [
     {
      "text": "Read uploaded photos and files (up to 150 MB per file).",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Voice mode on Free.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Run a scheduled automation at a set time and notify the member in the app or by email.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No grocery-store connector appears in Grok's documented connector list, so Grok cannot fill or order a cart for you.",
      "tag": "unverified",
      "sources": [
       "https://docs.x.ai/grok/connectors.md"
      ]
     },
     {
      "text": "Grok 'may give confidently wrong information... Verify important answers.'",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check every substitute against allergies yourself.",
     "Shop or check out yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Meal Planner helper in Grok and say \"plan this week's dinners\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Meal Planner\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the weekly check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "You are my practical Meal Planner. Suggest simple, delicious dinners for my household using ingredients that overlap so nothing goes to waste. Once I approve the meals, build a single grocery list grouped by supermarket section.",
    "memberSteps": [
     "Create a Project called \"Meal Planner\" with the helper text, and say: \"Remember our allergies and diet limits\" so it carries over.",
     "Snap a photo of your open fridge and ask: \"What 3 dinners can I make with this?\"",
     "Pick 4 dinners and ask for one grocery list sorted by Produce, Dairy, Meat and Pantry.",
     "Optional: the Instacart app can turn the list into a cart for you to review; you choose whether to check out.",
     "Any time, without a schedule: open your \"Meal Planner\" project in ChatGPT and say \"plan this week's dinners\"."
    ],
    "willDo": [
     {
      "text": "Ask ChatGPT to remember a specific fact; view, edit or delete saved memories in Settings.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8590148"
      ]
     },
     {
      "text": "The Instacart app in ChatGPT builds a cart from local stores for review, and the member pays only if they choose to check out.",
      "tag": "vendor-stated",
      "sources": [
       "https://openai.com/index/instacart-partnership",
       "https://company.instacart.com/pressreleases/instacart-app-launches-in-openai-chatgpt"
      ]
     },
     {
      "text": "Keep files and chats for this helper together in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Which ChatGPT plans and countries get the Instacart app is not stated; OpenAI says app availability varies by plan and region.",
      "tag": "unverified",
      "sources": [
       "https://help.openai.com/en/articles/20001256-plugins-in-chatgpt",
       "https://company.instacart.com/pressreleases/instacart-app-launches-in-openai-chatgpt"
      ]
     },
     {
      "text": "OpenAI said in March 2026 that Instant Checkout is 'moving to apps', so the in-chat checkout flow may change.",
      "tag": "reported",
      "sources": [
       "https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/"
      ]
     },
     {
      "text": "Free allows 3 file uploads per day; images up to 20 MB.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check every recipe against allergies yourself.",
     "Review and pay for any cart yourself, or shop in person."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Meal Planner\" project in ChatGPT and say \"plan this week's dinners\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Meal Planner\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the weekly check-in need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my practical Meal Planner. Suggest simple, delicious dinners for my household using ingredients that overlap so nothing goes to waste. Once I approve the meals, build a single grocery list grouped by supermarket section.",
    "memberSteps": [
     "Create a Project called \"Meal Planner\" with the helper text, your allergies, diet limits and family recipes as project files.",
     "Each week, tell Claude what needs using up, pick 4 dinners, and ask for the list sorted by store section.",
     "Ask Claude to cut a family recipe down to 2 portions when you need it.",
     "Optional (US): connect Instacart on the web or desktop app to build a cart; finish the order yourself in Instacart.",
     "Any time, without a schedule: open your \"Meal Planner\" project in Claude and say \"plan this week's dinners\"."
    ],
    "willDo": [
     {
      "text": "The Instacart connector builds a grocery cart from nearby stores that syncs to the member's Instacart account; it is US only, on mobile and web.",
      "tag": "vendor-stated",
      "sources": [
       "https://company.instacart.com/updates/instacart-is-now-available-in-claude"
      ]
     },
     {
      "text": "Memory is on by default on Free, Pro and Max; tell Claude to remember, change or forget something, or edit it in Settings > Your Claude.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     },
     {
      "text": "Read uploaded photos and PDFs (up to 500 MB per file, 20 files per chat).",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8241126-upload-files-to-claude"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Instacart's page says the member picks up the cart in Instacart's app or website to order; whether Claude can check out is not stated.",
      "tag": "unverified",
      "sources": [
       "https://company.instacart.com/updates/instacart-is-now-available-in-claude"
      ]
     },
     {
      "text": "Anthropic's pages disagree on whether Free accounts can connect Google apps: 'all users', 'paid plans only' and 'one tool' all appear.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     },
     {
      "text": "Connected apps cannot be added from the phone app; set them up on the web or desktop app.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check every recipe against allergies yourself.",
     "Place any order yourself in Instacart."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Meal Planner\" project in Claude and say \"plan this week's dinners\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Meal Planner\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Meal Planner. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the scheduled check-in (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my practical Meal Planner. Suggest simple, delicious dinners for my household using ingredients that overlap so nothing goes to waste. Once I approve the meals, build a single grocery list grouped by supermarket section.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create a Meal Planner skill with the helper text, and add your allergies, diet limits and how many you cook for to the same instructions.",
     "Each week, type \"/\" and pick Meal Planner, snap a photo of your fridge or list what needs using up, and pick 4 dinners.",
     "Once you approve the dinners, ask for one list sorted by Produce, Dairy, Meat and Pantry, and say \"Add this to a Keep list called Groceries\" so it is on your phone at the store.",
     "On Google AI Plus ($4.99) and up: ask \"Every Saturday at 9am, ask me what needs using up and suggest 5 dinners.\" On Free, set a weekly phone reminder and open the skill yourself.",
     "Any time, without a schedule: in Gemini, type / and pick your Meal Planner skill, then say \"plan this week's dinners\"."
    ],
    "willDo": [
     {
      "text": "Up to 10 files per prompt, 100 MB each; reads photos of letters.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14903178",
       "https://support.google.com/gemini/answer/13594961"
      ]
     },
     {
      "text": "Keep in Connected Apps creates notes and lists and adds items to an existing list.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230597"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     },
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "What the Instacart connected app can do inside Gemini (for example whether it builds a cart) is not described in the pages read; treat it as untested.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/13695044",
       "https://support.google.com/gemini/table/17434654"
      ]
     },
     {
      "text": "Keep can't add images or share notes from Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230597"
      ]
     },
     {
      "text": "Memory needs a Google AI plan, 18+, a personal account and the US.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check every recipe against allergies and diet limits yourself.",
     "Shop or check out yourself; this helper never places an order.",
     "On Free, open the skill each week yourself."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "weekly",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Meal Planner skill, then say \"plan this week's dinners\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Sources conflict on whether a payment card is needed to start Muse on the free tier: TechCrunch says yes, Engadget says a card is linked only for purchases.",
     "tag": "reported",
     "sources": [
      "https://techcrunch.com/?p=3161372",
      "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/"
     ]
    },
    {
     "text": "Muse chats are used for training by default after key personal information is removed; opt out in Settings > Data Controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse",
      "https://muse.ai/terms"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    }
   ],
   "grok": [
    {
     "text": "Grok Bot (Premium $30 and up, separate app) has a purchase flow that needs the member's approval; keep this helper in the regular Grok app.",
     "tag": "reported",
     "sources": [
      "https://patchbot.io/games/grok",
      "https://docs.x.ai/grok-bot/get-started"
     ]
    },
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "Projects and Skills setup is undocumented by the vendor; this layer is the weakest of the four.",
     "tag": "unverified",
     "sources": [
      "https://docs.x.ai/grok/faq"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Consumer chats on Free, Go, Plus and Pro 'may' be used to improve OpenAI's services; opting out applies going forward.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq"
     ]
    },
    {
     "text": "Free and Go show ads; no ads appear on health topics.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    },
    {
     "text": "Free plans have no scheduled tasks.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
      "https://chatgpt.com/pricing"
     ]
    }
   ],
   "claude": [
    {
     "text": "Duet can pay with Link or Shop Pay one-time cards after approval in the wallet app; it is invite-only (US Pro or Max waitlist), and this template still needs the member's own checkout.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
      "https://claude.com/resources/articles/claude-duet"
     ]
    },
    {
     "text": "Chats may be used for training depending on the member's Model Improvement setting; with it on, de-identified chats can be kept up to 5 years. Check Privacy Settings before sharing medical details.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
      "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://techcrunch.com/2026/09/23/everything-new-coming-to-metas-ai-agent-muse/?type=AI",
   "https://presenc.ai/research/meta-muse-connectors-partner-tracker-2026",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/pricing",
   "https://x.ai/news/grok-automations",
   "https://docs.x.ai/grok/connectors.md",
   "https://help.x.com/en/using-x/about-grok",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help-lb.openai.com/en/articles/8590148",
   "https://openai.com/index/instacart-partnership",
   "https://company.instacart.com/pressreleases/instacart-app-launches-in-openai-chatgpt",
   "https://help.openai.com/en/articles/20001256-plugins-in-chatgpt",
   "https://skift.com/2026/03/05/openai-chatgpt-checkout-walkback/",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://company.instacart.com/updates/instacart-is-now-available-in-claude",
   "https://support.claude.com/en/articles/11817273",
   "https://support.claude.com/en/articles/8241126-upload-files-to-claude",
   "https://support.claude.com/en/articles/10166901-use-google-workspace-connectors",
   "https://support.claude.com/en/articles/11724452-browsing-and-connecting-to-tools-from-the-directory",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14903178",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/15230597",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/table/17434654",
   "https://techcrunch.com/?p=3161372",
   "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/",
   "https://muse.ai/terms",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://patchbot.io/games/grok",
   "https://docs.x.ai/grok-bot/get-started",
   "https://docs.x.ai/x-subscription/pricing",
   "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
   "https://claude.com/resources/articles/claude-duet",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592"
  ]
 },
 {
  "slug": "pantry-tracker",
  "title": "Pantry Tracker",
  "audience": "personal",
  "category": "Family and home",
  "version": 4,
  "goalInOneSentence": "I want to know what staples are in my pantry and freezer so I stop buying a fourth jar of cumin and use food before it expires.",
  "experienceLevel": "Beginner",
  "whatDoneLooksLike": "A clean inventory of your freezer and pantry staples, plus quick alerts on what to use up this month.",
  "checkInRhythm": "Quick 5-minute update twice a month.",
  "contract": {
   "goal": "I want to know what staples are in my pantry and freezer so I stop buying a fourth jar of cumin and use food before it expires.",
   "do": [
    "Keep an organized list of what I have in my pantry, spice cabinet, and freezer.",
    "When I ask \"Do I have chicken broth?\", check our list.",
    "Remind me what needs to be used soon.",
    "Always advise me to check smell and appearance for food safety."
   ],
   "do_not": [
    "Never call food safe from the list alone."
   ],
   "ask_me_before": [
    "Calling anything safe to eat: I check its smell and appearance first."
   ],
   "report_back": [
    "A clean inventory of my freezer and pantry staples, plus quick alerts on what to use up this month.",
    "A quick 5-minute update twice a month."
   ],
   "stop_if": [
    "I ask whether food is still good: tell me to check its smell and appearance before anything else."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Open voice mode or snap 2 photos of your pantry shelves and freezer.",
   "Step 2 (10 mins): Have your helper list everything by category and flag items nearing expiration."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Pantry Tracker\", paste the helper text, and say: \"Remember these as the rules for my Pantry Tracker helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "You are my Kitchen & Pantry Tracker. Keep an organized list of what I have in my pantry, spice cabinet, and freezer. When I ask \"Do I have chicken broth?\", check our list and remind me what needs to be used soon.",
    "memberSteps": [
     "Open a side chat in Muse for \"Pantry Tracker\", paste the helper text, and ask Muse to keep the list as one saved file.",
     "Type or dictate what is on each shelf and in the freezer; ask Muse to sort it by category with dates.",
     "Ask: \"On the 1st and 15th, remind me to update my pantry list and tell me what to use up.\"",
     "Every so often, ask Muse to show you the whole list so you can fix mistakes.",
     "Any time, without a schedule: open your Pantry Tracker side chat in Muse and say \"update my pantry list\"."
    ],
    "willDo": [
     {
      "text": "Muse keeps memory in the member's own cloud computer, where it can be inspected, edited and downloaded.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Muse has its own cloud computer with a file system, which suits keeping one running list.",
      "tag": "vendor-stated",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
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
      "text": "Meta demonstrated a Muse voice mode at Connect 2026 without a release date; whether it is live is not confirmed.",
      "tag": "vendor-stated",
      "sources": [
       "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/"
      ]
     },
     {
      "text": "Photo upload in Muse is not confirmed; reading PDF, Word and text files is reported.",
      "tag": "unverified",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Our inference, not tested: Muse may summarize instead of keeping every item, so check the list yourself.",
      "tag": "unverified",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-memory-md-remembers-view-edit-delete-2026/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Use your phone keyboard's dictation to talk to Muse in the kitchen.",
     "Smell and look at food before using it."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Pantry Tracker side chat in Muse and say \"update my pantry list\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Pantry Tracker\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Pantry Tracker with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "You are my Kitchen & Pantry Tracker. Keep an organized list of what I have in my pantry, spice cabinet, and freezer. When I ask \"Do I have chicken broth?\", check our list and remind me what needs to be used soon.",
    "memberSteps": [
     "Set up Pantry Tracker as a Project or Skill in Grok, or paste the helper text at the start of a chat.",
     "Open voice mode, or snap 2 photos of your shelves and freezer, and ask for a list by category with items to use soon.",
     "Ask Grok to give you the full list each time; save it in your phone's notes and paste it in at the next update.",
     "Optional: two monthly Automations (the 1st and the 15th) for your update reminder.",
     "Any time, without a schedule: open your Pantry Tracker helper in Grok and say \"update my pantry list\"."
    ],
    "willDo": [
     {
      "text": "Voice mode on Free.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Read uploaded photos and files (up to 150 MB per file).",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Run a scheduled automation at a set time and notify the member in the app or by email.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "A 'Personalize Grok with your conversation history' memory toggle is reported in Settings > Data controls; its plan gate is not documented.",
      "tag": "reported",
      "sources": [
       "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
      ]
     },
     {
      "text": "Grok 'may give confidently wrong information'; check freezer storage times against a food-safety source.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     }
    ],
    "memberDoesByHand": [
     "Keep the latest list in your phone's notes.",
     "Smell and look at food before using it."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Pantry Tracker helper in Grok and say \"update my pantry list\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Pantry Tracker\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the scheduled check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "You are my Kitchen & Pantry Tracker. Keep an organized list of what I have in my pantry, spice cabinet, and freezer. When I ask \"Do I have chicken broth?\", check our list and remind me what needs to be used soon.",
    "memberSteps": [
     "Create a Project called \"Pantry Tracker\" with the helper text, and keep every pantry chat inside it.",
     "Tap the voice icon and talk through your freezer hands-free, or upload 2 shelf photos.",
     "Say: \"Remember my pantry list,\" and ask for the full list at the end of each update so you can save a copy.",
     "On Plus and up, ask: \"On the 1st and 15th, remind me to update my pantry.\" On Free, set a phone reminder.",
     "Any time, without a schedule: open your \"Pantry Tracker\" project in ChatGPT and say \"update my pantry list\"."
    ],
    "willDo": [
     {
      "text": "Voice on every plan with rolling daily allowances: Free limited, Go and Plus 3 hours.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/20001274-gpt-live-faq"
      ]
     },
     {
      "text": "Ask ChatGPT to remember a specific fact; view, edit or delete saved memories in Settings.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8590148"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Saved memories have a capacity with no published number; Plus and Pro get automatic memory management to avoid 'memory full'.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8590148"
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
      "text": "Free allows 3 file uploads per day; images up to 20 MB.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
      ]
     }
    ],
    "memberDoesByHand": [
     "Keep a saved copy of the latest list.",
     "Smell and look at food before using it."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Pantry Tracker\" project in ChatGPT and say \"update my pantry list\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Pantry Tracker\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) to start it yourself (Anthropic's pages conflict on project instructions for Free); no Claude plan runs a twice-monthly scheduled task, so the reminder is yours",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my Kitchen & Pantry Tracker. Keep an organized list of what I have in my pantry, spice cabinet, and freezer. When I ask \"Do I have chicken broth?\", check our list and remind me what needs to be used soon.",
    "memberSteps": [
     "Create a Project called \"Pantry Tracker\" with the helper text; if you also use Meal Planner, keep both in this one project so they share memory.",
     "Open voice mode on your phone and talk through your shelves, or upload 2 photos.",
     "Ask: \"Remember this as my pantry list,\" and ask for the full list after each update.",
     "Set two repeating phone reminders for the 1st and the 15th; Claude's scheduled tasks have no twice-a-month option on any plan.",
     "Any time, without a schedule: open your \"Pantry Tracker\" project in Claude and say \"update my pantry list\"."
    ],
    "willDo": [
     {
      "text": "Two-way voice mode (beta) on every plan, on phone, desktop and web.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     },
     {
      "text": "Each project has its own memory: inside a project Claude uses that project's memory plus non-project memory, not other projects'.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     },
     {
      "text": "Read uploaded photos and PDFs (up to 500 MB per file, 20 files per chat).",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8241126-upload-files-to-claude"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Searching past chats is on paid plans only (Pro and up).",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     },
     {
      "text": "No scheduled reminders or check-ins on Free.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "How much item-level detail memory keeps is not stated, so a long list may be summarized.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     }
    ],
    "memberDoesByHand": [
     "Keep a saved copy of the latest list.",
     "Smell and look at food before using it."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Pantry Tracker\" project in Claude and say \"update my pantry list\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": false,
       "fallback": "Set two repeating phone reminders for the 1st and the 15th; your helper updates the list whenever you open the project."
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": false,
     "runFallback": "Set two repeating phone reminders for the 1st and the 15th; your helper updates the list whenever you open the project."
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Pantry Tracker\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Pantry Tracker. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the scheduled check-in (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my Kitchen & Pantry Tracker. Keep an organized list of what I have in my pantry, spice cabinet, and freezer. When I ask \"Do I have chicken broth?\", check our list and remind me what needs to be used soon.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create a Pantry Tracker skill with the helper text.",
     "Upload 2 photos of your shelves and freezer (or talk them through in Gemini Live on your phone), then say \"Make a Keep note called Pantry with everything, by category, and flag what to use this month.\"",
     "When you ask \"Do I have chicken broth?\", ask it to check the Pantry note, and still smell and look at any food before you use it.",
     "On Google AI Plus ($4.99) and up: ask \"On the 1st and 15th at 10am, remind me to update my pantry list.\" On Free, set a phone reminder twice a month.",
     "Any time, without a schedule: in Gemini, type / and pick your Pantry Tracker skill, then say \"update my pantry list\"."
    ],
    "willDo": [
     {
      "text": "Up to 10 files per prompt, 100 MB each; reads photos of letters.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14903178",
       "https://support.google.com/gemini/answer/13594961"
      ]
     },
     {
      "text": "Keep in Connected Apps creates notes and lists and adds items to an existing list.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230597"
      ]
     },
     {
      "text": "Gemini Live voice conversation on all plans, plus a Listen button that reads a reply aloud.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Connected Apps that work inside Gemini Live include Keep, Tasks and Calendar.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "wontDo": [
     {
      "text": "Google's Keep page says Gemini can add items to a list; whether it can remove or tick off items is not stated.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/15230597"
      ]
     },
     {
      "text": "Whether a skill's rules apply inside a Gemini Live voice chat is not stated by Google.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/17094296",
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Memory needs a Google AI plan, 18+, a personal account and the US.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     }
    ],
    "memberDoesByHand": [
     "Smell and look at food before using it; the list never says food is safe.",
     "Fix the Keep note yourself when items are used up, if Gemini can't remove them.",
     "On Free, set your own twice-a-month reminder."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": true,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Pantry Tracker skill, then say \"update my pantry list\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Persistent-instruction path (Soul) is reported, not vendor-documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
     ]
    }
   ],
   "grok": [
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "Projects and Skills setup is undocumented by the vendor; this layer is the weakest of the four.",
     "tag": "unverified",
     "sources": [
      "https://docs.x.ai/grok/faq"
     ]
    },
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never press Share on a chat that holds personal details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Read aloud now sits in the overflow menu under a reply, which beginners may not find.",
     "tag": "reported",
     "sources": [
      "https://community.openai.com/t/read-aloud-feature-hidden/1393959"
     ]
    },
    {
     "text": "Free plans have no scheduled tasks.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
      "https://chatgpt.com/pricing"
     ]
    }
   ],
   "claude": [
    {
     "text": "A tap-to-hear read-aloud button for a reply is not documented.",
     "tag": "unverified",
     "sources": [
      "https://support.claude.com/en/articles/11101966-use-voice-mode"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://smartscope.blog/en/blog/meta-muse-memory-md-remembers-view-edit-delete-2026/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/pricing",
   "https://x.ai/news/grok-automations",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://help.x.com/en/using-x/about-grok",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help.openai.com/en/articles/20001274-gpt-live-faq",
   "https://help-lb.openai.com/en/articles/8590148",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.claude.com/en/articles/11817273",
   "https://support.claude.com/en/articles/8241126-upload-files-to-claude",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14903178",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/15230597",
   "https://support.google.com/gemini/answer/15274899",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://docs.x.ai/x-subscription/pricing",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://community.openai.com/t/read-aloud-feature-hidden/1393959",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592"
  ]
 },
 {
  "slug": "morning-brief-topics",
  "title": "Morning Brief on Chosen Topics",
  "audience": "personal",
  "category": "Staying informed",
  "version": 4,
  "goalInOneSentence": "I want a clean written morning digest covering my town, my hobbies, and the world events I care about — in 5 minutes flat.",
  "experienceLevel": "Complete beginner",
  "whatDoneLooksLike": "A calm, well-formatted morning newsletter written just for one reader: you.",
  "checkInRhythm": "Every morning or weekday mornings.",
  "contract": {
   "goal": "I want a clean written morning digest covering my town, my hobbies, and the world events I care about — in 5 minutes flat.",
   "do": [
    "Prepare my personalized Morning Written Brief.",
    "Cover each of my chosen topics in 3 clear, factual bullet points with source links.",
    "Keep the tone calm, informative, and free of hype."
   ],
   "do_not": [
    "Never push partisan outrage or clickbait."
   ],
   "ask_me_before": [
    "Adding a topic I did not choose."
   ],
   "report_back": [
    "A calm, well-formatted morning newsletter written just for me.",
    "Every morning or weekday mornings."
   ],
   "stop_if": [
    "An item has no source link to the original article: leave it out."
   ]
  },
  "steps": [
   "Step 1 (10 mins): List your topics (e.g., Tallahassee city commission, college baseball, national parks, breakthroughs in medicine).",
   "Step 2 (10 mins): Set how long you want it to be (e.g., \"3 bullet points per topic\")."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Morning Brief\", paste the helper text, and say: \"Remember these as the rules for my Morning Brief helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "Prepare my personalized Morning Written Brief. Cover each of my chosen topics in 3 clear, factual bullet points with source links. Keep the tone calm, informative, and free of hype.",
    "memberSteps": [
     "Open a side chat in Muse for \"Morning Brief\", paste the helper text, and list your 3 to 5 topics.",
     "Tell Muse: \"Every weekday at 7am, give me my Morning Brief, 3 bullets per topic, each with a source link.\"",
     "Ask for a clean, simple layout with no images or ads, and read it with your coffee.",
     "Any time, without a schedule: open your Morning Brief side chat in Muse and say \"give me my morning brief\"."
    ],
    "willDo": [
     {
      "text": "Browse the web for current information.",
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
     },
     {
      "text": "Produce 'rich, interactive outputs' as well as chat replies.",
      "tag": "vendor-stated",
      "sources": [
       "https://introducing.muse.ai/"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No citations by default; the instructions must ask for source links.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
       "https://www.meta.com/help/subscriptions/1021145227643680/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Open one source link a day until you trust the brief.",
     "Refresh your topics when they stop fitting."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Morning Brief side chat in Muse and say \"give me my morning brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not waiting for you each morning."
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Morning Brief\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Morning Brief with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "Prepare my personalized Morning Written Brief. Cover each of my chosen topics in 3 clear, factual bullet points with source links. Keep the tone calm, informative, and free of hype.",
    "memberSteps": [
     "Go to Automations > New Automation: Daily or Weekdays, 7:00 AM your time, app or email notification, with the helper text and your topics. Use Run now to test.",
     "Name the local reporters or sports writers you trust so Grok follows them on X for you.",
     "Check one source link a day until you trust it.",
     "Any time, without a schedule: open your Morning Brief helper in Grok and say \"give me my morning brief\"."
    ],
    "willDo": [
     {
      "text": "Daily automations at a set time with app or email notification; xAI's own example is a morning brief.",
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
     }
    ],
    "wontDo": [
     {
      "text": "Worst citation accuracy of 8 AI search tools in the Tow Center study (94% wrong) and confident errors on breaking news.",
      "tag": "reported",
      "sources": [
       "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
       "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting"
      ]
     },
     {
      "text": "Our inference, not tested: pulling from X posts may bring in the outrage the member wants to avoid, so the 'no outrage or clickbait' rule must stay in the text.",
      "tag": "unverified",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     }
    ],
    "memberDoesByHand": [
     "Verify important items at the source.",
     "Trim topics that keep pulling in heated posts."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Morning Brief helper in Grok and say \"give me my morning brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not waiting for you each morning."
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Morning Brief\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the daily check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "Prepare my personalized Morning Written Brief. Cover each of my chosen topics in 3 clear, factual bullet points with source links. Keep the tone calm, informative, and free of hype.",
    "memberSteps": [
     "Create a Project called \"Morning Brief\" with the helper text and your topics.",
     "On Plus and up, ask: \"Every weekday at 7am, prepare my Morning Brief.\" You get a push notification.",
     "On Free, open the project each morning and ask for today's brief.",
     "Any time, without a schedule: open your \"Morning Brief\" project in ChatGPT and say \"give me my morning brief\"."
    ],
    "willDo": [
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     },
     {
      "text": "Search the web (all plans).",
      "tag": "vendor-stated",
      "sources": [
       "https://chatgpt.com/pricing/"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "It 'can even make up things like quotes or citations'; check anything important.",
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
     "Spot-check source links.",
     "On Free, start the brief yourself each morning."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Morning Brief\" project in ChatGPT and say \"give me my morning brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not waiting for you each morning."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Morning Brief\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the daily check-in need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "Prepare my personalized Morning Written Brief. Cover each of my chosen topics in 3 clear, factual bullet points with source links. Keep the tone calm, informative, and free of hype.",
    "memberSteps": [
     "Create a Project called \"Morning Brief\" with the helper text and your topics.",
     "On Pro and up, set a scheduled task: \"Every weekday at 7am, prepare my Morning Brief with a source link for each item.\"",
     "For a hard policy or science story, ask for a short background explainer; Research mode on Pro and up digs deeper.",
     "On Free, open the project each morning and ask for today's brief.",
     "Any time, without a schedule: open your \"Morning Brief\" project in Claude and say \"give me my morning brief\"."
    ],
    "willDo": [
     {
      "text": "Search the web on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Scheduled tasks (hourly, daily, weekly or weekdays) run in the cloud even when the computer is asleep, on Pro and up only; Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Research mode for multi-source reports, on Pro and up.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11088861-use-research-on-claude",
       "https://claude.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Whether a scheduled task notifies the member's phone when the brief is ready is not stated in the article read.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork"
      ]
     },
     {
      "text": "No scheduled reminders or check-ins on Free.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     }
    ],
    "memberDoesByHand": [
     "Spot-check source links.",
     "On Free, start the brief yourself each morning."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Morning Brief\" project in Claude and say \"give me my morning brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not waiting for you each morning."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Morning Brief\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Morning Brief. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself each morning; Google AI Plus ($4.99) for the weekday scheduled brief (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "Prepare my personalized Morning Written Brief. Cover each of my chosen topics in 3 clear, factual bullet points with source links. Keep the tone calm, informative, and free of hype.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Make the Morning Brief skill (Customize > Skills > Create > Create manually) with the helper text, your topics and how long you want it (for example \"3 bullet points per topic\"). Add one always-on line in Settings & help > Personal Intelligence > Instructions for Gemini: \"Leave out any news item you can't link to its original article.\"",
     "On Google AI Plus ($4.99) and up: ask \"Every weekday at 7am, prepare my Morning Brief: 3 calm, factual bullet points with a source link for each of [your topics].\" On Free, type \"/\" each morning, pick Morning Brief and ask for today's brief.",
     "To keep a copy, use Share & export > Export to Docs.",
     "Any time, without a schedule: in Gemini, type / and pick your Morning Brief skill, then say \"give me my morning brief\"."
    ],
    "willDo": [
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "A scheduled result arrives as a push notification on mobile or an unread chat on the web.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     },
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "The pages read don't say whether a scheduled action applies a skill, so the scheduled prompt itself carries the key rules.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/16316416",
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Gemini's own Daily brief (Plus and up, US, needs Workspace connected and Memory on) shows 'Top of mind' and 'Looking ahead'; the pages read don't say it follows a chosen topic list, so this helper uses a scheduled action instead.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/17077455",
       "https://support.google.com/gemini/answer/16275805"
      ]
     },
     {
      "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "memberDoesByHand": [
     "Spot-check source links.",
     "On Free, start the brief yourself each morning."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "daily",
      "connectedApps": [
       "web-search"
      ],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "In Gemini, type / and pick your Morning Brief skill, then say \"give me my morning brief\".",
       "degrades": true,
       "degradesNote": "A brief you have to fetch arrives whenever you remember, not waiting for you each morning."
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Hallucination rate 32.9% on Artificial Analysis AA-Omniscience (second-hand).",
     "tag": "reported",
     "sources": [
      "https://www.eesel.ai/blog/meta-muse-for-research"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
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
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "No morning schedule on Free.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
     ]
    },
    {
     "text": "Plus has no dot. On Pro ($100 and up, 18+, not EEA, UK or Switzerland) or Business Premium, a dot can run its own schedules with a time zone and end date instead of Tasks.",
     "tag": "vendor-stated",
     "sources": [
      "https://learn.chatgpt.com/docs/dots",
      "https://learn.chatgpt.com/docs/dots/tasks-and-memory"
     ]
    }
   ],
   "claude": [
    {
     "text": "Duet's documented morning brief covers email and calendar; pointing it at news topics is not documented, and Duet is invite-only (US Pro or Max waitlist).",
     "tag": "unverified",
     "sources": [
      "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "None of the pages read say how Gemini shows sources for news items; open a few links to check they lead to real articles.",
     "tag": "unverified",
     "sources": [
      "https://support.google.com/gemini/answer/13275745"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.tomsguide.com/ai/i-used-meta-muse-to-automate-10-tasks-from-reminders-to-trip-alerts-and-i-cant-believe-how-well-metas-ai-handled-everything",
   "https://introducing.muse.ai/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/news/grok-automations",
   "https://help.x.com/en/using-x/about-grok",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://www.thestar.com.my/tech/tech-news/2025/12/17/grok-spews-misinformation-about-deadly-australia-shooting",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://chatgpt.com/pricing/",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://www.thedailystar.net/news/world/europe/news/ai-not-reliable-source-news-eu-media-study-says-4016021",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.claude.com/en/articles/11088861-use-research-on-claude",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/17077455",
   "https://en.wikipedia.org/wiki/Grok_(chatbot)",
   "https://docs.x.ai/x-subscription/pricing",
   "https://learn.chatgpt.com/docs/dots",
   "https://learn.chatgpt.com/docs/dots/tasks-and-memory",
   "https://support.claude.com/en/articles/17631495-get-started-with-claude-duet",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/15230597"
  ]
 },
 {
  "slug": "reading-curator",
  "title": "Reading Curator",
  "audience": "personal",
  "category": "Staying informed",
  "version": 4,
  "goalInOneSentence": "I want thoughtful book and long-form article recommendations based on what I actually loved reading, without getting trapped in an algorithm.",
  "experienceLevel": "Beginner",
  "whatDoneLooksLike": "A personal reading list with spoiler-free descriptions telling you *why* each book or essay fits your taste.",
  "checkInRhythm": "Whenever you finish a book or want weekend reading.",
  "contract": {
   "goal": "I want thoughtful book and long-form article recommendations based on what I actually loved reading, without getting trapped in an algorithm.",
   "do": [
    "Suggest thoughtful next reads based on the books and essays I enjoy.",
    "Explain why each pick matches my taste.",
    "Warn me about any elements I dislike."
   ],
   "do_not": [
    "Never spoil the ending. Zero spoilers.",
    "Never invent titles; recommend only real book titles by real authors."
   ],
   "ask_me_before": [
    "Sharing any detail that could spoil a book's plot or ending."
   ],
   "report_back": [
    "A personal reading list with spoiler-free descriptions telling you *why* each book or essay fits your taste.",
    "Whenever you finish a book or want weekend reading."
   ],
   "stop_if": [
    "You cannot verify that a title and its author are real: say so and leave it off the list."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Tell your helper 3 books or authors you loved and 1 or 2 things that make you put a book down.",
   "Step 2 (10 mins): Get 5 tailored suggestions and check which ones are at your local library."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Reading Curator\", paste the helper text, and say: \"Remember these as the rules for my Reading Curator helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
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
    "pasteText": "You are my personal Reading Curator and literary librarian. Based on the books and essays I enjoy, suggest thoughtful next reads. Explain why each pick matches my taste, warn me about any elements I dislike, and never spoil the ending.",
    "memberSteps": [
     "Open a new side chat in Muse and paste the Reading Curator text.",
     "Tell Muse three books or authors you loved and one or two things that make you put a book down.",
     "Ask: \"For each pick, give the author, year and a link to the publisher or a library page so I can check it is real.\"",
     "Ask Muse to keep a reading notes document with your book club notes and favorite quotes.",
     "Each time: open your Reading Curator side chat in Muse and say \"suggest my next read\"."
    ],
    "willDo": [
     {
      "text": "Browse the web in its own browser to look things up.",
      "tag": "vendor-stated",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Remembers across conversations and keeps memory files the member can inspect, edit and download.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Create documents, PDFs and spreadsheets and save them in Library > Artifacts.",
      "tag": "reported",
      "sources": [
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No citations by default; ask Muse for its sources.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Meta warns Muse 'may be inaccurate or take unexpected actions.'",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     }
    ],
    "memberDoesByHand": [
     "Look up each title in your library's catalog before you borrow or buy.",
     "Skip any pick Muse cannot show a real listing for."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Reading Curator side chat in Muse and say \"suggest my next read\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Reading Curator\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Reading Curator with these instructions:\" and paste the helper text.",
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
    "pasteText": "You are my personal Reading Curator and literary librarian. Based on the books and essays I enjoy, suggest thoughtful next reads. Explain why each pick matches my taste, warn me about any elements I dislike, and never spoil the ending.",
    "memberSteps": [
     "Set up the Reading Curator as a Project or a Skill in Grok (see setup).",
     "Tell Grok three books or authors you loved and what makes you put a book down.",
     "Ask for 5 picks, each with the author, year and a link to a publisher or library listing.",
     "Ask Grok to find recent interviews or podcast appearances by the authors you pick.",
     "Each time: open your Reading Curator helper in Grok and say \"suggest my next read\"."
    ],
    "willDo": [
     {
      "text": "Search X posts and the web in real time, on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok",
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Skills are reusable instructions Grok remembers across conversations.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     },
     {
      "text": "Built-in skills on every account create Word documents, spreadsheets, presentations and PDFs.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Grok 'may give confidently wrong information... Verify important answers.'",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     },
     {
      "text": "AI search tools, Grok among them, gave wrong or made-up citations in most tests of a 2025 study.",
      "tag": "reported",
      "sources": [
       "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check each title in your library's catalog.",
     "Open any interview link yourself before you trust the summary."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Reading Curator helper in Grok and say \"suggest my next read\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Reading Curator\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
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
    "pasteText": "You are my personal Reading Curator and literary librarian. Based on the books and essays I enjoy, suggest thoughtful next reads. Explain why each pick matches my taste, warn me about any elements I dislike, and never spoil the ending.",
    "memberSteps": [
     "Create a Project called \"Reading Curator\" and paste the Reading Curator text as its instructions.",
     "Start a \"Books I've Read & Loved\" list in the chat with a rating for each, and ask ChatGPT to add to it as you finish books.",
     "Ask for 5 picks and ask it to search the web to confirm each title and author.",
     "On Free, keep your own copy of the list in a note in case memory drops it.",
     "Each time: open your \"Reading Curator\" project in ChatGPT and say \"suggest my next read\"."
    ],
    "willDo": [
     {
      "text": "Keep files and chats for this helper together in one project.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     },
     {
      "text": "Search the web to confirm titles and authors (all plans).",
      "tag": "vendor-stated",
      "sources": [
       "https://chatgpt.com/pricing/"
      ]
     },
     {
      "text": "Memory works on every plan, but Free gets a limited version; Plus and up get expanded memory.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8590148",
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "ChatGPT 'can even make up things like quotes or citations'; do not use it as the only source.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth"
      ]
     },
     {
      "text": "Free allows 5 files per project and 3 file uploads a day, so keep the reading log as one file.",
      "tag": "vendor-stated",
      "sources": [
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check each title in your library's catalog.",
     "Keep your own copy of the reading log."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Reading Curator\" project in ChatGPT and say \"suggest my next read\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Reading Curator\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro is the safe minimum; Free may work (Anthropic's pages conflict on project instructions for Free)",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my personal Reading Curator and literary librarian. Based on the books and essays I enjoy, suggest thoughtful next reads. Explain why each pick matches my taste, warn me about any elements I dislike, and never spoil the ending.",
    "memberSteps": [
     "Create a Project called \"Reading Curator\" and paste the Reading Curator text as its instructions.",
     "Tell Claude three books or authors you loved and what makes you put a book down.",
     "Ask for 5 picks and ask Claude to search the web and show a source for each title.",
     "After a chapter, come back to the same project to talk through themes, history or characters, up to where you have read.",
     "Each time: open your \"Reading Curator\" project in Claude and say \"suggest my next read\"."
    ],
    "willDo": [
     {
      "text": "Search the web on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Memory is on by default on Free, Pro and Max, and each project keeps its own memory; you can read and edit it in Settings.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     },
     {
      "text": "Create Word and PDF files on every plan once file creation is turned on in Settings > Capabilities.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Claude can 'hallucinate' and show quotes that 'look authoritative' but are not grounded in fact; review its cited sources when it searches.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses"
      ]
     },
     {
      "text": "Searching past chats is for paid plans only, so on Free an old session is not looked up automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check each title in your library's catalog.",
     "Tell Claude which chapter you are on so it stays spoiler-free."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Reading Curator\" project in Claude and say \"suggest my next read\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Reading Curator\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Reading Curator. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free (personal Google account, 18+, Keep Activity on)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my personal Reading Curator and literary librarian. Based on the books and essays I enjoy, suggest thoughtful next reads. Explain why each pick matches my taste, warn me about any elements I dislike, and never spoil the ending.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create a Reading Curator skill with the helper text. Optional: add your \"Books I've Read & Loved\" list to the skill as a text file.",
     "Type \"/\" and pick Reading Curator, then name 3 books or authors you loved and 1 or 2 things that make you put a book down.",
     "Ask for 5 spoiler-free picks with a line on why each fits, and check every title and author in your library's catalog before you rely on it.",
     "Keep the reading list in one place: say \"Add these to a Keep note called Reading List,\" or use Share & export > Export to Docs.",
     "Each time: in Gemini, type / and pick your Reading Curator skill, then say \"suggest my next read\"."
    ],
    "willDo": [
     {
      "text": "A skill can hold files (text, PDF and images, 100 MB in total) next to its instructions; sharing skills and attaching Drive files are still to come.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Keep in Connected Apps creates notes and lists and adds items to an existing list.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230597"
      ]
     },
     {
      "text": "Share & export > Export to Docs saves a reply as a new Google Doc; Export to Sheets for tables.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "The pages read don't describe how Gemini shows a source for a book title, so a title it suggests is not proof the book exists.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/13275745"
      ]
     },
     {
      "text": "Skills don't include Canvas, Deep Research or Guided Learning; Connected Apps do work inside a skill.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Memory needs a Google AI plan, 18+, a personal account and the US.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     }
    ],
    "memberDoesByHand": [
     "Check each title in your library's catalog.",
     "Keep your own copy of the reading log, and update the skill's file when you finish a book.",
     "Tell the helper which chapter you are on so it stays spoiler-free."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "none",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Reading Curator skill, then say \"suggest my next read\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "In 2025 a newspaper ran an AI-written summer reading list where most titles did not exist but were credited to real authors; a real author's name does not prove a real book.",
     "tag": "reported",
     "sources": [
      "https://www.axios.com/2025/05/20/ai-summer-reading-books-chicago-sun-times"
     ]
    },
    {
     "text": "No assistant documents reading a library's live catalog or holds; whether a web search shows current availability is unverified (checking the library's own catalog would settle it).",
     "tag": "unverified",
     "sources": [
      "https://chatgpt.com/pricing/",
      "https://claude.com/pricing",
      "https://x.ai/pricing",
      "https://research.meta.ai/blog/how-we-built-safety-into-muse"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    }
   ],
   "grok": [
    {
     "text": "In 2025 a newspaper ran an AI-written summer reading list where most titles did not exist but were credited to real authors; a real author's name does not prove a real book.",
     "tag": "reported",
     "sources": [
      "https://www.axios.com/2025/05/20/ai-summer-reading-books-chicago-sun-times"
     ]
    },
    {
     "text": "No assistant documents reading a library's live catalog or holds; whether a web search shows current availability is unverified (checking the library's own catalog would settle it).",
     "tag": "unverified",
     "sources": [
      "https://chatgpt.com/pricing/",
      "https://claude.com/pricing",
      "https://x.ai/pricing",
      "https://research.meta.ai/blog/how-we-built-safety-into-muse"
     ]
    },
    {
     "text": "Projects and Skills setup is undocumented by the vendor; this layer is the weakest of the four.",
     "tag": "unverified",
     "sources": [
      "https://docs.x.ai/grok/faq"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "In 2025 a newspaper ran an AI-written summer reading list where most titles did not exist but were credited to real authors; a real author's name does not prove a real book.",
     "tag": "reported",
     "sources": [
      "https://www.axios.com/2025/05/20/ai-summer-reading-books-chicago-sun-times"
     ]
    },
    {
     "text": "No assistant documents reading a library's live catalog or holds; whether a web search shows current availability is unverified (checking the library's own catalog would settle it).",
     "tag": "unverified",
     "sources": [
      "https://chatgpt.com/pricing/",
      "https://claude.com/pricing",
      "https://x.ai/pricing",
      "https://research.meta.ai/blog/how-we-built-safety-into-muse"
     ]
    },
    {
     "text": "Free and Go show ads, which can use the current chat and, with memory on, saved memories.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    }
   ],
   "claude": [
    {
     "text": "In 2025 a newspaper ran an AI-written summer reading list where most titles did not exist but were credited to real authors; a real author's name does not prove a real book.",
     "tag": "reported",
     "sources": [
      "https://www.axios.com/2025/05/20/ai-summer-reading-books-chicago-sun-times"
     ]
    },
    {
     "text": "No assistant documents reading a library's live catalog or holds; whether a web search shows current availability is unverified (checking the library's own catalog would settle it).",
     "tag": "unverified",
     "sources": [
      "https://chatgpt.com/pricing/",
      "https://claude.com/pricing",
      "https://x.ai/pricing",
      "https://research.meta.ai/blog/how-we-built-safety-into-muse"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "Free mostly uses Flash-Lite with a 32k context; limits refresh every 5 hours up to a weekly cap.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/17004136",
      "https://support.google.com/gemini/answer/16275805"
     ]
    },
    {
     "text": "With Keep Activity on, activity can be used to improve Google services including AI models; with it off, chats are kept 72 hours.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://help.x.com/en/using-x/about-grok",
   "https://x.ai/pricing",
   "https://www.niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests-according-to-new-tow-center-study/",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://chatgpt.com/pricing/",
   "https://help-lb.openai.com/en/articles/8590148",
   "https://chatgpt.com/pricing",
   "https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/11817273",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/15230597",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/13275745",
   "https://www.axios.com/2025/05/20/ai-summer-reading-books-chicago-sun-times",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/17004136",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/13594961"
  ]
 },
 {
  "slug": "patient-tutor",
  "title": "Patient Tutor with a Study Plan",
  "audience": "personal",
  "category": "Learning and career",
  "version": 4,
  "goalInOneSentence": "I want to learn a new skill — Spanish for travel, bridge, photography, local history, or Excel — with a tutor that never gets impatient if I ask the same question three times.",
  "experienceLevel": "Complete beginner",
  "whatDoneLooksLike": "A 4-week bite-sized learning plan where each session takes 15 minutes and picks up right where you left off.",
  "checkInRhythm": "2 to 3 times a week for 15 minutes.",
  "contract": {
   "goal": "I want to learn a new skill — Spanish for travel, bridge, photography, local history, or Excel — with a tutor that never gets impatient if I ask the same question three times.",
   "do": [
    "Teach me step by step in 15-minute sessions.",
    "Use plain analogies and encourage my questions.",
    "End each session with a 2-sentence summary of what we covered.",
    "Save a progress note at the end of every session.",
    "Adapt to my pace."
   ],
   "do_not": [
    "Never rush ahead until I feel comfortable.",
    "Never overwhelm me with a wall of text."
   ],
   "ask_me_before": [
    "Moving on to the next step: check that I feel comfortable first."
   ],
   "report_back": [
    "A 4-week bite-sized learning plan where each session takes 15 minutes and picks up right where you left off.",
    "2 to 3 times a week for 15 minutes."
   ],
   "stop_if": [
    "A reply is turning into a wall of text: stop and break it into a smaller step."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Tell your helper what you want to learn and why (e.g., \"Conversational Italian before our autumn trip\").",
   "Step 2 (10 mins): Try your first 10-minute interactive lesson and tell it to slow down or speed up as needed."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Patient Tutor\", paste the helper text, and say: \"Remember these as the rules for my Patient Tutor helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "You are my Patient Tutor. Teach me step by step in 15-minute sessions. Use plain analogies, encourage my questions, never rush ahead until I feel comfortable, and end each session with a 2-sentence summary of what we covered.",
    "memberSteps": [
     "Open a new side chat in Muse and paste the Patient Tutor text.",
     "Tell Muse what you want to learn and why, then try a first short lesson.",
     "At the end, say: \"Add today's 2-sentence summary to my study notebook document, with flashcards for the key points.\"",
     "Ask Muse to remind you 2 or 3 times a week at a time that suits you.",
     "Any time, without a schedule: open your Patient Tutor side chat in Muse and say \"start today's lesson\"."
    ],
    "willDo": [
     {
      "text": "Remembers across conversations and keeps memory files the member can inspect, edit and download.",
      "tag": "vendor-stated",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://research.meta.ai/blog/how-we-built-safety-into-muse"
      ]
     },
     {
      "text": "Create documents, PDFs and spreadsheets and save them in Library > Artifacts.",
      "tag": "reported",
      "sources": [
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
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
      "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
      "tag": "reported",
      "sources": [
       "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
       "https://www.meta.com/help/subscriptions/1021145227643680/"
      ]
     },
     {
      "text": "No study or tutor mode is documented for Muse; Meta's help pages could not be read, so the tutor relies on the pasted text.",
      "tag": "unverified",
      "sources": [
       "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
       "https://www.meta.com/help/subscriptions/1021145227643680/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Open the study notebook before each session to see where you left off.",
     "Say slow down or speed up whenever you need to."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Patient Tutor side chat in Muse and say \"start today's lesson\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Patient Tutor\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Patient Tutor with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "You are my Patient Tutor. Teach me step by step in 15-minute sessions. Use plain analogies, encourage my questions, never rush ahead until I feel comfortable, and end each session with a 2-sentence summary of what we covered.",
    "memberSteps": [
     "Set up the Patient Tutor as a Project or a Skill in Grok (see setup).",
     "Tell Grok what you want to learn and why, then try a first short lesson.",
     "End each session with: \"Give me a 5-question practice quiz, then the 2-sentence summary.\" Copy the summary into a note.",
     "Optional: in Automations, create a weekly reminder for each study day (for example Monday and Thursday).",
     "Any time, without a schedule: open your Patient Tutor helper in Grok and say \"start today's lesson\"."
    ],
    "willDo": [
     {
      "text": "Skills are reusable instructions Grok remembers across conversations.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-skills"
      ]
     },
     {
      "text": "Run a scheduled automation at a set time and notify the member in the app or by email.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/news/grok-automations"
      ]
     },
     {
      "text": "Voice mode is on Free and paid plans.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No study or tutor mode appears in xAI's docs; a Skill built from the tutor text is the closest option.",
      "tag": "unverified",
      "sources": [
       "https://x.ai/news/grok-skills",
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "A memory setting ('Personalize Grok with your conversation history') is reported in Settings > Data controls; xAI does not document it and its plan gate is unverified.",
      "tag": "reported",
      "sources": [
       "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
      ]
     }
    ],
    "memberDoesByHand": [
     "Paste your last progress note at the start of each session.",
     "Keep your own copy of the progress notes."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Patient Tutor helper in Grok and say \"start today's lesson\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Patient Tutor\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the scheduled check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "You are my Patient Tutor. Teach me step by step in 15-minute sessions. Use plain analogies, encourage my questions, never rush ahead until I feel comfortable, and end each session with a 2-sentence summary of what we covered.",
    "memberSteps": [
     "Create a Project called \"Patient Tutor\" and paste the Patient Tutor text as its instructions.",
     "In a chat inside the project, type / and choose \"Study and learn\" to turn on study mode.",
     "At the end of each session, ask for the 2-sentence summary and keep it as one running progress note file in the project.",
     "On Plus and up, ask ChatGPT to remind you 2 or 3 times a week; on Free, set the reminder on your phone. For language practice, use Voice.",
     "Any time, without a schedule: open your \"Patient Tutor\" project in ChatGPT and say \"start today's lesson\"."
    ],
    "willDo": [
     {
      "text": "Study mode asks about your goals and level and works through answers step by step; it is on all ChatGPT plans and is turned on by typing / and choosing 'Study and learn'.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/11780217"
      ]
     },
     {
      "text": "With memory on, study mode can remember learning goals and past study sessions.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/11780217"
      ]
     },
     {
      "text": "Voice conversation on every plan: Free gets a limited allowance, Go and Plus about 3 hours a day.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/20001274-gpt-live-faq"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Study mode 'sometimes gives direct answers' instead of guiding you; say 'guide me, don't tell me' if it rushes.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/11780217"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     },
     {
      "text": "Tasks created inside a project cannot read that project's files.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt"
      ]
     }
    ],
    "memberDoesByHand": [
     "Keep the progress note file up to date in the project.",
     "Set your own study reminders on Free."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Patient Tutor\" project in ChatGPT and say \"start today's lesson\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Patient Tutor\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the 2 to 3 weekly lessons need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my Patient Tutor. Teach me step by step in 15-minute sessions. Use plain analogies, encourage my questions, never rush ahead until I feel comfortable, and end each session with a 2-sentence summary of what we covered.",
    "memberSteps": [
     "Create a Project called \"Patient Tutor\" and paste the Patient Tutor text as its instructions.",
     "Optional: open Search and tools > Use style and pick Explanatory, or Learning if your account shows it.",
     "At the end of each session, ask for the 2-sentence summary and add it to one progress note file in the project.",
     "On Pro and up, set a scheduled task to remind you 2 or 3 times a week; on Free, set the reminder on your phone.",
     "Any time, without a schedule: open your \"Patient Tutor\" project in Claude and say \"start today's lesson\"."
    ],
    "willDo": [
     {
      "text": "Preset styles include Explanatory ('Educational responses for learning new concepts'), chosen from Search and tools > Use style.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10181068"
      ]
     },
     {
      "text": "Memory is on by default on Free, Pro and Max, and each project keeps its own memory; you can read and edit it in Settings.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     },
     {
      "text": "Two-way voice mode (beta) on every plan, on phone, desktop and web.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Searching past chats is for paid plans only, so on Free an old session is not looked up automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11817273"
      ]
     },
     {
      "text": "Scheduled tasks (hourly, daily, weekly or weekdays) run in the cloud even when the computer is asleep, on Pro and up only; Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     }
    ],
    "memberDoesByHand": [
     "Keep the progress note file up to date in the project.",
     "Set your own study reminders on Free."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Patient Tutor\" project in Claude and say \"start today's lesson\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Patient Tutor\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Patient Tutor. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the scheduled check-in (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my Patient Tutor. Teach me step by step in 15-minute sessions. Use plain analogies, encourage my questions, never rush ahead until I feel comfortable, and end each session with a 2-sentence summary of what we covered.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create a Patient Tutor skill with the helper text, plus one line on what you want to learn and why.",
     "Type \"/\" and pick Patient Tutor for each 15-minute session, and say \"slow down\" or \"go on\" whenever you like.",
     "At the end of each session, ask for the 2-sentence summary and say \"Add it to a Keep note called Tutor Progress.\" Start the next session by pasting that note so it picks up where you left off.",
     "On Google AI Plus ($4.99) and up: ask \"Every Monday, Wednesday and Friday at 7pm, remind me it is time for my lesson.\" On Free, set the reminder on your phone. For language practice, use Gemini Live on your phone.",
     "Any time, without a schedule: in Gemini, type / and pick your Patient Tutor skill, then say \"start today's lesson\"."
    ],
    "willDo": [
     {
      "text": "Keep in Connected Apps creates notes and lists and adds items to an existing list.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230597"
      ]
     },
     {
      "text": "Gemini Live voice conversation on all plans, plus a Listen button that reads a reply aloud.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     },
     {
      "text": "Scheduled actions: write the time and repeat in the prompt (for example 'every Sunday at 4pm...'); manage them on the Scheduled page; up to 10 active; push notification on mobile.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16316416"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Guided Learning is not available inside a skill, so the tutor rules live in the skill and Guided Learning, if you use it, runs without them.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Whether a skill's rules apply inside a Gemini Live voice chat is not stated by Google.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/17094296",
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Google's Android help says Gemini Live is not on the web app, while May 2026 release notes describe Live in chat; use the phone app for voice to be safe.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899",
       "https://gemini.google/release-notes/"
      ],
      "conflict": true
     },
     {
      "text": "Memory needs a Google AI plan, 18+, a personal account and the US.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     }
    ],
    "memberDoesByHand": [
     "Keep the Tutor Progress note and paste it at the start of each session.",
     "Set your own study reminders on Free.",
     "Check facts that matter (grammar rules, formulas, dates) in a second source."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": false,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Patient Tutor skill, then say \"start today's lesson\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Live voice conversation with Muse is not confirmed in the US: Meta lists voice as coming next, while one outlet reports it added.",
     "tag": "unverified",
     "sources": [
      "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/",
      "https://runtimewire.com/article/meta-muse-live-video-chat-voice"
     ]
    },
    {
     "text": "Persistent-instruction path (Soul) is reported, not vendor-documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/"
     ]
    }
   ],
   "grok": [
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "Projects and Skills setup is undocumented by the vendor; this layer is the weakest of the four.",
     "tag": "unverified",
     "sources": [
      "https://docs.x.ai/grok/faq"
     ]
    },
    {
     "text": "Grok 'may give confidently wrong information... Verify important answers.'",
     "tag": "vendor-stated",
     "sources": [
      "https://help.x.com/en/using-x/about-grok"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "Memory works on every plan, but Free gets a limited version; Plus and up get expanded memory.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/8590148",
      "https://chatgpt.com/pricing"
     ]
    },
    {
     "text": "Free and Go show ads, which can use the current chat and, with memory on, saved memories.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    }
   ],
   "claude": [
    {
     "text": "A 'Learning' style for all users was reported in 2025 and in a June 2026 comparison, but Anthropic's current styles page lists only Normal, Concise, Formal and Explanatory, and names no plan gate.",
     "tag": "reported",
     "sources": [
      "https://www.engadget.com/ai/anthropic-brings-claudes-learning-mode-to-regular-users-and-devs-170018471/",
      "https://glasp.ai/articles/ai-study-modes-compared",
      "https://support.claude.com/en/articles/10181068"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    },
    {
     "text": "Free usage runs on a 5-hour session limit that varies with demand, so a lesson can be cut short at busy times.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/8602283-about-free-claude-usage"
     ]
    }
   ],
   "gemini": [
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    },
    {
     "text": "Free mostly uses Flash-Lite with a 32k context; limits refresh every 5 hours up to a weekly cap.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/17004136",
      "https://support.google.com/gemini/answer/16275805"
     ]
    },
    {
     "text": "Scheduled results are prepared within the hour before delivery, and a schedule may switch itself off after inactivity.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/16316416"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://x.ai/news/grok-automations",
   "https://x.ai/pricing",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help-lb.openai.com/en/articles/11780217",
   "https://help.openai.com/en/articles/20001274-gpt-live-faq",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/10181068",
   "https://support.claude.com/en/articles/11817273",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/15230597",
   "https://support.google.com/gemini/answer/15274899",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://gemini.google/release-notes/",
   "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/",
   "https://runtimewire.com/article/meta-muse-live-video-chat-voice",
   "https://docs.x.ai/x-subscription/pricing",
   "https://help.x.com/en/using-x/about-grok",
   "https://help-lb.openai.com/en/articles/8590148",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://www.engadget.com/ai/anthropic-brings-claudes-learning-mode-to-regular-users-and-devs-170018471/",
   "https://glasp.ai/articles/ai-study-modes-compared",
   "https://support.claude.com/en/articles/8602283-about-free-claude-usage",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/17004136"
  ]
 },
 {
  "slug": "job-hunt-helper",
  "title": "Job Hunt Helper",
  "audience": "personal",
  "category": "Learning and career",
  "version": 4,
  "goalInOneSentence": "I want to organize my job or consulting search, highlight my real experience clearly for each role, and walk into interviews feeling prepared.",
  "experienceLevel": "Beginner to Intermediate",
  "whatDoneLooksLike": "An updated master resume, tailored cover notes that sound human, and a tracker of every application and follow-up date.",
  "checkInRhythm": "Twice a week during an active job search.",
  "contract": {
   "goal": "I want to organize my job or consulting search, highlight my real experience clearly for each role, and walk into interviews feeling prepared.",
   "do": [
    "Help me translate my real-world experience into clear, compelling resume points.",
    "Help me write natural cover letters.",
    "Help me prep for interviews with realistic questions."
   ],
   "do_not": [
    "Never invent skills or experience I do not have.",
    "Never exaggerate or invent credentials.",
    "Never submit job applications automatically."
   ],
   "ask_me_before": [
    "Any job application goes in: I review and submit every one myself."
   ],
   "report_back": [
    "An updated master resume, tailored cover notes that sound human, and a tracker of every application and follow-up date.",
    "Twice a week during an active job search."
   ],
   "stop_if": [
    "A step would submit an application, or claim a skill or credential I did not give you: stop and hand it back to me."
   ]
  },
  "steps": [
   "Step 1 (10 mins): Paste your existing resume and ask your helper to interview you about accomplishments that aren’t written down yet.",
   "Step 2 (10 mins): Paste a job description and ask how to highlight your matching experience truthfully.",
   "Step 3 (10 mins): Practice 5 likely interview questions out loud."
  ],
  "platformLayers": {
   "muse": {
    "assistant": "Muse",
    "setupFeature": "Memory and the Soul file",
    "setupPath": "Start a side chat (menu, top left of Chat) for \"Job Hunt\", paste the helper text, and say: \"Remember these as the rules for my Job Hunt helper.\" To make the rules permanent, open the assistant screen > Soul > pencil icon and add the key rules.",
    "minimumPlan": "Free (usage limit; scheduled check-ins spend the same weekly allowance)",
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
    "pasteText": "You are my Job Hunt & Career Helper. Help me translate my real-world experience into clear, compelling resume points and natural cover letters. Never invent skills or experience I do not have. Help me prep for interviews with realistic questions.",
    "memberSteps": [
     "Open a new side chat in Muse and paste the Job Hunt text.",
     "Tell Muse: \"Never fill in or submit a job application. I submit every one myself.\" In settings, choose to have Muse always ask before acting.",
     "Attach your resume as a PDF or Word file, then paste a job posting and ask how to match it truthfully.",
     "Ask Muse to keep a tracker spreadsheet of applications and follow-up dates, and to draft thank-you notes for you to send.",
     "Any time, without a schedule: open your Job Hunt side chat in Muse and say \"run my job search check-in\"."
    ],
    "willDo": [
     {
      "text": "Reads PDF, Word, text, Markdown, Excel and CSV files; no size limit is published and photo upload is not confirmed.",
      "tag": "reported",
      "sources": [
       "https://www.eesel.ai/blog/meta-muse-for-research"
      ]
     },
     {
      "text": "Create documents, PDFs and spreadsheets and save them in Library > Artifacts.",
      "tag": "reported",
      "sources": [
       "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
       "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/"
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
      "text": "Muse can fill in forms online (added in September 2026), so the no-submit rule depends on the member's instruction and approval settings, not a product limit.",
      "tag": "vendor-stated",
      "sources": [
       "https://apps.apple.com/us/app/muse-from-meta/id6760173601"
      ]
     },
     {
      "text": "Approvals can be one-time or standing; the app default asks only for some actions, and 'always ask' can be chosen.",
      "tag": "reported",
      "sources": [
       "https://research.meta.ai/blog/how-we-built-safety-into-muse",
       "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/"
      ]
     },
     {
      "text": "Live voice conversation with Muse is not confirmed in the US: Meta lists voice as coming next, while one outlet reports it added.",
      "tag": "unverified",
      "sources": [
       "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/",
       "https://runtimewire.com/article/meta-muse-live-video-chat-voice"
      ]
     }
    ],
    "memberDoesByHand": [
     "Submit every application yourself.",
     "Send thank-you notes and messages yourself, or keep email read-only for this helper.",
     "Practice interview answers out loud with a person or by reading them aloud."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Job Hunt side chat in Muse and say \"run my job search check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "grok": {
    "assistant": "Grok",
    "setupFeature": "Projects if shown, otherwise a Skill",
    "setupPath": "If the sidebar shows Projects: create a project named \"Job Hunt\" and add the helper text as its instructions. Otherwise ask Grok in a chat: \"Create a skill called Job Hunt with these instructions:\" and paste the helper text.",
    "minimumPlan": "Free (tier gating for Projects and Skills not documented; Automations for the check-in are free)",
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
    "pasteText": "You are my Job Hunt & Career Helper. Help me translate my real-world experience into clear, compelling resume points and natural cover letters. Never invent skills or experience I do not have. Help me prep for interviews with realistic questions.",
    "memberSteps": [
     "Set up the Job Hunt helper as a Project or a Skill in Grok (see setup).",
     "Upload your resume as a PDF or Word file and ask Grok to interview you about what is missing.",
     "Before an interview, ask Grok for recent company news and leadership changes, then practice 5 questions in voice mode.",
     "Optional: in Automations, set a twice-weekly reminder to review your follow-up dates.",
     "Any time, without a schedule: open your Job Hunt helper in Grok and say \"run my job search check-in\"."
    ],
    "willDo": [
     {
      "text": "Read uploaded PDF, Word, text and spreadsheet files up to 150 MB per file (about 100 files per message on web, 20 on Android).",
      "tag": "vendor-stated",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Search X posts and the web in real time, on every plan.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok",
       "https://x.ai/pricing"
      ]
     },
     {
      "text": "Voice mode is on Free and paid plans.",
      "tag": "vendor-stated",
      "sources": [
       "https://x.ai/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "No form filling or job applying is documented for the regular Grok app.",
      "tag": "unverified",
      "sources": [
       "https://docs.x.ai/grok/faq"
      ]
     },
     {
      "text": "Grok 'may give confidently wrong information... Verify important answers.'",
      "tag": "vendor-stated",
      "sources": [
       "https://help.x.com/en/using-x/about-grok"
      ]
     }
    ],
    "memberDoesByHand": [
     "Submit every application yourself.",
     "Check company news against the source before you mention it in an interview."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "memberTrigger": "Open your Job Hunt helper in Grok and say \"run my job search check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "reported"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "reported"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "chatgpt": {
    "assistant": "ChatGPT",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Sidebar > New project > name it \"Job Hunt\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Free if you start it yourself; Plus ($20) for the scheduled check-in with Tasks (OpenAI's pages conflict on Go)",
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
    "pasteText": "You are my Job Hunt & Career Helper. Help me translate my real-world experience into clear, compelling resume points and natural cover letters. Never invent skills or experience I do not have. Help me prep for interviews with realistic questions.",
    "memberSteps": [
     "Create a Project called \"Job Hunt\" and paste the Job Hunt text as its instructions.",
     "Upload your resume into the project (Free allows 3 uploads a day and 5 files per project), then paste a job posting.",
     "Practice 5 interview questions out loud with Voice.",
     "Ask for a tracker table of applications and follow-up dates; on Plus and up, ask ChatGPT to remind you twice a week.",
     "Any time, without a schedule: open your \"Job Hunt\" project in ChatGPT and say \"run my job search check-in\"."
    ],
    "willDo": [
     {
      "text": "Read uploaded resumes and postings (files up to 512 MB, images up to 20 MB).",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq"
      ]
     },
     {
      "text": "Voice conversation on every plan: Free gets a limited allowance, Go and Plus about 3 hours a day.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/20001274-gpt-live-faq"
      ]
     },
     {
      "text": "Run scheduled tasks with push or email notification on Plus, Pro, Business and Enterprise (Go conflicts: up to 3 per the tasks page, none per the pricing grid; none on Free).",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
       "https://chatgpt.com/pricing"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Agent mode (paid plans only) can fill out forms online; it pauses for confirmation 'when needed', but OpenAI does not say a form submission always counts, so do not ask it to apply.",
      "tag": "vendor-stated",
      "sources": [
       "https://help.openai.com/articles/11752874"
      ]
     },
     {
      "text": "Free: 3 file uploads a day and 5 files per project.",
      "tag": "vendor-stated",
      "sources": [
       "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
       "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt"
      ]
     }
    ],
    "memberDoesByHand": [
     "Submit every application yourself.",
     "Check every resume line against what you actually did."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "Open your \"Job Hunt\" project in ChatGPT and say \"run my job search check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Plus",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Plus",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "claude": {
    "assistant": "Claude",
    "setupFeature": "Projects (project instructions)",
    "setupPath": "Open Projects in the left sidebar > create a project named \"Job Hunt\" > add the helper text as the project's instructions. Start every chat for this helper inside that project.",
    "minimumPlan": "Pro ($20) either way: scheduled tasks for the twice-weekly check-ins need Pro, and Anthropic's pages conflict on Free project instructions",
    "setupClaims": [
     {
      "text": "Projects are available to all users including Free (up to 5 projects on Free) and hold chats, files and instructions.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/9519177",
       "https://claude.com/pricing"
      ]
     },
     {
      "text": "Anthropic's personalization article lists project instructions as paid plans only, which contradicts the Projects article.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
       "https://support.claude.com/en/articles/9519177"
      ]
     },
     {
      "text": "Whether a Free account shows the project instructions field, and the exact menu labels, were not confirmed on a live screen.",
      "tag": "unverified",
      "sources": [
       "https://support.claude.com/en/articles/9519177"
      ]
     }
    ],
    "fallback": "If a Free account has no project instructions field: paste the helper text into the account's profile preferences in Settings (applies to every chat; plan gate not stated) or at the start of each chat.",
    "pasteText": "You are my Job Hunt & Career Helper. Help me translate my real-world experience into clear, compelling resume points and natural cover letters. Never invent skills or experience I do not have. Help me prep for interviews with realistic questions.",
    "memberSteps": [
     "Create a Project called \"Job Hunt\" and paste the Job Hunt text as its instructions.",
     "Upload your resume and a job posting, and ask Claude which keywords are missing and how to show your real experience.",
     "Practice 5 interview questions out loud in voice mode.",
     "Turn on file creation (Settings > Capabilities) and ask for your master resume as a Word file and a tracker spreadsheet with follow-up dates.",
     "Any time, without a schedule: open your \"Job Hunt\" project in Claude and say \"run my job search check-in\"."
    ],
    "willDo": [
     {
      "text": "Read uploaded files up to 500 MB each and 20 per chat; files kept in a project are limited to 30 MB each.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/8241126-upload-files-to-claude"
      ]
     },
     {
      "text": "Create Word, Excel and PDF files on every plan once file creation is turned on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude"
      ]
     },
     {
      "text": "Two-way voice mode (beta) on every plan, on phone, desktop and web.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/11101966-use-voice-mode"
      ]
     }
    ],
    "wontDo": [
     {
      "text": "Claude in Chrome (Pro and up, desktop Chrome) can fill in forms on websites and has a 'Skip all approvals' mode; keep it on Manual for job sites, or do not use it for applications.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome",
       "https://support.claude.com/en/articles/12902446"
      ]
     },
     {
      "text": "Scheduled tasks (hourly, daily, weekly or weekdays) run in the cloud even when the computer is asleep, on Pro and up only; Free has none.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
       "https://claude.com/pricing"
      ]
     }
    ],
    "memberDoesByHand": [
     "Submit every application yourself.",
     "Set your own follow-up reminders on Free."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29.",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "conflict"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "conflict"
       },
       "memberTrigger": "Open your \"Job Hunt\" project in Claude and say \"run my job search check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Pro",
        "priceMonthlyUSD": 20,
        "basis": "vendor"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Pro",
      "priceMonthlyUSD": 20,
      "basis": "vendor"
     },
     "runPossible": true,
     "runFallback": ""
    }
   },
   "gemini": {
    "assistant": "Gemini",
    "setupFeature": "Instructions for Gemini (always-on rules) plus a skill for this helper",
    "setupPath": "Check first that you are signed in with a personal Google account, not a work or school one. Then Customize (left menu) > Skills > Create > Create manually: name it \"Job Hunt Helper\", add a one-line description, and paste the helper text as its instructions. In a chat, type \"/\" and pick Job Hunt Helper. Put any rule that must apply to every chat (for example \"never send or pay for anything\") in Settings & help > Personal Intelligence > Instructions for Gemini.",
    "minimumPlan": "Free if you start it yourself; Google AI Plus ($4.99) for the scheduled check-in (Google's pages conflict)",
    "setupClaims": [
     {
      "text": "Skills: Customize > Skills > Create, including Create manually (name, description, instructions); use one by typing '/'; free; needs 18+, a personal account and Keep Activity on.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     },
     {
      "text": "Instructions for Gemini apply to every chat and are open to all users: Settings & help > Personal Intelligence > Instructions for Gemini.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16598625"
      ]
     },
     {
      "text": "For personal accounts 18+, Gems go read-only on 2026-11-17 and are removed on 2026-12-17; existing Gems convert to skills automatically.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/18560919"
      ]
     },
     {
      "text": "Work (Workspace) accounts get Gemini through Workspace: Gems last until at least 2027-03-01, Task mode and consumer skills are not available, and Connected Apps need admin approval.",
      "tag": "vendor-stated",
      "sources": [
       "https://knowledge.workspace.google.com/p/gems-migration",
       "https://support.google.com/gemini/answer/13695044"
      ]
     },
     {
      "text": "Skills help shows desktop steps only; the mobile app is said to work.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/17094296"
      ]
     }
    ],
    "fallback": "If Keep Activity is off, skills and Connected Apps don't work: paste the helper text at the start of each chat. Under-18 accounts can't use skills yet. On a work account, use a Gem (Sidebar > Gems > New Gem) until Google moves work accounts to skills; Gems there last until at least 2027-03-01.",
    "pasteText": "You are my Job Hunt & Career Helper. Help me translate my real-world experience into clear, compelling resume points and natural cover letters. Never invent skills or experience I do not have. Help me prep for interviews with realistic questions.",
    "memberSteps": [
     "Check which Google account you're signed in with (tap your profile picture). A personal Gmail account can use skills; a work or school account can't yet, so ask Second Look for the work-account steps.",
     "Create a Job Hunt Helper skill with the helper text, and upload your resume plus one job posting in a chat that uses it.",
     "Ask which parts of your real experience match the posting and how to say them truthfully; check every line against what you actually did.",
     "Practice 5 likely interview questions out loud in Gemini Live on your phone.",
     "Ask for a tracker table of applications and follow-up dates, then Share & export > Export to Sheets. Say \"Add a Google Tasks reminder for each follow-up date,\" which works on Free. On Google AI Plus ($4.99) and up you can also ask for a twice-a-week check-in.",
     "Any time, without a schedule: in Gemini, type / and pick your Job Hunt Helper skill, then say \"run my job search check-in\"."
    ],
    "willDo": [
     {
      "text": "Up to 10 files per prompt, 100 MB each; reads photos of letters.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14903178",
       "https://support.google.com/gemini/answer/13594961"
      ]
     },
     {
      "text": "Gemini Live voice conversation on all plans, plus a Listen button that reads a reply aloud.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15274899"
      ]
     },
     {
      "text": "Share & export > Export to Sheets turns a table reply, such as an application tracker, into a Google Sheet.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Google Tasks in Connected Apps can create tasks and reminders.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15230285"
      ]
     },
     {
      "text": "In a normal chat Gemini can search and summarize Gmail and turn a reply into a Gmail draft (Share & export > Draft in Gmail); it cannot send from chat.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/15229592",
       "https://support.google.com/gemini/answer/14184041"
      ]
     },
     {
      "text": "Scheduled actions need Google AI Plus ($4.99/month) per Google's tier table, but Google's scheduled actions page says they are coming gradually to all personal accounts; treat them as Plus until tested on a free account.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16275805",
       "https://support.google.com/gemini/answer/16316416",
       "https://gemini.google/subscriptions/"
      ],
      "conflict": true
     }
    ],
    "wontDo": [
     {
      "text": "Task mode (Tasks in Gemini) is experimental and needs Google AI Pro ($19.99) or Ultra on a personal account, 18+, outside the EEA, UK, Switzerland and Nigeria; Google warns of prompt injection and says not to give it sign-in or payment details.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16596215",
       "https://gemini.google/subscriptions/"
      ]
     },
     {
      "text": "Task mode can draft, reply to, forward and label Gmail, asking before it sends.",
      "tag": "vendor-stated",
      "sources": [
       "https://support.google.com/gemini/answer/16596215",
       "https://support.google.com/gemini/answer/15229592"
      ]
     },
     {
      "text": "Whether a skill's rules apply inside a Gemini Live voice chat is not stated by Google.",
      "tag": "unverified",
      "sources": [
       "https://support.google.com/gemini/answer/17094296",
       "https://support.google.com/gemini/answer/15274899"
      ]
     }
    ],
    "memberDoesByHand": [
     "Submit every application yourself.",
     "Check every resume line against what you actually did.",
     "Read and send every follow-up email yourself. If you have Task mode (Google AI Pro, experimental), use it only for follow-up drafts, approve each send, and never let it apply for a job."
    ],
    "basis": "Docs-based, not hands-on tested. Checked 2026-10-29 (run 4 Gemini deep dive).",
    "lastVerified": "2026-10-29",
    "requirements": {
     "needs": {
      "persistentInstructions": true,
      "scheduling": "custom",
      "connectedApps": [],
      "webBrowsing": false,
      "fileUploads": false,
      "voiceReadAloud": true,
      "agentActions": false
     },
     "setupMinPlan": {
      "tier": "free",
      "planName": "Free",
      "priceMonthlyUSD": 0,
      "basis": "vendor"
     },
     "runModes": {
      "onDemand": {
       "minPlan": {
        "tier": "free",
        "planName": "Free",
        "priceMonthlyUSD": 0,
        "basis": "vendor"
       },
       "memberTrigger": "In Gemini, type / and pick your Job Hunt Helper skill, then say \"run my job search check-in\".",
       "degrades": false,
       "degradesNote": ""
      },
      "scheduled": {
       "minPlan": {
        "tier": "paid",
        "planName": "Google AI Plus",
        "priceMonthlyUSD": 4.99,
        "basis": "conflict"
       },
       "possible": true,
       "fallback": ""
      }
     },
     "runMinPlan": {
      "tier": "paid",
      "planName": "Google AI Plus",
      "priceMonthlyUSD": 4.99,
      "basis": "conflict"
     },
     "runPossible": true,
     "runFallback": ""
    }
   }
  },
  "knownIssues": {
   "muse": [
    {
     "text": "Chats are used for training by default after key personal information is removed; opt out in Settings > Data controls.",
     "tag": "vendor-stated",
     "sources": [
      "https://research.meta.ai/blog/how-we-built-safety-into-muse"
     ]
    },
    {
     "text": "Meta says plan benefits 'may vary by region and account', so no Muse feature can be promised on a given plan.",
     "tag": "vendor-stated",
     "sources": [
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    },
    {
     "text": "Every reminder and recurring task draws on the same weekly usage allowance; on Free a busy schedule can use up the week, and what happens to scheduled jobs then is not documented.",
     "tag": "reported",
     "sources": [
      "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
      "https://www.meta.com/help/subscriptions/1021145227643680/"
     ]
    }
   ],
   "grok": [
    {
     "text": "Turn off 'Improve the Model' in Settings > Data controls, or use Private Chat, if you do not want resume chats used for training; the default is not documented.",
     "tag": "reported",
     "sources": [
      "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/"
     ]
    },
    {
     "text": "Over 370,000 shared Grok chats were indexed by Google in 2025; never press Share on a chat that holds personal details.",
     "tag": "reported",
     "sources": [
      "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/"
     ]
    },
    {
     "text": "Scheduled Automations were announced as 'available to everyone' in July 2026, before the current Free plan existed; Free usage is 'Limited' with no published number.",
     "tag": "vendor-stated",
     "sources": [
      "https://x.ai/news/grok-automations",
      "https://docs.x.ai/x-subscription/pricing"
     ]
    },
    {
     "text": "Grok Bot ($30 Premium and up) works in its own cloud computer and its Auto Review is on by default, so most actions go ahead without asking; set it to ask before any application.",
     "tag": "vendor-stated",
     "sources": [
      "https://docs.x.ai/grok-bot/approvals-security-and-privacy",
      "https://docs.x.ai/grok-bot/get-started"
     ]
    }
   ],
   "chatgpt": [
    {
     "text": "On consumer plans, chats may be used to improve OpenAI's models unless the member opts out; opting out applies going forward.",
     "tag": "vendor-stated",
     "sources": [
      "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq"
     ]
    },
    {
     "text": "Free and Go show ads, which can use the current chat and, with memory on, saved memories.",
     "tag": "vendor-stated",
     "sources": [
      "https://help-lb.openai.com/en/articles/20001047"
     ]
    },
    {
     "text": "On Pro or Business Premium, a dot has its own cloud browser; set its Custom Rules to 'Ask before taking action' or 'Hand off to you' for anything that applies or sends.",
     "tag": "vendor-stated",
     "sources": [
      "https://learn.chatgpt.com/docs/dots/computers-and-apps",
      "https://learn.chatgpt.com/docs/dots/controls"
     ]
    }
   ],
   "claude": [
    {
     "text": "Chats may be used for model training depending on the Model Improvement setting; with it on, de-identified chats can be kept up to 5 years. Check Privacy Settings before uploading a resume.",
     "tag": "vendor-stated",
     "sources": [
      "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
      "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data"
     ]
    },
    {
     "text": "Whether Free accounts get project instructions is contradicted across Anthropic's help pages.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
      "https://support.claude.com/en/articles/9519177"
     ]
    }
   ],
   "gemini": [
    {
     "text": "A subset of chats is read by human reviewers and kept up to 3 years even after you delete activity; Google says not to enter confidential information you wouldn't want a reviewer to see.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961"
     ]
    },
    {
     "text": "Keep Activity off turns off Connected Apps, skills, the Daily brief and Tasks, so the free setup depends on it being on.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13594961",
      "https://support.google.com/gemini/answer/13695044"
     ]
    },
    {
     "text": "Google says Gemini can make mistakes and not to rely on it for professional advice; answers about Gmail, Keep and Tasks can be wrong or out of date.",
     "tag": "vendor-stated",
     "sources": [
      "https://support.google.com/gemini/answer/13275745",
      "https://support.google.com/gemini/answer/15229592",
      "https://support.google.com/gemini/answer/15230597"
     ]
    }
   ]
  },
  "lastVerified": "2026-10-29",
  "sources": [
   "https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/",
   "https://research.meta.ai/blog/how-we-built-safety-into-muse",
   "https://smartscope.blog/en/blog/meta-muse-soul-md-personality-file-contents-editing-2026/",
   "https://smartscope.blog/en/blog/meta-muse-screen-guide-features-main-chat-feed-2026/",
   "https://www.eesel.ai/blog/meta-muse-for-research",
   "https://www.techrepublic.com/article/news-meta-muse-ai-agent-us-launch/",
   "https://apps.apple.com/us/app/muse-from-meta/id6760173601",
   "https://www.engadget.com/2256577/how-to-get-started-with-meta-s-new-ai-agent-muse/",
   "https://www.meta.com/blog/meta-connect-2026-everything-we-announced/",
   "https://runtimewire.com/article/meta-muse-live-video-chat-voice",
   "https://x.ai/news/grok-skills",
   "https://docs.x.ai/grok/faq",
   "https://www.maginative.com/article/xai-upgrades-grok-with-personalized-memory-and-custom-workspaces/",
   "https://help.x.com/en/using-x/about-grok",
   "https://x.ai/pricing",
   "https://intercom.help/openai/en/articles/10169521-projects-in-chatgpt",
   "https://help-lb.openai.com/en/articles/8555545-file-uploads-faq",
   "https://help.openai.com/en/articles/20001274-gpt-live-faq",
   "https://help.openai.com/en/articles/10291617-tasks-in-chatgpt",
   "https://chatgpt.com/pricing",
   "https://help.openai.com/articles/11752874",
   "https://support.claude.com/en/articles/9519177",
   "https://claude.com/pricing",
   "https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features",
   "https://support.claude.com/en/articles/8241126-upload-files-to-claude",
   "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude",
   "https://support.claude.com/en/articles/11101966-use-voice-mode",
   "https://support.claude.com/en/articles/12012173-get-started-with-claude-in-chrome",
   "https://support.claude.com/en/articles/12902446",
   "https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-cowork",
   "https://support.google.com/gemini/answer/17094296",
   "https://support.google.com/gemini/answer/16598625",
   "https://support.google.com/gemini/answer/18560919",
   "https://knowledge.workspace.google.com/p/gems-migration",
   "https://support.google.com/gemini/answer/13695044",
   "https://support.google.com/gemini/answer/14903178",
   "https://support.google.com/gemini/answer/13594961",
   "https://support.google.com/gemini/answer/15274899",
   "https://support.google.com/gemini/answer/14184041",
   "https://support.google.com/gemini/answer/15230285",
   "https://support.google.com/gemini/answer/15229592",
   "https://support.google.com/gemini/answer/16275805",
   "https://support.google.com/gemini/answer/16316416",
   "https://gemini.google/subscriptions/",
   "https://support.google.com/gemini/answer/16596215",
   "https://www.meta.com/help/subscriptions/1021145227643680/",
   "https://smartscope.blog/en/blog/meta-muse-1-billion-referral-tokens-weekly-limits-2026/",
   "https://joindeleteme.com/ai-privacy-settings/grok-privacy-settings-guide/",
   "https://9to5mac.com/2025/08/20/370k-grok-ai-chats-made-public-without-user-consent/",
   "https://x.ai/news/grok-automations",
   "https://docs.x.ai/x-subscription/pricing",
   "https://docs.x.ai/grok-bot/approvals-security-and-privacy",
   "https://docs.x.ai/grok-bot/get-started",
   "https://help.openai.com/en/articles/7039943-data-usage-for-consumer-services-faq",
   "https://help-lb.openai.com/en/articles/20001047",
   "https://learn.chatgpt.com/docs/dots/computers-and-apps",
   "https://learn.chatgpt.com/docs/dots/controls",
   "https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training",
   "https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data",
   "https://support.google.com/gemini/answer/13275745",
   "https://support.google.com/gemini/answer/15230597"
  ]
 }
];
