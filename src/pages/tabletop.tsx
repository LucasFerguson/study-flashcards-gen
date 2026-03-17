import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import Flashcard from "~/components/Flashcard";
import cards from "./cards.json";
import { CARD_HEIGHT_PX, CARD_WIDTH_PX, type Flashcard as FlashcardType } from "~/lib/flashcards";

type CardState = FlashcardType & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotVelocity: number;
  dragging: boolean;
};

const STACK_SPREAD = 12;
const DEFAULT_FRICTION = 0.98;
const DEFAULT_BOUNCE = 0.7;
const MAX_VELOCITY = 40;
const DEFAULT_ROTATION_DAMPING = 0.97;
const DRAG_SAMPLE_WINDOW = 80;
const TABLE_MARGIN = 20;
const DEFAULT_GRAVITY = 0.2;

type PhysicsSettings = {
  rotationEnabled: boolean;
  friction: number;
  bounceEnabled: boolean;
  bounceStrength: number;
  gravityEnabled: boolean;
  gravityStrength: number;
  spotlightEnabled: boolean;
};

export default function TabletopPage() {
  const baseCards = JSON.parse(JSON.stringify(cards)) as FlashcardType[];
  const tabletopRef = useRef<HTMLDivElement>(null);
  const [cardStates, setCardStates] = useState<CardState[]>([]);
  const cardStatesRef = useRef<CardState[]>([]);
  const [activeCardId, setActiveCardId] = useState<string | number | null>(null);
  const dragHistory = useRef<
    Record<string | number, { x: number; y: number; time: number }[]>
  >({});

  const boundsRef = useRef({ width: 1200, height: 800 });
  const boundsReadyRef = useRef(false);
  const [settings, setSettings] = useState<PhysicsSettings>({
    rotationEnabled: true,
    friction: DEFAULT_FRICTION,
    bounceEnabled: true,
    bounceStrength: DEFAULT_BOUNCE,
    gravityEnabled: false,
    gravityStrength: DEFAULT_GRAVITY,
    spotlightEnabled: false,
  });
  const settingsRef = useRef(settings);
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const initializeCards = () => {
      const { width, height } = boundsRef.current;
      const margin = TABLE_MARGIN;
      const usableWidth = Math.max(width - CARD_WIDTH_PX - margin * 2, 1);
      const usableHeight = Math.max(height - CARD_HEIGHT_PX - margin * 2, 1);
      const seeded = baseCards.map((card, index) => {
        const x = margin + (index * STACK_SPREAD) % usableWidth;
        const y = margin + ((index * STACK_SPREAD * 1.4) % usableHeight);
        return {
          ...card,
          x,
          y,
          vx: 0,
          vy: 0,
          rotation: (index % 7) * 2,
          rotVelocity: 0,
          dragging: false,
        } satisfies CardState;
      });
      cardStatesRef.current = seeded;
      setCardStates(seeded);
    };

    const updateBounds = () => {
      const rect = tabletopRef.current?.getBoundingClientRect();
      if (!rect) return;
      boundsRef.current = { width: rect.width, height: rect.height };
      if (!boundsReadyRef.current && rect.width > 0 && rect.height > 0) {
        boundsReadyRef.current = true;
        initializeCards();
      }
    };

    const resizeObserver = new ResizeObserver(updateBounds);
    if (tabletopRef.current) {
      resizeObserver.observe(tabletopRef.current);
    }
    updateBounds();

    return () => resizeObserver.disconnect();
  }, [baseCards]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    let frameId: number;

    const tick = () => {
      const { width, height } = boundsRef.current;
      const {
        rotationEnabled,
        friction,
        bounceEnabled,
        bounceStrength,
        gravityEnabled,
        gravityStrength,
      } = settingsRef.current;
      const updated = cardStatesRef.current.map((card) => {
        if (card.dragging) return card;

        let vx = card.vx * friction;
        let vy = card.vy * friction;
        if (gravityEnabled) {
          vy += gravityStrength;
        }
        let x = card.x + vx;
        let y = card.y + vy;
        let rotVelocity = rotationEnabled
          ? card.rotVelocity * DEFAULT_ROTATION_DAMPING
          : 0;
        let rotation = rotationEnabled ? card.rotation + rotVelocity : 0;

        if (x < 0) {
          x = 0;
          if (bounceEnabled) {
            vx = -vx * bounceStrength;
          } else {
            vx = 0;
          }
        }
        if (y < 0) {
          y = 0;
          if (bounceEnabled) {
            vy = -vy * bounceStrength;
          } else {
            vy = 0;
          }
        }
        if (x > width - CARD_WIDTH_PX) {
          x = width - CARD_WIDTH_PX;
          if (bounceEnabled) {
            vx = -vx * bounceStrength;
          } else {
            vx = 0;
          }
        }
        if (y > height - CARD_HEIGHT_PX) {
          y = height - CARD_HEIGHT_PX;
          if (bounceEnabled) {
            vy = -vy * bounceStrength;
          } else {
            vy = 0;
          }
        }

        return {
          ...card,
          x,
          y,
          vx,
          vy,
          rotation,
          rotVelocity,
        };
      });

      cardStatesRef.current = updated;
      setCardStates(updated);
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const startDrag = (event: React.PointerEvent, cardId: string | number) => {
    event.preventDefault();
    event.stopPropagation();

    const pointerX = event.clientX;
    const pointerY = event.clientY;

    setActiveCardId(cardId);

    cardStatesRef.current = cardStatesRef.current.map((card) => {
      if ((card.id || card.title) !== cardId) return card;
      return {
        ...card,
        dragging: true,
        vx: 0,
        vy: 0,
        rotVelocity: 0,
      };
    });
    setCardStates(cardStatesRef.current);

    dragHistory.current[cardId] = [{ x: pointerX, y: pointerY, time: Date.now() }];
  };

  const updateDrag = (event: React.PointerEvent) => {
    if (activeCardId === null) return;
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    const history = dragHistory.current[activeCardId] || [];
    const now = Date.now();
    const trimmed = [...history, { x: pointerX, y: pointerY, time: now }].filter(
      (sample) => now - sample.time <= DRAG_SAMPLE_WINDOW
    );
    dragHistory.current[activeCardId] = trimmed;

    const card = cardStatesRef.current.find(
      (item) => (item.id || item.title) === activeCardId
    );
    if (!card) return;

    const offsetX = CARD_WIDTH_PX * 0.5;
    const offsetY = CARD_HEIGHT_PX * 0.5;

    const updated = cardStatesRef.current.map((item) => {
      if ((item.id || item.title) !== activeCardId) return item;
      return {
        ...item,
        x: pointerX - offsetX,
        y: pointerY - offsetY,
      };
    });

    cardStatesRef.current = updated;
    setCardStates(updated);
  };

  const endDrag = () => {
    if (activeCardId === null) return;
    const history = dragHistory.current[activeCardId] || [];
    const latest = history[history.length - 1];
    const earliest = history[0];
    const timeDelta = latest && earliest ? latest.time - earliest.time : 0;
    const dx = latest && earliest ? latest.x - earliest.x : 0;
    const dy = latest && earliest ? latest.y - earliest.y : 0;

    const velocityScale = timeDelta > 0 ? 16 / timeDelta : 0;
    const vx = Math.max(Math.min(dx * velocityScale, MAX_VELOCITY), -MAX_VELOCITY);
    const vy = Math.max(Math.min(dy * velocityScale, MAX_VELOCITY), -MAX_VELOCITY);

    const rotationEnabled = settingsRef.current.rotationEnabled;
    const updated = cardStatesRef.current.map((card) => {
      if ((card.id || card.title) !== activeCardId) return card;
      return {
        ...card,
        dragging: false,
        vx,
        vy,
        rotVelocity: rotationEnabled ? (vx + vy) * 0.08 : 0,
      };
    });

    cardStatesRef.current = updated;
    setCardStates(updated);
    setActiveCardId(null);
  };

  const shuffleCards = () => {
    const { width, height } = boundsRef.current;
      const margin = TABLE_MARGIN;
      const usableWidth = Math.max(width - CARD_WIDTH_PX - margin * 2, 1);
      const usableHeight = Math.max(height - CARD_HEIGHT_PX - margin * 2, 1);
      const shuffled = cardStatesRef.current.map((card) => ({
        ...card,
        x: margin + Math.random() * usableWidth,
        y: margin + Math.random() * usableHeight,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        rotation: (Math.random() - 0.5) * 12,
        rotVelocity: (Math.random() - 0.5) * 2,
        dragging: false,
    }));
    cardStatesRef.current = shuffled;
    setCardStates(shuffled);
  };

  const handleTabletopMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (settingsRef.current.spotlightEnabled) {
      const rect = tabletopRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSpotlightPos({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
    updateDrag(event);
  };

  const dealToPiles = (pileCount: number) => {
    const { width, height } = boundsRef.current;
    const margin = TABLE_MARGIN;
    const pileSpacing = (width - CARD_WIDTH_PX - margin * 2) / Math.max(pileCount, 1);
    const piles = cardStatesRef.current.map((card, index) => {
      const pileIndex = index % pileCount;
      const x = margin + pileSpacing * pileIndex + (index % 3) * 12;
      const y = height / 3 + (index % 4) * 12;
      return {
        ...card,
        x,
        y,
        vx: 0,
        vy: 0,
        rotation: (Math.random() - 0.5) * 6,
        rotVelocity: 0,
        dragging: false,
      };
    });
    cardStatesRef.current = piles;
    setCardStates(piles);
  };

  return (
    <>
      <Head>
        <title>Tabletop</title>
        <meta name="description" content="Drag and arrange your flashcard stack" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#1d5f3a",
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 3px, transparent 3px, transparent 8px)",
          }}
        />

        <div className="relative z-10 flex min-h-screen flex-col items-start justify-start px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">Tabletop</h1>
          <p className="text-sm text-white/80 mb-6">
            Drag the stack around the table. More tabletop interactions can go here.
          </p>

          <div className="mb-6 flex flex-wrap gap-3 text-sm">
            <button
              type="button"
              onClick={shuffleCards}
              className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              Shuffle Scatter
            </button>
            <button
              type="button"
              onClick={() => dealToPiles(3)}
              className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              Deal 3 Piles
            </button>
            <button
              type="button"
              onClick={() => dealToPiles(5)}
              className="rounded bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              Deal 5 Piles
            </button>
          </div>
          <div className="mb-6 grid w-full max-w-3xl gap-4 rounded-xl bg-black/20 p-4 text-sm text-white backdrop-blur">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.rotationEnabled}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      rotationEnabled: event.target.checked,
                    }))
                  }
                />
                Rotation
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.bounceEnabled}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      bounceEnabled: event.target.checked,
                    }))
                  }
                />
                Bounce
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.gravityEnabled}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      gravityEnabled: event.target.checked,
                    }))
                  }
                />
                Gravity
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.spotlightEnabled}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      spotlightEnabled: event.target.checked,
                    }))
                  }
                />
                Spotlight
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className="text-white/80">Friction ({settings.friction.toFixed(2)})</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={settings.friction}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      friction: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-white/80">
                  Bounce Strength ({settings.bounceStrength.toFixed(2)})
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.bounceStrength}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      bounceStrength: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-white/80">
                  Gravity Strength ({settings.gravityStrength.toFixed(2)})
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.gravityStrength}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      gravityStrength: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>
          </div>

          <div
            ref={tabletopRef}
            onPointerMove={handleTabletopMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className="relative h-[82vh] w-full"
          >
            {settings.spotlightEnabled && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(circle 220px at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(255,255,255,0.18), rgba(0,0,0,0.6) 70%)`,
                }}
              />
            )}
            {cardStates.map((card) => {
              const key = card.id || card.title;
              const isActive = (card.id || card.title) === activeCardId;
              return (
                <div
                  key={key}
                  onPointerDown={(event) => startDrag(event, key)}
                  className={`absolute select-none ${
                    isActive ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{
                    transform: `translate(${card.x}px, ${card.y}px) rotate(${card.rotation}deg)`,
                    zIndex: isActive ? 999 : 10,
                  }}
                >
                  <Flashcard {...card} />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
