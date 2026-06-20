"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IDENTITY } from "@/content/identity";

import { Clock } from "./Clock";

/**
 * DEPTH.01 — ABOUT. The interactive Neural Core and the skills grid
 * share one highlight state: hovering a node lights its skill row and
 * vice versa. An idle auto-cycle keeps the core alive for visitors who
 * never touch it; pointer tilt gives it depth. All of this is suspended
 * under reduced motion.
 */

interface Skill {
  key: string;
  label: string;
  core: string;
  /** x,y of the node in the 0..200 viewBox. */
  node: [number, number];
  tech: string;
}

/** Node geometry is presentation; the tech stacks come from content. */
const NODES: Omit<Skill, "tech">[] = [
  { key: "backend", label: "Backend", core: "BACKEND", node: [40, 46] },
  { key: "aiml", label: "AI/ML", core: "AI / ML", node: [158, 58] },
  { key: "data", label: "Data Handling", core: "DATA HANDLING", node: [30, 120] },
  { key: "realtime", label: "Realtime", core: "REALTIME", node: [168, 132] },
  { key: "languages", label: "Languages", core: "LANGUAGES", node: [76, 172] },
  { key: "infra", label: "Infra", core: "INFRA", node: [132, 168] },
];

/** Pair each node with its capability tech tail from IDENTITY (same order). */
const SKILLS: Skill[] = NODES.map((n, i) => {
  const cap = IDENTITY.capabilities[i] ?? "";
  const tech = cap.split("—")[1]?.trim() ?? cap;
  return { ...n, tech };
});

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function AboutSection({ booted }: { booted: boolean }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const lastPoke = useRef(0);

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [auto, setAuto] = useState<string | null>(null);

  const active = hovered ?? selected ?? auto;

  // Idle auto-cycle — advance only when the visitor is neither hovering
  // nor holding a selection, and not within 5s of an interaction.
  useEffect(() => {
    if (prefersReduced()) return;
    let i = 0;
    const id = setInterval(() => {
      if (hovered || selected) return;
      if (Date.now() - lastPoke.current < 5000) return;
      i = (i + 1) % SKILLS.length;
      setAuto(SKILLS[i].key);
    }, 1500);
    return () => clearInterval(id);
  }, [hovered, selected]);

  const poke = useCallback(() => {
    lastPoke.current = Date.now();
    setAuto(null);
  }, []);

  const onEnter = useCallback(
    (key: string) => {
      poke();
      setHovered(key);
    },
    [poke]
  );
  const onLeave = useCallback(() => setHovered(null), []);
  const onToggle = useCallback(
    (key: string) => {
      poke();
      setSelected((s) => (s === key ? null : key));
    },
    [poke]
  );

  // Pointer tilt on the core.
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const host = e.currentTarget;
    const core = coreRef.current;
    if (!core) return;
    const r = host.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    core.style.transform = `rotateY(${dx * 16}deg) rotateX(${-dy * 16}deg)`;
  }, []);
  const onMoveLeave = useCallback(() => {
    if (coreRef.current) coreRef.current.style.transform = "rotateY(0) rotateX(0)";
    setHovered(null);
  }, []);

  // Staged hero reveal after boot, plus the name glitch.
  useEffect(() => {
    if (!booted) return;
    const root = sectionRef.current;
    if (!root) return;
    const instant = prefersReduced();
    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]")
    ).sort(
      (a, b) =>
        Number(a.getAttribute("data-reveal")) -
        Number(b.getAttribute("data-reveal"))
    );
    const base = instant ? 0 : 200;
    const timers: ReturnType<typeof setTimeout>[] = [];
    items.forEach((el, i) => {
      timers.push(
        setTimeout(() => el.setAttribute("data-shown", "1"), base + i * 85)
      );
    });

    const name = root.querySelector<HTMLElement>("[data-name='1']");
    if (name && !instant) {
      timers.push(
        setTimeout(() => {
          name.setAttribute("data-glitch", "on");
          setTimeout(() => name.removeAttribute("data-glitch"), 480);
        }, base + 100)
      );
      // periodic ambient glitch
      let glitchTimer: ReturnType<typeof setTimeout>;
      const fire = () => {
        name.setAttribute("data-nameglitch", "on");
        setTimeout(() => name.removeAttribute("data-nameglitch"), 520);
        glitchTimer = setTimeout(fire, 6000 + Math.random() * 5000);
      };
      glitchTimer = setTimeout(fire, 4500 + Math.random() * 3000);
      return () => {
        timers.forEach(clearTimeout);
        clearTimeout(glitchTimer);
      };
    }
    return () => timers.forEach(clearTimeout);
  }, [booted]);

  return (
    <section
      ref={sectionRef}
      id="core"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "104px 0 48px",
        gap: 32,
      }}
    >
      <div
        data-reveal="1"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: ".22em",
          color: "var(--muted)",
        }}
      >
        <span style={{ color: "var(--glow)" }}>DEPTH.01</span>
        <span style={{ width: 32, height: 1, background: "var(--hair-strong)" }} />
        <span>ABOUT</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            marginLeft: 6,
            color: "var(--ok)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--ok)",
              boxShadow: "0 0 8px var(--ok)",
              animation: "np-pulseDot 2.4s ease-in-out infinite",
            }}
          />
          {IDENTITY.availability}
        </span>
      </div>

      <div
        className="np-about-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)",
          gap: "clamp(28px,5vw,64px)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div data-reveal="2">
            <h1
              data-name="1"
              style={{
                fontFamily: "var(--grotesk)",
                fontWeight: 700,
                fontSize: "clamp(46px,7vw,92px)",
                lineHeight: 0.96,
                letterSpacing: "-.02em",
                textShadow: "0 0 32px rgba(79,209,255,.25)",
              }}
            >
              {IDENTITY.name}
            </h1>
            <p
              style={{
                marginTop: 14,
                fontFamily: "var(--mono)",
                fontSize: 13,
                letterSpacing: ".16em",
                color: "var(--glow)",
                textTransform: "uppercase",
              }}
            >
              {IDENTITY.role}
            </p>
          </div>

          <p
            data-reveal="3"
            className="np-bio"
            style={{
              maxWidth: "58ch",
              fontSize: "clamp(15px,1.5vw,18px)",
              lineHeight: 1.7,
              color: "var(--muted)",
              fontWeight: 300,
              textWrap: "pretty",
            }}
          >
            {IDENTITY.summary}
          </p>

          <div
            data-reveal="4"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 10,
                letterSpacing: ".24em",
                color: "var(--dim)",
              }}
            >
              {"// SKILLS"}
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: "9px 24px",
              }}
            >
              {SKILLS.map((s) => (
                <div
                  key={s.key}
                  className="np-skill"
                  data-on={active === s.key ? "1" : "0"}
                  onMouseEnter={() => onEnter(s.key)}
                  onMouseLeave={onLeave}
                  onClick={() => onToggle(s.key)}
                >
                  <b>{s.label}</b> — {s.tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive neural core */}
        <div
          data-reveal="6"
          className="np-core-wrap"
          onMouseMove={onMove}
          onMouseLeave={onMoveLeave}
          style={{
            position: "relative",
            aspectRatio: "1",
            width: "100%",
            maxWidth: 440,
            justifySelf: "center",
            perspective: "900px",
          }}
        >
          <div
            ref={coreRef}
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transition: "transform .25s ease-out",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "6%",
                border: "1px solid var(--hair)",
                borderRadius: "50%",
                animation: "np-spinSlow 60s linear infinite",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "20%",
                border: "1px dashed rgba(79,209,255,.22)",
                borderRadius: "50%",
                animation: "np-spinSlow 38s linear infinite reverse",
              }}
            />
            <svg
              viewBox="0 0 200 200"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
              }}
            >
              <g
                stroke="rgba(79,209,255,.30)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="3 5"
                style={{ animation: "np-dash 6s linear infinite" }}
              >
                {SKILLS.map((s) => (
                  <line
                    key={s.key}
                    x1="100"
                    y1="100"
                    x2={s.node[0]}
                    y2={s.node[1]}
                    stroke={active === s.key ? "var(--glow)" : "rgba(79,209,255,.30)"}
                    strokeWidth={active === s.key ? 1.8 : 1}
                  />
                ))}
              </g>
              <g>
                {SKILLS.map((s, i) => {
                  const on = active === s.key;
                  return (
                    <g
                      key={s.key}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => onEnter(s.key)}
                      onMouseLeave={onLeave}
                      onClick={() => onToggle(s.key)}
                    >
                      {/* invisible hit target */}
                      <circle cx={s.node[0]} cy={s.node[1]} r="14" fill="transparent" />
                      <circle
                        cx={s.node[0]}
                        cy={s.node[1]}
                        r={on ? 8.5 : 5}
                        fill="var(--glow)"
                        style={{
                          filter: on ? "drop-shadow(0 0 9px var(--glow))" : "none",
                          animation: `np-nodePulse 3s ease-in-out ${i * 0.4}s infinite`,
                        }}
                      />
                    </g>
                  );
                })}
              </g>
              <circle
                cx="100"
                cy="100"
                r={active ? 14 : 11}
                fill="rgba(79,209,255,.20)"
                stroke="var(--glow)"
                strokeWidth="1.5"
                style={{ transition: "all .18s" }}
              />
              <circle
                cx="100"
                cy="100"
                r="22"
                fill="none"
                stroke="rgba(124,92,255,.4)"
                strokeWidth="1"
                style={{ animation: "np-nodePulse 2.6s ease-in-out infinite" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: ".14em",
                color: "var(--glow)",
                background: "rgba(4,6,15,.85)",
                border: "1px solid rgba(79,209,255,.4)",
                padding: "5px 10px",
                opacity: active ? 1 : 0,
                transition: "opacity .18s",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                textShadow: "0 0 10px var(--glow)",
              }}
            >
              {active ? SKILLS.find((s) => s.key === active)?.core : ""}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: -8,
              transform: "translateX(-50%)",
              fontFamily: "var(--mono)",
              fontSize: 10,
              letterSpacing: ".2em",
              color: "var(--dim)",
              whiteSpace: "nowrap",
              zIndex: 2,
            }}
          >
            NEURAL CORE · <Clock /> {IDENTITY.timeZoneLabel} ·{" "}
            <span style={{ color: "var(--hot)" }}>tap / hover nodes</span>
          </div>
        </div>
      </div>

      <div
        data-reveal="7"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "var(--mono)",
          fontSize: 10,
          letterSpacing: ".2em",
          color: "var(--dim)",
          marginTop: "auto",
        }}
      >
        <span
          style={{
            width: 1,
            height: 38,
            background: "linear-gradient(to bottom,var(--glow),transparent)",
          }}
        />
        <span>SCROLL TO DESCEND</span>
      </div>
    </section>
  );
}
