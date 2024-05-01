import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Link, Accordion, AccordionItem, Checkbox } from "@nextui-org/react";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import MetahkgLogo from "../components/logo";
import { faCancel, faWarning } from "@fortawesome/free-solid-svg-icons";
import { safebrowsing_v4 } from "@googleapis/safebrowsing";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import getInfo from "../lib/getInfo";
import { UrlHausThreat } from "../types/threat";
import { config } from "../lib/config";
import { rateLimit } from "../lib/rateLimit";
import { useDarkMode } from "../components/AppContext";
import { useIsSmallScreen } from "../hooks/useWindowSize";
import { HMACVerify } from "../lib/hmac";

/**
 * @description get server side props
 * @returns 403 if access denied
 * @returns 429 if rate limit exceeded
 * @returns 302 redirect if no problems found
 * @returns the data if some problems are found
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
    // 30 minutes
    context.res.setHeader(
        "Cache-Control",
        "public, s-maxage=900, stale-while-revalidate=900",
    );

    const ip =
        (config.TRUST_PROXY && context.req.headers["x-forwarded-for"]) ||
        context.req.socket.remoteAddress ||
        "";

    if (!ip) {
        context.res.statusCode = 403;
        return { props: { data: { statusCode: 403, error: "Access denied" } } };
    }

    if ((await rateLimit(ip, 30, 10)) >= 10) {
        context.res.statusCode = 429;
        return { props: { data: { statusCode: 429, error: "Too many requests" } } };
    }

    const url = String(context.query.url);
    const signature = String(context.query.signature);

    if (
        config.HMAC_VERIFY &&
        config.HMAC_KEY &&
        !HMACVerify(config.HMAC_KEY, url, signature)
    ) {
        context.res.statusCode = 403;
        return {
            props: {
                data: {
                    statusCode: 403,
                    error: "Access denied",
                    message: "HMAC signature invalid.",
                },
            },
        };
    }

    const forceLanding = String(context.query.forceLanding) === "true";

    const data = await getInfo(url);

    if (
        !("error" in data) &&
        !data.unsafe &&
        data.reachable &&
        !data.redirects &&
        !data.tracking &&
        !forceLanding
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
}

/**
 * @description The redirect page
 */
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
        window.location.assign(data?.tidyUrl || data?.redirectUrl || url);
    }

    /**
     * @description handle cancel
     */
    const handleCancel = useCallback(() => {
        setCancel(true);
    }, [setCancel]);

    const body = useMemo(() => {
        if ("error" in data) {
            return (
                <h4 className="!text-[red] text-xl dark:text-gray-100">
                    Error: {data.error}
                </h4>
            );
        }

        const threat:
            | safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
            | UrlHausThreat = data.safebrowsingThreats[0] || data.urlhausThreats[0];

        return (
            <React.Fragment>
                <h4 className="dark:text-gray-100 mb-2 text-lg font-semibold">
                    You will be redirected to the following URL:
                </h4>
                <code className="break-all text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] py-[1px] px-1">
                    {url}
                </code>

                <div className="container my-4">
                    {/** @ts-ignore */}
                    <Accordion variant="splitted" className="min-w-[60vw] max-w-[80vw]">
                        {!!data.tracking && (
                            <AccordionItem
                                key="1"
                                title={
                                    <h4 className="dark:text-gray-100 text-lg font-semibold">
                                        Tracking parameters detected
                                    </h4>
                                }
                            >
                                <p className="dark:text-gray-100">
                                    Metahkg Redirect detected tracking parameters in the
                                    URL.
                                    <br />
                                    Cleaned URL:
                                    <br />
                                    <code className="break-all text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] p-1">
                                        {data.tidyUrl}
                                    </code>
                                </p>
                            </AccordionItem>
                        )}
                        {!!data.redirects && (
                            <AccordionItem
                                key="2"
                                title={
                                    <h4 className="dark:text-gray-100 text-xl font-semibold">
                                        Redirect URL detected
                                    </h4>
                                }
                                subtitle={
                                    <p className="break-all nextui-collapse-subtitle text-metahkg-grey">
                                        {(data.redirectUrl?.length || 0) > 50
                                            ? `${data.redirectUrl?.slice(0, 50)}...`
                                            : data.redirectUrl}
                                    </p>
                                }
                            >
                                <p className="dark:text-gray-100">
                                    Metahkg Redirect detected this URL redirects to:
                                    <br />
                                    <code className="break-all text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] p-1">
                                        {data.redirectUrl}
                                    </code>
                                </p>
                            </AccordionItem>
                        )}
                        {!data.reachable && (
                            <AccordionItem
                                title={
                                    <h4 className="text-[#F5A523]">
                                        <FontAwesomeIcon icon={faWarning} /> URL not
                                        reachable
                                    </h4>
                                }
                            >
                                <p className="dark:text-gray-100">
                                    Metahkg Redirect cannot reach the URL.
                                    <br />
                                    Metahkg Redirect may have been blocked by the URL, or
                                    the URL does not exist.
                                    <br />
                                    Visit at your own risk.
                                </p>
                            </AccordionItem>
                        )}
                        {!!data.unsafe && (
                            <AccordionItem
                                title={
                                    <h4 className="text-[#F5A523] text-lg font-semibold">
                                        <FontAwesomeIcon icon={faWarning} />{" "}
                                        {data.safebrowsingThreats.length ||
                                        data.urlhausThreats.length
                                            ? `${
                                                  data.safebrowsingThreats.length
                                                      ? "Google safebrowsing"
                                                      : "Urlhaus"
                                              } identified this URL as a threat`
                                            : "Host seems to be malicious"}
                                    </h4>
                                }
                                className="text-[#F5A523]"
                            >
                                <div>
                                    {data.urlhausThreats[0]?.urlhaus_link && (
                                        <p className="dark:text-gray-100">
                                            Visit{" "}
                                            <Link
                                                href={data.urlhausThreats[0].urlhaus_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                isExternal
                                                className="dark:text-gray-100"
                                            >
                                                urlhaus
                                            </Link>{" "}
                                            for more information on this threat.
                                        </p>
                                    )}
                                    <p className="dark:text-gray-100">
                                        Threat type:{" "}
                                        {(
                                            threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                        ).threatType || (threat as UrlHausThreat).threat}
                                    </p>
                                    {(
                                        threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                    ).platformType && (
                                        <p className="dark:text-gray-100">
                                            Platform:{" "}
                                            {
                                                (
                                                    threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                                ).platformType
                                            }
                                        </p>
                                    )}
                                    <p className="dark:text-gray-100">
                                        Url:{" "}
                                        <code className="break-all text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] p-1">
                                            {(
                                                threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                            ).threat?.url ||
                                                (threat as UrlHausThreat).url}
                                        </code>
                                    </p>
                                    {(threat as UrlHausThreat).tags && (
                                        <p className="dark:text-gray-100">
                                            Tags: {(threat as UrlHausThreat).tags}
                                        </p>
                                    )}
                                </div>
                            </AccordionItem>
                        )}
                    </Accordion>
                </div>
                {data.unsafe && (
                    <Checkbox
                        className="mb-[10px]"
                        onChange={(e) => {
                            setDisclaimer(e.target.checked);
                        }}
                    >
                        <p className="dark:text-gray-100">
                            I understand the possible risks, and that Metahkg will not be
                            liable for any damage caused by this third-party url.
                        </p>
                    </Checkbox>
                )}
                <div
                    className={`grid gap-4 ${isSmallScreen ? "grid-flow-row" : "grid-flow-col"}`}
                >
                    {Boolean(data.tidyUrl) && (
                        <Button
                            as="a"
                            href={data.tidyUrl}
                            color="secondary"
                            disabled={data.unsafe && !disclaimer}
                            className="[&>span]:mx-[10px] dark:text-gray-100 w-52"
                        >
                            Proceed to cleaned URL
                            {countdown && ` (in ${timer}s)`}
                        </Button>
                    )}
                    {Boolean(data.redirectUrl) && !data.tracking && (
                        <Button
                            as="a"
                            href={data.redirectUrl}
                            color="secondary"
                            disabled={data.unsafe && !disclaimer}
                            className="[&>span]:mx-[10px] dark:text-gray-100 w-52"
                        >
                            Proceed directly
                            {countdown && !data.tracking && ` (in ${timer}s)`}
                        </Button>
                    )}

                    <Button
                        as="a"
                        href={url}
                        color="primary"
                        disabled={data.unsafe && !disclaimer}
                        className="[&>span]:mx-[10px] dark:text-gray-100 w-52"
                    >
                        Proceed
                        {countdown &&
                            !data.redirects &&
                            !data.tracking &&
                            ` (in ${timer}s)`}
                    </Button>

                    {countdown && (
                        <Button
                            color="danger"
                            onClick={handleCancel}
                            className="[&>span]:mx-[10px] dark:text-gray-100 w-52"
                        >
                            <FontAwesomeIcon
                                icon={faCancel}
                                className="mr-[5px] dark:text-gray-100"
                            />
                            Cancel
                        </Button>
                    )}
                </div>
            </React.Fragment>
        );
    }, [countdown, data, disclaimer, handleCancel, timer, url]);

    return (
        <div className={`flex flex-col items-center justify-center w-90 my-[50px]`}>
            <div className="flex justify-center items-center mb-[20px] flex-nowrap max-w-full">
                <MetahkgLogo
                    className="inline-block"
                    svg
                    light={darkMode}
                    height={60}
                    width={60}
                />
                <h1
                    className={`inline-block mb-0 text-5xl font-bold text-gray-800 dark:text-gray-100`}
                >
                    Metahkg{!isSmallScreen && " Redirect"}
                </h1>
            </div>
            {body}
        </div>
    );
}
