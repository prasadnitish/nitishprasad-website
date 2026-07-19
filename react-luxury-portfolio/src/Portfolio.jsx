import { useEffect, useMemo, useState } from "react";

const filmPanels = [
  {
    marker: "00",
    title: "Nitish Prasad",
    lead: "Fourteen years turning complex infrastructure into legible product decisions.",
    body:
      "Fintech and Amazon Pay infrastructure shaped the operating discipline. AI workflow systems sharpened the question: what should the product decide, what should the model synthesize, and what should deterministic systems keep under control?",
    rows: [
      ["Experience", "14 years"],
      ["Core terrain", "Fintech / Amazon Pay"],
      ["Current edge", "AI workflow systems"]
    ]
  },
  {
    marker: "01",
    title: "Amplify Engine",
    lead: "A distributed recommendation layer built around speed, retrieval, and controlled inference.",
    body:
      "AWS Bedrock and Lambda-backed RAG architecture for seller workflow recommendations, designed for low-latency decision support instead of dashboard browsing.",
    rows: [
      ["Architecture", "AWS Bedrock / Lambda RAG"],
      ["Latency", "sub-80ms"],
      ["Function", "recommendation intelligence"]
    ]
  },
  {
    marker: "02",
    title: "SproutMath",
    lead: "A native iOS learning engine that treats offline state as the product constraint.",
    body:
      "The architecture uses local state vectors so learning progress, rendering, and feedback can work without network dependency or remote runtime overhead.",
    rows: [
      ["Platform", "native iOS"],
      ["Runtime", "offline"],
      ["State model", "local vectors"]
    ]
  }
];

const matrixItems = [
  {
    marker: "01",
    line: "I translate infrastructure pressure into product clarity.",
    detail:
      "14 years across Fintech, Amazon Pay, marketplace systems, and AI workflows. The through-line is making complex system tradeoffs usable for product and executive decisions.",
    metric: "14Y // FINTECH + AMAZON PAY"
  },
  {
    marker: "02",
    line: "I design AI surfaces around boundaries, not novelty.",
    detail:
      "Amplify Engine uses AWS Bedrock and Lambda-backed RAG to support recommendation workflows with a sub-80ms latency target.",
    metric: "BEDROCK / LAMBDA RAG // <80MS"
  },
  {
    marker: "03",
    line: "I prefer product architectures that survive bad connectivity.",
    detail:
      "SproutMath uses native iOS offline state vectors so progress and learning interactions remain local, predictable, and fast.",
    metric: "NATIVE IOS // OFFLINE STATE VECTORS"
  },
  {
    marker: "04",
    line: "I make the system legible before asking teams to scale it.",
    detail:
      "The work is useful where product judgment, engineering constraints, and operating cadence have to converge before the product can grow.",
    metric: "SYSTEM DESIGN // OPERATING CADENCE"
  }
];

function MetricRows({ rows }) {
  return (
    <dl className="grid max-w-[760px] grid-cols-1 gap-y-8 sm:grid-cols-3 sm:gap-x-14">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="font-mono text-[11px] uppercase tracking-[0.22em] text-graphite">{label}</dt>
          <dd className="mt-3 text-xl font-medium tracking-[-0.02em] text-ivory sm:text-2xl">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function FilmstripMode() {
  return (
    <section
      aria-label="Horizontal filmstrip portfolio"
      className="no-scrollbar flex h-screen w-screen snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
    >
      {filmPanels.map((panel, index) => (
        <article
          key={panel.marker}
          className="flex h-screen w-screen shrink-0 snap-start flex-col justify-between px-8 pb-12 pt-28 sm:px-14 lg:px-20"
        >
          <div className="flex items-baseline justify-between gap-8">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-graphite">{panel.marker}</p>
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.24em] text-graphite sm:block">
              {index + 1} / {filmPanels.length}
            </p>
          </div>

          <div className="max-w-[1040px]">
            <h1 className="max-w-[980px] text-[clamp(4.75rem,11vw,12rem)] font-semibold leading-[0.82] tracking-[-0.08em] text-ivory">
              {panel.title}
            </h1>
            <p className="mt-8 max-w-[820px] text-[clamp(1.55rem,2.8vw,3.45rem)] font-medium leading-[1.05] tracking-[-0.055em] text-ivory">
              {panel.lead}
            </p>
            <p className="mt-8 max-w-[700px] text-base leading-7 text-graphite sm:text-lg">{panel.body}</p>
          </div>

          <MetricRows rows={panel.rows} />
        </article>
      ))}
    </section>
  );
}

function FocusMatrixMode({ initialFocus = 0 }) {
  const [active, setActive] = useState(Math.min(Math.max(initialFocus, 0), matrixItems.length - 1));
  const current = matrixItems[active];

  return (
    <section className="min-h-screen overflow-x-hidden px-6 pb-36 pt-28 sm:px-14 lg:px-20 lg:pt-28" aria-label="Focus-revealed type matrix">
      <div className="grid min-h-[calc(100vh-8rem)] min-w-0 grid-cols-1 gap-10 sm:gap-14 lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.62fr)] lg:items-center">
        <div className="min-w-0 space-y-5 sm:space-y-7">
          {matrixItems.map((item, index) => {
            const isActive = index === active;
            return (
              <button
                key={item.marker}
                type="button"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className={`group block min-w-0 w-full text-left transition-opacity duration-500 ease-luxury ${
                  isActive ? "opacity-100" : "opacity-[0.15]"
                }`}
              >
                <span className="mb-3 block font-mono text-[11px] uppercase tracking-[0.28em] text-graphite">
                  {item.marker}
                </span>
                <span className="editorial-line block min-w-0 max-w-full text-[clamp(1.65rem,7vw,2.45rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-ivory sm:text-[clamp(1.9rem,8vw,3.35rem)] lg:max-w-[1120px] lg:text-[clamp(2.55rem,5.3vw,7.35rem)] lg:leading-[0.9] lg:tracking-[-0.075em]">
                  {item.line}
                </span>
              </button>
            );
          })}
        </div>

        <aside
          key={current.marker}
          className="transition-all duration-500 ease-luxury"
          aria-live="polite"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-graphite">revealed detail</p>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-graphite sm:mt-5 sm:text-xs sm:tracking-[0.22em]">
            {current.metric}
          </p>
          <p className="editorial-line mt-6 max-w-full text-lg font-medium leading-[1.18] tracking-[-0.025em] text-ivory sm:text-4xl sm:tracking-[-0.045em] lg:max-w-[520px] lg:leading-[1.12]">
            {current.detail}
          </p>
        </aside>
      </div>
    </section>
  );
}

export default function Portfolio() {
  const initialParams = new URLSearchParams(window.location.search);
  const requestedMode = initialParams.get("mode");
  const requestedFocus = Number(initialParams.get("focus"));
  const [mode, setMode] = useState(requestedMode === "matrix" ? "matrix" : "filmstrip");

  const modeCopy = useMemo(
    () => ({
      filmstrip: "horizontal filmstrip",
      matrix: "focus-revealed type matrix"
    }),
    []
  );

  useEffect(() => {
    document.body.classList.toggle("vertical-locked", mode === "filmstrip");
    document.body.classList.toggle("vertical-free", mode === "matrix");
    return () => {
      document.body.classList.remove("vertical-locked", "vertical-free");
    };
  }, [mode]);

  return (
    <main className="min-h-screen bg-ink text-ivory selection:bg-ivory selection:text-ink">
      <header className="fixed left-0 right-0 top-0 z-30 flex flex-wrap items-start justify-between gap-4 px-6 py-6 sm:items-center sm:px-10">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-graphite">Nitish Prasad</p>
          <p className="mt-1 text-sm text-ivory/80">Luxury portfolio experiment</p>
        </div>

        <nav className="flex items-center gap-2" aria-label="Experience mode">
          {[
            ["filmstrip", "Filmstrip"],
            ["matrix", "Matrix"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition duration-300 ease-luxury ${
                mode === value ? "bg-ivory text-ink" : "text-graphite hover:text-ivory"
              }`}
              aria-pressed={mode === value}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="transition-opacity duration-500 ease-luxury" aria-label={modeCopy[mode]}>
        {mode === "filmstrip" ? (
          <FilmstripMode />
        ) : (
          <FocusMatrixMode initialFocus={Number.isInteger(requestedFocus) ? requestedFocus : 0} />
        )}
      </div>

      <div className="fixed bottom-5 right-6 z-40 font-mono text-[10px] uppercase tracking-[0.18em] text-graphite">
        SYS_STATUS: ACTIVE // SSR: 0ms
      </div>
    </main>
  );
}
