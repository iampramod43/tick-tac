# - Complete Productivity Suite

A comprehensive productivity application built with Next.js 16, featuring task management, time tracking, habit building, and more - all with a beautiful UI and offline-first architecture.

## ✨ Features

### 📋 Task Management

- ✅ **Smart Task Lists**: Inbox, Today, Upcoming, and Completed views
- 📝 **Rich Task Details**: Add notes, due dates, priorities, tags, and subtasks
- 🎨 **Custom Lists**: Create unlimited color-coded lists
- 🔍 **Advanced Filters**: Filter by priority, due date, and tags
- 🎯 **Natural Language**: Add tasks like "Buy milk tomorrow !!"
- ⚡ **Optimistic UI**: Instant feedback on all actions

### 📅 Calendar View

- 📆 **Monthly Calendar**: Visual display of tasks by due date
- 🗓️ **Date Navigation**: Browse months with Previous/Next/Today buttons
- 📌 **Task Preview**: See tasks on calendar cells
- ✏️ **Quick Actions**: Add, edit, and complete tasks from calendar

### ⏱️ Pomodoro Timer

- 🍅 **Focus Sessions**: 25-minute work intervals
- ☕ **Smart Breaks**: Short (5 min) and long (15 min) breaks
- 📊 **Session Tracking**: Track completed pomodoros and time focused
- 🔔 **Notifications**: Desktop notifications when sessions complete
- ⚙️ **Customizable**: Adjust work/break durations to your preference
- 📈 **Statistics**: View session history and total time focused

### 🎯 Habit Tracker

- 📅 **Daily Tracking**: Mark habits as complete for each day
- 🔥 **Streak Counter**: Track consecutive days of completion
- 📊 **Weekly View**: See your progress across the week
- 🎨 **Custom Habits**: Create habits with colors and descriptions
- 📈 **Progress Stats**: View completion rates and totals

### ⏳ Countdown Timers

- 📅 **Event Tracking**: Count down to important dates
- ⏰ **Real-Time Updates**: Live countdown to seconds
- 🎨 **Categories**: Organize by Work, Personal, Holiday, etc.
- 📊 **Multiple Countdowns**: Track unlimited events
- 🎉 **Event Status**: See when events have passed

### 📊 Eisenhower Matrix

- 🎯 **4 Quadrants**: Urgent/Important, Not Urgent/Important, etc.
- 📋 **Smart Prioritization**: Visual task organization
- ✅ **Task Management**: Add, complete, and delete tasks per quadrant
- 🔄 **Quick Move**: Easily move tasks between quadrants
- 💡 **Actionable Labels**: "Do First", "Schedule", "Delegate", "Eliminate"

### 🔍 Global Search

- ⌨️ **Keyboard Shortcut**: Cmd/Ctrl + K to search
- 🎯 **Universal Search**: Find tasks across all views
- ⚡ **Instant Results**: Real-time search as you type
- 🔗 **Quick Navigation**: Jump directly to results

### 🎨 Additional Features

- 🌓 **Theme Support**: Light, dark, and system theme modes
- 💾 **Offline Storage**: Local persistence with IndexedDB
- 📱 **Responsive Design**: Beautiful on desktop and mobile
- 🔗 **URL-Based Navigation**: Shareable links to specific views
- ⚡ **Fast Performance**: Optimized with React Query

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Database**: Dexie.js (IndexedDB wrapper)
- **Type Safety**: TypeScript
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, pnpm, yarn, or bun package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd tick-tac
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
tick-tac/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page (dashboard)
│   │   ├── auth/              # Authentication pages
│   │   ├── settings/          # Settings page
│   │   └── tasks/[id]/        # Task detail page
│   │
│   ├── components/
│   │   ├── layout/            # Layout components (Sidebar, Header, MainLayout)
│   │   ├── tasks/             # Task-related components
│   │   ├── lists/             # List management components
│   │   ├── common/            # Shared components (SearchBar, DatePicker, etc.)
│   │   ├── providers/         # Context providers
│   │   └── ui/                # shadcn/ui components
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useTasks.ts        # Task operations
│   │   ├── useLists.ts        # List operations
│   │   └── useOfflineStorage.ts # IndexedDB operations
│   │
│   ├── lib/
│   │   ├── types.ts           # TypeScript type definitions
│   │   ├── constants.ts       # App constants
│   │   └── utils.ts           # Utility functions
│   │
│   └── data/
│       └── mockData.json      # Initial mock data
│
├── components/                # shadcn/ui installed components
└── lib/                       # shadcn/ui utilities
```

## Features Overview

### Task Management

- **Quick Add**: Add tasks quickly from any view with natural language support
- **Task Details**: Comprehensive task editor with all fields
- **Subtasks**: Break down tasks into smaller steps
- **Priority Levels**: 4 priority levels (Urgent, High, Normal, Low)
- **Tags**: Organize tasks with custom tags
- **Due Dates**: Set due dates with calendar picker

### Views

- **Inbox**: Default location for new tasks
- **Today**: Tasks due today
- **Upcoming**: Tasks due in the next 7 days
- **Calendar**: Monthly calendar view with tasks displayed on their due dates
- **Completed**: Archive of finished tasks
- **Custom Lists**: Create unlimited custom lists with colors

### User Interface

- **Dark Mode**: Supports light, dark, and system themes
- **Responsive**: Mobile-first design that works on all devices
- **Animations**: Smooth transitions and interactions
- **Keyboard Shortcuts**: Fast navigation with keyboard
- **Search**: Real-time search across all tasks
- **Filters**: Advanced filtering by priority, due date, and tags

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## 🎯 Complete Features

- [x] ✅ Task Management (Inbox, Today, Upcoming, Completed)
- [x] ✅ Calendar View
- [x] ✅ Pomodoro Timer
- [x] ✅ Habit Tracker
- [x] ✅ Countdown Timers
- [x] ✅ Eisenhower Matrix
- [x] ✅ Global Search (Cmd/Ctrl + K)
- [x] ✅ Custom Lists
- [x] ✅ Theme Switcher (Light/Dark/System)
- [x] ✅ Offline Storage

## 🚀 Future Enhancements

- [ ] Backend API integration (REST or GraphQL)
- [ ] Real-time sync with WebSocket
- [ ] User authentication and multi-user support
- [ ] Recurring tasks
- [ ] File attachments
- [ ] Collaboration features
- [ ] Mobile apps (React Native)
- [ ] Data export/import
- [ ] Advanced analytics and insights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or building your own task manager.

## Acknowledgments

- Inspired by [tickTac](https://tickTac.com/)
- Built with [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Note**: This is a frontend-only implementation with local storage. All data is stored in your browser's IndexedDB and will persist across sessions.
