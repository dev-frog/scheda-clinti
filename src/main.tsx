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

      // Hide loading state and show content immediately
      const hideLoading = () => {
        const loadingState = document.getElementById('sc-loading-state');
        if (loadingState && loadingState instanceof HTMLElement) {
          console.log("Scheda Clienti: Hiding loading state");
          loadingState.style.display = "none";
        }

        // Add loaded class to show content
        rootElement.classList.add('loaded');
      };

      // Hide loading immediately and on next tick to be sure
      hideLoading();
      setTimeout(hideLoading, 0);

      // Dispatch event for any other listeners (WordPress bridge, etc.)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("scAppMounted"));
      }, 50);
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
