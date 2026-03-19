# Aria III Maintenance Tracker — User Guide

**Audience:** Lab researchers, technicians, and service personnel who create, update, and resolve maintenance tickets for the BD FACS Aria III flow cytometer.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [The Dashboard](#2-the-dashboard)
3. [Understanding the Kanban Board](#3-understanding-the-kanban-board)
4. [Creating a Ticket](#4-creating-a-ticket)
5. [Viewing a Ticket](#5-viewing-a-ticket)
6. [Updating a Ticket](#6-updating-a-ticket)
7. [Using the Service Log (Comments)](#7-using-the-service-log-comments)
8. [Resolving and Closing a Ticket](#8-resolving-and-closing-a-ticket)
9. [Moving Tickets with Drag-and-Drop](#9-moving-tickets-with-drag-and-drop)
10. [The History Page](#10-the-history-page)
11. [Field Reference](#11-field-reference)

---

## 1. Getting Started

Open your web browser and navigate to the application URL (e.g. **http://localhost** or the address provided by your lab IT team). No login is required.

### Navigation bar

The navigation bar appears at the top of every page:

```
[≋ Aria III]   [Dashboard]  [History]              [+ New Ticket]
  Maintenance
  Tracker
```

| Element | Action |
|---------|--------|
| **Aria III logo** | Returns to the Dashboard |
| **Dashboard** | Main view — all active tickets |
| **History** | Table of all resolved maintenance events |
| **+ New Ticket** | Opens the ticket creation form |

---

## 2. The Dashboard

The Dashboard is the main workspace. It opens automatically when you visit the application.

### Stats bar

At the top of the Dashboard, four cards show a live count of tickets by status:

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  ◉  Open    │ │  ◉ In Prog. │ │  ◉ Resolved │ │  ◉  Closed  │
│      4      │ │      2      │ │      3      │ │      1      │
│  ──────▓▓▓▓ │ │  ──────▓▓  │ │  ──────▓▓▓  │ │  ──────▓    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Clicking a stat card filters the view** to show only tickets with that status. Click the same card again to remove the filter and show all tickets.

The thin bar at the bottom of each card shows that status's proportion of all tickets.

### Filter controls

In the top-right area of the Dashboard:

| Control | Purpose |
|---------|---------|
| **All Severity** dropdown | Filter tickets to show only High / Medium / Low severity |
| **Kanban / List** toggle | Switch between the Kanban board and a flat list view |
| **↻ (Refresh)** button | Reload tickets from the server |

### Kanban vs List view

- **Kanban** (default): Tickets are arranged in four columns by status. Best for understanding the overall workflow at a glance and for moving tickets between stages.
- **List**: All matching tickets appear in a single scrollable column. Best for quickly scanning a specific status or severity.

---

## 3. Understanding the Kanban Board

The Kanban board is the default Dashboard view. It shows four columns, each representing a stage in the maintenance workflow:

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   OPEN   (3)   │  │ IN PROGRESS (2)│  │  RESOLVED (3)  │  │  CLOSED  (1)   │
│  sky blue      │  │  amber/orange  │  │    emerald     │  │     slate      │
│                │  │                │  │                │  │                │
│ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────┐ │  │ ┌────────────┐ │
│ │ #1 Laser   │ │  │ │ #4 Pressure│ │  │ │ #6 Sort    │ │  │ │ #9 Temp    │ │
│ │ 488nm Blue │ │  │ │ System     │ │  │ │ Collection │ │  │ │ Control    │ │
│ │ Dr. Patel  │ │  │ │ Dr. Gupta  │ │  │ │ Dr. Osei   │ │  │ │ Dr. Patel  │ │
│ │  ● High    │ │  │ │  ● High    │ │  │ │  ● High    │ │  │ │  ● Medium  │ │
│ └────────────┘ │  │ └────────────┘ │  │ └────────────┘ │  │ └────────────┘ │
│                │  │                │  │                │  │                │
│ ┌────────────┐ │  │ ...            │  │ ...            │  │                │
│ │ #2 Nozzle  │ │  └────────────────┘  └────────────────┘  └────────────────┘
│ └────────────┘ │
└────────────────┘
```

### Column colors

| Column | Header Color | Meaning |
|--------|-------------|---------|
| Open | Sky blue | Issue reported, not yet assigned |
| In Progress | Amber/orange | Actively being worked on |
| Resolved | Emerald green | Fix applied, awaiting confirmation |
| Closed | Slate gray | Fully completed, no further action |

### Ticket card anatomy

Each ticket card in the board shows:

```
┌─────────────────────────────────────┐
│ #4                          ● High  │  ← Ticket ID + Severity badge
│ Pressure System                     │  ← Instrument subsystem
│                                     │
│ 👤 Dr. Gupta  🔧 Field Eng. Kim  5h ago │  ← Reporter, Assignee, Last update
└─────────────────────────────────────┘
```

- **Left colored border**: Red = High, Amber = Medium, Green = Low severity
- **Reporter** (👤): Who filed the ticket
- **Assignee** (🔧): Who is working on it (if assigned)
- **Time**: How long ago the ticket was last updated

**Click any card** to open the full ticket detail page.

---

## 4. Creating a Ticket

When an instrument issue is identified, create a ticket immediately.

### Step 1 — Open the form

Click **+ New Ticket** in the top-right of the navigation bar, or click **Create a ticket** inside an empty "Open" column.

### Step 2 — Select the instrument subsystem

Choose the affected component from the dropdown:

- Laser — 488nm Blue
- Laser — 633nm Red
- Laser — 405nm Violet
- FSC Detector
- SSC Detector
- PMT Array
- Sort Collection System
- Nozzle / Flow Cell
- Fluidics System
- Pressure System
- Electronic / Software
- Temperature Control
- Sample Injection Port (SIP)
- Other

> **Tip:** Choose the most specific subsystem you can. This makes filtering and historical analysis more useful.

### Step 3 — Describe the problem

In the **Problem Description** field, include:

- What you observed (symptoms, error messages, measurements)
- When it started
- Whether it is consistent or intermittent
- Any steps you have already tried
- Impact on current or upcoming experiments

> **Example:** *"488nm laser power output dropping from 200 mW to ~80 mW after 90 min of continuous sort. No error code displayed. Issue appeared after yesterday's 6-hour sort session. Restarting laser controller did not resolve it."*

### Step 4 — Select severity

Choose the severity level that best describes the impact:

| Severity | When to use |
|----------|-------------|
| **High** | Instrument is non-functional, unsafe to operate, or experiments cannot proceed |
| **Medium** | Performance is degraded but a workaround exists; some experiments can continue |
| **Low** | Minor or cosmetic issue; no meaningful impact on operations |

Click the severity tile — it will highlight when selected.

### Step 5 — Enter your name

Type your name in the **Your Name** field so others know who reported the issue.

### Step 6 — Submit

Click **Submit Ticket**. You will be taken directly to the new ticket's detail page, where you can add additional notes or assign a technician.

---

## 5. Viewing a Ticket

Click any ticket card on the Dashboard, or any ticket ID link in the History page, to open the **Ticket Detail** page.

### Main panel (left, 2/3 width)

#### Header

Shows the current status badge, severity badge, and the instrument subsystem affected.

#### Status progress tracker

A four-step visual indicator shows where the ticket sits in the workflow:

```
  [1]───────[2]───────[3]───────[4]
  Open   In Prog.  Resolved  Closed
```

Completed steps are filled in with the current status color.

#### Metadata grid

| Field | Description |
|-------|-------------|
| Reporter | Who filed the ticket |
| Assigned To | Who is responsible for fixing it |
| Created | Date and time the ticket was created |
| Updated | Date and time of the most recent change |
| Resolved | Date and time the status was set to Resolved (if applicable) |

#### Problem description

The full text entered when the ticket was created.

#### Service log

A chronological thread of comments added by reporters, technicians, and service engineers. See [Section 7](#7-using-the-service-log-comments) for how to add entries.

### Sidebar (right, 1/3 width)

The **Manage** card contains all controls for updating the ticket. The **Danger Zone** card contains the delete action. See [Section 6](#6-updating-a-ticket) for details.

---

## 6. Updating a Ticket

All updates are made from the **sidebar** of the Ticket Detail page.

### Changing the status

In the sidebar under **Manage**, click one of the four status buttons:

```
  ○  Open
  ◉  In Progress     ← currently selected (dark background)
     Resolved
     Closed
```

Click the button for the new status. It will highlight immediately.

> The status can also be changed by **dragging the ticket card** to a different column on the Kanban board — see [Section 9](#9-moving-tickets-with-drag-and-drop).

### Changing the severity

Use the **Severity** dropdown in the sidebar to change between Low, Medium, and High.

### Assigning to a technician

Type a name (or clear the field to unassign) in the **Assigned Technician** field.

> **Tip:** Use consistent names (e.g. "Tech. Marcus Webb") to make filtering by assignee useful in the future.

### Saving changes

After making any changes in the sidebar, click **Save Changes**. The button is disabled (and reads "Up to date") when no unsaved changes exist.

A confirmation toast will appear in the top-right corner when the save succeeds.

> **Important:** Changes to status, severity, and assignee are only saved when you click **Save Changes**. Navigating away without saving will discard those changes.

### Deleting a ticket

In the **Danger Zone** section at the bottom of the sidebar, click **Delete Ticket**.

A confirmation prompt will appear. Confirm to permanently delete the ticket and all its service log comments. This action cannot be undone.

---

## 7. Using the Service Log (Comments)

The Service Log is a chronological record of all work notes, findings, and updates related to a ticket. It is the primary communication channel between reporters and technicians.

### Reading the service log

Comments appear in the main panel, in chronological order (oldest first). Each entry shows:

- **Avatar** — a colored circle showing the author's initial
- **Author name** and the date/time of the note
- **Note body** — the full text of the entry

### Adding a service note

At the bottom of the Service Log section:

1. Enter your name in the first input field
2. Type your note in the text area
3. Click **Add Note**

> **What to write:**
> - Findings from diagnostics ("Checked laser power supply — voltage nominal")
> - Parts ordered or received ("PMT module #8 ordered from BD, ETA 3 business days")
> - Actions taken ("Replaced O-rings on sheath pressure regulator")
> - Status updates ("Monitoring pressure stability — check again at 5pm")
> - Confirmation that a fix is holding ("Sort purity back to >98% over 3 consecutive runs")

### Deleting a comment

Hover over a comment — a small **×** button will appear in the top-right of the comment. Click it to delete the note. (This is not reversible.)

---

## 8. Resolving and Closing a Ticket

### When to use each status

| Status | When to use |
|--------|-------------|
| **Open** | Issue reported, not yet being investigated |
| **In Progress** | Actively being diagnosed or repaired |
| **Resolved** | The fix has been applied and initial testing shows it is working. Awaiting confirmation over time or by the original reporter |
| **Closed** | The issue is definitively fixed and confirmed. No further action needed |

### Recommended resolution workflow

1. **Reporter** creates ticket with status **Open**
2. **Technician** picks up the ticket, assigns it to themselves, sets status to **In Progress**, and adds a service note
3. **Technician** adds notes as work progresses
4. **Technician** sets status to **Resolved** once the fix is applied and adds a closing note describing what was done
5. **Reporter** (or lab manager) confirms the fix over subsequent sessions, then sets status to **Closed**

### What happens when a ticket is Resolved

The application automatically stamps a **Resolved At** timestamp when the status is changed to **Resolved**. This timestamp:
- Appears in the metadata grid on the ticket detail page
- Appears in the **Resolved At** column on the History page
- Is used for tracking mean-time-to-resolution

If a ticket is reopened (status changed back to **In Progress** or **Open**), the resolved timestamp is cleared automatically.

### Resolved tickets in History

Once a ticket reaches **Resolved** status, it also appears on the **History** page, which provides a permanent audit trail of all maintenance events. See [Section 10](#10-the-history-page).

---

## 9. Moving Tickets with Drag-and-Drop

On the Kanban board, you can change a ticket's status without opening it by dragging its card to a different column.

### How to drag

1. Click and hold a ticket card on the Kanban board
2. While holding, drag the card horizontally toward the target column
3. The target column highlights when it is ready to receive the card
4. Release the card to drop it

The status updates immediately (optimistically) on screen, and the change is saved to the server in the background. A confirmation toast appears when the save succeeds.

If the save fails (e.g. the server is temporarily unavailable), the card returns to its original column and an error message is shown.

### Visual feedback during drag

| State | Visual |
|-------|--------|
| Picking up a card | Card lifts, enlarges slightly, and rotates |
| Hovering over a valid column | Column background brightens |
| Successful drop | Card settles in new column, toast appears |
| Failed drop (same column) | No change, no server call |

> **Tip:** Dragging is the fastest way to update status during a lab meeting or daily standup — no need to open each ticket individually.

---

## 10. The History Page

The History page provides a read-only table of every ticket that has reached **Resolved** status. It serves as a permanent audit trail and reference for recurring issues.

### Accessing History

Click **History** in the navigation bar.

### Table columns

| Column | Description |
|--------|-------------|
| Ticket | Ticket ID — click to open the full detail page |
| Subsystem | The affected instrument component |
| Severity | High / Medium / Low |
| Reporter | Who filed the original ticket |
| Resolved By | The assigned technician (if set) |
| Resolved At | Date and time the status was set to Resolved |

### Searching

Type in the **search box** (top-right of the History page) to filter the table instantly. The search matches against:
- Instrument subsystem name
- Reporter name
- Assigned technician name

The result count updates live at the bottom of the table.

> **Example use:** Search for "PMT" to see all past PMT-related failures and how they were resolved.

---

## 11. Field Reference

### Instrument Part / Subsystem

| Subsystem | Notes |
|-----------|-------|
| Laser — 488nm Blue | Primary excitation laser; used for FITC, PE, etc. |
| Laser — 633nm Red | Far-red excitation; used for APC, APC-Cy7 |
| Laser — 405nm Violet | UV/Violet laser; used for Pacific Blue, BV dyes |
| FSC Detector | Forward scatter — cell size |
| SSC Detector | Side scatter — cell complexity/granularity |
| PMT Array | All photomultiplier tube detector channels |
| Sort Collection System | Deflection plates, collection tubes, tube holders |
| Nozzle / Flow Cell | Sorting tip, jet-in-air nozzle |
| Fluidics System | Sheath tank, tubing, sheath filter, de-gas chamber |
| Pressure System | Sheath pressure regulator, sample pressure |
| Electronic / Software | FACSDiva software, sort electronics, sort boards |
| Temperature Control | Sample cooling block, Peltier unit |
| Sample Injection Port (SIP) | Sample input, sample tube engagement |
| Other | Issues that don't fit the above categories |

### Severity levels

| Level | Badge Color | Definition |
|-------|-------------|-----------|
| High | Red | Instrument non-functional or unsafe; critical sorts at risk |
| Medium | Amber | Degraded performance; workaround available |
| Low | Green | Cosmetic or minor; no experimental impact |

### Ticket status

| Status | Badge Color | Meaning |
|--------|-------------|---------|
| Open | Sky blue (pulsing) | Newly reported; not yet assigned |
| In Progress | Amber (pulsing) | Actively being investigated or repaired |
| Resolved | Emerald (pulsing) | Fix applied; under observation |
| Closed | Slate | Confirmed resolved; closed permanently |
