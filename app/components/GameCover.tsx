import { useEffect, useState } from "react";
import { Game } from "../types";
import "../globals.css";

interface Props {
  game: Game;
}

const PATTERNS = ["circles", "lines", "dots", "cross", "wave"] as const;
type Pattern = (typeof PATTERNS)[number];

function hashString(str: string) {
  return str.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function PatternSVG({ pattern }: { pattern: Pattern }) {
  if (pattern === "circles")
    return (
      <>
        <circle
          cx="50%"
          cy="50%"
          r="40%"
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
        <circle
          cx="50%"
          cy="50%"
          r="25%"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
        <circle cx="50%" cy="50%" r="10%" fill="white" opacity="0.3" />
      </>
    );

  if (pattern === "lines")
    return (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={i}
            x1={`${i * 14}%`}
            y1="0"
            x2={`${i * 14 + 20}%`}
            y2="100%"
            stroke="white"
            strokeWidth="0.8"
          />
        ))}
      </>
    );

  if (pattern === "dots")
    return (
      <>
        {Array.from({ length: 5 }, (_, i) =>
          Array.from({ length: 5 }, (_, j) => (
            <circle
              key={`${i}-${j}`}
              cx={`${i * 25}%`}
              cy={`${j * 25}%`}
              r="2"
              fill="white"
            />
          )),
        )}
      </>
    );

  if (pattern === "cross")
    return (
      <>
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="white"
          strokeWidth="0.8"
        />
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="white"
          strokeWidth="0.8"
        />
        <rect
          x="35%"
          y="35%"
          width="30%"
          height="30%"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
        />
      </>
    );

  return (
    <path d="M0,30 Q25,0 50,30 T100,30 V100 H0Z" fill="white" opacity="0.1" />
  );
}

export default function GameCover({ game }: Props) {
  const hash = hashString(game.id);
  const pattern = PATTERNS[hash % PATTERNS.length];
  const accentHue = (hash * 37) % 360;

  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCover() {
      try {
        const res = await fetch(
          `/api/cover?title=${encodeURIComponent(game.title)}`,
        );
        const data = await res.json();
        setCover(data.coverUrl);
      } catch {
        setCover(null);
      }
    }

    fetchCover();
  }, [game.title]);

  return (
    <div className="game-cover" style={{ background: game.coverColor }}>
      {cover ? (
        <img
          src={cover}
          alt={game.title}
          className="game-cover-img"
          loading="lazy"
        />
      ) : (
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="game-cover-pattern"
        >
          <PatternSVG pattern={pattern} />
        </svg>
      )}

      <div className="game-cover-footer">
        <span
          className="game-cover-genre"
          style={{ color: `hsl(${accentHue}, 70%, 70%)` }}
        >
          {game.genre}
        </span>
      </div>
    </div>
  );
}
