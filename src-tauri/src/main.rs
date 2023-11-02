// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![flood_events])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[derive(Clone, serde::Serialize)]
struct FloodEvent {
group_id: String, // Flood group identifier.
progress: u64, // Events sent so far.
total: u64, // Total number of events to send.
}

#[tauri::command]
async fn flood_events(window: tauri::Window, id: String, count: u64) -> Result<(), String> {
  for i in 1..=count {
    if let Err(e) = window.emit("flood://event", FloodEvent {
      group_id: id.clone(),
      progress: i,
      total: count,
    }) {
      println!("flood_events emit error: {}", e);
    }
  }
Ok(())
}
