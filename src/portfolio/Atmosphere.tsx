/**
 * Anime-cyberpunk atmosphere — deep purple void, starfield, aurora
 * wash, a full-viewport synthwave grid tunnel (ceiling + floor), glitch
 * slice, embers, data rain, and a legibility veil. Entirely decorative
 * and aria-hidden; all motion is CSS and freezes under reduced motion.
 */

const star = (
  top: string,
  left: string,
  size: number,
  color: string,
  dur: string,
  delay: string
): React.CSSProperties => ({
  position: "absolute",
  top,
  left,
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: "50%",
  background: color,
  animation: `np-twinkle ${dur} ease-in-out ${delay} infinite`,
});

const STARS: React.CSSProperties[] = [
  star("8%", "12%", 2, "#cfe8ff", "3.4s", "0s"),
  star("14%", "78%", 2, "#cfe8ff", "4.1s", ".6s"),
  star("6%", "44%", 1.5, "#ffd6f0", "2.8s", "1.1s"),
  star("20%", "60%", 2, "#cfe8ff", "3.9s", ".3s"),
  star("11%", "30%", 1.5, "#fff", "3.1s", "1.7s"),
  star("24%", "88%", 1.5, "#cfe8ff", "4.6s", ".9s"),
  star("17%", "7%", 1.5, "#ffd6f0", "3.6s", "2.2s"),
  star("5%", "64%", 1.5, "#fff", "2.6s", "1.3s"),
];

const ember = (
  left: string,
  color: string,
  glow: string,
  dur: string,
  delay: string
): React.CSSProperties => ({
  position: "absolute",
  left,
  bottom: 0,
  width: "2px",
  height: "2px",
  borderRadius: "50%",
  background: color,
  boxShadow: `0 0 6px ${glow}`,
  animation: `np-emberFloat ${dur} linear ${delay} infinite`,
});

const EMBERS: React.CSSProperties[] = [
  ember("18%", "#ff9ed2", "#ff49c0", "11s", "0s"),
  ember("46%", "#7fe0ff", "#4fd1ff", "14s", "3s"),
  ember("72%", "#c7bfff", "#7c5cff", "12.5s", "1.5s"),
  ember("88%", "#ff9ed2", "#ff49c0", "13s", "5s"),
];

const rain = (
  left: string,
  height: string,
  color: string,
  dur: string,
  delay: string
): React.CSSProperties => ({
  position: "absolute",
  left,
  top: 0,
  width: "1px",
  height,
  background: `linear-gradient(180deg,transparent,${color},transparent)`,
  animation: `np-rainFall ${dur} linear ${delay} infinite`,
});

const RAIN: React.CSSProperties[] = [
  rain("14%", "18vh", "rgba(79,209,255,.55)", "5.5s", "0s"),
  rain("33%", "14vh", "rgba(255,73,192,.45)", "7s", ".8s"),
  rain("62%", "20vh", "rgba(124,92,255,.5)", "6.2s", "1.6s"),
  rain("82%", "15vh", "rgba(79,209,255,.45)", "8s", ".4s"),
];

export function Atmosphere() {
  return (
    <>
      <div
        data-atmos="1"
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* deep purple void */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg,#0a0618 0%,#15092e 30%,#1f0c40 50%,#280f44 64%,#1c0a32 80%,#0c0620 100%)",
          }}
        />

        {/* starfield */}
        <div style={{ position: "absolute", inset: 0 }}>
          {STARS.map((s, i) => (
            <div key={i} style={s} />
          ))}
        </div>

        {/* aurora wash */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "46%",
            height: "30%",
            background:
              "linear-gradient(180deg,transparent,rgba(196,92,255,.10) 40%,rgba(255,73,192,.08) 70%,transparent)",
            animation: "np-hazeDrift 16s ease-in-out infinite alternate",
            zIndex: 1,
          }}
        />

        {/* horizon neon line */}
        <div
          style={{
            position: "absolute",
            left: "-5%",
            right: "-5%",
            top: "58%",
            height: "2px",
            background:
              "linear-gradient(90deg,transparent,rgba(79,209,255,.7),rgba(255,73,192,.8) 50%,rgba(124,92,255,.7),transparent)",
            filter: "blur(.5px)",
            boxShadow: "0 0 28px rgba(255,73,192,.55)",
            zIndex: 3,
          }}
        />

        {/* synthwave grid tunnel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            animation: "np-gridGlitch 11s steps(60) infinite",
          }}
        >
          {/* ceiling grid */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: "58%",
              perspective: "440px",
              perspectiveOrigin: "50% 100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "0 0 -2px 0",
                transform: "rotateX(-70deg)",
                transformOrigin: "50% 100%",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  bottom: -60,
                  left: 0,
                  right: 0,
                  backgroundImage:
                    "linear-gradient(rgba(79,209,255,.30) 1px,transparent 1px),linear-gradient(90deg,rgba(255,73,192,.18) 1px,transparent 1px)",
                  backgroundSize: "60px 60px",
                  animation: "np-gridUp 2.4s linear infinite",
                  willChange: "transform",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(0deg,transparent 0%,transparent 60%,#06081a 100%)",
              }}
            />
          </div>
          {/* floor grid */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "42%",
              perspective: "440px",
              perspectiveOrigin: "50% 0%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-2px 0 0 0",
                transform: "rotateX(70deg)",
                transformOrigin: "50% 0%",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  bottom: -60,
                  left: 0,
                  right: 0,
                  backgroundImage:
                    "linear-gradient(rgba(79,209,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,73,192,.32) 1px,transparent 1px)",
                  backgroundSize: "60px 60px",
                  animation: "np-gridDown 1.8s linear infinite",
                  willChange: "transform",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg,transparent 0%,transparent 55%,#0a0614 100%)",
              }}
            />
          </div>
        </div>

        {/* sweeping glitch slice */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: "3vh",
            zIndex: 4,
            background:
              "linear-gradient(90deg,transparent,rgba(79,209,255,.5),rgba(255,73,192,.4),transparent)",
            opacity: 0,
            animation: "np-sliceGlitch 9s steps(40) infinite",
          }}
        />

        {/* embers */}
        {EMBERS.map((s, i) => (
          <div key={`e${i}`} style={s} />
        ))}

        {/* data rain */}
        {RAIN.map((s, i) => (
          <div key={`r${i}`} style={s} />
        ))}

        {/* legibility veil + vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            background:
              "radial-gradient(75% 65% at 50% 48%,rgba(4,6,15,.5),transparent 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            background:
              "radial-gradient(130% 120% at 50% 30%,transparent 46%,rgba(2,3,10,.82) 100%)",
          }}
        />
      </div>

      {/* CRT scanlines */}
      <div
        data-scan="1"
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 2px,rgba(0,0,0,.1) 3px,rgba(0,0,0,0) 4px)",
          opacity: 0.6,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          height: "16vh",
          zIndex: 91,
          pointerEvents: "none",
          background:
            "linear-gradient(to bottom,transparent,rgba(79,209,255,.04),transparent)",
          animation: "np-scanSweep 9s linear infinite",
        }}
      />
    </>
  );
}
