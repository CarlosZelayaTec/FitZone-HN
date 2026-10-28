import { useState, useSyncExternalStore } from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}

export default function HeroBackground() {
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    prefersReducedMotion,
    () => true,
  );
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src="/images/hero-gimnasio.jpg"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {!reducedMotion && !videoFailed && (
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-gimnasio.jpg"
          tabIndex={-1}
          onError={() => setVideoFailed(true)}
          onCanPlay={(event) => {
            // Keep the poster visible if the browser declines autoplay.
            void event.currentTarget.play().catch(() => setVideoFailed(true));
          }}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="/videos/hero-gimnasio.mp4"
            type="video/mp4"
            onError={() => setVideoFailed(true)}
          />
        </video>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.95),rgba(0,0,0,0.35))]" />
    </div>
  );
}
