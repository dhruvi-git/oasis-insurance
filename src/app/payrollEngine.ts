import { Employee, PayrollSettings } from './types';

export interface PayrollCalculationResult {
  dailyWageRate: number;
  attendanceDeduction: number;
  effectiveHalfDaysFromLate: number;
  totalHalfDays: number;
  halfDayDeduction: number;
  baseIncentive: number;
  scaledIncentive: number;
  overtimePay: number;
  pfDeduction: number;
  tdsDeduction: number;
  ptDeduction: number;
  totalDeductions: number;
  netMonthlySalary: number;
  proRataAccruedSalary: number;
}

/**
 * Deterministic Payroll Calculation Engine
 * 
 * Computes base salary structure, attendance penalties, lates penalties,
 * performance incentive scaling with Sales Division leverage multipliers,
 * statutory deductions, and pro-rata accruals.
 * 
 * @param emp Employee details
 * @param config Payroll global configuration properties
 * @param currentDayOfMonth Number representing the current operational calendar day (1 to 26)
 */
export function calculatePayroll(
  emp: Employee,
  config: PayrollSettings,
  currentDayOfMonth: number
): PayrollCalculationResult {
  const base = emp.baseSalary;
  const workingDays = config.baseWorkingDays; // Typically 26 days
  
  // 1. Daily Wage Rate
  const dailyWageRate = base / workingDays;

  // 2. Attendance absenteeism penalty
  const attendanceDeduction = emp.absentDays * dailyWageRate;

  // 3. Late punctuality penalty (3 lates = 1 half-day deduction)
  const effectiveHalfDaysFromLate = Math.floor(emp.lateDays / 3);
  const totalHalfDays = emp.halfDays + effectiveHalfDaysFromLate;
  const halfDayDeduction = totalHalfDays * (dailyWageRate / 2);

  // 4. Base Performance Incentive brackets
  let baseIncentive = 0;
  if (emp.performanceScore >= 90) {
    baseIncentive = config.incentiveBracket90;
  } else if (emp.performanceScore >= 80) {
    baseIncentive = config.incentiveBracket80;
  } else if (emp.performanceScore >= 70) {
    baseIncentive = config.incentiveBracket70;
  } else {
    baseIncentive = config.incentiveBracketUnder70;
  }

  // 5. Sales Leverage dynamic multiplier calibration
  let scaledIncentive = baseIncentive;
  if (emp.department === "Sales" && emp.targetAchievement && emp.targetAchievement > 100) {
    scaledIncentive = baseIncentive * (emp.targetAchievement / 100);
  }

  // Overtime Pay (Based on hourly wage derived from 8 hour shift * 1.5x overtime multiplier)
  const otRate = (dailyWageRate / 8) * 1.5;
  const overtimePay = emp.overtimeHours * otRate;

  // 6. Statutory Deductions
  const pfDeduction = base * (config.pfPercentage / 100);
  const tdsDeduction = base * (config.tdsPercentage / 100);
  const ptDeduction = config.ptAmount; // Fixed amount (typically ₹200)

  const totalDeductions = 
    attendanceDeduction +
    halfDayDeduction +
    pfDeduction +
    tdsDeduction +
    ptDeduction;

  // 7. Net Monthly Salary calculation
  const netMonthlySalary = Math.round(
    base +
    scaledIncentive +
    (emp.bonus || 0) +
    overtimePay -
    totalDeductions
  );

  // 8. Live Pro-Rata Accrual Formula with Ceil boundary safety at 26
  const activeTimelineFactor = Math.min(currentDayOfMonth, 26);
  const proRataAccruedSalary = Math.round((netMonthlySalary / 26) * activeTimelineFactor);

  return {
    dailyWageRate,
    attendanceDeduction,
    effectiveHalfDaysFromLate,
    totalHalfDays,
    halfDayDeduction,
    baseIncentive,
    scaledIncentive,
    overtimePay,
    pfDeduction,
    tdsDeduction,
    ptDeduction,
    totalDeductions,
    netMonthlySalary,
    proRataAccruedSalary
  };
}
