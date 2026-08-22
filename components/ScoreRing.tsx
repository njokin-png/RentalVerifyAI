export function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 90
      ? "#087f7b"
      : score >= 70
        ? "#d97706"
        : score >= 45
          ? "#e07822"
          : "#c2413b";
  return (
    <div
      className="w-44 h-44 rounded-full grid place-items-center"
      style={{ background: `conic-gradient(${color} ${score}%,#e7eeee 0)` }}
    >
      <div className="w-36 h-36 bg-white rounded-full grid place-items-center text-center">
        <div>
          <b className="text-5xl">{score}</b>
          <span className="text-slate-400">/100</span>
          <p className="text-xs text-slate-500">TRUST SCORE</p>
        </div>
      </div>
    </div>
  );
}
