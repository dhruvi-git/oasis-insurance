# OASIS Payroll Intelligence Platform

An enterprise-grade SaaS payroll and attendance intelligence dashboard built for **OASIS Insurance Brokers Pvt. Ltd.** The platform translates biometric punch cards, performance appraisal parameters, and leave schedules into real-time payroll calculations.

---

## 🎨 Design System & Palette

- **Primary Colors**: Navy Blue (`#0B2E4F`) and Accent Orange (`#F5A623`).
- **Typography**: Built on Google Fonts' *Plus Jakarta Sans* for clean B2B interface legibility.
- **Card Styling**: Rounded corners (`rounded-xl`), soft shadows (`shadow-sm` to `shadow-md`), and glassmorphism components (`backdrop-filter`) for modal views.
- **Responsive Layout**: Collapsible sidebar, sticky headers, and custom scrollbars.

---

## 📂 Project Architecture

```
├── src/
│   ├── app/
│   │   ├── types.ts          # TypeScript type contracts
│   │   ├── mockData.ts       # Robust Indian enterprise mock database (22 records)
│   │   ├── page.tsx          # Central state, views, calculations & modals
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

### Formula Parameters:
- **Base Working Days**: 26 (Adjustable in global configurations).
- **Daily Wage Rate**: $\frac{\text{Base Salary}}{\text{Working Days}}$.
- **Attendance Deduction**: $\text{Absent Days} \times \text{Daily Wage Rate}$.
- **Late Deduction Rule**: Every 3 late check-ins count as 1 half-day deduction.
- **Half-Day Deduction**: $\text{Half-Days} \times \frac{\text{Daily Wage Rate}}{2}$.
- **Performance Incentives**:
  - Score $\ge 90$: $+₹10,000$
  - Score $80 - 89$: $+₹7,000$
  - Score $70 - 79$: $+₹5,000$
  - Score $< 70$: $+₹2,000$
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
