/**
 * Export script to extract data from IndexedDB and localStorage
 * Run this in the browser console or as a Node.js script
 *
 * Usage in browser console:
 * 1. Open browser DevTools
 * 2. Go to Application > IndexedDB > tickTacDB
 * 3. Or run this script in the console
 */

// This script should be run in the browser console
// It exports data from IndexedDB and localStorage to JSON

export async function exportData() {
  const data: any = {
    tasks: [],
    lists: [],
    notes: [],
    journal: [],
    timeEntries: [],
  };

  try {
    // Export from IndexedDB (Dexie)
    // Note: This requires Dexie to be available
    if (typeof window !== "undefined" && (window as any).Dexie) {
      const Dexie = (window as any).Dexie;
      const db = new Dexie("tickTacDB");
      db.version(2).stores({
        tasks: "id, listId, due, done, createdAt",
        lists: "id, order",
        timeEntries: "id, taskId, listId, date, startTime, createdAt",
      });

      await db.open();

      data.tasks = await db.tasks.toArray();
      data.lists = await db.lists.toArray();
      data.timeEntries = await db.timeEntries.toArray();

      await db.close();
    }

    // Export from localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      const notesJson = localStorage.getItem("tickTac_notes");
      const journalJson = localStorage.getItem("tickTac_journal");

      if (notesJson) {
        data.notes = JSON.parse(notesJson);
      }

      if (journalJson) {
        data.journal = JSON.parse(journalJson);
      }
    }

    // Create download link
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tick-tac-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("✅ Data exported successfully!");
    console.log(`📊 Exported:`, {
      tasks: data.tasks.length,
      lists: data.lists.length,
      notes: data.notes.length,
      journal: data.journal.length,
      timeEntries: data.timeEntries.length,
    });

    return data;
  } catch (error) {
    console.error("❌ Export failed:", error);
    throw error;
  }
}

// If running in browser, make it available globally
if (typeof window !== "undefined") {
  (window as any).exportTickTikData = exportData;
}
