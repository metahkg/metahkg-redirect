import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Text, Link, Checkbox, Collapse } from "@nextui-org/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import MetahkgLogo from "../components/logo";
import { regex } from "../lib/regex";
import { InfoData, UrlHausThreat } from "./api/info";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import { safebrowsing_v4 } from "@googleapis/safebrowsing";

export default function Redirect() {
  const router = useRouter();
  const [timer, setTimer] = useState(5);
  const [disclaimer, setDisclaimer] = useState(false);
  const url = decodeURIComponent(String(router.query.url));

  const { data, error } = useSWR<InfoData>(
    `/api/info?url=${encodeURIComponent(url)}`,
    async (url: string) => await fetch(url).then((res) => res.json())
  );

  useEffect(() => {
    if (data && !("error" in data) && data.safe) {
      const timerInterval = setInterval(() => {
        console.log("timer");
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [data, timer]);

  if (!data) {
    return <Text>Loading...</Text>;
  }

  if (error || "error" in data)
    return <Text>Error {("error" in data && data.error) || error}</Text>;

  if (!regex.url.test(url)) {
    return <Text>Invalid url</Text>;
  }

  if (timer === 0) {
    window.location.assign(url);
  }

  const threat:
    | safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
    | UrlHausThreat = data.safebrowsing_threats[0] || data.urlhaus_threats[0];

  return (
    <div className="bg-[#222] min-h-[100vh] w-[100vw] max-h-full overflow-scroll flex justify-center">
      <div className="flex flex-col items-center justify-center w-[70vw] mt-[50px] mb-[50px]">
        <Text h1 className="flex items-center mb-[20px]">
          <MetahkgLogo light height={60} width={60} />
          Metahkg
        </Text>

        <Text h4>
          You will be redirected to the following url
          {data.safe && ` in ${timer} seconds`}:
        </Text>
        <code className="mb-[15px]">{url}</code>

        {!data.safe && (
          <div className="mb-[20px] flex flex-col items-center">
            <Collapse
              className="min-w-[50vw]"
              shadow
              title={
                <Text h4 color="warning">
                  <FontAwesomeIcon icon={faWarning} />{" "}
                  {data.safebrowsing_threats.length
                    ? "Google safebrowsing"
                    : "Urlhaus"}{" "}
                  identified this url as a threat. Proceed with caution.
                </Text>
              }
              subtitle="Click here for more information."
              color="warning"
            >
              {data.urlhaus_threats[0]?.urlhaus_link && (
                <div>
                  <Text>
                    Visit{" "}
                    <Link href={data.urlhaus_threats[0].urlhaus_link}>
                      urlhaus
                    </Link>{" "}
                    for more information on this threat.
                  </Text>
                  <Text>{`Threat type: ${
                    threat.threatType || (threat as UrlHausThreat).threat
                  }`}</Text>
                  {threat.platformType && (
                    <Text>{`Platform: ${threat.platformType}`}</Text>
                  )}
                  <Text>{`Url: ${
                    threat.threat?.url || (threat as UrlHausThreat).url
                  }`}</Text>
                  {(threat as UrlHausThreat).tags && (
                    <Text>{`Tags: ${(threat as UrlHausThreat).tags}`}</Text>
                  )}
                </div>
              )}
            </Collapse>
            <Checkbox className="mt-[10px]" onChange={setDisclaimer}>
              <Text>
                I understand the possible consequences, and that Metahkg will
                <br />
                not be responsible for any possible damages caused by the url.
              </Text>
            </Checkbox>
          </div>
        )}

        <div className="flex align-center">
          <Link href={url}>
            <Button
              color={data.safe ? "default" : "error"}
              disabled={!data.safe && !disclaimer}
            >
              Proceed
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
