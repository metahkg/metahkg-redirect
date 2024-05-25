import React, { useCallback } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import AppContextProvider, { useDarkMode } from "../components/AppContext";
import {
    Box,
    CssBaseline,
    IconButton,
    NoSsr,
    ThemeProvider,
    Tooltip,
} from "@mui/material";
import { theme, darkTheme } from "../lib/theme";
import { AppCacheProvider } from "@mui/material-nextjs/v14-pagesRouter";
import {
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
} from "@mui/icons-material";

/**
 * @description The main Next.js app.
 */
export function MyApp(props: AppProps) {
    const [darkMode, setDarkMode] = useDarkMode();

    /**
     * @description Toggles the dark mode.
     */
    const toggleDarkMode = useCallback(() => {
        setDarkMode(!darkMode);
    }, [darkMode, setDarkMode]);

    return (
        <NoSsr>
            <AppCacheProvider {...props}>
                <Head>
                    <title>Metahkg Redirect</title>
                    <meta name="description" content="Metahkg Redirect" />
                </Head>
                <ThemeProvider theme={darkMode ? darkTheme : theme}>
                    <CssBaseline />
                    <Box className={`${darkMode ? "dark" : ""} w-100v h-100v`}>
                        <Box className="bg-white dark:bg-[#232323] min-h-[100vh] w-[100vw] max-w-[100vw] max-h-full overflow-y-scroll flex relative justify-center">
                            <Tooltip
                                title={`Switch to ${darkMode ? "light" : "dark"} mode`}
                                className="flex absolute top-5 right-5"
                                arrow
                                placement="bottom"
                            >
                                <IconButton onClick={toggleDarkMode}>
                                    {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                                </IconButton>
                            </Tooltip>
                            <props.Component {...props.pageProps} />
                        </Box>
                    </Box>
                </ThemeProvider>
            </AppCacheProvider>
        </NoSsr>
    );
}

/**
 * @description Wraps the app in the context provider.
 */
export default function App(props: AppProps) {
    return (
        <AppContextProvider>
            <MyApp {...props} />
        </AppContextProvider>
    );
}
