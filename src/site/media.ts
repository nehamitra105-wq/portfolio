// Images and videos count as loaded once they can show something: an image
// has finished (or failed), a video has its first frame (or failed).
export type Media = HTMLImageElement | HTMLVideoElement;

export function isMediaPending(el: Media) {
  if (el instanceof HTMLImageElement) return !el.complete;
  return !el.error && el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA;
}

export function whenMediaReady(el: Media) {
  return new Promise<void>((resolve) => {
    if (!isMediaPending(el)) return resolve();
    const events = el instanceof HTMLImageElement ? ["load", "error"] : ["loadeddata", "error"];
    const done = () => {
      events.forEach((name) => el.removeEventListener(name, done));
      resolve();
    };
    events.forEach((name) => el.addEventListener(name, done));
  });
}
