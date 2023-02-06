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
import React, { useEffect, useMemo, useState } from "react";
import MetahkgLogo from "../components/logo";
import { faCancel, faWarning } from "@fortawesome/free-solid-svg-icons";
import { safebrowsing_v4 } from "@googleapis/safebrowsing";
import { InferGetServerSidePropsType, GetServerSideProps } from "next";
import getInfo, { InfoData } from "../lib/getInfo";
import { UrlHausThreat } from "../types/threat";
import { config } from "../lib/config";
import { rateLimit } from "../lib/rateLimit";
import { useDarkMode } from "../components/AppContext";
import { useIsSmallScreen } from "../hooks/useWindowSize";

export const getServerSideProps: GetServerSideProps<{
  data: InfoData;
}> = async (context) => {
  // 30 minutes
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=900"
  );

  const ip =
    (config.TRUST_PROXY && context.req.headers["x-forwarded-for"]) ||
    context.req.socket.remoteAddress ||
    "";

  if (!ip) {
    context.res.statusCode = 403;
    return { props: { data: { statusCode: 403, error: "Access denied" } } };
  }

  if ((await rateLimit(ip)) >= 10) {
    context.res.statusCode = 429;
    return { props: { data: { statusCode: 429, error: "Too many requests" } } };
  }

  const url = decodeURIComponent(String(context.query.url));

  const data = await getInfo(url);

  if (
    !("error" in data) &&
    !data.unsafe &&
    data.reachable &&
    !data.redirects &&
    !data.tracking
  ) {
    return {
      redirect: {
        destination: url,
        statusCode: 302,
      },
    };
  }

  if ("error" in data) {
    context.res.statusCode = data.statusCode;
    return {
      props: { data },
    };
  }

  return {
    props: {
      data,
    },
  };
};

export default function Redirect({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [timer, setTimer] = useState(5);
  const [disclaimer, setDisclaimer] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [darkMode] = useDarkMode();
  const isSmallScreen = useIsSmallScreen();
  const url = decodeURIComponent(String(router.query.url));

  const countdown =
    data && !("error" in data) && !data.unsafe && data.reachable && !cancel;

  useEffect(() => {
    if (countdown && timer >= 1) {
      const timerInterval = setInterval(() => {
        if (!cancel) {
          setTimer(timer - 1);
        }
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [countdown, timer, cancel]);

  if (timer === 0 && countdown) {
    window.location.assign(data?.redirectUrl || url);
  }

  const body = useMemo(() => {
    if ("error" in data) {
      return (
        <Text h4 color="error">
          Error: {data.error}
        </Text>
      );
    }

    const threat:
      | safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
      | UrlHausThreat = data.safebrowsingThreats[0] || data.urlhausThreats[0];

    return (
      <React.Fragment>
        <Text h4>You will be redirected to the following URL:</Text>
        <code className="break-all">{url}</code>

        <Collapse.Group splitted className="min-w-[60vw] max-w-[80vw]">
          {data.tracking && (
            <Collapse title={<Text h4>Tracking parameters detected</Text>}>
              <Text>
                Metahkg Redirect detected tracking parameters in the URL.
                <br />
                Cleaned URL:
                <br />
                <code className="break-all">{data.tidyUrl}</code>
              </Text>
            </Collapse>
          )}
          {data.redirects && (
            <Collapse
              title={<Text h4>Redirect URL detected</Text>}
              subtitle={
                <Text className="break-all nextui-collapse-subtitle">
                  {(data.redirectUrl?.length || 0) > 50
                    ? data.redirectUrl?.slice(0, 50) + "..."
                    : data.redirectUrl}
                </Text>
              }
            >
              <Text>
                Metahkg Redirect detected this URL redirects to:
                <br />
                <code className="break-all">{data.redirectUrl}</code>
              </Text>
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
              <Text>
                Metahkg Redirect cannot reach the URL.
                <br />
                Metahkg Redirect may have been blocked by the URL, or the URL
                does not exist.
                <br />
                Visit at your own risk.
              </Text>
            </Collapse>
          )}
          {data.unsafe && (
            <Collapse
              title={
                <Text h4 color="warning">
                  <FontAwesomeIcon icon={faWarning} />{" "}
                  {data.safebrowsingThreats.length || data.urlhausThreats.length
                    ? `${
                        data.safebrowsingThreats.length
                          ? "Google safebrowsing"
                          : "Urlhaus"
                      } identified this URL as a threat`
                    : `Host seems to be malicious`}
                </Text>
              }
              color="warning"
            >
              <Container>
                {data.safebrowsingThreats.length ||
                data.urlhausThreats.length ? (
                  <React.Fragment>
                    {data.urlhausThreats[0]?.urlhaus_link && (
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
                    )}
                    <Text>
                      Threat type:{" "}
                      {(
                        threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                      ).threatType || (threat as UrlHausThreat).threat}
                    </Text>
                    {(
                      threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                    ).platformType && (
                      <Text>
                        Platform:{" "}
                        {
                          (
                            threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                          ).platformType
                        }
                      </Text>
                    )}
                    <Text>
                      Url:{" "}
                      {
                        <code className="break-all">
                          {(
                            threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                          ).threat?.url || (threat as UrlHausThreat).url}
                        </code>
                      }
                    </Text>
                    {(threat as UrlHausThreat).tags && (
                      <Text>Tags: {(threat as UrlHausThreat).tags}</Text>
                    )}
                  </React.Fragment>
                ) : (
                  <Text>
                    Host <code className="break-all">{data.maliciousHost}</code>{" "}
                    is listed in{" "}
                    <Link
                      href="https://gitlab.com/malware-filter/urlhaus-filter/-/tree/main/#hosts-based"
                      isExternal
                      target="_blank"
                      rel="noreferrer"
                    >
                      malicious hosts list
                    </Link>
                    .
                  </Text>
                )}
              </Container>
            </Collapse>
          )}
        </Collapse.Group>
        {data.unsafe && (
          <Checkbox className="mb-[10px]" onChange={setDisclaimer}>
            <Text>
              I understand the possible risks, and that Metahkg will not be
              liable for any damage caused by this third-party url.
            </Text>
          </Checkbox>
        )}
        <Grid.Container gap={1.5} justify="center">
          {Boolean(data.tidyUrl) && (
            <Grid>
              <Button
                as="a"
                href={data.tidyUrl}
                color="gradient"
                bordered
                disabled={data.unsafe && !disclaimer}
                className="[&>span]:mx-[10px]"
              >
                Proceed to cleaned URL
                {countdown && ` (in ${timer}s)`}
              </Button>
            </Grid>
          )}
          {Boolean(data.redirectUrl) && !data.tracking && (
            <Grid>
              <Button
                as="a"
                href={data.redirectUrl}
                color="gradient"
                bordered
                disabled={data.unsafe && !disclaimer}
                className="[&>span]:mx-[10px]"
              >
                Proceed directly
                {countdown && !data.tracking && ` (in ${timer}s)`}
              </Button>
            </Grid>
          )}
          <Grid>
            <Button
              as="a"
              href={url}
              color="default"
              disabled={data.unsafe && !disclaimer}
              className="[&>span]:mx-[10px]"
            >
              Proceed
              {countdown &&
                !data.redirects &&
                !data.tracking &&
                ` (in ${timer}s)`}
            </Button>
          </Grid>
          {countdown && (
            <Grid>
              <Button
                color="error"
                onClick={() => {
                  setCancel(true);
                }}
                className="[&>span]:mx-[10px]"
              >
                <FontAwesomeIcon icon={faCancel} className="mr-[5px]" />
                Cancel
              </Button>
            </Grid>
          )}
        </Grid.Container>
      </React.Fragment>
    );
  }, [countdown, data, disclaimer, timer, url]);

  return (
    <Container className="flex flex-col items-center justify-center w-90 my-[50px]">
      <Container className="flex justify-center items-center mb-[20px] flex-nowrap max-w-full">
        <MetahkgLogo
          className="inline-block"
          svg
          light={darkMode}
          height={60}
          width={60}
        />
        <Text className="inline-block mb-0" h1>
          Metahkg{!isSmallScreen && " Redirect"}
        </Text>
      </Container>
      {body}
    </Container>
  );
}
