# Designer Task Tracker - Documentation & Case Study

## 1. Why Build This App? (The Rationale)
**Comparison: Custom App vs. Google Sheets**

The decision to migrate from Google Sheets to a custom-built React application was driven by specific limitations in scalability, data integrity, and workflow efficiency.

| Feature | ❌ Google Sheets Limitation | ✅ App Solution |
| :--- | :--- | :--- |
| **Date Management** | Requires manual creation of new columns/sheets daily. Older dates clutter the view or need archival. | **Automatic Rollover**: The app generates dynamic daily columns. Past days are automatically archived; pending tasks from yesterday auto-migrate to today. |
| **Data Integrity** | Users can type invalid statuses (e.g., "Dne", "Pennding") or accidentally delete rows. | **Structured Data**: Dropdowns and fixed states (Pending/Submitted) prevent data entry errors. |
| **Task Assignment** | "Assigned By" is often just text, inconsistent if people use nicknames. | **Standardized Assigners**: Pre-defined list of Account Managers ensures accurate tracking of who requested what. |
| **Visibility** | Hard to focus on *my* tasks when looking at a giant grid of everyone's work. | **Designer-Centric View**: Filters and focused "Active Designer" tabs allow clutter-free work. |
| **Analytics** | Calculating "Efficiency %" requires complex formulas that break easily. | **Real-Time Dashboard**: Automated calculation of Completion Rates per Designer and Account Manager without manual spreadsheet crunching. |
| **Interactivity** | Moving a task to tomorrow requires "Cut & Paste". | **Drag & Drop**: Native drag-and-drop support to reschedule tasks instantly. |

---

## 2. User Manual

### 🎨 For Designers
**Goal**: clear your board by the end of the day.
1.  **Access the Board**: Log in to see the weekly view (Monday–Friday).
2.  **View Tasks**:
    *   Tasks are organized by **Date** columns.
    *   'Today' is highlighted.
3.  **Update Status**:
    *   Click the **Status Badge** (e.g., "Pending") on any task card.
    *   Select **Submitted** when work is done. The card turns green.
4.  **Reschedule**:
    *   If you can't finish a task today, **Drag and Drop** it to the next day's column.
5.  **Add Your Own Tasks**:
    *   Use the **"Add Task"** button at the bottom of any column for quick inline entry.

### 👔 For Account Managers / Admin
**Goal**: Assign work and monitor team health.
1.  **Assigning Tasks**:
    *   Click the **"+" (Plus)** button in the toolbar.
    *   Select the **Designer**, enter **Task Details**, **Deadline**, and select your name in **Assigned By**.
    *   *Tip*: Using the "Assigned By" field correctly ensures the dashboard tracks your delegation stats.
2.  **Using the Dashboard**:
    *   Navigate to the **Dashboard** tab (Visible only to Admins/Managers).
    *   **Tab Switching**: Toggle between "Designers" (to see who is overloaded) and "Account Managers" (to see who is assigning the most work).
    *   **Date Filters**: Use "Today", "This Week", or custom ranges to generate reports for meetings.

---

## 3. Case Study Presentation Structure

**Title**: *Scaling Creative Workflows: From Spreadsheets to Intelligent Systems*

**Slide 1: The Challenge**
*   **The Bottleneck**: Managing a growing creative team using static spreadsheets.
*   **The Pain Points**:
    *   Manual maintenance of sheets (10+ hours/month).
    *   Lack of accountability ("Who deleted that row?").
    *   Difficulty in tracking true team capacity.

**Slide 2: The Solution (Designer Task Tracker)**
*   A bespoke Single Page Application (SPA) built with **React** & **Firebase**.
*   **Key Features**:
    *   **Auto-Migration**: Never lose a "Pending" task again.
    *   **Role-Based Views**: Designers see their work; Dashboard metrics restricted to Admins only.
    *   **Zero-Maintenance**: Infinite date scrolling without manual setup.

**Slide 3: Impact & ROI**
*   **Efficiency**: 100% reduction in "sheet setup" time.
*   **Accountability**: Every task has a logged Creator and Owner.
*   **Data-Driven Culture**: Visual dashboards replace gut-feeling on team performance.

**Slide 4: Technical Innovation**
*   **Optimistic UI**: Instant feedback for users, ensuring the app feels faster than a spreadsheet.
*   **Real-Time Sync**: Firebase backend ensures all managers see updates instantly without page refreshes.
*   **Mobile Ready**: Fully responsive design for checking status on the go.

---

## 4. Future Roadmap (Optional Slide)
*   **Notifications**: Slack integrations for task completion.
*   **Asset Library**: Direct file uploads to task cards.
*   **Client View**: Limited read-only link for clients to track their specific requests.
