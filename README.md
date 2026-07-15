# OASIS Payroll Intelligence Platform

An enterprise-grade SaaS payroll and attendance intelligence dashboard built for **OASIS Insurance Brokers Pvt. Ltd.** The platform translates biometric punch cards, performance appraisal parameters, and leave schedules into real-time payroll calculations.

---

## 🎨 Design System & Palette

- **Primary Colors**: Navy Blue (`#0B2E4F`) and Accent Orange (`#F5A623`).
- **Typography**: Built on Google Fonts' *Plus Jakarta Sans* for clean B2B interface legibility.
- **Card Styling**: Rounded corners (`rounded-xl`), soft shadows (`shadow-sm` to `shadow-md`), and glassmorphism components (`backdrop-filter`) for modal views.
- **Responsive Layout**: Collapsible sidebar, sticky headers, and custom scrollbars.

---

## 🚀 Key Platform Features

### 1. High-Fidelity Employee Portal
*   **Accrued Monthly Salary Card**: Computes pro-rata payout up to the selected day with a timeline progress bar. Clicking "View Payslip" opens the printable ledger slip.
*   **Leave Balance Desk**: Displays active leave quotas (Casual, Sick, Paid, Unpaid).
*   **Interactive Leave Application Form**: Validates dates and available balances, dynamically deducts approved counts from the employee's quotas, and appends requests to a scrolling historical registry.
*   **Sales Performance Audits**: Integrates sales volume cards (policies sold, values generated, target achievements) and renders an interactive performance radar chart.
*   **Biometric Calendar Preview**: Displays monthly check-in punch cards colored by daily attendance status.

### 2. Decoupled Dynamic Calculation Engine
*   **Decoupled Logic (`payrollEngine.ts`)**: Base pay rates, attendance penalties, lateness penalties, dynamic Sales division variable incentive scaling, statutory taxes, and pro-rata accrued balances are calculated in a single, pure stateless computation utility, isolating math from UI rendering.
*   **Accrual Timeline Slider**: A slider located in the header allows administrators to sweep through the current day of the month from Day 1 to Day 26.
*   **Roster Ticker Display**: Live banner tracking and aggregating the collective accrued payroll liability of all 22+ employees up to the selected day.
*   **Light-Amber Accrued Column**: A high-visibility column inside the Payroll Register showing the pro-rata earned balance dynamically calculated for each employee.
*   **Accrued vs. Target Breakdown**: Employee drawers and payslips render comparison charts displaying full-month target payout lines side-by-side with accrued pro-rata assets.

### 3. Executive Analytics Dashboard
*   **KPI Grid Summary**: Live animated indicators showing Total Roster, Present Today counters, Late arrivals, Organization Appraisal Average, Monthly Outlays, and Pending Leaves.
*   **Interactive Data Visualizations (Recharts)**:
    *   *Check-in Punctuality Trend*: Area chart visualizing daily presence and punctuality rates.
    *   *Compensation Expense by Division*: Dual-color bar chart comparing total salary outlay by department.
    *   *Compensation Bracket Allocation*: Radial donut chart analyzing employee counts across wage categories.
    *   *Late Arrivals Count by Department*: Horizontal bar chart highlighting punctuality hot-spots.
*   **System Action Stream**: Dynamic audit trail logging spreadsheet uploads, settings overrides, and approval events.

### 4. Employee Directory & Detailed Profiles
*   **Roster Directory**: Searchable grid datatable with custom filters (department, payroll status), column-sorting (by ID, Base Salary), and responsive pagination.
*   **Organization Profile Drawers**:
    *   *Personal Card*: Name, email, supervisor, designated role hierarchy, and base salary.
    *   *Leave Balance Tracker*: Interactive status cards indicating Casual, Sick, Paid, and Unpaid balances.
    *   *Biometric Attendance Calendar*: Monthly grid showing daily status (Green: Present, Red: Absent, Orange: Late, Indigo: Half-Day).
    *   *Performance Radar Chart*: Multi-dimensional analysis mapping target achievements, CSAT ratings, compliance scores, and manager feedback.

### 5. Biometric Attendance & Leave Controller
*   **File Parsing Simulator**: Drag-and-drop biometric attendance Excel sheet upload simulation featuring loading overlays and automatic calculations.
*   **Leave Approval Desk**: Inbox displaying active leave requests (Casual, Sick, Paid, Unpaid). Administrative actions (Approve/Reject) dynamically deduct from the employee's respective balances and log audit events.

### 6. Payroll Ledger & Live Calculations
*   **Dynamic Matrix**: Complete table displaying Base Salary, Deductions, Incentives, and Net take-home payouts.
*   **In-Line Modifiers**: Modifying an employee's absent days, late marks, appraisal score, or allowances instantly updates their Net Salary on-screen.
*   **CSV Payroll Register Export**: One-click download of the complete monthly register schema, formatted for standard bank transfers.
*   **Payslip Generator & PDF Printer**: Generate individual, electronically certified salary slips complete with Earnings Ledgers, Deductions Ledgers, accounting info (PAN, HDFC Bank, PF numbers), and print-ready styles.
*   **Sales Leverage Metrics**: Integrates badges for `targetAchievement%` and `policiesSold` directly next to Sales profiles. If target performance exceeds 100%, their variable incentive is scaled by the target factor.

### 7. Settings & Calculations Configurations
*   **Variable Adjustments**: Administrators can alter base working days, PF contribution percentage, Professional Tax caps, and TDS rates.
*   **Incentive Brackets Override**: Tweaking the performance score brackets immediately updates calculations globally.

---

## 📂 Project Architecture

```
├── src/
│   ├── app/
│   │   ├── types.ts          # TypeScript type contracts
│   │   ├── mockData.ts       # Robust Indian enterprise mock database (22 records)
│   │   ├── payrollEngine.ts  # Isolated stateless computation calculations engine
│   │   ├── page.tsx          # Central state, views, UI layouts & modals
│   │   ├── globals.css       # Tailwind 4 styles, custom scrollbars, printing rules
│   │   └── layout.tsx        # HTML wrapper structure and page SEO metadata
├── public/
│   └── logo.webp             # Corporate logo asset
├── package.json              # App configuration & package dependencies
└── README.md                 # Project handbook
```

---

## 👥 Role-Based UI Architecture

Switch roles from the header privilege switcher to preview views:
1. **Super Admin**: Complete system privileges, full employee directory audits, leave approvals, and live Settings tweaks.
2. **HR Manager**: Roster configuration, biometric file sync upload, leave approvals, and payslip generation.
3. **Department Head (Sales)**: Automatically restricted to their division (e.g. Sales). Calibration of Sales target achievements and approval of division incentives.
4. **Employee**: Restricted personal view. Renders personal attendance calendars, historical payout radar charts, and payslip downloads.

---

## 🔢 Implemented Payroll Formula

Calculations are computed dynamically in real-time as roster statistics are updated in the payroll grid:

$$\text{Net Salary} = \text{Base Salary} - \text{Attendance Deduction} - \text{Late/Half-Day Deductions} - \text{PF} - \text{PT} - \text{TDS} + \text{Incentive} + \text{Bonus} + \text{Overtime Pay}$$

### Accrued Pro-Rata Formula:
$$\text{Pro-Rata Accrued Salary} = \left(\frac{\text{Net Monthly Salary}}{26}\right) \times \min(\text{currentDayOfMonth}, 26)$$

### Formula Parameters:
- **Base Working Days**: 26 (Adjustable in global configurations).
- **Daily Wage Rate**: $\frac{\text{Base Salary}}{\text{Working Days}}$.
- **Attendance Deduction**: $\text{Absent Days} \times \text{Daily Wage Rate}$.
- **Late Deduction Rule**: Every 3 late check-ins count as 1 half-day deduction.
- **Half-Day Deduction**: $\text{Half-Days} \times \frac{\text{Daily Wage Rate}}{2}$.
- **Performance Incentives**:
  - Score &ge; 90: $+₹10,000$
  - Score $80 - 89$: $+₹7,000$
  - Score $70 - 79$: $+₹5,000$
  - Score $< 70$: $+₹2,000$
  - *Sales Team Multiplier*: If Sales members achieve $> 100\%$ target achievement, their performance incentive is multiplied by the target achievement factor (e.g., $\text{Incentive} \times \frac{\text{Target}}{100}$).
- **Overtime Rate**: Hourly wage rate $\times 1.5$ multiplier.
- **Deductions Ledger**: PF (12% of Base), TDS (10% of Base), PT (Fixed ₹200).

---

## 🚀 How to Run the Project Locally

### 1. Install Dependencies
Run the command to install packages (React, Next.js, Lucide Icons, Recharts, etc.):
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Production Build Compilation
To check type safety, optimize assets, and compile the static bundle, run:
```bash
npm run build
```
