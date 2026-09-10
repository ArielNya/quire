import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { hasAgentFlight, whenAgentIdle } from "./flight";

/**
 * Native only. Back from the root screen:
 * - no partner call in flight → exit now (process dies)
 * - partner still running → let it finish, persist the take, then exit
 */
export function installNativeLifecycle() {
  if (!Capacitor.isNativePlatform()) return;

  void App.addListener("backButton", async ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
      return;
    }
    if (hasAgentFlight()) {
      await whenAgentIdle();
    }
    await App.exitApp();
  });
}
