import React,{ useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(window.localStorage.getItem("theme") ?? "light");

  const handleClick = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="border-t mt-2 md:mt-0 md:border-t-transparent md:border-s px-2 ml-2">
      <button onClick={handleClick} className="transition p-2">{theme === "light" ? (<div className="flex items-center text-black dark:text-white">
        <img src="/Moon.svg" alt="" />
        <span className="ml-2 md:hidden">Oscuro</span>
        </div>): (<div className="flex items-center text-black dark:text-white">
        <img src="/Sun.svg" alt="" />
        <span className="ml-2 md:hidden">Claro</span>
        </div>)}</button>
    </div>
  );
}