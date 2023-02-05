import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Text,
  Link,
  Checkbox,
  Collapse,
  Container,
  Grid,
  Loading,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import MetahkgLogo from "../components/logo";
import { regex } from "../lib/regex";
import { InfoData, UrlHausThreat } from "./api/info";
import { faCancel, faWarning } from "@fortawesome/free-solid-svg-icons";
import { safebrowsing_v4 } from "@googleapis/safebrowsing";

export default function Redirect() {
  const router = useRouter();
  const [timer, setTimer] = useState(5);
  const [disclaimer, setDisclaimer] = useState(false);
  const [cancel, setCancel] = useState(false);
  const url = decodeURIComponent(String(router.query.url));

  const { data, error } = useSWR<InfoData>(
    regex.url.test(url) ? `/api/info?url=${encodeURIComponent(url)}` : null,
    async (url: string | null) =>
      url ? await fetch(url).then((res) => res.json()) : null
  );

  const countdown = data && !("error" in data) && data.safe && data.reachable && !cancel;

  useEffect(() => {
    if (countdown && timer >= 1) {
      const timerInterval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [countdown, timer]);

  if (timer === 0 && countdown) {
    window.location.assign(data?.redirectUrl || url);
  }

  const body = useMemo(() => {
    if (url === "undefined") {
      return null;
    }

    if (!regex.url.test(url)) {
      return (
        <Text h4 color="error">
          Invalid url
        </Text>
      );
    }

    if (!data) {
      return <Loading type="points-opacity" size="lg" />;
    }

    if (error || "error" in data) {
      return (
        <Text h4 color="error">
          Error: {("error" in data && data.error) || error}
        </Text>
      );
    }

    const threat:
      | safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
      | UrlHausThreat = data.safebrowsingThreats[0] || data.urlhausThreats[0];

    return (
      <React.Fragment>
        <Text h4>You will be redirected to the following url:</Text>
        <code>{url}</code>
        <Grid.Container gap={2} className="flex flex-col items-center w-full">
          <Grid>
            <Collapse.Group
              splitted
              className="min-w-[50vw]"
            >
              {data.tracking && (
                <Collapse title={<Text h4>Tracking parameters detected</Text>}>
                  Metahkg Redirect detected tracking parameters in the URL.
                  <br />
                  Cleaned URL:
                  <br />
                  <code>{data.tidyUrl}</code>
                </Collapse>
              )}
              {data.redirects && (
                <Collapse
                  title={<Text h4>Redirect URL detected</Text>}
                  subtitle={data.redirectUrl}
                >
                  Metahkg Redirect detected this URL redirects to:
                  <br />
                  <code>{data.redirectUrl}</code>
                </Collapse>
              )}
              {!data.reachable && (
                <Collapse
                  title={
                    <Text h4 color="warning">
                      <FontAwesomeIcon icon={faWarning} /> URL not reachable
                    </Text>
                  }
                >
                  Metahkg Redirect cannot reach the URL.
                  <br />
                  Metahkg Redirect may have been blocked by the URL, or the URL
                  does not exist.
                  <br />
                  Visit at your own risk.
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
                      identified this URL as a threat. Proceed with caution.
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

        <Grid.Container gap={1.5} justify="center">
          {Boolean(data.tidyUrl) && (
            <Grid>
              <Link href={data.tidyUrl}>
                <Button
                  color="gradient"
                  bordered
                  disabled={!data.safe && !disclaimer}
                >
                  <Text className="!mx-[10px]">
                    Proceed to cleaned URL
                    {countdown && ` (in ${timer}s)`}
                  </Text>
                </Button>
              </Link>
            </Grid>
          )}
          {Boolean(data.redirectUrl) && !data.tracking && (
            <Grid>
              <Link href={data.redirectUrl}>
                <Button
                  color="gradient"
                  bordered
                  disabled={!data.safe && !disclaimer}
                >
                  <Text className="!mx-[10px]">
                    Proceed directly
                    {countdown &&
                      !data.tracking &&
                      ` (in ${timer}s)`}
                  </Text>
                </Button>
              </Link>
            </Grid>
          )}
          <Grid>
            <Link href={url}>
              <Button
                color={"default"}
                disabled={!data.safe && !disclaimer}
              >
                <Text className="!mx-[10px]">
                  Proceed
                  {countdown &&
                    !data.redirects &&
                    !data.tracking &&
                    ` (in ${timer}s)`}
                </Text>
              </Button>
            </Link>
          </Grid>
          {countdown && (
            <Grid>
              <Button
                color="error"
                onClick={() => {
                  setCancel(true);
                }}
              >
                <Text className="!mx-[10px]">
                  <FontAwesomeIcon icon={faCancel} /> Cancel
                </Text>
              </Button>
            </Grid>
          )}
        </Grid.Container>
      </React.Fragment>
    );
  }, [countdown, data, disclaimer, error, timer, url]);

  return (
    <Container className="flex flex-col items-center justify-center w-[70vw] mt-[50px] mb-[50px]">
      <Text h1 className="flex items-center mb-[20px]">
        <MetahkgLogo light height={60} width={60} />
        Metahkg Redirect
      </Text>
      {body}
    </Container>
  );
}
