import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Scheda Clienti: Script loaded, waiting for DOM...");

const init = () => {
  console.log("Scheda Clienti: Initializing...");
  // WordPress integration: look for scheda-clienti-root first, fallback to root
  const rootElement =
    document.getElementById("scheda-clienti-root") ||
    document.getElementById("root");

  if (rootElement) {
    console.log("Scheda Clienti: Root element found, mounting app...");
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(<App />);

      // Hide loading message as soon as possible
      const hideLoading = () => {
        const loadingElement = rootElement.querySelector(".sc-loading");
        if (loadingElement && loadingElement instanceof HTMLElement) {
          console.log("Scheda Clienti: Hiding loading message");
          loadingElement.style.display = "none";
        }
      };

      // Attempt to hide immediately, and also on next tick to be sure
      hideLoading();
      setTimeout(hideLoading, 0);

      // Dispatch event for any other listeners
      window.dispatchEvent(new CustomEvent("scAppMounted"));
    } catch (error) {
      console.error("Scheda Clienti: Error mounting React app:", error);
    }
  } else {
    console.error(
      "Scheda Clienti: Root element not found. Neither #scheda-clienti-root nor #root found.",
    );
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
