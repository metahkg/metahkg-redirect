import React, { useCallback, useEffect } from "react";
import type { AppProps } from "next/app";
import AppContextProvider, { useDarkMode } from "../components/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-regular-svg-icons";
import { Tooltip } from "@nextui-org/tooltip";
import { Button } from "@nextui-org/button";
import { NextUIProvider } from "@nextui-org/system";
import "../styles/globals.css";
import { ThemeProvider, useTheme } from "next-themes";

/**
 * @description The main Next.js app.
 */
export function MyApp({ Component, pageProps }: AppProps) {
    const [darkMode, setDarkMode] = useDarkMode();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (darkMode) {
            setTheme("dark");
        } else {
            setTheme("light");
        }
        console.log(theme);
    }, [darkMode]);

    /**
     * @description Toggles the dark mode.
     */
    const toggleDarkMode = useCallback(() => {
        setDarkMode(!darkMode);
    }, [darkMode, setDarkMode]);

    return (
        <div className={darkMode ? "dark" : ""}>
            <NextUIProvider>
                <div className="dark:bg-[#222] bg-[white] min-h-[100vh] w-[100vw] max-w-[100vw] max-h-full overflow-y-scroll flex relative justify-center">
                    <Tooltip
                        content={`Switch to ${darkMode ? "light" : "dark"} mode`}
                        placement="bottom"
                    >
                        <Button
                            className="flex absolute top-5 right-5 bg-transparent shadow-none border-none rounded-3xl"
                            onPress={toggleDarkMode}
                        >
                            <FontAwesomeIcon size="lg" icon={darkMode ? faMoon : faSun} />
                        </Button>
                    </Tooltip>
                    <Component {...pageProps} />
                </div>
            </NextUIProvider>
        </div>
    );
}

/**
 * @description Wraps the app in the context provider.
 */
export default function App(props: AppProps) {
    return (
        <NextUIProvider>
            <ThemeProvider
                themes={["light", "dark"]}
                attribute="class"
                defaultTheme="dark"
            >
                <AppContextProvider>
                    <MyApp {...props} />
                </AppContextProvider>
            </ThemeProvider>
        </NextUIProvider>
    );
}
