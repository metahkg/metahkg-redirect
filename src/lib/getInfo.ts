// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { safebrowsing, safebrowsing_v4 } from "@googleapis/safebrowsing";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { parsecsv } from "./parsecsv";
import { regex } from "./regex";
import { TidyURL } from "tidy-url";
import { config } from "./config";
import { redis } from "./redis";
import { sha256 } from "./hash";
import { UrlHausThreat } from "../types/threat";

let downloaded = false;

async function downloadData() {
  try {
    mkdirSync("data", { recursive: true });

    const malware_urls_csv = await fetch(
      // online malware urls
      // see https://urlhaus.abuse.ch/api/
      "https://urlhaus.abuse.ch/downloads/csv_online/"
    )
      .then((res) => res.text())
      .catch(() => null);

    if (malware_urls_csv) {
      const columns = [
        "id",
        "dateadded",
        "url",
        "url_status",
        "threat",
        "tags",
        "urlhaus_link",
        "reporter",
      ];

      const malware_urls_json = parsecsv(malware_urls_csv, columns, {
        comments: "#",
        delimiter: ",",
      });
      writeFileSync(
        "data/malware-urls.json",
        JSON.stringify(malware_urls_json)
      );
    }

    const malware_hosts_txt = await fetch(
      // malware hosts
      // https://gitlab.com/malware-filter/urlhaus-filter
      "https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-domains.txt"
    )
      .then((res) => res.text())
      .catch(() => null);

    if (malware_hosts_txt) {
      const malware_hosts_json = malware_hosts_txt
        .trim()
        .split("\n")
        .filter((line) => !line.startsWith("#"))
        .map((line) => line.trim());
      writeFileSync(
        "data/malware-hosts.json",
        JSON.stringify(malware_hosts_json)
      );
    }
  } catch (e) {
    console.error(e);
  }
  downloaded = true;
}

try {
  statSync("data/malware-urls.json");
  statSync("data/malware-hosts.json");
  downloaded = true;
} catch {
  downloaded = false;
}

downloadData();
setInterval(
  downloadData,
  // 30 minutes
  1000 * 60 * 30
);

export type InfoData =
  | {
      unsafe: boolean;
      reachable: boolean;
      malicious: boolean;
      maliciousHost?: string;
      redirects?: boolean;
      redirectUrl?: string;
      tracking?: boolean;
      tidyUrl?: string;
      safebrowsingThreats: safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch[];
      urlhausThreats: UrlHausThreat[];
    }
  | {
      statusCode: number;
      error: string;
    };

export default async function getInfo(url: string): Promise<InfoData> {
  if (!regex.url.test(url)) {
    return { statusCode: 400, error: "Invalid URL" };
  }

  const redisKey = `url-${sha256(url)}`;

  const cached = await redis.get(redisKey).catch((err) => {
    console.error(err);
    return null;
  });

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error(err);
    }
  }

  const url_object = new URL(url);

  const controller = new AbortController();

  // 3 seconds timeout:
  const timeoutId = setTimeout(controller.abort, 3000);

  const actualUrl = await fetch(url, {
    redirect: "follow",
    signal: controller.signal,
  })
    .then((res) => {
      clearTimeout(timeoutId);
      if (regex.url.test(res.url)) {
        return res.url;
      }
      return false;
    })
    .catch(() => null);

  const reachable = actualUrl !== null;

  const redirects = actualUrl
    ? new URL(actualUrl).pathname !== url_object.pathname ||
      new URL(actualUrl).host !== url_object.host
    : null;

  const tidyUrl = TidyURL.clean(actualUrl || url).url;

  const tracking = tidyUrl !== (actualUrl || url);

  while (!downloaded) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const urlList = [
    url.replace(`${url_object.protocol}//`, ""),
    url.startsWith("https://")
      ? url.replace(`https://`, "http://")
      : url.replace(`http://`, "https://"),
    url_object.origin + url_object.pathname,
    url_object.origin,
    url,
    redirects && actualUrl,
  ].filter(Boolean) as string[];

  const safebrowsingThreats = await safebrowsing("v4")
    .threatMatches.find({
      auth: config.SAFEBROWSING_API_KEY,
      requestBody: {
        threatInfo: { threatEntries: urlList.map((url) => ({ url })) },
      },
    })
    .then((res) => res.data.matches || [])
    .catch((err) => {
      console.error(err);
      return null;
    });

  if (safebrowsingThreats === null) {
    return { statusCode: 500, error: "Internal server error." };
  }

  let urlhausThreats: UrlHausThreat[];

  try {
    urlhausThreats =
      (
        JSON.parse(
          readFileSync("data/malware-urls.json", "utf8")
        ) as UrlHausThreat[]
      ).filter(
        (threats) =>
          urlList.includes(threats.url) ||
          urlList.some((url) => url.startsWith(threats.url))
      ) || [];
  } catch (e) {
    urlhausThreats = [];
    console.error(e);
  }

  let malicious: boolean = false;
  let maliciousHost: string = "";
  try {
    const maliciousHosts = JSON.parse(
      readFileSync("data/malware-hosts.json", "utf8")
    ) as string[];
    maliciousHost = (
      [redirects && actualUrl, url].filter(Boolean) as string[]
    ).reduce((prev, curr: string) => {
      const host = new URL(curr).host;
      return maliciousHosts.includes(host) ? host : prev;
    }, maliciousHost);
    if (maliciousHost) {
      malicious = true;
    }
  } catch (e) {
    console.error(e);
  }

  const result = {
    unsafe: Boolean(
      safebrowsingThreats.length + urlhausThreats.length + Number(malicious)
    ),
    malicious,
    ...(maliciousHost && { maliciousHost }),
    reachable,
    ...(actualUrl && redirects && { redirectUrl: actualUrl }),
    ...(redirects !== null && { redirects }),
    tracking,
    ...(tracking && { tidyUrl }),
    safebrowsingThreats: safebrowsingThreats,
    urlhausThreats: urlhausThreats,
  };

  redis
    .set(
      redisKey,
      JSON.stringify(result),
      "EX",
      // ttl: 30 minutes
      60 * 30
    )
    .catch(console.error);

  return result;
}
