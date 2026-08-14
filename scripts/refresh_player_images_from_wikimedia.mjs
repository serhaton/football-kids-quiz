import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const players = [
  { id: "messi", name: "Lionel Messi", wikiTitle: "Lionel Messi" },
  { id: "ronaldo", name: "Cristiano Ronaldo", wikiTitle: "Cristiano Ronaldo" },
  { id: "mbappe", name: "Kylian Mbappe", wikiTitle: "Kylian Mbappe" },
  { id: "haaland", name: "Erling Haaland", wikiTitle: "Erling Haaland" },
  { id: "neymar", name: "Neymar", wikiTitle: "Neymar" },
  { id: "salah", name: "Mohamed Salah", wikiTitle: "Mohamed Salah" },
  { id: "vinicius", name: "Vinicius Junior", wikiTitle: "Vinicius Junior" },
  { id: "bellingham", name: "Jude Bellingham", wikiTitle: "Jude Bellingham" },
  { id: "debruyne", name: "Kevin De Bruyne", wikiTitle: "Kevin De Bruyne" },
  { id: "kane", name: "Harry Kane", wikiTitle: "Harry Kane" },
  { id: "modric", name: "Luka Modric", wikiTitle: "Luka Modric" },
  { id: "lewandowski", name: "Robert Lewandowski", wikiTitle: "Robert Lewandowski" },
  { id: "benzema", name: "Karim Benzema", wikiTitle: "Karim Benzema" },
  { id: "griezmann", name: "Antoine Griezmann", wikiTitle: "Antoine Griezmann" },
  { id: "pedri", name: "Pedri", wikiTitle: "Pedri" },
  { id: "rodri", name: "Rodri", wikiTitle: "Rodri" },
  { id: "foden", name: "Phil Foden", wikiTitle: "Phil Foden" },
  { id: "saka", name: "Bukayo Saka", wikiTitle: "Bukayo Saka" },
  { id: "yamal", name: "Lamine Yamal", wikiTitle: "Lamine Yamal" },
  { id: "musiala", name: "Jamal Musiala", wikiTitle: "Jamal Musiala" },
  { id: "calhanoglu", name: "Hakan Calhanoglu", wikiTitle: "Hakan Calhanoglu" },
  { id: "ardaguler", name: "Arda Guler", wikiTitle: "Arda Guler" },
  { id: "ilkaygundogan", name: "Ilkay Gundogan", wikiTitle: "Ilkay Gundogan" },
  { id: "orkunkokcu", name: "Orkun Kokcu", wikiTitle: "Orkun Kokcu" },
  { id: "merihdemiral", name: "Merih Demiral", wikiTitle: "Merih Demiral" }
];

function stripHtml(value = "") {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url) {
  const res = await fetchWithRetry(url);
  return res.json();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options = {}, maxRetries = 6) {
  let attempt = 0;
  while (true) {
    const res = await fetch(url, {
      ...options,
      headers: {
        "User-Agent": "football-kids-quiz-attribution-updater/1.0 (non-commercial; app-review-evidence)",
        ...(options.headers || {})
      }
    });

    if (res.ok) {
      return res;
    }

    const retryable = res.status === 429 || res.status === 503 || res.status === 502;
    if (!retryable || attempt >= maxRetries) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }

    const retryAfter = Number(res.headers.get("retry-after"));
    const backoffMs = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : 1200 * Math.pow(2, attempt);
    await sleep(backoffMs);
    attempt += 1;
  }
}

function csvCell(value) {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function main() {
  const playersDir = path.join(projectRoot, "assets", "players");
  const docsDir = path.join(projectRoot, "docs");
  const tmpDir = path.join(projectRoot, ".tmp", "wikimedia-images");
  await ensureDir(tmpDir);
  await ensureDir(docsDir);

  const rows = [];

  for (const player of players) {
    const row = {
      id: player.id,
      player: player.name,
      localFile: `assets/players/${player.id}.png`,
      wikiTitle: player.wikiTitle,
      wikipediaPageUrl: "",
      commonsFileName: "",
      commonsFilePageUrl: "",
      imageDownloadUrl: "",
      author: "",
      credit: "",
      licenseShortName: "",
      licenseUrl: "",
      modified: "Yes",
      status: "ok",
      note: ""
    };

    try {
      const wikiApi = new URL("https://en.wikipedia.org/w/api.php");
      wikiApi.searchParams.set("action", "query");
      wikiApi.searchParams.set("format", "json");
      wikiApi.searchParams.set("formatversion", "2");
      wikiApi.searchParams.set("redirects", "1");
      wikiApi.searchParams.set("prop", "pageimages");
      wikiApi.searchParams.set("piprop", "name");
      wikiApi.searchParams.set("titles", player.wikiTitle);

      const wikiJson = await fetchJson(wikiApi.toString());
      const page = wikiJson?.query?.pages?.[0];
      if (!page || page.missing || !page.pageimage) {
        throw new Error("No page image found on Wikipedia page");
      }

      const pageTitle = page.title;
      const fileName = page.pageimage;
      row.wikipediaPageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;
      row.commonsFileName = fileName;

      const commonsApi = new URL("https://commons.wikimedia.org/w/api.php");
      commonsApi.searchParams.set("action", "query");
      commonsApi.searchParams.set("format", "json");
      commonsApi.searchParams.set("formatversion", "2");
      commonsApi.searchParams.set("prop", "imageinfo");
      commonsApi.searchParams.set("iiprop", "url|extmetadata");
      commonsApi.searchParams.set("iiurlwidth", "900");
      commonsApi.searchParams.set("titles", `File:${fileName}`);

      const commonsJson = await fetchJson(commonsApi.toString());
      const commonsPage = commonsJson?.query?.pages?.[0];
      const info = commonsPage?.imageinfo?.[0];
      if (!info) {
        throw new Error("No Commons image info found");
      }

      const ext = info.extmetadata || {};
      const author = stripHtml(ext.Artist?.value || "");
      const credit = stripHtml(ext.Credit?.value || "");
      const licenseShortName = stripHtml(ext.LicenseShortName?.value || "");
      const licenseUrl = stripHtml(ext.LicenseUrl?.value || "");

      const downloadUrl = info.thumburl || info.url;
      if (!downloadUrl) {
        throw new Error("No downloadable image URL found");
      }

      row.commonsFilePageUrl = info.descriptionurl || "";
      row.imageDownloadUrl = downloadUrl;
      row.author = author;
      row.credit = credit;
      row.licenseShortName = licenseShortName;
      row.licenseUrl = licenseUrl;

      const tmpIn = path.join(tmpDir, `${player.id}.img`);
      const outPng = path.join(playersDir, `${player.id}.png`);

      const imgRes = await fetchWithRetry(downloadUrl);
      if (!imgRes.ok) {
        throw new Error(`Image download failed: HTTP ${imgRes.status}`);
      }
      const ab = await imgRes.arrayBuffer();
      await fs.writeFile(tmpIn, Buffer.from(ab));

      const sips = spawnSync("sips", ["-s", "format", "png", tmpIn, "--out", outPng], {
        cwd: projectRoot,
        stdio: "pipe",
        encoding: "utf8"
      });
      if (sips.status !== 0) {
        throw new Error(`sips failed: ${sips.stderr || sips.stdout}`);
      }

      await fs.unlink(tmpIn).catch(() => {});
    } catch (err) {
      row.status = "failed";
      row.note = err instanceof Error ? err.message : String(err);
    }

    rows.push(row);
    console.log(`${player.id}: ${row.status}${row.note ? ` (${row.note})` : ""}`);
    await sleep(900);
  }

  const jsonPath = path.join(docsDir, "player_image_sources.json");
  await fs.writeFile(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: rows.length,
        succeeded: rows.filter((r) => r.status === "ok").length,
        failed: rows.filter((r) => r.status !== "ok").length,
        rows
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  const headers = [
    "id",
    "player",
    "localFile",
    "wikipediaPageUrl",
    "commonsFileName",
    "commonsFilePageUrl",
    "imageDownloadUrl",
    "author",
    "credit",
    "licenseShortName",
    "licenseUrl",
    "modified",
    "status",
    "note"
  ];

  const csvLines = [headers.join(",")];
  for (const row of rows) {
    csvLines.push(headers.map((h) => csvCell(row[h])).join(","));
  }
  await fs.writeFile(path.join(docsDir, "player_image_sources.csv"), csvLines.join("\n") + "\n", "utf8");

  const mdLines = [
    "# Player Image Sources",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "| Player | Local File | Wikipedia Page | Commons File Page | Author | License | License URL | Status |",
    "|---|---|---|---|---|---|---|---|"
  ];

  for (const row of rows) {
    mdLines.push(
      `| ${row.player} | ${row.localFile} | ${row.wikipediaPageUrl || "-"} | ${row.commonsFilePageUrl || "-"} | ${row.author || "-"} | ${row.licenseShortName || "-"} | ${row.licenseUrl || "-"} | ${row.status}${row.note ? ` (${row.note.replace(/\|/g, "/")})` : ""} |`
    );
  }

  await fs.writeFile(path.join(docsDir, "player_image_sources.md"), mdLines.join("\n") + "\n", "utf8");

  const successCount = rows.filter((r) => r.status === "ok").length;
  const failCount = rows.length - successCount;
  console.log(`Done. Success: ${successCount}, Failed: ${failCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
