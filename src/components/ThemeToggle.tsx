import { useEffect, useState } from "preact/hooks";

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
    <div className="border-s px-2 ml-2">
      <button onClick={handleClick} className="transition p-2">{theme === "light" ? <img src="/public/Moon.svg" alt="" />: <img src="/public/Sun.svg" alt="" />}</button>
    </div>
  );
}