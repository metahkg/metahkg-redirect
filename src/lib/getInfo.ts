// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { safebrowsing, safebrowsing_v4 } from "@googleapis/safebrowsing";
import { mkdirSync } from "fs";
import { parsecsv } from "./parsecsv";
import { regex } from "./regex";
import { TidyURL } from "tidy-url";
import { config } from "./config";
import { redis } from "./redis";
import { sha256 } from "./hash";
import { UrlHausThreat } from "../types/threat";
import { genCheckUrlList } from "./genCheckUrlList";
import { isForbiddenHost } from "./isForbiddenHost";
import { client, db, malwareHostsCl, malwareUrlsCl } from "./db";
import { ObjectId } from "mongodb";

let downloaded = false;

/**
 * @description download malware threats data from urlhaus.abuse.ch
 */
async function downloadData() {
  await client.connect();

  try {
    mkdirSync("data", { recursive: true });

    const malware_urls_csv = await fetch(
      // online malware urls
      // see https://urlhaus.abuse.ch/api/
      "https://urlhaus.abuse.ch/downloads/csv_online/",
    )
      .then((res) => res.text())
      .catch(() => null);

    let columns = [
      "id",
      "dateadded",
      "url",
      "url_status",
      "last_online",
      "threat",
      "tags",
      "urlhaus_link",
      "reporter",
    ];

    if (malware_urls_csv) {
      const lines = malware_urls_csv.trim().split("\n");
      for (let index = 0; index < 50; index++) {
        if (!lines[index].trim().startsWith("#")) {
          columns = lines[index - 1].replace("#", "").trim().split(",");
          return;
        }
      }
    }

    const malware_urls = malware_urls_csv
      ? (parsecsv(malware_urls_csv, columns, {
          comments: "#",
          delimiter: ",",
        }) as unknown as UrlHausThreat[])
      : null;

    const malware_hosts_txt = await fetch(
      // malware hosts
      // https://gitlab.com/malware-filter/urlhaus-filter
      "https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-domains.txt",
    )
      .then((res) => res.text())
      .catch(() => null);

    const malware_hosts = malware_hosts_txt
      ? malware_hosts_txt
          .trim()
          .split("\n")
          .filter((line) => !line.startsWith("#"))
          .map((line) => line.trim())
          .map((host) => ({ host }))
      : null;

    try {
      if (malware_urls) {
        await db.collection("malware-urls-temp").createIndex({ url: 1 });
        await db.collection("malware-urls-temp").insertMany(malware_urls);
        await malwareUrlsCl.drop().catch(() => {});
        await db.renameCollection("malware-urls-temp", "malware-urls");
      }
      if (malware_hosts) {
        await db.collection("malware-hosts-temp").createIndex({ host: 1 });
        await db.collection("malware-hosts-temp").insertMany(malware_hosts);
        await malwareHostsCl.drop().catch(() => {});
        await db.renameCollection("malware-hosts-temp", "malware-hosts");
      }
    } finally {
      await client.close();
    }
  } catch (e) {
    console.error(e);
  }
  downloaded = true;
}

(async () => {
  try {
    await client.connect();
    if (
      (await malwareUrlsCl.countDocuments()) +
        (await malwareHostsCl.countDocuments()) >
      0
    ) {
      downloaded = true;
    }
  } catch {
    downloaded = false;
  } finally {
    await client.close();
  }
})();

downloadData();
setInterval(
  downloadData,
  // 30 minutes
  1000 * 60 * 30,
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

/**
 * @description get info for url - threats, redirects, tracking, reachability
 * @param {string} url - url to check
 */
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

  if (await isForbiddenHost(url_object.hostname)) {
    return { statusCode: 403, error: "Forbidden" };
  }

  const controller = new AbortController();

  // 3 seconds timeout:
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  const actualUrl = await fetch(url, {
    redirect: "follow",
    signal: controller.signal,
  })
    .then(async (res) => {
      clearTimeout(timeoutId);
      if (regex.url.test(res.url)) {
        if (await isForbiddenHost(res.url)) {
          return false;
        }
        return res.url;
      }
      return false;
    })
    .catch(() => null);

  const actualUrl_object = actualUrl ? new URL(actualUrl) : null;

  const reachable = actualUrl !== null;

  const redirects = actualUrl
    ? actualUrl_object?.pathname !== url_object.pathname ||
      actualUrl_object?.host !== url_object.host
    : null;

  const tidyUrl = TidyURL.clean(actualUrl || url).url;

  const tracking = tidyUrl !== (actualUrl || url);

  while (!downloaded) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  let checkUrlList = genCheckUrlList(url) as string[];

  if (redirects && actualUrl) {
    checkUrlList = checkUrlList.concat(genCheckUrlList(actualUrl));
  }

  const safebrowsingThreats = await safebrowsing("v4")
    .threatMatches.find({
      auth: config.SAFEBROWSING_API_KEY,
      requestBody: {
        threatInfo: { threatEntries: checkUrlList.map((url) => ({ url })) },
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

  await client.connect();

  let urlhausThreats: UrlHausThreat[];

  try {
    urlhausThreats =
      ((await malwareUrlsCl
        .find({
          url: {
            $in: checkUrlList,
          },
        })
        .project({ _id: 0 })
        .toArray()) as (UrlHausThreat & { _id?: ObjectId })[]) || [];
  } catch (e) {
    urlhausThreats = [];
    console.error(e);
  }

  let malicious = false;
  let maliciousHost = "";
  try {
    maliciousHost = (
      (await malwareHostsCl.findOne({
        host: {
          $in: ([redirects && actualUrl, url].filter(Boolean) as string[]).map(
            (url) => new URL(url).host,
          ),
        },
      })) as { _id?: ObjectId; host: string }
    )?.host;

    if (maliciousHost) {
      malicious = true;
    }
  } catch (e) {
    console.error(e);
  }

  await client.close();

  const result = {
    unsafe: Boolean(
      safebrowsingThreats.length + urlhausThreats.length + Number(malicious),
    ),
    malicious,
    ...(maliciousHost && { maliciousHost }),
    reachable,
    ...(actualUrl && redirects && { redirectUrl: actualUrl }),
    ...(redirects !== null && { redirects }),
    tracking,
    ...(tracking && { tidyUrl }),
    safebrowsingThreats,
    urlhausThreats,
  };

  redis
    .set(
      redisKey,
      JSON.stringify(result),
      "EX",
      // ttl: 30 minutes
      60 * 30,
    )
    .catch(console.error);

  return result;
}
