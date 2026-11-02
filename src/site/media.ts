// Images and videos count as loaded only once they're whole: an image has
// downloaded and been decoded (so it won't paint in strips), a video can play
// through (or the browser has buffered all it's going to before playing).
// Failed ones count as done too, so a broken file can't hold the page.
export type Media = HTMLImageElement | HTMLVideoElement;

const decoded = new WeakSet<HTMLImageElement>();
const buffered = new WeakSet<HTMLVideoElement>();

// Starts decoding a downloaded image if it hasn't been already.
function decode(img: HTMLImageElement) {
  if (!img.complete || decoded.has(img) || img.dataset.decoding) return;
  img.dataset.decoding = "1";
  const done = () => {
    decoded.add(img);
    delete img.dataset.decoding;
    img.dispatchEvent(new Event("decoded"));
  };
  img.decode().then(done, done);
}

// Makes sure the browser actually fetches it: lazy images and videos that
// only fetch a little up front are switched to load in full now.
function loadInFull(el: Media) {
  if (el instanceof HTMLImageElement) {
    if (el.loading === "lazy") el.loading = "eager";
    return;
  }
  if (el.preload !== "auto") el.preload = "auto";
  if (!el.dataset.watched) {
    el.dataset.watched = "1";
    // The browser has stopped fetching for now: it has what it needs.
    el.addEventListener("suspend", () => buffered.add(el));
  }
}

// Still downloading: an image not complete, a video without a frame yet.
export function isMediaDownloading(el: Media) {
  loadInFull(el);
  if (el instanceof HTMLImageElement) return !el.complete;
  return !el.error && el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA;
}

export function isMediaPending(el: Media) {
  loadInFull(el);
  if (el instanceof HTMLImageElement) {
    decode(el);
    return !decoded.has(el);
  }
  if (el.error) return false;
  if (el.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) return false;
  return !(buffered.has(el) && el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);
}

export function whenMediaReady(el: Media) {
  return new Promise<void>((resolve) => {
    if (!isMediaPending(el)) return resolve();
    const events =
      el instanceof HTMLImageElement
        ? ["load", "error", "decoded"]
        : ["loadeddata", "canplaythrough", "suspend", "error"];
    const check = () => {
      if (isMediaPending(el)) return;
      events.forEach((name) => el.removeEventListener(name, check));
      resolve();
    };
    events.forEach((name) => el.addEventListener(name, check));
  });
}
