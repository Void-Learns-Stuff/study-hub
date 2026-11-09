# Study Hub

A small, hand-picked list of free places to learn. Built because I kept losing good study sites in old browser tabs and bookmark folders I never opened.

**Live site:** https://void-learns-stuff.github.io/study-hub/

## What's in here

Resources grouped by subject: programming, math, natural sciences, history and humanities, languages, study skills and memory, courses and lectures, and a catch-all for learning tools. Use the search box to find something specific, or click a subject to browse.

Every entry is labelled **Free** or **Freemium**. Freemium means the site has a free tier, but some features or courses cost money. Paid-only sites aren't listed.

## Why these sites?

I picked sites that are genuinely useful, not just popular. Most are run by universities, nonprofits, or people who care about teaching, and many publish their materials under open licenses. If you know a site that deserves a spot, please suggest it.

## Found something broken?

Links go stale. Sites move, paywalls appear, pages disappear. If something doesn't work, [open an issue](https://github.com/void-learns-stuff/study-hub/issues/new) and tell me the name and what happened. I'll fix it as soon as I can.

## Suggesting a resource

Open an issue with:

- The site's name and link
- One or two sentences on what makes it useful
- The subject it belongs in, if you know

You don't need to be formal. "This is great for stats, it has a lot of visuals" is plenty.

## Running it locally

You can't just double-click `index.html`, because the page loads `links.json` and browsers block that on local files. Instead, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000 in your browser.

## Adding resources yourself

Everything lives in `links.json`. Each entry looks like this:

```json
{
  "name": "Site Name",
  "url": "https://example.com",
  "description": "One honest sentence about what it's good for.",
  "level": "Beginner",
  "price": "Free",
  "tags": ["keyword", "another keyword"]
}
```

To add a new subject, copy an existing category block and give it a new `id`.

## A few notes

- I check links when I add them, but I can't check them all the time. Let me know if something's off.
- Descriptions are my own summaries. They may not match a site's current offer exactly.
- This project is a personal list, not an affiliate site. I don't earn anything from these links.

## Thanks

To everyone who builds and maintains free learning resources. You make it possible to learn things without paying for every step.
