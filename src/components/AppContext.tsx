import React, { createContext, useContext, useEffect, useState } from "react";

interface AppContextInterface {
  darkMode: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
}

const AppContext = createContext<AppContextInterface>(
  {} as AppContextInterface,
);

/**
 * @description React context provider component. Provides app-wide states.
 */
export default function AppContextProvider(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined"
      ? JSON.parse(localStorage?.getItem("darkmode") || "null") ?? true
      : true,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage?.setItem("darkmode", JSON.stringify(darkMode));
    }
  }, [darkMode]);

  return (
    <AppContext.Provider
      value={{
        darkMode: [darkMode, setDarkMode],
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * @description React hook to access dark mode state.
 */
export function useDarkMode() {
  const { darkMode } = useContext(AppContext);
  return darkMode;
}
