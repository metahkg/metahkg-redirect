import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import MetahkgLogo from "../components/logo";
import { safebrowsing_v4 } from "@googleapis/safebrowsing";
import { InferGetServerSidePropsType, GetServerSideProps } from "next";
import getInfo, { InfoData } from "../lib/getInfo";
import { UrlHausThreat } from "../types/threat";
import { config } from "../lib/config";
import { rateLimit } from "../lib/rateLimit";
import { useDarkMode } from "../components/AppContext";
import { useIsSmallScreen } from "../hooks/useWindowSize";
import { HMACVerify } from "../lib/hmac";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Link,
    Typography,
    NoSsr,
} from "@mui/material";
import {
    Cancel as CancelIcon,
    ExpandMore as ExpandMoreIcon,
    Warning as WarningIcon,
} from "@mui/icons-material";
import { orange } from "@mui/material/colors";
import { colors } from "../lib/css";

/**
 * @description get server side props
 * @returns 403 if access denied
 * @returns 429 if rate limit exceeded
 * @returns 302 redirect if no problems found
 * @returns the data if some problems are found
 */
export const getServerSideProps: GetServerSideProps<{
    data: InfoData;
}> = async (context) => {
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
};

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

    const threat:
        | safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
        | UrlHausThreat
        | null =
        "error" in data ? null : data.safebrowsingThreats[0] || data.urlhausThreats[0];
    const body =
        "error" in data ? (
            <Typography variant="h4" color="error">
                Error: {data.error}
            </Typography>
        ) : (
            <React.Fragment>
                <Typography variant="h6" className="mx-12">
                    You will be redirected to the following URL:
                </Typography>
                <Typography
                    variant="body2"
                    className="break-all font-mono text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] px-1"
                >
                    {url}
                </Typography>
                <Box className="min-w-[60vw] max-w-[80vw] mt-3">
                    {data.tracking && (
                        <Accordion className="dark:bg-[#202020] !rounded-lg">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    Tracking parameters detected
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1">
                                    Metahkg Redirect detected tracking parameters in the
                                    URL.
                                    <br />
                                    Cleaned URL:
                                    <br />
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="font-mono break-all text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] px-1 inline-block"
                                >
                                    {data.tidyUrl}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {data.redirects && (
                        <Accordion className="dark:bg-[#202020] !rounded-lg">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">
                                    Redirect URL detected
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1">
                                    Metahkg Redirect detected this URL redirects to:
                                    <br />
                                    <Typography className="break-all font-mono text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] px-1 inline-block">
                                        {data.redirectUrl}
                                    </Typography>
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {!data.reachable && (
                        <Accordion className="dark:bg-[#202020] !rounded-lg">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography
                                    variant="h6"
                                    className="flex items-center"
                                    color={darkMode ? orange[600] : orange[500]}
                                >
                                    <WarningIcon className="mr-2" /> URL not reachable
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    Metahkg Redirect cannot reach the URL.
                                    <br />
                                    Metahkg Redirect may have been blocked by the URL, or
                                    the URL does not exist.
                                    <br />
                                    Visit at your own risk.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {data.unsafe && (
                        <Accordion className="dark:bg-[#202020] !rounded-lg">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography
                                    variant="h6"
                                    color={darkMode ? orange[600] : orange[500]}
                                    className="flex items-center"
                                >
                                    <WarningIcon className="mr-2" />{" "}
                                    {data.safebrowsingThreats.length ||
                                    data.urlhausThreats.length
                                        ? "Warning: Potential Malware Detected"
                                        : "Warning: Host seems to be malicious"}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {data.safebrowsingThreats.length ||
                                data.urlhausThreats.length ? (
                                    <React.Fragment>
                                        {data.urlhausThreats[0]?.urlhaus_link && (
                                            <Typography>
                                                Visit{" "}
                                                <Link
                                                    href={
                                                        data.urlhausThreats[0]
                                                            .urlhaus_link
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    color={colors.link}
                                                >
                                                    urlhaus
                                                </Link>{" "}
                                                for more information on this threat.
                                            </Typography>
                                        )}
                                        <Typography>
                                            Threat type:{" "}
                                            {(
                                                threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                            ).threatType ||
                                                (threat as UrlHausThreat).threat}
                                        </Typography>
                                        {(
                                            threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                        ).platformType && (
                                            <Typography>
                                                Platform:{" "}
                                                {
                                                    (
                                                        threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                                    ).platformType
                                                }
                                            </Typography>
                                        )}
                                        <Typography>
                                            Url:{" "}
                                            {
                                                <Typography className="break-all font-mono text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] px-1 inline-block">
                                                    {(
                                                        threat as safebrowsing_v4.Schema$GoogleSecuritySafebrowsingV4ThreatMatch
                                                    ).threat?.url ||
                                                        (threat as UrlHausThreat).url}
                                                </Typography>
                                            }
                                        </Typography>
                                        {(threat as UrlHausThreat).tags && (
                                            <Typography>
                                                Tags: {(threat as UrlHausThreat).tags}
                                            </Typography>
                                        )}
                                    </React.Fragment>
                                ) : (
                                    <Typography>
                                        Host{" "}
                                        <Typography className="break-all font-mono text-purple-700 bg-purple-200 dark:bg-purple-300 rounded-[0.25rem] px-1 inline-block">
                                            {data.maliciousHost}
                                        </Typography>{" "}
                                        is listed in{" "}
                                        <Link
                                            href="https://gitlab.com/malware-filter/urlhaus-filter/-/tree/main/#hosts-based"
                                            target="_blank"
                                            rel="noreferrer"
                                            color={colors.link}
                                        >
                                            malicious hosts list
                                        </Link>
                                        .
                                    </Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    )}
                </Box>
                {data.unsafe && (
                    <FormControlLabel
                        required
                        control={
                            <Checkbox
                                className="mt-1"
                                onChange={(_e, checked) => setDisclaimer(checked)}
                            />
                        }
                        label="I understand the possible risks, and that Metahkg will not be liable for any damage caused by this third-party url."
                    />
                )}
                <Box className={`flex mt-3 ${isSmallScreen ? "flex-col" : ""}`}>
                    {Boolean(data.tidyUrl) && (
                        <Button
                            LinkComponent="a"
                            href={data.tidyUrl}
                            color="secondary"
                            disabled={data.unsafe && !disclaimer}
                            variant="contained"
                            className="!whitespace-nowrap"
                        >
                            Proceed to cleaned URL
                            {countdown && ` (in ${timer}s)`}
                        </Button>
                    )}
                    {Boolean(data.redirectUrl) && !data.tracking && (
                        <Button
                            LinkComponent="a"
                            href={data.redirectUrl}
                            color="secondary"
                            variant="contained"
                            disabled={data.unsafe && !disclaimer}
                            className={`!whitespace-nowrap ${data.tidyUrl ? (isSmallScreen ? "mt-3" : "ml-3") : ""}`}
                            sx={{ minWidth: 180 }}
                        >
                            Proceed directly
                            {countdown && !data.tracking && ` (in ${timer}s)`}
                        </Button>
                    )}
                    <Button
                        LinkComponent="a"
                        href={url}
                        color="primary"
                        variant="contained"
                        disabled={data.unsafe && !disclaimer}
                        sx={{ minWidth: 180 }}
                        className={`!whitespace-nowrap ${(Boolean(data.redirectUrl) && !data.tracking) || data.tidyUrl ? (isSmallScreen ? "mt-3" : "ml-3") : ""}`}
                    >
                        Proceed
                        {countdown &&
                            !data.redirects &&
                            !data.tracking &&
                            ` (in ${timer}s)`}
                    </Button>
                    {countdown && (
                        <Button
                            color="error"
                            variant="contained"
                            onClick={handleCancel}
                            sx={{ minWidth: 180 }}
                            className={`!whitespace-nowrap ${isSmallScreen ? "mt-3" : "ml-3"} flex`}
                        >
                            <CancelIcon className="mr-1" />
                            Cancel
                        </Button>
                    )}
                </Box>
            </React.Fragment>
        );

    return (
        <NoSsr>
            <Box className="flex flex-col items-center justify-center w-90 my-[50px]">
                <Box className="flex justify-center items-center mb-[20px] flex-nowrap max-w-full">
                    <MetahkgLogo
                        className="inline-block"
                        light={darkMode}
                        height={60}
                        width={60}
                    />
                    <Typography className="inline-block mb-0 font-bold" variant="h2">
                        Metahkg{!isSmallScreen && " Redirect"}
                    </Typography>
                </Box>
                {body}
            </Box>
        </NoSsr>
    );
}
