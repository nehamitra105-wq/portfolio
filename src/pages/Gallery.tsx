import { useEffect, useRef, useState } from "react";
import GalleryPieces from "../components/GalleryPieces";
import SiteFooter from "../components/SiteFooter";
import SiteNav from "../components/SiteNav";
import { useFrameZoom } from "../site/frameZoom";
import GuyDrawing, {
  ALL_GUY_FRAMES,
  type GuyState,
} from "../components/GuyDrawing";
import { cubicBezierValue, mix, toFallPath } from "../gallery/curves";
import { JUMP_ROW, LEG_PLATFORMS, PLATFORMS } from "../gallery/layout";

type Direction = "left" | "right";

// Shows the guy's current state ([idle], [sliding], ...) fixed on screen.
// Only for troubleshooting the interaction.
const SHOW_STATE_LABEL = false;

const SCENE_WIDTH = 1512;
const SCENE_HEIGHT = 8978;
const FOOTER_TOP = PLATFORMS[PLATFORMS.length - 1].top;
const GUY_SIZE = 86;
const GUY_DRAWING_BOTTOM = 69;
const EDGE_GAP = 40;
// The "idle" guy placed on the first piece in the gallery setup frame.
const START_LEFT = 386;
const START_TOP = PLATFORMS[0].top - GUY_DRAWING_BOTTOM;
// Same scroll offsets as the Make test frame: the first fall triggered at
// scroll 172 with frame 1 at top 204; later slides ran from top - 284 and
// fell at top - 2.
const FIRST_FALL_TRIGGER_OFFSET = 32;
const SLIDE_START_OFFSET = 284;
const FALL_TRIGGER_OFFSET = 2;
const FALL_DURATION = 900;
const SPLAT_DURATION = 300;
const GET_UP_FRAME_DURATION = 260;
// If scrolling stops mid-slide for this long, the guy gets back up.
const SLIDE_PAUSE_TIMEOUT = 500;
const JUMP_DURATION = 1000;
const JUMP_DISTANCE = 40;

const platformTop = (platform: number) =>
  PLATFORMS[platform].top - GUY_DRAWING_BOTTOM;
const leftLimit = (platform: number) =>
  PLATFORMS[platform].left + EDGE_GAP - GUY_SIZE / 2;
const rightLimit = (platform: number) =>
  PLATFORMS[platform].left +
  PLATFORMS[platform].width -
  EDGE_GAP -
  GUY_SIZE / 2;
const rightEdgeLeft = (platform: number) =>
  PLATFORMS[platform].left + PLATFORMS[platform].width - GUY_SIZE / 2;
const leftEdgeLeft = (platform: number) =>
  PLATFORMS[platform].left - GUY_SIZE / 2;

const LEGS = LEG_PLATFORMS.map(({ from, to, path }, index) => {
  const fall = toFallPath(path);
  const fromTop = PLATFORMS[from].top;

  return {
    from,
    to,
    fall,
    direction: (fall.tip.x > fall.start.x ? "right" : "left") as Direction,
    slideStartScroll: index === 0 ? 0 : fromTop - SLIDE_START_OFFSET,
    fallTriggerScroll:
      index === 0
        ? fromTop - FIRST_FALL_TRIGGER_OFFSET
        : fromTop - FALL_TRIGGER_OFFSET,
    slideEndLeft: fall.start.x - GUY_SIZE / 2,
    landingLeft: fall.tip.x - GUY_SIZE / 2,
  };
});

// Progress along the drawn path over the fall, using the vertical curve of
// the Make's second fall.
const fallCurve = (progress: number) =>
  cubicBezierValue(0, 0, 179 / 339.5, 1, progress);

export default function Gallery() {
  const zoom = useFrameZoom(SCENE_WIDTH);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const sceneRef = useRef<HTMLDivElement>(null);
  const guyRef = useRef<HTMLDivElement>(null);
  const currentLeftRef = useRef(START_LEFT);
  const targetLeftRef = useRef(START_LEFT);
  const scrollTopRef = useRef(0);
  const walkStartedAtRef = useRef(0);
  const cursorInIdleZoneRef = useRef(true);
  const phaseRef = useRef<
    "ready" | "sliding" | "getting-up" | "falling" | "on-platform" | "jumping"
  >("ready");
  const platformRef = useRef(0);
  const legRef = useRef(0);
  const autoAdvanceRef = useRef(false);
  const pendingJumpRef = useRef<Direction | null>(null);
  const jumpTriggerRef = useRef<(direction: Direction) => void>(() => {});
  const restartRef = useRef<() => void>(() => {});
  const [guyState, setGuyState] = useState<GuyState>("idle");
  const [direction, setDirection] = useState<Direction>("right");
  const [fallFrame, setFallFrame] = useState(0);
  const [getUpFrame, setGetUpFrame] = useState(0);
  const [hasLanded, setHasLanded] = useState(false);
  const [jumpFrame, setJumpFrame] = useState(0);
  const [walkFrame, setWalkFrame] = useState(0);
  const [guyPosition, setGuyPosition] = useState({
    left: START_LEFT,
    top: START_TOP,
  });

  // Load and decode every frame up front so none of them shows up as an empty
  // image box the first time it's needed.
  useEffect(() => {
    for (const src of ALL_GUY_FRAMES) {
      const image = new Image();
      image.src = src;
      image.decode().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWalkFrame((frame) => (frame + 1) % 2);
    }, 170);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrame = 0;

    const walk = (time: number) => {
      const canWalk =
        (phaseRef.current === "ready" && scrollTopRef.current <= 1) ||
        phaseRef.current === "on-platform";

      if (canWalk) {
        const platform = platformRef.current;
        const top = platformTop(platform);

        if (cursorInIdleZoneRef.current && !autoAdvanceRef.current) {
          targetLeftRef.current = currentLeftRef.current;
          walkStartedAtRef.current = 0;
          setGuyState("idle");
          animationFrame = requestAnimationFrame(walk);
          return;
        }

        const distance = targetLeftRef.current - currentLeftRef.current;

        if (Math.abs(distance) > 1) {
          if (walkStartedAtRef.current === 0) {
            walkStartedAtRef.current = time;
          }

          const step = Math.sign(distance) * Math.min(Math.abs(distance), 1.7);
          currentLeftRef.current += step;
          setDirection(step > 0 ? "right" : "left");
          setGuyState("walking");
          setGuyPosition({ left: currentLeftRef.current, top });
        } else if (
          walkStartedAtRef.current > 0 &&
          time - walkStartedAtRef.current < 500
        ) {
          setGuyState("walking");
        } else if (JUMP_ROW.includes(platform) && pendingJumpRef.current) {
          const jumpDirection = pendingJumpRef.current;
          pendingJumpRef.current = null;
          walkStartedAtRef.current = 0;
          jumpTriggerRef.current(jumpDirection);
        } else {
          walkStartedAtRef.current = 0;
          setGuyState("idle");
        }
      }

      animationFrame = requestAnimationFrame(walk);
    };

    animationFrame = requestAnimationFrame(walk);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (
        !sceneRef.current ||
        autoAdvanceRef.current ||
        (phaseRef.current !== "ready" && phaseRef.current !== "on-platform") ||
        (phaseRef.current === "ready" && scrollTopRef.current > 1)
      ) {
        return;
      }

      const sceneBounds = sceneRef.current.getBoundingClientRect();
      // The scene may be scaled down to fit; work in scene pixels.
      const pointerInScene = (event.clientX - sceneBounds.left) / zoomRef.current;
      const pointerYInScene = (event.clientY - sceneBounds.top) / zoomRef.current;
      const guyCenter = currentLeftRef.current + GUY_SIZE / 2;
      const platform = platformRef.current;
      const top = platformTop(platform);
      const guyCenterY = top + GUY_SIZE / 2;

      if (
        Math.abs(pointerInScene - guyCenter) <= 100 ||
        Math.abs(pointerYInScene - guyCenterY) <= 100
      ) {
        const renderedLeft = guyRef.current
          ? (guyRef.current.getBoundingClientRect().left - sceneBounds.left) / zoomRef.current
          : currentLeftRef.current;

        cursorInIdleZoneRef.current = true;
        currentLeftRef.current = renderedLeft;
        targetLeftRef.current = renderedLeft;
        pendingJumpRef.current = null;
        walkStartedAtRef.current = 0;
        setGuyState("idle");
        setGuyPosition({ left: renderedLeft, top });
        return;
      }

      cursorInIdleZoneRef.current = false;

      const rowIndex = JUMP_ROW.indexOf(platform);

      if (rowIndex >= 0) {
        if (pointerInScene > guyCenter + 2) {
          if (rowIndex < JUMP_ROW.length - 1) {
            targetLeftRef.current = rightEdgeLeft(platform);
            pendingJumpRef.current = "right";
          } else {
            targetLeftRef.current = rightLimit(platform);
            pendingJumpRef.current = null;
          }
        } else if (pointerInScene < guyCenter - 2) {
          if (rowIndex > 0) {
            targetLeftRef.current = leftEdgeLeft(platform);
            pendingJumpRef.current = "left";
          } else {
            targetLeftRef.current = leftLimit(platform);
            pendingJumpRef.current = null;
          }
        }
        return;
      }

      if (pointerInScene > guyCenter + 2) {
        targetLeftRef.current = rightLimit(platform);
      } else if (pointerInScene < guyCenter - 2) {
        targetLeftRef.current = leftLimit(platform);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    // The sequence always starts from the first piece, so don't let a reload
    // restore the old scroll position.
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    let animationFrame = 0;
    let slideStartLeft = START_LEFT;
    let slideStartScroll = 0;
    let resumeScroll = 0;
    let slidePauseTimeout = 0;
    let returningToTop = false;
    // Scroll position in scene pixels (the scene may be scaled down to fit).
    const pageScroll = () => window.scrollY / zoomRef.current;
    let interactionScroll = pageScroll();

    const startSlide = (scrollTop: number) => {
      if (
        phaseRef.current !== "ready" &&
        phaseRef.current !== "on-platform"
      ) {
        return;
      }

      const leg = LEGS[legRef.current];
      phaseRef.current = "sliding";
      autoAdvanceRef.current = false;
      pendingJumpRef.current = null;
      walkStartedAtRef.current = 0;
      slideStartLeft = currentLeftRef.current;
      // After getting back up, carry on from where he stopped rather than
      // jumping ahead to match the scroll position.
      slideStartScroll = Math.max(leg.slideStartScroll, resumeScroll);
      resumeScroll = 0;

      setDirection(leg.direction);
      setGuyState("sliding");
      updateSlide(scrollTop);
    };

    // Once the guy is on a piece and the page has scrolled far enough, start
    // the next slide. On the gem row he first walks and jumps over to the
    // piece the next drawn path starts from.
    const continueIfScrolled = () => {
      const leg = LEGS[legRef.current];

      if (
        !leg ||
        phaseRef.current !== "on-platform" ||
        interactionScroll < leg.slideStartScroll
      ) {
        return;
      }

      const platform = platformRef.current;

      if (platform === leg.from) {
        startSlide(interactionScroll);
        return;
      }

      const rowIndex = JUMP_ROW.indexOf(platform);
      const targetIndex = JUMP_ROW.indexOf(leg.from);
      if (rowIndex < 0 || targetIndex < 0) return;

      const jumpDirection = targetIndex > rowIndex ? "right" : "left";
      autoAdvanceRef.current = true;
      pendingJumpRef.current = jumpDirection;
      targetLeftRef.current =
        jumpDirection === "right"
          ? rightEdgeLeft(platform)
          : leftEdgeLeft(platform);
    };

    const finishFall = () => {
      const leg = LEGS[legRef.current];
      phaseRef.current = "on-platform";
      platformRef.current = leg.to;
      legRef.current += 1;
      pendingJumpRef.current = null;
      cursorInIdleZoneRef.current = true;
      setHasLanded(true);
      setGuyState("idle");
      currentLeftRef.current = leg.landingLeft;
      targetLeftRef.current = leg.landingLeft;
      setGuyPosition({ left: leg.landingLeft, top: platformTop(leg.to) });

      animationFrame = requestAnimationFrame(continueIfScrolled);
    };

    const getUpFromSlide = () => {
      if (phaseRef.current !== "sliding") return;

      phaseRef.current = "getting-up";
      const getUpStartedAt = performance.now();
      setGetUpFrame(0);
      setGuyState("getting-up");

      const animateGetUp = (time: number) => {
        const elapsed = time - getUpStartedAt;

        if (elapsed < GET_UP_FRAME_DURATION * 2) {
          setGetUpFrame(elapsed < GET_UP_FRAME_DURATION ? 0 : 1);
          animationFrame = requestAnimationFrame(animateGetUp);
          return;
        }

        phaseRef.current = legRef.current === 0 ? "ready" : "on-platform";
        resumeScroll = interactionScroll;
        targetLeftRef.current = currentLeftRef.current;
        walkStartedAtRef.current = 0;
        cursorInIdleZoneRef.current = true;
        setGuyState("idle");
      };

      animationFrame = requestAnimationFrame(animateGetUp);
    };

    const startFall = () => {
      if (phaseRef.current === "falling") return;

      window.clearTimeout(slidePauseTimeout);
      const leg = LEGS[legRef.current];
      const startTop = platformTop(leg.from);
      const endTop = platformTop(leg.to);
      phaseRef.current = "falling";
      const fallStartedAt = performance.now();
      setDirection(leg.direction);
      setGuyState("falling");

      const animateFall = (time: number) => {
        const elapsed = time - fallStartedAt;

        if (elapsed < FALL_DURATION) {
          const point = leg.fall.pointAt(fallCurve(elapsed / FALL_DURATION));
          const top = mix(
            startTop,
            endTop,
            (point.y - leg.fall.start.y) / (leg.fall.tip.y - leg.fall.start.y),
          );

          setFallFrame(Math.floor(elapsed / 130) % 4);
          setGuyState(endTop - top <= 10 ? "about-to-land" : "falling");
          setGuyPosition({ left: point.x - GUY_SIZE / 2, top });
          animationFrame = requestAnimationFrame(animateFall);
          return;
        }

        const landingElapsed = elapsed - FALL_DURATION;
        setGuyPosition({ left: leg.landingLeft, top: endTop });

        if (landingElapsed < SPLAT_DURATION) {
          setGuyState("splat");
          animationFrame = requestAnimationFrame(animateFall);
          return;
        }

        if (landingElapsed < SPLAT_DURATION + GET_UP_FRAME_DURATION * 2) {
          const gettingUpElapsed = landingElapsed - SPLAT_DURATION;
          setGetUpFrame(gettingUpElapsed < GET_UP_FRAME_DURATION ? 0 : 1);
          setGuyState("getting-up");
          animationFrame = requestAnimationFrame(animateFall);
          return;
        }

        finishFall();
      };

      animationFrame = requestAnimationFrame(animateFall);
    };

    const startJump = (jumpDirection: Direction) => {
      const platform = platformRef.current;
      const jumpingRight = jumpDirection === "right";
      const target =
        JUMP_ROW[JUMP_ROW.indexOf(platform) + (jumpingRight ? 1 : -1)];
      const hasGap =
        target !== undefined &&
        (jumpingRight
          ? PLATFORMS[target].left >
            PLATFORMS[platform].left + PLATFORMS[platform].width
          : PLATFORMS[platform].left >
            PLATFORMS[target].left + PLATFORMS[target].width);

      if (!hasGap) {
        phaseRef.current = "on-platform";
        setGuyState("idle");
        return;
      }

      phaseRef.current = "jumping";
      const jumpStartedAt = performance.now();
      const startLeft = jumpingRight
        ? rightEdgeLeft(platform)
        : leftEdgeLeft(platform);
      const endLeft = startLeft + (jumpingRight ? JUMP_DISTANCE : -JUMP_DISTANCE);
      const startTop = platformTop(platform);
      const endTop = platformTop(target);
      setGuyState("jumping");
      setDirection(jumpDirection);
      setJumpFrame(0);

      const animateJump = (time: number) => {
        const progress = Math.min((time - jumpStartedAt) / JUMP_DURATION, 1);
        let animationStage = 0;
        let airborneProgress = 0;

        if (progress < 0.125) {
          animationStage = 0;
        } else if (progress < 0.25) {
          animationStage = 1;
        } else if (progress < 0.75) {
          animationStage = 2;
          airborneProgress = (progress - 0.25) / 0.5;
        } else if (progress < 0.875) {
          animationStage = 3;
          airborneProgress = 1;
        } else {
          animationStage = 4;
          airborneProgress = 1;
        }

        const top =
          mix(startTop, endTop, airborneProgress) -
          Math.sin(Math.PI * airborneProgress) * 10;

        setJumpFrame(animationStage);
        setGuyPosition({
          left: mix(startLeft, endLeft, airborneProgress),
          top,
        });

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateJump);
          return;
        }

        phaseRef.current = "on-platform";
        platformRef.current = target;
        currentLeftRef.current = endLeft;
        targetLeftRef.current = endLeft;
        cursorInIdleZoneRef.current = true;
        setGuyState("idle");
        setGuyPosition({ left: endLeft, top: endTop });
        continueIfScrolled();
      };

      animationFrame = requestAnimationFrame(animateJump);
    };

    jumpTriggerRef.current = startJump;

    const updateSlide = (scrollTop: number) => {
      const index = legRef.current;
      const leg = LEGS[index];
      const progress = Math.min(
        Math.max(
          (scrollTop - slideStartScroll) /
            Math.max(leg.fallTriggerScroll - slideStartScroll, 1),
          0,
        ),
        1,
      );
      const left = mix(
        slideStartLeft,
        leg.slideEndLeft,
        index === 0 ? progress : Math.pow(progress, 1.7),
      );
      const top = platformTop(leg.from);

      currentLeftRef.current = left;
      setDirection(leg.direction);
      setGuyState("sliding");
      setGuyPosition({ left, top });

      if (scrollTop >= leg.fallTriggerScroll) {
        currentLeftRef.current = leg.slideEndLeft;
        setGuyPosition({ left: leg.slideEndLeft, top });
        startFall();
        return;
      }

      window.clearTimeout(slidePauseTimeout);
      slidePauseTimeout = window.setTimeout(getUpFromSlide, SLIDE_PAUSE_TIMEOUT);
    };

    const resetSequence = () => {
      window.clearTimeout(slidePauseTimeout);
      resumeScroll = 0;
      phaseRef.current = "ready";
      platformRef.current = 0;
      legRef.current = 0;
      autoAdvanceRef.current = false;
      setHasLanded(false);
      interactionScroll = 0;
      scrollTopRef.current = 0;
      currentLeftRef.current = START_LEFT;
      targetLeftRef.current = START_LEFT;
      pendingJumpRef.current = null;
      cursorInIdleZoneRef.current = true;
      setGuyState("idle");
      setGuyPosition({ left: START_LEFT, top: START_TOP });
    };

    const cancelSlide = (scrollAmount: number) => {
      window.clearTimeout(slidePauseTimeout);
      phaseRef.current = legRef.current === 0 ? "ready" : "on-platform";
      interactionScroll = Math.max(scrollAmount, 0);
      scrollTopRef.current = interactionScroll;
      targetLeftRef.current = currentLeftRef.current;
      walkStartedAtRef.current = 0;
      setGuyState("idle");
      setGuyPosition({
        left: currentLeftRef.current,
        top: platformTop(platformRef.current),
      });
    };

    // Scrolling back up never sends the guy back to the start: he stays on
    // whichever piece he's on. Only the footer's Gallery link restarts him.
    const advanceInteraction = (scrollAmount: number) => {
      if (returningToTop) return;

      if (phaseRef.current === "sliding" && scrollAmount < interactionScroll) {
        cancelSlide(scrollAmount);
        return;
      }

      interactionScroll = Math.max(scrollAmount, 0);
      scrollTopRef.current = interactionScroll;

      if (interactionScroll <= 1) return;

      if (phaseRef.current === "ready") {
        startSlide(interactionScroll);
      } else if (phaseRef.current === "sliding") {
        updateSlide(interactionScroll);
      } else if (phaseRef.current === "on-platform") {
        continueIfScrolled();
      }
    };

    // Footer "Gallery" link: put the guy back on the first piece and scroll
    // to the top. Scrolling is ignored until the page gets there, so the
    // guy doesn't start sliding on the way up.
    restartRef.current = () => {
      cancelAnimationFrame(animationFrame);
      returningToTop = pageScroll() > 1;
      resetSequence();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const finishReturnToTop = () => {
      if (!returningToTop) return;
      returningToTop = false;
      interactionScroll = pageScroll();
      scrollTopRef.current = interactionScroll;
    };

    const handleScroll = (event: Event) => {
      if (returningToTop) {
        if (pageScroll() <= 1) finishReturnToTop();
        return;
      }

      const target = event.target;
      const targetScroll =
        target instanceof HTMLElement ? target.scrollTop / zoomRef.current : pageScroll();

      advanceInteraction(Math.max(pageScroll(), targetScroll));
    };

    const handleWheelInput = (deltaY: number, deltaMode: number) => {
      // Scrolling with the wheel stops the smooth scroll back to the top.
      if (returningToTop) {
        finishReturnToTop();
        return;
      }

      const delta =
        (deltaMode === 1
          ? deltaY * 16
          : deltaMode === 2
            ? deltaY * window.innerHeight
            : deltaY) / zoomRef.current;

      if (delta > 0) {
        advanceInteraction(Math.max(pageScroll(), interactionScroll + delta));
      } else if (delta < 0 && phaseRef.current === "sliding") {
        cancelSlide(Math.max(pageScroll(), interactionScroll + delta));
      }
    };

    const handleWheel = (event: WheelEvent) => {
      handleWheelInput(event.deltaY, event.deltaMode);
    };

    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    document.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: true,
    });
    // Also ends the return if the smooth scroll gets interrupted part way.
    window.addEventListener("scrollend", finishReturnToTop);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(slidePauseTimeout);
      jumpTriggerRef.current = () => {};
      restartRef.current = () => {};
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("scrollend", finishReturnToTop);
    };
  }, []);

  const stateLabel = guyState.replace(/-/g, " ");

  return (
    <main
      className="stage relative overflow-clip bg-white text-black"
      style={{ paddingTop: FOOTER_TOP * zoom }}
    >
      <SiteNav active="gallery" />
      {/* The scene scales down to fit narrower windows, like the other pages. */}
      <div className="absolute inset-x-0 top-0 flex justify-center">
      <section
        aria-label="Gallery"
        className="relative shrink-0 overflow-hidden"
        ref={sceneRef}
        style={{ width: SCENE_WIDTH, height: SCENE_HEIGHT, zoom }}
      >
        <GalleryPieces />

        <div
          className="guy absolute z-10 size-[86px]"
          ref={guyRef}
          style={{
            left: guyPosition.left,
            top: guyPosition.top,
          }}
        >
          <GuyDrawing
            direction={direction}
            fallFrame={fallFrame}
            getUpFrame={getUpFrame}
            hasLanded={hasLanded}
            jumpFrame={jumpFrame}
            state={guyState}
            walkFrame={walkFrame}
          />
        </div>
      </section>
      </div>

      {/* Full-width footer, starting where the temp footer sat in the frame
          (the last fall lands on its top edge). */}
      <SiteFooter onGalleryClick={() => restartRef.current()} />

      {SHOW_STATE_LABEL && (
        <p
          aria-live="polite"
          className="state-label fixed top-[294px] z-30 h-[29px] w-[180px] -translate-x-1/2 text-center font-['Neue_Montreal:Regular',Arial,sans-serif] text-[24px] leading-normal font-normal"
        >
          [{stateLabel}]
        </p>
      )}
    </main>
  );
}
