import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Text,
  Link,
  Checkbox,
  Collapse,
  Container,
  Grid,
} from "@nextui-org/react";
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
    regex.url.test(url) ? `/api/info?url=${encodeURIComponent(url)}` : null,
    async (url: string | null) =>
      url ? await fetch(url).then((res) => res.json()) : null
  );

  useEffect(() => {
    if (data && !("error" in data) && data.safe && timer >= 1) {
      const timerInterval = setInterval(() => {
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
    window.location.assign(data.redirectUrl || url);
  }

  const threat:
    | safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
    | UrlHausThreat = data.safebrowsingThreats[0] || data.urlhausThreats[0];

  return (
    <Container className="bg-[#222] min-h-[100vh] w-[100vw] max-w-[100vw] max-h-full overflow-y-scroll flex justify-center">
      <Container className="flex flex-col items-center justify-center w-[70vw] mt-[50px] mb-[50px]">
        <Text h1 className="flex items-center mb-[20px]">
          <MetahkgLogo light height={60} width={60} />
          Metahkg
        </Text>

        <Text h4>You will be redirected to the following url:</Text>
        <code>{url}</code>
        <Grid.Container gap={2} className="flex flex-col items-center w-full">
          <Grid>
            <Collapse.Group
              accordion={false}
              splitted
              shadow
              className="min-w-[50vw]"
            >
              {data.redirects && (
                <Collapse
                  title={<Text h4>Redirect URL detected</Text>}
                  subtitle={data.redirectUrl}
                >
                  Metahkg Redirect detected this url redirects to:
                  <br />
                  <code>{data.redirectUrl}</code>
                </Collapse>
              )}
              {!data.safe && (
                <Collapse
                  title={
                    <Text h4 color="warning">
                      <FontAwesomeIcon icon={faWarning} />{" "}
                      {data.safebrowsingThreats.length
                        ? "Google safebrowsing"
                        : "Urlhaus"}{" "}
                      identified this url as a threat. Proceed with caution.
                    </Text>
                  }
                  subtitle="Click here for more information."
                  color="warning"
                >
                  {data.urlhausThreats[0]?.urlhaus_link && (
                    <Container>
                      <Text>
                        Visit{" "}
                        <Link
                          href={data.urlhausThreats[0].urlhaus_link}
                          target="_blank"
                          rel="noreferrer"
                          isExternal
                        >
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
                    </Container>
                  )}
                </Collapse>
              )}
            </Collapse.Group>
          </Grid>
        </Grid.Container>

        {!data.safe && (
          <Container>
            <Checkbox className="mb-[10px]" onChange={setDisclaimer}>
              <Text>
                I understand the possible consequences, and that Metahkg will
                not be responsible for any possible damages caused by the url.
              </Text>
            </Checkbox>
          </Container>
        )}

        <Container className="flex justify-center">
          {Boolean(data.redirectUrl) && (
            <Link href={data.redirectUrl}>
              <Button
                color="gradient"
                bordered
                disabled={!data.safe && !disclaimer}
                className="mr-[15px]"
              >
                Proceed directly{data.safe && ` (in ${timer}s)`}
              </Button>
            </Link>
          )}
          <Link href={url}>
            <Button
              color={data.safe ? "default" : "error"}
              disabled={!data.safe && !disclaimer}
            >
              Proceed{data.safe && !data.redirects && ` (in ${timer}s)`}
            </Button>
          </Link>
        </Container>
      </Container>
    </Container>
  );
}
