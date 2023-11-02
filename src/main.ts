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
let floodMsgsEl: HTMLElement | null;

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
  floodMsgsEl = document.querySelector("#flood-msgs");
  document.querySelector("#flood-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    floodEvents((countInputEl as HTMLInputElement).value as unknown as number, (group_id, progress, total) => {
      /* const child = document.createElement("p");
      child.textContent = `flood ${group_id} consumed ${progress}/${total} events`;
      floodMsgsEl?.appendChild(child); */
      // (floodMsgsEl as HTMLElement).textContent = `flood ${group_id} consumed ${progress}/${total} events`;
      /* if (progress % (total/10)) {
        console.debug(`flood ${group_id} consumed ${progress}/${total} events`);
      } */
    });
  });
});
