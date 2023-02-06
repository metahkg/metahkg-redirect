import React, { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext<{
  darkMode: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  // @ts-ignore
}>(null);

export default function AppContextProvider(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined"
      ? JSON.parse(localStorage?.getItem("darkmode") || "null") ?? true
      : true
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

export function useDarkMode() {
  const { darkMode } = useContext(AppContext);
  return darkMode;
}
