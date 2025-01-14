/// <reference lib="webworker" />

// See https://developer.chrome.com/docs/workbox/modules/
// for the list of available Workbox modules.

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { googleFontsCache, imageCache } from "workbox-recipes";

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all of the assets generated by the build process, except SVG files (as we inline them as react components)
precacheAndRoute(
  self.__WB_MANIFEST.filter((file) => {
    const url = typeof file === "string" ? file : file.url;
    return !url.endsWith(".svg");
  })
);

// Send all navigation requests to index.html
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/;
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") return false;
    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith("/_")) return false;
    // If this looks like a URL for a resource, because it contains a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) return false;
    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

// Handle caching the page font
googleFontsCache();

// Handle caching images not included in the build process
imageCache();

// This allows the web app to trigger skipWaiting via registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
