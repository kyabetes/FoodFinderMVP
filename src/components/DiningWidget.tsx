import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { weeklyHours } from '../data/hours';
import { computeOpenStatus } from '../utils/time';

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function nextMealQuery(now: dayjs.Dayjs) {
  const hour = now.hour();
  // Rough heuristic breakfast/lunch/dinner
  if (hour < 11) return 'breakfast near me';
  if (hour < 16) return 'lunch near me';
  if (hour < 22) return 'dinner near me';
  return 'food near me';
}

export function DiningWidget() {
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof computeOpenStatus>[]>([]);
  const now = useMemo(() => dayjs(), [showModal, results]);

  function handleGo() {
    const statuses = weeklyHours.map((loc) => computeOpenStatus(loc));
    setResults(statuses);
  }

  const anyOpen = results.some((r) => r.open);

  return (
    <div className="relative w-full max-w-4xl">
      <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-pastel-purple/30 via-pastel-blue/30 to-pastel-pink/30 blur-2xl opacity-70"></div>
      <div className="relative w-full backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-2xl shadow-pastel-purple/30 p-8 transition-transform duration-300 hover:-translate-y-0.5">
        <div className="mb-6 flex flex-col gap-4">          <h1 className="title-playful text-4xl sm:text-5xl font-extrabold text-slate-800 flex flex-wrap items-center gap-2">
            <span className="flex flex-wrap items-center gap-2">
              {['Where', 'can', 'I', 'eat'].map((w, i) => (
                <span key={i} className="floaty-word drop-shadow-sm">{w}</span>
              ))}
              <span className="glassy-gradient-text no-wobble" data-text="RIGHT">RIGHT</span>
              <span className="glassy-gradient-text no-wobble" data-text="NOW?">NOW?</span>
            </span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-5">
          <input
            value={'Clark University'}
            readOnly
            onFocus={() => setShowModal(true)}
            onClick={() => setShowModal(true)}
            className="flex-1 rounded-2xl bg-white/60 border border-white/60 px-5 py-3 focus:outline-none ring-2 ring-transparent focus:ring-pastel-purple/60 shadow-inner placeholder:text-slate-400 cursor-pointer"
            placeholder="Campus"
          />
          <button
            onClick={handleGo}
            className="rounded-2xl bg-slate-900 text-white px-6 py-3 font-semibold shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5 active:translate-y-0 transition will-change-transform"
          >
            GO!
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-4">
            {results.map((r) => (
              <div
                key={r.location.id}
                className="group border border-white/60 bg-white/70 backdrop-blur rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow hover:shadow-lg transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-800 drop-shadow-sm">{r.location.name}</h3>
                    <span className="text-xs text-slate-500">{r.location.label}</span>
                  </div>
                  <div className="text-slate-600 text-sm mt-1">
                    {r.open ? (
                      <span>Closes at {dayjs(r.closingAt).format('h:mm A')}</span>
                    ) : r.nextOpen ? (
                      <span>Opens at {dayjs(r.nextOpen).format('ddd h:mm A')}</span>
                    ) : (
                      <span>No hours available</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 sm:mt-0">
                  <span
                    className={classNames(
                      'px-3 py-1 rounded-pill text-sm font-semibold ring-1 ring-inset',
                      r.open
                        ? 'bg-green-100/80 text-green-800 ring-white/70 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.35)]'
                        : 'bg-red-100/80 text-red-700 ring-white/70 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.35)]'
                    )}
                  >
                    {r.open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            ))}

            {!anyOpen && (
              <div className="text-slate-600 text-center mt-6">
                <p className="mb-2">nothing is open :(</p>
                <a
                  className="underline text-slate-800 hover:text-slate-900 hover:drop-shadow-[0_0_20px_rgba(0,0,0,0.15)]"
                  href={`https://www.google.com/maps/search/${encodeURIComponent(nextMealQuery(now))}`}
                  target="_blank" rel="noreferrer"
                >
                  ...want alternatives?
                </a>
              </div>
            )}
          </div>
        )}

        {results.length === 0 && (
          <p className="text-slate-500 mt-6">Press GO! to check current status.</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
          <div className="relative bg-white/80 border border-white/60 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-pastel-blue/20 via-pastel-purple/20 to-pastel-pink/20 blur-2xl -z-10"></div>
            <h2 className="text-xl font-semibold text-slate-800">Heads up</h2>
            <p className="text-slate-600 mt-2">
              This MVP currently supports Clark University only. The search is read-only for now.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-white/60 bg-white/70 hover:bg-white shadow-sm">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
