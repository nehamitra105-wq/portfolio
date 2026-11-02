// Images and videos count as loaded once they can show something whole: an
// image has downloaded and been decoded (so it won't paint in strips), a
// video has its first frame. Failed ones count as done too.
export type Media = HTMLImageElement | HTMLVideoElement;

const decoded = new WeakSet<HTMLImageElement>();

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

// Still downloading (an image) or without a first frame (a video).
export function isMediaDownloading(el: Media) {
  if (el instanceof HTMLImageElement) return !el.complete;
  return !el.error && el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA;
}

export function isMediaPending(el: Media) {
  if (el instanceof HTMLImageElement) {
    decode(el);
    return !decoded.has(el);
  }
  return !el.error && el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA;
}

export function whenMediaReady(el: Media) {
  return new Promise<void>((resolve) => {
    if (!isMediaPending(el)) return resolve();
    const events = el instanceof HTMLImageElement ? ["load", "error", "decoded"] : ["loadeddata", "error"];
    const check = () => {
      if (isMediaPending(el)) return;
      events.forEach((name) => el.removeEventListener(name, check));
      resolve();
    };
    events.forEach((name) => el.addEventListener(name, check));
  });
}
