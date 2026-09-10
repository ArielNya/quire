import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { StatusBar, Style } from "@capacitor/status-bar";
import { getRouter } from "./router";
import "./styles.css";

void StatusBar.setBackgroundColor({ color: "#0c0c0d" }).catch(() => {});
void StatusBar.setStyle({ style: Style.Dark }).catch(() => {});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={getRouter()} />
  </StrictMode>,
);
