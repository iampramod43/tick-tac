# tickTac Clone — Frontend Blueprint

**Purpose**: UI/UX blueprint for a tickTac-like task manager built with **Next.js (App Router)**. This document focuses on frontend architecture, components, user flows, and design — backend integration will come later.

---

## Tech stack (frontend-only)

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State & Data:** React Query (TanStack Query) + Context API
- **Local persistence:** `localStorage` / IndexedDB (Dexie.js) for offline / mock data
- **Animation:** Framer Motion
- **Icons:** lucide-react
- **Theme:** Light / Dark with system preference
- **Routing:** App Router + dynamic layouts

---

## Project folder structure

```
/src
 ├── app
 │    ├── layout.tsx
 │    ├── page.tsx             # Dashboard (Today view)
 │    ├── auth/
 │    │     ├── login/page.tsx
 │    │     └── register/page.tsx
 │    ├── settings/page.tsx
 │    └── tasks/
 │          ├── [id]/page.tsx  # Task detail deep-link
 │          └── new/page.tsx
 │
 ├── components/
 │    ├── layout/
 │    │     ├── Sidebar.tsx
 │    │     ├── Header.tsx
 │    │     └── MainLayout.tsx
 │    ├── tasks/
 │    │     ├── TaskItem.tsx
 │    │     ├── TaskList.tsx
 │    │     ├── TaskEditor.tsx
 │    │     ├── TaskQuickAdd.tsx
 │    │     ├── TaskFilters.tsx
 │    │     └── TaskDetailPanel.tsx
 │    ├── lists/
 │    │     ├── ListSidebar.tsx
 │    │     ├── ListMenu.tsx
 │    │     └── NewListModal.tsx
 │    ├── ui/
 │    │     ├── Button.tsx
 │    │     ├── Input.tsx
 │    │     ├── Modal.tsx
 │    │     └── Tooltip.tsx
 │    └── common/
 │          ├── ThemeToggle.tsx
 │          ├── SearchBar.tsx
 │          ├── DatePicker.tsx
 │          └── PriorityIndicator.tsx
 │
 ├── hooks/
 │    ├── useTasks.ts
 │    ├── useLists.ts
 │    └── useOfflineStorage.ts
 │
 ├── lib/
 │    ├── utils.ts
 │    ├── constants.ts
 │    └── types.ts
 │
 ├── styles/
 │    ├── globals.css
 │    └── theme.css
 │
 └── data/
      └── mockData.json
```

---

## Navigation & primary screens

**Sidebar (left)**

- Inbox
- Today
- Upcoming
- Completed
- Custom Lists (collapsible)
- - Add new list
- Settings & Theme toggle (bottom)

**Header (top bar)**

- Search bar
- Add Task button (global)
- User profile / avatar
- Quick filter chips (Priority, Tag, Due)

**Main area**

- Task list (virtualized)
- Task detail panel (right slide-over)

---

## Core components & behaviors

### TaskList

- Virtualized list (react-window)
- Each row shows: checkbox, title, due date, priority dot, tags
- Click row → open TaskDetailPanel
- Double-click → inline edit
- Keyboard navigable

### TaskItem

- Checkbox toggle (optimistic local update)
- Hover actions: edit, quick add subtask, more menu
- Drag & drop reorder (optional)

### TaskEditor

- Title (auto-focus)
- Notes (multiline, markdown preview optional)
- Due date (DatePicker)
- Priority selector (1–4)
- Tags selector (typeahead)
- Reminder UI (placeholder)
- Save / Cancel

### TaskQuickAdd

- Persistent input bar or floating + button
- Accepts natural language parsing in UI only (e.g. "Call mom tomorrow 6pm")
- Enter adds to Inbox

### TaskDetailPanel

- Slides from right (Framer Motion)
- Shows: full title, status, notes, subtasks, attachments, reminder UI, activity
- Inline edit and autosave

### ListSidebar

- Shows lists with colors
- CRUD actions (UI-only): add, rename, delete
- Drag & drop for reordering lists (react-beautiful-dnd)

### TaskFilters

- Priority, Due (today/overdue/next 7 days), Tag, Completion
- Combined filters with chips

### ThemeToggle

- Light / Dark / System
- Persisted in localStorage

---

## Pages (Next.js routes)

| Route            | Purpose                  |
| ---------------- | ------------------------ |
| `/`              | Dashboard (Today view)   |
| `/auth/login`    | Login page               |
| `/auth/register` | Register page            |
| `/tasks/[id]`    | Deep-link to task detail |
| `/lists/[id]`    | Tasks filtered by list   |
| `/completed`     | Completed tasks view     |
| `/settings`      | Preferences and theme    |

---

## Local state and persistence strategy

- Load initial data from `data/mockData.json` or `localStorage`.
- `useTasks` and `useLists` hooks expose CRUD operations that update React Query cache and write changes to localStorage/IndexedDB.
- Mock network latency on mutations for realistic UX.
- When backend arrives, swap persistence layer to API calls while keeping the same hooks.

Example hook shape:

```ts
const { tasks, addTask, updateTask, deleteTask } = useTasks();
```

---

## UX flows

**Add task**

1. Click `+` or Quick Add
2. Fill title (optional natural-language text)
3. Save → shown immediately in selected list

**Edit task**

1. Open TaskDetailPanel or inline editor
2. Change fields → auto-save locally

**Complete task**

- Click checkbox → animate strike-through and move to Completed view

**Filter / Search**

- Use search bar or chips → TaskList updates in real time

---

## Design system & guidelines

- **Colors**: neutral background, accent colors per list
- **Typography**: Inter (primary); readable sizes and spacing
- **Motion**: subtle transitions and panel slide-ins
- **Empty states**: friendly illustrations + CTA
- **Accessibility**: keyboard shortcuts, ARIA labels, focus rings
- **Responsive**: mobile-first; sidebar becomes drawer on small screens

---

## Mock data (data/mockData.json)

```json
{
  "lists": [
    { "id": "1", "title": "Inbox", "color": "#007AFF" },
    { "id": "2", "title": "Personal", "color": "#FF9500" },
    { "id": "3", "title": "Work", "color": "#34C759" }
  ],
  "tasks": [
    {
      "id": "t1",
      "listId": "1",
      "title": "Buy groceries",
      "priority": 2,
      "due": "2025-11-12",
      "done": false
    },
    {
      "id": "t2",
      "listId": "2",
      "title": "Prepare presentation",
      "priority": 1,
      "due": "2025-11-13",
      "done": false
    },
    {
      "id": "t3",
      "listId": "3",
      "title": "Gym session",
      "priority": 3,
      "done": true
    }
  ]
}
```

---

## Developer setup (quick)

1. Create project

```bash
npx create-next-app tickTac-clone --typescript --tailwind
cd tickTac-clone
npx shadcn-ui init
```

2. Add libraries

```bash
npm install @tanstack/react-query framer-motion lucide-react dexie
```

3. Add shadcn components

```bash
npx shadcn-ui add button input dialog dropdown-menu tooltip
```

4. Start dev server

```bash
npm run dev
```

---

## Next steps (after UI completion)

- Replace local persistence with backend API (REST or GraphQL)
- Add real-time sync (WebSocket) and background sync
- Implement reminders & calendar view
- Add authentication and account settings

---

## Notes

- This document is frontend-first; backend contracts and API shapes will be defined later.
- Keep hooks and state management abstracted so switching to real APIs is straightforward.

---

_End of blueprint._
