import { useRef, useState, useSyncExternalStore } from 'react';

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
  const [pausado, setPausado] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
          id="video-portada"
          ref={videoRef}
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-gimnasio.jpg"
          tabIndex={-1}
          onError={() => setVideoFailed(true)}
          onPlay={() => setPausado(false)}
          onPause={() => setPausado(true)}
          onCanPlay={(event) => {
            // Keep the poster visible if the browser declines autoplay.
            if (!pausado) void event.currentTarget.play().catch(() => setVideoFailed(true));
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
      {!reducedMotion && !videoFailed && <button type="button" aria-controls="video-portada" onClick={() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) void video.play().catch(() => setVideoFailed(true));
        else video.pause();
      }} className="pointer-events-auto absolute right-4 top-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-yellow-400/30 bg-black/70 px-3 text-xs font-semibold text-yellow-200 backdrop-blur-sm hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">{pausado ? <path d="m8 5 11 7-11 7Z" /> : <path d="M6 5h4v14H6zm8 0h4v14h-4z" />}</svg>
        {pausado ? 'Reanudar video' : 'Pausar video'}
      </button>}
    </div>
  );
}
