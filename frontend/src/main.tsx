import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/providers/ThemeProvider";

const savedTheme = window.localStorage.getItem("eums-theme");
if (savedTheme === "dark" || savedTheme === "light") {
  document.documentElement.classList.toggle("dark", savedTheme === "dark");
  document.documentElement.dataset.theme = savedTheme;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
