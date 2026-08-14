#!/usr/bin/env node
/**
 * generate-course-og.mjs
 * -----------------------
 * Generates per-course social preview pages into the built SPA output.
 *
 * WHY: WhatsApp / Facebook / X crawlers do NOT execute JavaScript. A client-side
 * SPA can therefore never provide course-specific <meta property="og:*"> tags on
 * its own. This script solves that with a zero-server, static-host approach:
 *
 *   For every course it writes  dist/subject/<id>/index.html  — a byte-for-byte
 *   copy of the real built index.html (so the SPA boots exactly as normal for
 *   users) but with the OG/Twitter meta tags replaced by that course's own
 *   title / description / image / url.
 *
 *   nginx serves these files automatically through the standard SPA fallback
 *   `try_files $uri $uri/ /index.html`: a request for /subject/123 matches the
 *   directory dist/subject/123/ and nginx serves its index.html. Real users
 *   get the identical app shell; crawlers read the course-specific tags.
 *
 * USAGE:  run AFTER `npm run build`  (see package.json "build:full")
 *
 * ENV:
 *   VITE_API_URL   API base (defaults to https://api.elmanssa.com/api/v1)
 *   OG_BASE_URL    canonical site origin (defaults to https://elmanssa.com)
 *   OG_IMAGE_URL   fallback preview image for courses without an absolute image
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");
const TEMPLATE_FILE = path.join(DIST_DIR, "index.html");
const API_BASE = (process.env.VITE_API_URL || "https://api.elmanssa.com/api/v1").replace(/\/+$/, "");
const OG_BASE_URL = (process.env.OG_BASE_URL || "https://elmanssa.com").replace(/\/+$/, "");
const OG_IMAGE_URL = process.env.OG_IMAGE_URL || `${OG_BASE_URL}/assets/og-image.png`;
const PER_PAGE = 100;
const OG_DESCRIPTION_MAX = 155;
const OG_TITLE_MAX = 80;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function escapeAttr(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function cleanText(value) {
    return String(value ?? "")
        .replace(/<[^>]*>/g, " ")   // strip HTML tags
        .replace(/\s+/g, " ")       // collapse whitespace
        .trim();
}

function truncate(value, max) {
    const text = cleanText(value);
    if (text.length <= max) return text;
    return text.slice(0, max - 1).trimEnd() + "…";
}

function isAbsoluteImageUrl(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url);
}

function findPathIds(item) {
    const ids = new Set();
    if (item && item.id !== undefined && item.id !== null && item.id !== "") {
        ids.add(String(item.id));
    }
    if (item && item.guidId) {
        ids.add(String(item.guidId));
    }
    return [...ids];
}

/* ── Fetch all courses (handles array and { data, meta } shapes) ─────────── */

async function fetchAllCourses() {
    const all = [];
    let page = 1;
    let total = Infinity;

    while (all.length < total) {
        const url = `${API_BASE}/subjects?page=${page}&per_page=${PER_PAGE}`;
        let json;
        try {
            const res = await fetch(url, {
                headers: { Accept: "application/json" },
                signal: AbortSignal.timeout(15_000),
            });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} from ${url}`);
            }
            json = await res.json();
        } catch (err) {
            throw new Error(`Failed to fetch courses from ${url}: ${err.message}`);
        }

        const raw = Array.isArray(json) ? json : json?.data;
        if (!Array.isArray(raw) || raw.length === 0) break;

        all.push(...raw);
        const metaTotal = typeof json?.meta?.total === "number" ? json.meta.total : raw.length;
        if (Number.isFinite(metaTotal)) total = metaTotal;

        if (raw.length < PER_PAGE) break; // no more pages
        page += 1;
    }
    return all;
}

/* ── Per-course tag injection ────────────────────────────────────────────── */

function buildCourseHtml(template, course, pathId) {
    const title = truncate(course.title || "دورة تعليمية", OG_TITLE_MAX);
    const description = truncate(course.description, OG_DESCRIPTION_MAX);
    const ogTitle = `${title} | المنصة | Elmanssa`.slice(0, OG_TITLE_MAX + 20);
    const image = isAbsoluteImageUrl(course.imageUrl) ? course.imageUrl : OG_IMAGE_URL;
    const url = `${OG_BASE_URL}/subject/${encodeURIComponent(pathId)}`;

    let html = template;

    html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${escapeAttr(ogTitle)}</title>`);

    // Replace the content= value of a meta tag whether it sits on one line or
    // spans several (index.html keeps property and content on separate lines).
    // Preserves everything around the value, including line breaks.
    const replaceContent = (attrPattern, value) => {
        const re = new RegExp(`(<meta\\s+${attrPattern})([\\s\\S]*?)(content=)["'][^"']*["']`);
        return html.replace(re, (_m, open, between, prefix) => `${open}${between}${prefix}"${escapeAttr(value)}"`);
    };

    // SEO (name=description) + OG + Twitter
    if (description) html = replaceContent('name="description"', description);
    html = replaceContent('property="og:title"', ogTitle);
    if (description) html = replaceContent('property="og:description"', description);
    html = replaceContent('property="og:url"', url);
    html = replaceContent('property="og:image"', image);

    // Drop image dimensions when the course image isn't the known 1200×630 banner
    if (image === OG_IMAGE_URL) {
        if (!/og:image:type/.test(html)) {
            html = html.replace('property="og:image"', 'property="og:image:type" content="image/png" />\n  <meta property="og:image"');
        }
        if (!/og:image:width/.test(html)) {
            html = html.replace('property="og:image:type" content="image/png" />', '$&<meta property="og:image:width" content="1200" />');
        }
        if (!/og:image:height/.test(html)) {
            html = html.replace('property="og:image:width" content="1200" />', '$&<meta property="og:image:height" content="630" />');
        }
    } else {
        html = html
            .replace(/\n\s*<meta property="og:image:(type|width|height)"[^>]*\/?>/g, "")
            .replace(/\s*\/?>$/, " />");
    }

    html = replaceContent('name="twitter:title"', ogTitle);
    html = replaceContent('name="twitter:description"', description);
    html = replaceContent('name="twitter:image"', image);

    return html;
}

/* ── Main ────────────────────────────────────────────────────────────────── */

async function main() {
    if (!existsSync(TEMPLATE_FILE)) {
        console.error(`[build:og] dist/index.html not found. Run "npm run build" first.`);
        process.exit(1);
    }

    let courses;
    try {
        courses = await fetchAllCourses();
    } catch (err) {
        // Never fail the deploy because the API was unreachable — new courses
        // simply won't get preview pages until the next successful run.
        console.error(`[build:og] WARNING: ${err.message}`);
        console.error(`[build:og] Skipping per-course preview generation (homepage preview stays default).`);
        return;
    }

    if (courses.length === 0) {
        console.warn("[build:og] No courses returned by API — nothing generated.");
        return;
    }

    const template = await readFile(TEMPLATE_FILE, "utf8");
    let written = 0;

    for (const course of courses) {
        for (const pathId of findPathIds(course)) {
            const outDir = path.join(DIST_DIR, "subject", pathId);
            const outFile = path.join(outDir, "index.html");
            await mkdir(outDir, { recursive: true });
            await writeFile(outFile, buildCourseHtml(template, course, pathId), "utf8");
            written += 1;
        }
    }

    console.log(`[build:og] Generated ${written} per-course preview page(s) for ${courses.length} course(s).`);
    console.log(`[build:og] e.g. ${OG_BASE_URL}/subject/${encodeURIComponent(String(courses[0].id ?? ""))}`);
    console.log(`[build:og] NOTE: nginx must fall back via "try_files $uri $uri/ /index.html" (or serve dist/subject/*/index.html) for these to be reachable.`);
}

main().catch((err) => {
    console.error("[build:og] Fatal error:", err);
    process.exit(1);
});
