import poster from "../video-poster.jpg";

const HREF = "https://x.com/0xCodez/status/2093013117156331552";
const SRC =
  "https://video.twimg.com/amplify_video/2093010212764487680/vid/avc1/1280x720/_xPiww1nnxNdg2L3.mp4?tag=29";

export function VideoBadge() {
  return (
    <figure className="videobadge" id="video">
      <div className="videobadge-frame">
        <video
          poster={poster}
          controls
          preload="metadata"
          playsInline
          src={SRC}
        >
          workshop video
        </video>
        <a className="videobadge-x" href={HREF}>
          X
        </a>
        <span className="videobadge-dur">72:04</span>
      </div>
      <figcaption>
        <a className="xref" href={HREF}>
          x.com/0xCodez/status/2093013117156331552
        </a>
        {" · "}
        @0xCodez · 2026-08-27
      </figcaption>
    </figure>
  );
}
