# API-free AI news publishing workflow

This site uses a human-reviewed workflow: ChatGPT researches and drafts, then an editor saves a private draft and publishes it only after a fact check.

## 1. Create the recurring ChatGPT task

In ChatGPT Plus, create a weekday scheduled task with this prompt. Keep the rules in the task prompt because scheduled tasks do not use Project uploads.

```text
Every weekday at 08:00 Asia/Seoul, research notable AI, productivity, and developer-tool news published in the last 24 hours. Use official announcements and reputable reporting only.

Return everything in English:
1. Five candidate stories with publisher, publication date, source URL, and a one-sentence statement of the verified fact.
2. One recommended story, with a short explanation of why it matters to practical AI-tool users.
3. A 1,200–1,800 word Markdown article draft with an H2 introduction, two or three H2 sections, and a short takeaway.
4. Three SEO headline options, one meta description (under 155 characters), and five tags.
5. A Sources section containing every URL used.

Rules:
- Do not copy wording from source articles beyond a short necessary quotation.
- Clearly distinguish verified facts from analysis.
- Never invent dates, pricing, product availability, quotes, or capabilities.
- If a claim cannot be verified, omit it.
- Write in clear English for readers who use AI tools at work.
```

## 2. Editorial checklist

Before publishing, verify every date, number, quote, feature claim, and source link against the original source. Remove unsupported claims, duplicated coverage, and long excerpts. The published article must add original explanation, not merely paraphrase a news report.

## 3. Publish in this site

1. Sign in at `/admin` and open **News workflow**.
2. Copy the scheduled result into a new post and review every source link.
3. Edit the Markdown as needed, then select **Publish** only after the checklist is complete.

The scheduled task does not publish to this site automatically. Published posts appear in the blog, search, category pages, and sitemap.

## 4. Optional no-code assistance

RSS tools (such as Feedly or Inoreader) can send official-source summaries to email. Use them as a second input for the scheduled task. Browser/RPA tools may fill the draft form, but keep publishing as a manual approval step: UI automation can fail when a site or login flow changes.
