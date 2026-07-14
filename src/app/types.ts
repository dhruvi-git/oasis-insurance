export type Department = 'Sales' | 'Operations' | 'Claims' | 'Finance' | 'HR' | 'IT';

export interface OrgHierarchy {
  manager: string;
  role: string;
}

export interface LeaveBalance {
  casual: number;
  sick: number;
  paid: number;
  unpaid: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: Department;
  designation: string;
  joiningDate: string;
  baseSalary: number;
  payrollStatus: 'Paid' | 'Draft' | 'Processing';
  
  // Attendance metrics
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  overtimeHours: number;
  attendancePercentage: number;
  
  // Performance metrics
  performanceScore: number; // 0 - 100
  salesGenerated?: number; // for Sales dept
  targetAchievement?: number; // %
  customerSatisfaction?: number; // score out of 5
  managerRating?: number; // score out of 5
  feedback?: string;

  // Personal Info & Org
  orgHierarchy: OrgHierarchy;
  leaveBalance: LeaveBalance;
  
  // Salary grid modifiers
  bonus: number;
}

export interface PayrollSettings {
  baseWorkingDays: number;
  pfPercentage: number;
  ptAmount: number;
  tdsPercentage: number;
  incentiveBracket90: number; // score >= 90
  incentiveBracket80: number; // score 80-89
  incentiveBracket70: number; // score 70-79
  incentiveBracketUnder70: number; // score < 70
}

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  timestamp: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  leaveType: 'Casual' | 'Sick' | 'Paid' | 'Unpaid';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}
