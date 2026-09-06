import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { exportRawRecovery } from "./storage.js";
import "./styles.css";
import "./shell.css";

class TrackerErrorBoundary extends Component {
  state = { failed: false, recoveryError: "" };
  static getDerivedStateFromError() {
    return { failed: true };
  }

  downloadRecovery = () => {
    try {
      const blob = new Blob([exportRawRecovery()], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "feeding-tracker-recovery.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      this.setState({
        recoveryError:
          "The browser could not read saved data. Try reopening this app in the same browser.",
      });
    }
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="recovery-screen" role="alert">
        <h1>The tracker could not open</h1>
        <p>
          Your saved records have not been cleared. You can save a recovery copy
          before trying again.
        </p>
        <div className="recovery-actions">
          <button type="button" onClick={this.downloadRecovery}>
            Save recovery copy
          </button>
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
        {this.state.recoveryError && <p>{this.state.recoveryError}</p>}
      </main>
    );
  }
}

createRoot(document.getElementById("root")).render(
  <TrackerErrorBoundary>
    <App />
  </TrackerErrorBoundary>,
);

if ("serviceWorker" in navigator) {
  let refreshRequested = false;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshRequested && !reloaded) {
      reloaded = true;
      window.location.reload();
    } else {
      document.getElementById("app-update-banner")?.remove();
    }
  });

  const offerUpdate = (worker) => {
    if (!worker || document.getElementById("app-update-banner")) return;
    const banner = document.createElement("aside");
    banner.id = "app-update-banner";
    banner.className = "app-update-banner";
    banner.setAttribute("aria-label", "App update");
    const message = document.createElement("p");
    message.textContent =
      "An update is ready. Save your changes before updating.";
    const update = document.createElement("button");
    update.type = "button";
    update.textContent = "Update";
    update.addEventListener("click", () => {
      refreshRequested = true;
      update.disabled = true;
      update.textContent = "Updating…";
      worker.postMessage({ type: "SKIP_WAITING" });
      // Reload happens only after the new worker controls this page.
    });
    const later = document.createElement("button");
    later.type = "button";
    later.textContent = "Later";
    later.addEventListener("click", () => banner.remove());
    banner.append(message, update, later);
    document.body.appendChild(banner);
  };

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js",
        { updateViaCache: "none" },
      );
      const watchInstalling = () => {
        const installing = registration.installing;
        if (!installing) return;
        const checkState = () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          )
            offerUpdate(registration.waiting || installing);
        };
        installing.addEventListener("statechange", checkState);
        checkState();
      };
      registration.addEventListener("updatefound", watchInstalling);
      watchInstalling();
      offerUpdate(registration.waiting);
      window.addEventListener("online", () =>
        registration.update().catch(() => {}),
      );
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          offerUpdate(registration.waiting);
          registration.update().catch(() => {});
        }
      });
    } catch (error) {
      console.warn("Offline installation unavailable:", error.name);
    }
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
