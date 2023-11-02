import { invoke } from "@tauri-apps/api/tauri";
import { UnlistenFn, listen } from "@tauri-apps/api/event";

interface EventFlood {
  group_id: string, // Flood group identifier.
  progress: number, // Events sent so far.
  total: number, // Total number of events to send.
}
type FloodHandler = (group_id: string, progress: number, total: number) => void;

const handlers: Map<string, FloodHandler> = new Map();

let floodStopListening: UnlistenFn | null = null;
let countInputEl: HTMLInputElement | null;
let _floodMsgsEl: HTMLElement | null;

async function floodEvents(count: number, handler?: FloodHandler) {
  const id = window.crypto.randomUUID();
  if (handler !== undefined) {
    handlers.set(id, handler);
  }

  if (floodStopListening === null) {
    floodStopListening = await listen<EventFlood>("flood://event", ({ payload }) => {
      const handler = handlers.get(payload.group_id);
      if (handler !== undefined) {
        handler(payload.group_id, payload.progress, payload.total);
      }
    });
  }

  try {
    await invoke("flood_events", {
      id,
      count: new Number(count),
    });
  } catch (e) {
    console.error("flood events error", e);
  }
  console.debug("Finished", id);
}

window.addEventListener("DOMContentLoaded", () => {
  countInputEl = document.querySelector("#count-input");
  _floodMsgsEl = document.querySelector("#flood-msgs");
  document.querySelector("#flood-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    floodEvents((countInputEl as HTMLInputElement).value as unknown as number, (_group_id, _progress, _total) => {
      /* const child = document.createElement("p");
      child.textContent = `flood ${_group_id} consumed ${_progress}/${_total} events`;
      _floodMsgsEl?.appendChild(child); */
      // (_floodMsgsEl as HTMLElement).textContent = `flood ${_group_id} consumed ${_progress}/${_total} events`;
      /* if (_progress % (_total/10)) {
        console.debug(`flood ${_group_id} consumed ${_progress}/${_total} events`);
      } */
    });
  });
});
