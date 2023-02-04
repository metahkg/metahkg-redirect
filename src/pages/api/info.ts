// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { safebrowsing, safebrowsing_v4 } from "@googleapis/safebrowsing";
import type { NextApiRequest, NextApiResponse } from "next";
import dotenv from "dotenv";
import { ajv } from "../../lib/ajv";
import { Static, Type } from "@sinclair/typebox";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { parsecsv } from "../../lib/parsecsv";
import { regex } from "../../lib/regex";

dotenv.config();

async function dl_urlhaus() {
  try {
    const malware_csv = await fetch(
      // online malware urls only
      // see https://urlhaus.abuse.ch/api/
      "https://urlhaus.abuse.ch/downloads/csv_online/"
    ).then((res) => res.text());

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

    const malware_json = parsecsv(malware_csv, columns, {
      comments: "#",
      delimiter: ",",
    });

    mkdirSync("data", { recursive: true });
    writeFileSync("data/malware.json", JSON.stringify(malware_json));
  } catch (e) {
    console.error(e);
  }
}

dl_urlhaus();
setInterval(
  dl_urlhaus,
  // 30 minutes
  1000 * 60 * 30
);

export type InfoData =
  | {
      safe: boolean;
      safebrowsing_threats: safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch[];
      urlhaus_threats: UrlHausThreat[];
    }
  | {
      error: string;
    };

export interface UrlHausThreat {
  id: string;
  dateadded: string;
  url: string;
  url_status: "online" | "offline";
  threat: string;
  tags: string;
  urlhaus_link: string;
  reporter: string;
}

const querySchema = Type.Object(
  { url: Type.RegEx(regex.url) },
  { additionalProperties: false }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InfoData>
) {
  req.query.url = decodeURIComponent((req.query.url || "") as string);

  if (!ajv.validate(querySchema, req.query)) {
    return res.status(400).json({ error: "Bad request." });
  }

  const { url } = req.query as Static<typeof querySchema>;
  const url_object = new URL(url);

  const urlList = [
    url.replace(`${url_object.protocol}//`, ""),
    url.startsWith("https://")
      ? url.replace(`https://`, "http://")
      : url.replace(`http://`, "https://"),
    url_object.origin + url_object.pathname,
    url_object.origin,
    url,
  ];

  const safebrowsing_threats = await safebrowsing("v4")
    .threatMatches.find({
      auth: process.env.SAFEBROWSING_API_KEY,
      requestBody: {
        threatInfo: { threatEntries: urlList.map((url) => ({ url })) },
      },
    })
    .then((res) => res.data.matches || [])
    .catch((err) => {
      console.error(err);
      return null;
    });

  let urlhaus_threats: UrlHausThreat[];

  try {
    urlhaus_threats =
      (
        JSON.parse(
          readFileSync("./data/malware.json", "utf8")
        ) as UrlHausThreat[]
      ).filter(
        (threats) =>
          urlList.includes(threats.url) ||
          urlList.some((url) => url.startsWith(threats.url))
      ) || [];
  } catch (e) {
    urlhaus_threats = [];
    console.error(e);
  }

  if (safebrowsing_threats === null) {
    return res.status(500).json({ error: "Internal server error." });
  }

  res.status(200).json({
    safe: !Boolean(safebrowsing_threats.length + urlhaus_threats.length),
    safebrowsing_threats,
    urlhaus_threats,
  });
}
