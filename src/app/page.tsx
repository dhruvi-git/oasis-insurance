"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Users,
  Calendar,
  Award,
  CreditCard,
  Settings,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Search,
  Bell,
  User,
  Download,
  UploadCloud,
  Check,
  AlertCircle,
  Trash2,
  Edit,
  Filter,
  ArrowUpDown,
  FileText,
  ChevronDown,
  CheckCircle2,
  Clock,
  Coins,
  TrendingUp,
  MapPin,
  Building2,
  Lock,
  Percent,
  Plus
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Employee, PayrollSettings, LeaveRequest, ActivityLog, Department } from "./types";
import { initialSettings, initialEmployees, initialLeaveRequests, initialActivityLogs } from "./mockData";

export default function Home() {
  // App States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@oasisinsurance.in");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: none, 1: email input, 2: sent code

  // Mock Database States
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [settings, setSettings] = useState<PayrollSettings>(initialSettings);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);

  // Shell States
  const [currentDayOfMonth, setCurrentDayOfMonth] = useState<number>(15);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState<"Dashboard" | "Employees" | "Attendance" | "Performance" | "Payroll" | "Settings">("Dashboard");
  const [currentRole, setCurrentRole] = useState<"Super Admin" | "HR" | "Dept Head" | "Employee">("Super Admin");
  const [globalSearch, setGlobalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  // Selected Employee for Details View
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipEmployeeId, setPayslipEmployeeId] = useState<string | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" | "info" }[]>([]);
  const triggerToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Biometric upload simulation
  const [isParsingUpload, setIsParsingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings modification buffer state
  const [settingsBuffer, setSettingsBuffer] = useState<PayrollSettings>({ ...initialSettings });

  // Employee Form State
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: "",
    email: "",
    department: "Sales",
    designation: "",
    baseSalary: 50000,
    presentDays: 26,
    absentDays: 0,
    lateDays: 0,
    halfDays: 0,
    overtimeHours: 0,
    performanceScore: 80,
    bonus: 0,
  });

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<string>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync settingsBuffer when global settings change
  useEffect(() => {
    setSettingsBuffer({ ...settings });
  }, [settings]);

  // Adjust routing and view locks based on active role
  const filteredEmployeesByRole = useMemo(() => {
    if (currentRole === "Dept Head") {
      // restricted to Sales (mock Dept Head is Sanjay Mehta, head of Sales)
      return employees.filter(emp => emp.department === "Sales");
    }
    if (currentRole === "Employee") {
      // restricted to Rajesh Kumar's record
      return employees.filter(emp => emp.id === "OASIS-001");
    }
    return employees;
  }, [employees, currentRole]);

  // Adjust active tab if it's locked for the selected role
  useEffect(() => {
    if (currentRole === "Employee" && currentTab !== "Dashboard" && currentTab !== "Payroll") {
      setCurrentTab("Dashboard");
    }
    if (currentRole === "Dept Head" && currentTab === "Settings") {
      setCurrentTab("Dashboard");
    }
  }, [currentRole, currentTab]);

  // Global search filtering
  const searchedEmployees = useMemo(() => {
    let result = filteredEmployeesByRole;

    if (globalSearch.trim() !== "") {
      const q = globalSearch.toLowerCase();
      result = result.filter(
        emp =>
          emp.name.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          emp.designation.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== "All") {
      result = result.filter(emp => emp.department === deptFilter);
    }

    if (statusFilter !== "All") {
      result = result.filter(emp => emp.payrollStatus === statusFilter);
    }

    // Sort
    result.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [filteredEmployeesByRole, globalSearch, deptFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchedEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [searchedEmployees, currentPage]);

  const totalPages = Math.ceil(searchedEmployees.length / itemsPerPage);

  // Dynamic Payroll Calculations
  const payrollRegister = useMemo(() => {
    return employees.map((emp) => {
      const base = emp.baseSalary;
      const days = settings.baseWorkingDays;
      const perDay = base / days;
      
      const attendanceDeduction = emp.absentDays * perDay;
      
      // 3 lates = 1 half day deduction
      const lateHalfDays = Math.floor(emp.lateDays / 3);
      const totalHalfDays = emp.halfDays + lateHalfDays;
      const halfDayDeduction = totalHalfDays * (perDay / 2);
      
      // Incentives based on performance score
      let incentive = 0;
      if (emp.performanceScore >= 90) {
        incentive = settings.incentiveBracket90;
      } else if (emp.performanceScore >= 80) {
        incentive = settings.incentiveBracket80;
      } else if (emp.performanceScore >= 70) {
        incentive = settings.incentiveBracket70;
      } else {
        incentive = settings.incentiveBracketUnder70;
      }

      // Sales Department Leverage Rules
      if (emp.department === "Sales" && emp.targetAchievement && emp.targetAchievement > 100) {
        incentive = incentive * (emp.targetAchievement / 100);
      }

      // Overtime: Base salary per hour = per day / 8 hrs * 1.5 multiplier
      const otRate = (perDay / 8) * 1.5;
      const overtimePay = emp.overtimeHours * otRate;

      // Fixed tax deductions
      const pfDeduction = base * (settings.pfPercentage / 100);
      const ptDeduction = settings.ptAmount;
      const tdsDeduction = base * (settings.tdsPercentage / 100);

      const netSalary = Math.round(
        base -
        attendanceDeduction -
        halfDayDeduction -
        pfDeduction -
        ptDeduction -
        tdsDeduction +
        incentive +
        (emp.bonus || 0) +
        overtimePay
      );

      // Live Pro-Rata Accrual Formula
      const proRataAccruedSalary = Math.round((netSalary / 26) * Math.min(currentDayOfMonth, 26));

      return {
        ...emp,
        perDay,
        attendanceDeduction,
        lateHalfDays,
        totalHalfDays,
        halfDayDeduction,
        incentive,
        overtimePay,
        pfDeduction,
        ptDeduction,
        tdsDeduction,
        netSalary,
        proRataAccruedSalary
      };
    });
  }, [employees, settings, currentDayOfMonth]);

  // Top Performance Leaders
  const leaderboardData = useMemo(() => {
    const sorted = [...employees].sort((a, b) => b.performanceScore - a.performanceScore);
    return {
      top5: sorted.slice(0, 5),
      bottom5: sorted.slice(-5).reverse()
    };
  }, [employees]);

  // Chart Data Preparation
  const chartDepartmentCosts = useMemo(() => {
    const departments: Record<Department, number> = {
      Sales: 0,
      Operations: 0,
      Claims: 0,
      Finance: 0,
      HR: 0,
      IT: 0
    };
    
    payrollRegister.forEach((emp) => {
      departments[emp.department] += emp.netSalary;
    });

    return Object.keys(departments).map((key) => ({
      name: key,
      value: departments[key as Department],
      costInLakhs: parseFloat((departments[key as Department] / 100000).toFixed(2))
    }));
  }, [payrollRegister]);

  const chartSalaryDistribution = useMemo(() => {
    let under50 = 0;
    let between50and100 = 0;
    let between100and150 = 0;
    let above150 = 0;

    payrollRegister.forEach((emp) => {
      const sal = emp.netSalary;
      if (sal < 50000) under50++;
      else if (sal <= 100000) between50and100++;
      else if (sal <= 150000) between100and150++;
      else above150++;
    });

    return [
      { name: "< ₹50k", value: under50 },
      { name: "₹50k - ₹100k", value: between50and100 },
      { name: "₹100k - ₹150k", value: between100and150 },
      { name: "> ₹150k", value: above150 }
    ].filter(d => d.value > 0);
  }, [payrollRegister]);

  const chartAttendanceStats = useMemo(() => {
    // Generate simulated monthly dates
    return [
      { name: "Jul 01", presentRate: 94.2, lateCount: 4 },
      { name: "Jul 03", presentRate: 95.8, lateCount: 2 },
      { name: "Jul 05", presentRate: 91.5, lateCount: 6 },
      { name: "Jul 07", presentRate: 98.1, lateCount: 1 },
      { name: "Jul 09", presentRate: 96.0, lateCount: 3 },
      { name: "Jul 11", presentRate: 93.4, lateCount: 5 },
      { name: "Jul 13", presentRate: 97.2, lateCount: 2 },
    ];
  }, []);

  const chartLateArrivals = useMemo(() => {
    const depts: Record<Department, number> = {
      Sales: 0,
      Operations: 0,
      Claims: 0,
      Finance: 0,
      HR: 0,
      IT: 0
    };
    employees.forEach(emp => {
      depts[emp.department] += emp.lateDays;
    });
    return Object.keys(depts).map(key => ({
      name: key,
      lates: depts[key as Department]
    }));
  }, [employees]);

  // Overall KPI cards
  const kpiData = useMemo(() => {
    const totalCount = employees.length;
    const presentToday = Math.round(totalCount * 0.92);
    const averageScore = Math.round(employees.reduce((acc, curr) => acc + curr.performanceScore, 0) / totalCount);
    const totalPayrollVal = payrollRegister.reduce((acc, curr) => acc + curr.netSalary, 0);
    const totalAccruedLiability = payrollRegister.reduce((acc, curr) => acc + curr.proRataAccruedSalary, 0);
    const lateToday = employees.filter(emp => emp.lateDays > 3).length;
    const pendingLeaves = leaveRequests.filter(lr => lr.status === "Pending").length;

    return {
      totalCount,
      presentToday,
      lateToday,
      averageScore,
      totalPayrollVal,
      totalAccruedLiability,
      pendingLeaves
    };
  }, [employees, payrollRegister, leaveRequests]);

  // Actions
  const handleRoleSwitch = (role: typeof currentRole) => {
    setCurrentRole(role);
    setRoleSwitcherOpen(false);
    triggerToast(`Switched view authorization: ${role}`, "info");

    // Clear details if selected is restricted
    if (role === "Employee") {
      setSelectedEmployeeId("OASIS-001");
    } else if (role === "Dept Head") {
      setSelectedEmployeeId(null);
    }
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsParsingUpload(true);
      const filename = e.target.files[0].name;

      setTimeout(() => {
        setIsParsingUpload(false);
        // Randomize 3 employees' late counts slightly for visual update feedback
        setEmployees(prev => {
          return prev.map(emp => {
            if (emp.id === "OASIS-001" || emp.id === "OASIS-006" || emp.id === "OASIS-009") {
              const updatedLates = emp.lateDays + 1;
              const presentDays = Math.max(20, emp.presentDays - 1);
              const absentDays = Math.min(6, emp.absentDays + 1);
              return {
                ...emp,
                lateDays: updatedLates,
                presentDays,
                absentDays,
                attendancePercentage: parseFloat(((presentDays / settings.baseWorkingDays) * 100).toFixed(1))
              };
            }
            return emp;
          });
        });

        // Add to activities
        const newLog: ActivityLog = {
          id: `ACT-${Date.now()}`,
          user: currentRole === "Super Admin" ? "Vikram Malhotra" : "Priya Patel",
          role: currentRole,
          action: `Biometric spreadsheet "${filename}" processed. Recalculated attendance deductions.`,
          timestamp: new Date().toISOString()
        };
        setActivityLogs(prev => [newLog, ...prev]);
        triggerToast("Attendance spreadsheet parsed. 22 records synced.", "success");
      }, 1500);
    }
  };

  const handleLeaveAction = (id: string, action: "Approved" | "Rejected") => {
    setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: action } : req));
    const req = leaveRequests.find(r => r.id === id);
    
    if (req && action === "Approved") {
      // update employee's leave balance & attendance deducts if needed
      setEmployees(prev => prev.map(emp => {
        if (emp.id === req.employeeId) {
          const leaveKey = req.leaveType.toLowerCase() as keyof typeof emp.leaveBalance;
          const currentBal = emp.leaveBalance[leaveKey];
          return {
            ...emp,
            leaveBalance: {
              ...emp.leaveBalance,
              [leaveKey]: Math.max(0, currentBal - req.days)
            }
          };
        }
        return emp;
      }));
    }

    // Add activity log
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      user: currentRole === "Super Admin" ? "Vikram Malhotra" : currentRole === "HR" ? "Priya Patel" : "Sanjay Mehta",
      role: currentRole,
      action: `${action} leave request for ${req?.employeeName} (${req?.days} days)`,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);

    triggerToast(`Leave request ${action.toLowerCase()} successfully`, action === "Approved" ? "success" : "info");
  };

  const handleUpdatePayrollField = (empId: string, field: "lateDays" | "absentDays" | "performanceScore" | "bonus", value: number) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        // Enforce boundaries
        let cleanedVal = value;
        if (field === "performanceScore") cleanedVal = Math.min(100, Math.max(0, value));
        if (field === "lateDays") cleanedVal = Math.max(0, value);
        if (field === "absentDays") cleanedVal = Math.min(settings.baseWorkingDays, Math.max(0, value));
        if (field === "bonus") cleanedVal = Math.max(0, value);

        return {
          ...emp,
          [field]: cleanedVal
        };
      }
      return emp;
    }));
  };

  const handleSaveSettings = () => {
    setSettings(settingsBuffer);
    const newLog: ActivityLog = {
      id: `ACT-${Date.now()}`,
      user: "Vikram Malhotra",
      role: currentRole,
      action: "Modified global payroll parameters and rules. Net salaries recomputed.",
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
    triggerToast("Global payroll configurations updated successfully", "success");
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.designation || !newEmployee.email) {
      triggerToast("Please fill in all mandatory fields", "error");
      return;
    }

    const nextIdNum = employees.length + 1;
    const paddedId = String(nextIdNum).padStart(3, "0");
    const freshEmployee: Employee = {
      id: `OASIS-${paddedId}`,
      name: newEmployee.name,
      email: newEmployee.email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + nextIdNum}?w=150`,
      department: newEmployee.department as Department,
      designation: newEmployee.designation,
      joiningDate: new Date().toISOString().split('T')[0],
      baseSalary: Number(newEmployee.baseSalary) || 45000,
      payrollStatus: "Draft",
      presentDays: settings.baseWorkingDays,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      overtimeHours: 0,
      attendancePercentage: 100,
      performanceScore: Number(newEmployee.performanceScore) || 80,
      salesGenerated: newEmployee.department === "Sales" ? 250000 : undefined,
      targetAchievement: 100,
      customerSatisfaction: 4.5,
      managerRating: 4,
      feedback: "New Joiner appraisal score.",
      orgHierarchy: { manager: "Vikram Malhotra", role: "Associate" },
      leaveBalance: { casual: 5, sick: 5, paid: 10, unpaid: 0 },
      bonus: Number(newEmployee.bonus) || 0
    };

    setEmployees(prev => [...prev, freshEmployee]);
    setIsNewEmployeeModalOpen(false);
    triggerToast(`Employee ${freshEmployee.name} added to roster`, "success");

    // reset
    setNewEmployee({
      name: "",
      email: "",
      department: "Sales",
      designation: "",
      baseSalary: 50000,
      presentDays: 26,
      absentDays: 0,
      lateDays: 0,
      halfDays: 0,
      overtimeHours: 0,
      performanceScore: 80,
      bonus: 0,
    });
  };

  const handleExportPayrollCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Employee ID,Full Name,Department,Designation,Base Salary,Present Days,Absent Days,Lates,Half Days,Incentive,Bonus,OT Hours,PF,PT,TDS,Net Salary\n";

    payrollRegister.forEach(emp => {
      csvContent += `${emp.id},${emp.name},${emp.department},${emp.designation},${emp.baseSalary},${emp.presentDays},${emp.absentDays},${emp.lateDays},${emp.halfDays},${emp.incentive},${emp.bonus},${emp.overtimeHours},${Math.round(emp.pfDeduction)},${emp.ptDeduction},${Math.round(emp.tdsDeduction)},${emp.netSalary}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OASIS_Payroll_Register_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Payroll register CSV downloaded successfully", "success");
  };

  // Mock Login Action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    triggerToast("Logged in successfully. Welcome to OASIS.", "success");
  };

  const activeEmployeeDetail = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return employees.find(emp => emp.id === selectedEmployeeId) || null;
  }, [selectedEmployeeId, employees]);

  const activePayslipDetail = useMemo(() => {
    if (!payslipEmployeeId) return null;
    return payrollRegister.find(emp => emp.id === payslipEmployeeId) || null;
  }, [payslipEmployeeId, payrollRegister]);

  // Global search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      triggerToast(`Search performed for "${globalSearch}"`, "info");
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 text-slate-900 transition-all duration-300">
      
      {/* Toast Notification HUD */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium w-80 translate-y-0 transition-transform duration-300 pointer-events-auto ${
              t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : t.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : t.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
            <p className="flex-1">{t.message}</p>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 1. LOGIN SCREEN OVERLAY (Starting State)                   */}
      {/* ========================================================= */}
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden bg-[#0A1931]">
          {/* Tech Corporate background vectors */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,166,35,0.15),rgba(255,255,255,0))]" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[#F5A623] opacity-5 blur-[120px] -top-40 -left-40" />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0B2E4F] opacity-30 blur-[150px] -bottom-60 -right-60" />

          {/* Centered Login Card */}
          <div className="w-full max-w-md p-8 glass-panel-dark text-white rounded-2xl shadow-2xl relative z-10 mx-4">
            <div className="flex flex-col items-center mb-6">
              {/* Logo container */}
              <div className="bg-white/10 p-4 rounded-xl mb-4 border border-white/20">
                <img
                  src="/logo.webp"
                  alt="OASIS Logo"
                  className="h-10 object-contain max-w-[200px]"
                  onError={(e) => {
                    // Fallback to text if file missing
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">OASIS Payroll Intelligence</h2>
              <p className="text-xs text-white/60 text-center uppercase tracking-wider mt-1">OASIS Insurance Brokers Pvt. Ltd.</p>
            </div>

            {forgotPasswordStep === 0 ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#F5A623] transition-colors"
                    placeholder="name@oasisinsurance.in"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep(1)}
                      className="text-xs text-[#F5A623] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#F5A623] transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0B2E4F] border-white/10 focus:ring-0 focus:ring-offset-0 accent-[#F5A623]"
                  />
                  <label htmlFor="remember" className="ml-2 text-xs text-white/80 cursor-pointer select-none">
                    Remember my credentials for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F5A623] hover:bg-[#F7B644] text-[#0B2E4F] font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95 text-sm"
                >
                  Sign In to Control Center
                </button>

                {/* Role Switcher Demo buttons */}
                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs text-white/40 text-center mb-3 font-semibold uppercase tracking-wider">Demo Quick Access Accounts</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("admin@oasisinsurance.in");
                        setCurrentRole("Super Admin");
                        setIsLoggedIn(true);
                        triggerToast("Logged in as Super Admin", "success");
                      }}
                      className="py-2 px-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 text-center font-medium text-white transition-all active:scale-95"
                    >
                      👑 Super Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("priya.patel@oasisinsurance.in");
                        setCurrentRole("HR");
                        setIsLoggedIn(true);
                        triggerToast("Logged in as HR Admin", "success");
                      }}
                      className="py-2 px-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 text-center font-medium text-white transition-all active:scale-95"
                    >
                      💼 HR Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("sanjay.mehta@oasisinsurance.in");
                        setCurrentRole("Dept Head");
                        setIsLoggedIn(true);
                        triggerToast("Logged in as Sales Dept Head", "success");
                      }}
                      className="py-2 px-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 text-center font-medium text-white transition-all active:scale-95"
                    >
                      👔 Dept Head (Sales)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail("rajesh.kumar@oasisinsurance.in");
                        setCurrentRole("Employee");
                        setIsLoggedIn(true);
                        triggerToast("Logged in as Employee (Rajesh)", "success");
                      }}
                      className="py-2 px-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 text-center font-medium text-white transition-all active:scale-95"
                    >
                      👤 Employee Portal
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Retrieve Access Password</h3>
                {forgotPasswordStep === 1 ? (
                  <>
                    <p className="text-xs text-white/70">Enter your registered corporate email. We will send a secure verification code to reset your account password.</p>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[#F5A623]"
                      placeholder="name@oasisinsurance.in"
                    />
                    <button
                      onClick={() => setForgotPasswordStep(2)}
                      className="w-full bg-[#F5A623] hover:bg-[#F7B644] text-[#0B2E4F] font-bold py-3 px-4 rounded-lg text-sm"
                    >
                      Send Authentication Code
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-white/70">An OTP code has been dispatched. Enter the code received on your official mobile and email to authenticate.</p>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-center tracking-widest text-white focus:outline-none focus:border-[#F5A623]"
                      placeholder="0 0 0 0 0 0"
                    />
                    <button
                      onClick={() => {
                        setForgotPasswordStep(0);
                        triggerToast("Password reset mock sequence complete. You can sign in.", "success");
                      }}
                      className="w-full bg-[#F5A623] hover:bg-[#F7B644] text-[#0B2E4F] font-bold py-3 px-4 rounded-lg text-sm"
                    >
                      Reset and Login
                    </button>
                  </>
                )}
                <button
                  onClick={() => setForgotPasswordStep(0)}
                  className="w-full text-xs text-white/50 hover:underline pt-2"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. THE MAIN PORTAL SHELL & SIDEBAR ROUTING                */
        /* ========================================================= */
        <div className="flex-1 flex overflow-hidden min-h-screen">
          
          {/* Collapsible sidebar */}
          <aside
            className={`${
              sidebarOpen ? "w-64" : "w-16"
            } bg-[#0B2E4F] text-white flex flex-col transition-all duration-300 flex-shrink-0 z-20`}
          >
            {/* Header branding */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#164875]">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-white p-1 rounded flex-shrink-0">
                  <img src="/logo.webp" alt="O" className="h-6 w-6 object-contain" />
                </div>
                {sidebarOpen && (
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="font-extrabold text-sm tracking-tight text-white">OASIS PAYROLL</span>
                    <span className="text-[9px] font-semibold text-white/50 uppercase tracking-widest leading-tight">Intelligence Hub</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-[#164875] rounded transition-colors text-white/70 hover:text-white"
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-2">
              {[
                { label: "Dashboard", icon: LayoutDashboard, roles: ["Super Admin", "HR", "Dept Head", "Employee"] },
                { label: "Employees", icon: Users, roles: ["Super Admin", "HR", "Dept Head"] },
                { label: "Attendance", icon: Calendar, roles: ["Super Admin", "HR", "Dept Head"] },
                { label: "Performance", icon: Award, roles: ["Super Admin", "HR", "Dept Head"] },
                { label: "Payroll", icon: CreditCard, roles: ["Super Admin", "HR", "Dept Head", "Employee"] },
                { label: "Settings", icon: Settings, roles: ["Super Admin", "HR"] },
              ].map((link) => {
                const isAuthorized = link.roles.includes(currentRole);
                const isActive = currentTab === link.label;

                if (!isAuthorized) return null;

                return (
                  <button
                    key={link.label}
                    onClick={() => {
                      setCurrentTab(link.label as any);
                    }}
                    className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? "bg-[#F5A623] text-[#0B2E4F] font-bold shadow-md shadow-amber-500/10"
                        : "hover:bg-[#164875] text-slate-300 hover:text-white"
                    }`}
                  >
                    <link.icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? "text-[#0B2E4F]" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    {sidebarOpen && <span className="ml-3 text-sm">{link.label}</span>}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-35">
                        {link.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* User credentials footer */}
            <div className="p-3 border-t border-[#164875] bg-[#072039]/60 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#F5A623] text-[#0B2E4F] font-bold flex items-center justify-center flex-shrink-0">
                  {currentRole === "Super Admin" ? "SA" : currentRole === "HR" ? "HR" : currentRole === "Dept Head" ? "DH" : "EM"}
                </div>
                {sidebarOpen && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-semibold truncate leading-tight text-white">
                      {currentRole === "Super Admin"
                        ? "Vikram Malhotra"
                        : currentRole === "HR"
                        ? "Priya Patel"
                        : currentRole === "Dept Head"
                        ? "Sanjay Mehta"
                        : "Rajesh Kumar"}
                    </span>
                    <span className="text-[10px] text-white/50 font-medium truncate uppercase">{currentRole}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setIsLoggedIn(false);
                  triggerToast("Session terminated", "info");
                }}
                className="p-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* Content container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* ========================================================= */}
            {/* GLOBAL HEADER                                            */}
            {/* ========================================================= */}
            <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 z-10 shadow-sm">
              
              {/* Left search */}
              <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-[#0B2E4F] transition-all bg-slate-50 focus:bg-white"
                    placeholder={`Global search directory (ID, name, role)...`}
                  />
                  {globalSearch && (
                    <button
                      onClick={() => setGlobalSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Pro-Rata Accumulator Timeline Controller */}
              <div className="hidden md:flex items-center gap-4 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-1.5 mx-4 flex-1 max-w-sm lg:max-w-md">
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Accrual Timeline</span>
                  <span className="text-xs font-bold text-[#0B2E4F]">Day {currentDayOfMonth} of 26</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="26"
                  value={currentDayOfMonth}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentDayOfMonth(val);
                  }}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F5A623]"
                />
                <div className="flex flex-col text-right flex-shrink-0 border-l border-slate-200 pl-4">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Accrued Liability</span>
                  <span className="text-xs font-extrabold text-amber-600">₹{kpiData.totalAccruedLiability.toLocaleString()}</span>
                </div>
              </div>

              {/* Right tools */}
              <div className="flex items-center gap-4">
                
                {/* Role Switcher Demo Widget */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setRoleSwitcherOpen(!roleSwitcherOpen);
                      setNotificationsOpen(false);
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#0B2E4F]/5 text-[#0B2E4F] hover:bg-[#0B2E4F]/10 border border-[#0B2E4F]/10 rounded-xl text-xs font-semibold transition-all select-none"
                  >
                    <span>Role: <strong className="text-[#F5A623]">{currentRole}</strong></span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {roleSwitcherOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-30">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Select View Privilege</p>
                      {[
                        { name: "Super Admin", desc: "Unrestricted controls" },
                        { name: "HR", desc: "Manage lists & uploads" },
                        { name: "Dept Head", desc: "Calibrate performance (Sales)" },
                        { name: "Employee", desc: "Personal portal portal" }
                      ].map((role) => (
                        <button
                          key={role.name}
                          onClick={() => handleRoleSwitch(role.name as any)}
                          className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex flex-col ${
                            currentRole === role.name ? "bg-[#0B2E4F]/5 font-semibold text-[#0B2E4F]" : "text-slate-700"
                          }`}
                        >
                          <span className="text-xs">{role.name}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{role.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notifications Alert Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setRoleSwitcherOpen(false);
                      setProfileOpen(false);
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all relative border border-slate-200/50"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    <span className="absolute -top-1 -right-1 bg-[#F5A623] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {leaveRequests.filter(r => r.status === "Pending").length}
                    </span>
                  </button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-30">
                      <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                        <span className="font-semibold text-xs text-slate-700">System Notification Centre</span>
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">Action Required</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {leaveRequests.filter(r => r.status === "Pending").map(req => (
                          <div key={req.id} className="px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                            <p className="text-xs font-semibold text-slate-800">{req.employeeName} requested leave</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{req.days} days ({req.leaveType}) • {req.startDate} to {req.endDate}</p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => {
                                  handleLeaveAction(req.id, "Approved");
                                  setNotificationsOpen(false);
                                }}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  handleLeaveAction(req.id, "Rejected");
                                  setNotificationsOpen(false);
                                }}
                                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold"
                              >
                                Deny
                              </button>
                            </div>
                          </div>
                        ))}
                        {leaveRequests.filter(r => r.status === "Pending").length === 0 && (
                          <div className="px-4 py-6 text-center text-xs text-slate-400">
                            No pending action alerts right now.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Widget */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setNotificationsOpen(false);
                      setRoleSwitcherOpen(false);
                    }}
                    className="flex items-center gap-2 select-none border border-slate-200/50 rounded-xl p-1 bg-slate-50 hover:bg-slate-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0B2E4F] text-[#F5A623] font-bold flex items-center justify-center text-xs">
                      {currentRole === "Super Admin" ? "VM" : currentRole === "HR" ? "PP" : currentRole === "Dept Head" ? "SM" : "RK"}
                    </div>
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-30">
                      <div className="px-4 py-2.5 border-b border-slate-50">
                        <p className="text-xs font-bold text-slate-800">
                          {currentRole === "Super Admin" ? "Vikram Malhotra" : currentRole === "HR" ? "Priya Patel" : currentRole === "Dept Head" ? "Sanjay Mehta" : "Rajesh Kumar"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {currentRole === "Super Admin" ? "vikram.malhotra@oasisinsurance.in" : currentRole === "HR" ? "priya.patel@oasisinsurance.in" : currentRole === "Dept Head" ? "sanjay.mehta@oasisinsurance.in" : "rajesh.kumar@oasisinsurance.in"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          if (currentRole === "Employee") {
                            setSelectedEmployeeId("OASIS-001");
                          } else {
                            setSelectedEmployeeId(null);
                            triggerToast("Redirecting to Employee Directory", "info");
                          }
                          setCurrentTab("Employees");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors text-xs text-slate-700 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" />
                        My Profile Card
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setIsLoggedIn(false);
                          triggerToast("Logged out successfully", "info");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors text-xs text-rose-600 flex items-center gap-2 border-t border-slate-50 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </header>

            {/* ========================================================= */}
            {/* VIEWPORT CONTROLLER                                       */}
            {/* ========================================================= */}
            <main className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* If search query has filters, show notification banner */}
              {globalSearch && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs text-blue-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Filtering list by query: &ldquo;{globalSearch}&rdquo;. Showing {searchedEmployees.length} matching entries.</span>
                  </div>
                  <button onClick={() => setGlobalSearch("")} className="font-semibold underline">Reset</button>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 1: EXECUTIVE DASHBOARD                                */}
              {/* ========================================================= */}
              {currentTab === "Dashboard" && (
                <div className="space-y-6">
                  {/* Hero Intro */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0B2E4F] p-6 rounded-2xl text-white relative overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(245,166,35,0.15),transparent)]" />
                    <div className="relative z-10">
                      <h1 className="text-2xl font-bold tracking-tight">OASIS Insurance Payroll Dashboard</h1>
                      <p className="text-xs text-white/70 mt-1">Real-time attendance parsing, incentive routing, and compensation intelligence analytics.</p>
                    </div>
                    <div className="relative z-10 flex gap-2">
                      <span className="px-3 py-1.5 bg-white/10 rounded-xl border border-white/20 text-xs font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Sync: Live Biometrics
                      </span>
                    </div>
                  </div>

                  {/* KPI Blocks */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { title: "Total Roster", value: kpiData.totalCount, icon: Users, color: "text-[#0B2E4F] bg-blue-50" },
                      { title: "Present Today", value: `${kpiData.presentToday}/${kpiData.totalCount}`, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                      { title: "Late Check-ins", value: kpiData.lateToday, icon: Clock, color: "text-amber-600 bg-amber-50" },
                      { title: "Performance Avg", value: `${kpiData.averageScore}%`, icon: Award, color: "text-[#F5A623] bg-orange-50" },
                      { title: "Monthly Payroll", value: `₹${(kpiData.totalPayrollVal / 100000).toFixed(1)}L`, icon: Coins, color: "text-indigo-600 bg-indigo-50" },
                      { title: "Pending Leaves", value: kpiData.pendingLeaves, icon: AlertCircle, color: "text-rose-600 bg-rose-50" },
                    ].map((kpi, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                          <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                            <kpi.icon className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <span className="text-xl font-bold tracking-tight text-slate-800">{kpi.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dashboard Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Attendance Trend Chart */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col h-80">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Check-in Punctuality Trend</h3>
                          <p className="text-[10px] text-slate-400">Weekly average checkout completion percentages vs late check-ins</p>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Attendance</span>
                      </div>
                      <div className="flex-1 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartAttendanceStats} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0B2E4F" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#0B2E4F" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Area type="monotone" dataKey="presentRate" stroke="#0B2E4F" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" name="Present Rate (%)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Department Cost Bar Chart */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col h-80">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Compensation Expense by Division</h3>
                          <p className="text-[10px] text-slate-400">Net salary outlays compared in Lakhs (₹)</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Finance</span>
                      </div>
                      <div className="flex-1 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartDepartmentCosts} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip />
                            <Bar dataKey="costInLakhs" fill="#F5A623" radius={[4, 4, 0, 0]} name="Payout (Lakhs ₹)">
                              {chartDepartmentCosts.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#0B2E4F" : "#F5A623"} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie Chart Salary Distribution */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col h-80">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Compensation Bracket Allocation</h3>
                          <p className="text-[10px] text-slate-400">Employee count divided by net monthly pay grades</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Analysis</span>
                      </div>
                      <div className="flex-1 w-full text-xs flex flex-col md:flex-row items-center justify-center">
                        <div className="w-full md:w-1/2 h-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartSalaryDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {chartSalaryDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={["#0B2E4F", "#164875", "#F5A623", "#F7B644"][index % 4]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 flex flex-col gap-2 justify-center pl-4 border-t md:border-t-0 md:border-l border-slate-100 py-4">
                          {chartSalaryDistribution.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between text-xs text-slate-600">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#0B2E4F", "#164875", "#F5A623", "#F7B644"][index % 4] }} />
                                <span>{entry.name}</span>
                              </div>
                              <span className="font-bold">{entry.value} employee{entry.value > 1 ? "s" : ""}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Late Arrivals Analytics Heatmap/Bar chart */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col h-80">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">Late Arrivals Count by Department</h3>
                          <p className="text-[10px] text-slate-400">Aggregated late-in marks registered by biometric terminal</p>
                        </div>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Risk Factor</span>
                      </div>
                      <div className="flex-1 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={chartLateArrivals} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" stroke="#94a3b8" />
                            <YAxis type="category" dataKey="name" stroke="#94a3b8" />
                            <Tooltip />
                            <Bar dataKey="lates" fill="#e11d48" radius={[0, 4, 4, 0]} name="Late Marks Registered" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Recent Activity Logs */}
                  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Platform Activity Audit Log</h3>
                        <p className="text-[10px] text-slate-400">Verifiable logging of organizational overrides and spreadsheet synchronizations</p>
                      </div>
                      <button
                        onClick={() => triggerToast("Activity history synced", "info")}
                        className="text-xs text-[#0B2E4F] font-semibold hover:underline"
                      >
                        Reload Stream
                      </button>
                    </div>
                    <div className="space-y-4">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex gap-4 items-start text-xs border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 font-semibold flex-shrink-0">
                            {log.role}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{log.action}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Approved by: <strong className="text-slate-600">{log.user}</strong> • {new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: EMPLOYEES DIRECTORY                                */}
              {/* ========================================================= */}
              {currentTab === "Employees" && (
                <div className="space-y-6">
                  
                  {/* Actions row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-slate-800">Employee Directory</h2>
                      <span className="text-[10px] text-[#0B2E4F] bg-[#0B2E4F]/5 border border-[#0B2E4F]/10 px-2.5 py-0.5 rounded-full font-bold">
                        {searchedEmployees.length} Total Records
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Department Filter */}
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                        <select
                          value={deptFilter}
                          onChange={(e) => {
                            setDeptFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="All">All Departments</option>
                          <option value="Sales">Sales</option>
                          <option value="Operations">Operations</option>
                          <option value="Claims">Claims</option>
                          <option value="Finance">Finance</option>
                          <option value="HR">HR</option>
                          <option value="IT">IT</option>
                        </select>
                      </div>

                      {/* Add Employee button */}
                      {(currentRole === "Super Admin" || currentRole === "HR") && (
                        <button
                          onClick={() => setIsNewEmployeeModalOpen(true)}
                          className="px-4 py-2 bg-[#F5A623] hover:bg-[#F7B644] text-[#0B2E4F] font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          Add Employee
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Employees Table Grid */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-3">Employee Card</th>
                            <th className="px-6 py-3 cursor-pointer select-none" onClick={() => {
                              setSortField("id");
                              setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                            }}>
                              <div className="flex items-center gap-1">
                                Employee ID <ArrowUpDown className="w-3 h-3 text-slate-400" />
                              </div>
                            </th>
                            <th className="px-6 py-3">Department</th>
                            <th className="px-6 py-3">Designation</th>
                            <th className="px-6 py-3 cursor-pointer select-none" onClick={() => {
                              setSortField("baseSalary");
                              setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                            }}>
                              <div className="flex items-center gap-1">
                                Base Salary <ArrowUpDown className="w-3 h-3 text-slate-400" />
                              </div>
                            </th>
                            <th className="px-6 py-3">Joined Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {paginatedEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                  <div>
                                    <p className="font-bold text-slate-800">{emp.name}</p>
                                    <p className="text-[10px] text-slate-400">{emp.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-slate-600">{emp.id}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold text-[10px]">
                                  {emp.department}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-medium">{emp.designation}</td>
                              <td className="px-6 py-4 font-bold text-slate-700">₹{emp.baseSalary.toLocaleString()}</td>
                              <td className="px-6 py-4 text-slate-500 font-medium">{emp.joiningDate}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase ${
                                  emp.payrollStatus === "Paid"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : emp.payrollStatus === "Processing"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}>
                                  {emp.payrollStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedEmployeeId(emp.id);
                                    triggerToast(`Opened Profile: ${emp.name}`, "info");
                                  }}
                                  className="text-xs text-[#0B2E4F] font-bold hover:text-[#164875] hover:underline"
                                >
                                  View Profile
                                </button>
                              </td>
                            </tr>
                          ))}

                          {paginatedEmployees.length === 0 && (
                            <tr>
                              <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                No employee profiles found matching current search/filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination control */}
                    {totalPages > 1 && (
                      <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Showing {Math.min(searchedEmployees.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(searchedEmployees.length, currentPage * itemsPerPage)} of {searchedEmployees.length} entries</span>
                        <div className="flex gap-1">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white rounded-lg"
                          >
                            Prev
                          </button>
                          {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentPage(idx + 1)}
                              className={`px-3 py-1.5 border rounded-lg ${
                                currentPage === idx + 1
                                  ? "bg-[#0B2E4F] text-white border-[#0B2E4F]"
                                  : "border-slate-200 bg-white hover:bg-slate-100"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white rounded-lg"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: ATTENDANCE & BIOMETRIC SYNC                        */}
              {/* ========================================================= */}
              {currentTab === "Attendance" && (
                <div className="space-y-6">
                  
                  {/* Upload Drop Zone Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Drag-n-drop Upload container */}
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-64 lg:col-span-1">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Biometric Attendance Terminal Sync</h3>
                        <p className="text-[10px] text-slate-400 mt-1">Upload daily/monthly biometric system punch logs (.xlsx, .csv)</p>
                      </div>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#0B2E4F]/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all flex-1 my-4"
                      >
                        {isParsingUpload ? (
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                            <p className="text-[10px] text-amber-600 font-bold">Parsing punch logs & mapping deductions...</p>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-8 h-8 text-[#0B2E4F] mb-1" />
                            <p className="text-xs font-bold text-slate-700">Drag or click to choose Excel sheets</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Accepts check-in/checkout schemas</p>
                          </>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleExcelUpload}
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                        />
                      </div>

                      <div className="text-[9px] text-slate-400 font-medium">
                        Note: Syncing auto-updates lates, absent counts, and computes compensation adjustments.
                      </div>
                    </div>

                    {/* Quick Stats blocks */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Present Average</span>
                          <h4 className="text-3xl font-extrabold text-slate-800 mt-2">93.4%</h4>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-4">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +1.2% over previous month average
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Overtime Hours</span>
                          <h4 className="text-3xl font-extrabold text-indigo-600 mt-2">115 hrs</h4>
                        </div>
                        <p className="text-[10px] text-indigo-500 font-semibold mt-4">
                          Estimated OT payroll liability: ₹84,200
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Average Late Arrival minutes</span>
                          <h4 className="text-3xl font-extrabold text-amber-500 mt-2">18.5 min</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4">
                          Tolerated buffer: 10 minutes from shift start
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Shifts Configured</span>
                          <h4 className="text-3xl font-extrabold text-[#0B2E4F] mt-2">2 Shifts</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-4">
                          General Shift (9:00 AM) & Night Shift (9:00 PM)
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Attendance Log Table */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <span className="font-bold text-xs text-slate-700">Detailed Monthly Attendance Ledger</span>
                      <span className="text-[10px] text-slate-400">Current calendar cycle: 26 working days</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 bg-slate-50 uppercase">
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3 text-center">Base Days</th>
                            <th className="px-6 py-3 text-center text-emerald-600">Present</th>
                            <th className="px-6 py-3 text-center text-rose-500">Absents</th>
                            <th className="px-6 py-3 text-center text-amber-500">Late Marks</th>
                            <th className="px-6 py-3 text-center text-indigo-500">Half Days</th>
                            <th className="px-6 py-3 text-center">Overtime hours</th>
                            <th className="px-6 py-3 text-center">Attendance %</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                          {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <img src={emp.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                  <div>
                                    <span className="font-bold text-slate-800">{emp.name}</span>
                                    <span className="text-[10px] text-slate-400 block">{emp.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-center font-bold text-slate-500">{settings.baseWorkingDays}</td>
                              <td className="px-6 py-3 text-center font-bold text-emerald-600">{emp.presentDays}</td>
                              <td className="px-6 py-3 text-center font-bold text-rose-500">{emp.absentDays}</td>
                              <td className="px-6 py-3 text-center font-bold text-amber-600">{emp.lateDays}</td>
                              <td className="px-6 py-3 text-center font-bold text-indigo-500">{emp.halfDays}</td>
                              <td className="px-6 py-3 text-center font-medium">{emp.overtimeHours} hrs</td>
                              <td className="px-6 py-3 text-center font-bold">{emp.attendancePercentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Leave Management Approval Block */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-700">Leave Approvals Control Console</span>
                      <span className="text-[10px] text-slate-400 font-medium">Managers can approve or deny requests</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                            <th className="px-6 py-3">Employee Name</th>
                            <th className="px-6 py-3">Leave Type</th>
                            <th className="px-6 py-3">Duration</th>
                            <th className="px-6 py-3">Date Range</th>
                            <th className="px-6 py-3">Reason for Leave</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-center">Action Overrides</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {leaveRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-3 font-semibold text-slate-800">{req.employeeName}</td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                  req.leaveType === "Sick" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  req.leaveType === "Casual" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                  "bg-indigo-50 text-indigo-700 border-indigo-200"
                                }`}>
                                  {req.leaveType}
                                </span>
                              </td>
                              <td className="px-6 py-3 font-bold text-slate-600">{req.days} days</td>
                              <td className="px-6 py-3 font-medium text-slate-500">{req.startDate} to {req.endDate}</td>
                              <td className="px-6 py-3 text-slate-500 font-medium">{req.reason}</td>
                              <td className="px-6 py-3">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  req.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                                  req.status === "Rejected" ? "bg-rose-100 text-rose-800" :
                                  "bg-amber-100 text-amber-800"
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-center">
                                {req.status === "Pending" ? (
                                  <div className="flex justify-center gap-1.5">
                                    <button
                                      onClick={() => handleLeaveAction(req.id, "Approved")}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleLeaveAction(req.id, "Rejected")}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-semibold">Processed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: PERFORMANCE & LEADERBOARDS                         */}
              {/* ========================================================= */}
              {currentTab === "Performance" && (
                <div className="space-y-6">
                  
                  {/* Top Rankers / Bottom Calibration grids */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Top Performers (Top 5) */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                        <div>
                          <h3 className="text-sm font-bold text-emerald-800">Top 5 Performers (Calibrated Incentives)</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Top performing roster eligible for high brackets</p>
                        </div>
                        <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                          <TrendingUp className="w-4 h-4" />
                        </span>
                      </div>

                      <div className="space-y-3 flex-1">
                        {leaderboardData.top5.map((emp, index) => (
                          <div key={emp.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-xs text-slate-400 w-5">#{index + 1}</span>
                              <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                              <div>
                                <span className="font-bold text-xs text-slate-800 block">{emp.name}</span>
                                <span className="text-[10px] text-slate-400">{emp.department} • {emp.designation}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-600">{emp.performanceScore}%</span>
                              <span className="text-[9px] text-slate-400 block">Score</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Performers (Bottom 5 for review) */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                        <div>
                          <h3 className="text-sm font-bold text-rose-800">Bottom 5 Performers (Appraisal Calibration)</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Roster requiring performance training or target calibration</p>
                        </div>
                        <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                        </span>
                      </div>

                      <div className="space-y-3 flex-1">
                        {leaderboardData.bottom5.map((emp, index) => (
                          <div key={emp.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-xs text-slate-400 w-5">#{index + 1}</span>
                              <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                              <div>
                                <span className="font-bold text-xs text-slate-800 block">{emp.name}</span>
                                <span className="text-[10px] text-slate-400">{emp.department} • {emp.designation}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-rose-600">{emp.performanceScore}%</span>
                              <span className="text-[9px] text-slate-400 block">Score</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Calibrator directory table */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <span className="font-bold text-xs text-slate-700">Appraisal & Incentive Metrics Matrix</span>
                      <span className="text-[10px] text-slate-400">Score brackets determine dynamic bonus routing</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase bg-slate-50">
                            <th className="px-6 py-3">Employee Name</th>
                            <th className="px-6 py-3 text-center">Score (0-100)</th>
                            <th className="px-6 py-3 text-center">Sales Outlay</th>
                            <th className="px-6 py-3 text-center">Target Completion</th>
                            <th className="px-6 py-3 text-center">CSAT</th>
                            <th className="px-6 py-3 text-center">Manager Rating</th>
                            <th className="px-6 py-3">Incentive Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {employees.map(emp => (
                            <tr key={emp.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                  <img src={emp.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                                  <div>
                                    <span className="font-bold text-slate-800">{emp.name}</span>
                                    <span className="text-[10px] text-slate-400 block">{emp.id} ({emp.department})</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className={`h-full ${
                                      emp.performanceScore >= 90 ? "bg-emerald-500" :
                                      emp.performanceScore >= 80 ? "bg-blue-500" :
                                      emp.performanceScore >= 70 ? "bg-amber-500" :
                                      "bg-rose-500"
                                    }`} style={{ width: `${emp.performanceScore}%` }} />
                                  </div>
                                  <span className="font-bold">{emp.performanceScore}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-center font-bold text-slate-600">{emp.salesGenerated ? `₹${emp.salesGenerated.toLocaleString()}` : "—"}</td>
                              <td className="px-6 py-3 text-center font-bold text-slate-600">{emp.targetAchievement ? `${emp.targetAchievement}%` : "—"}</td>
                              <td className="px-6 py-3 text-center text-slate-600 font-semibold">{emp.customerSatisfaction ? `⭐ ${emp.customerSatisfaction}` : "—"}</td>
                              <td className="px-6 py-3 text-center text-slate-600 font-semibold">{emp.managerRating ? `⭐ ${emp.managerRating}` : "—"}</td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  emp.performanceScore >= 90 ? "bg-emerald-50 text-emerald-700" :
                                  emp.performanceScore >= 80 ? "bg-blue-50 text-blue-700" :
                                  emp.performanceScore >= 70 ? "bg-amber-50 text-amber-700" :
                                  "bg-rose-50 text-rose-700"
                                }`}>
                                  ₹{emp.performanceScore >= 90 ? settings.incentiveBracket90.toLocaleString() :
                                    emp.performanceScore >= 80 ? settings.incentiveBracket80.toLocaleString() :
                                    emp.performanceScore >= 70 ? settings.incentiveBracket70.toLocaleString() :
                                    settings.incentiveBracketUnder70.toLocaleString()} Eligibility
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: CENTRAL PAYROLL ENGINE MATRIX                      */}
              {/* ========================================================= */}
              {currentTab === "Payroll" && (
                <div className="space-y-6">
                  
                  {/* Actions summary banner */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">Payroll Register Matrix</h2>
                      <p className="text-[10px] text-slate-400 mt-0.5">Editable matrix. Adjust lates, performance scores, or bonuses to recalculate net pay dynamically.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportPayrollCSV}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Export Register (CSV)
                      </button>
                    </div>
                  </div>

                  {/* Calculations register */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <th className="px-4 py-3">Employee</th>
                            <th className="px-4 py-3 text-right">Base Pay</th>
                            <th className="px-4 py-3 text-center">Absent Deduct</th>
                            <th className="px-4 py-3 text-center">Lates (Deduct)</th>
                            <th className="px-4 py-3 text-center">Score (Incentive)</th>
                            <th className="px-4 py-3 text-center">Bonus (₹)</th>
                            <th className="px-4 py-3 text-right">PF (-12%)</th>
                            <th className="px-4 py-3 text-right">TDS (-10%)</th>
                            <th className="px-4 py-3 text-right text-indigo-700 bg-indigo-50/50">Net Salary</th>
                            <th className="px-4 py-3 text-right text-amber-700 bg-amber-50">Accrued Earned (Day {currentDayOfMonth})</th>
                            <th className="px-4 py-3 text-center">Payslip</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {payrollRegister.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50/50">
                              
                              {/* Identity */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                                  <div>
                                    <span className="font-bold text-slate-800 block">{emp.name}</span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[9px] text-slate-400 block">{emp.id} • {emp.department}</span>
                                      {emp.department === "Sales" && (
                                        <>
                                          <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[8px] font-extrabold rounded">
                                            Tgt: {emp.targetAchievement}%
                                          </span>
                                          <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[8px] font-extrabold rounded">
                                            Pol: {emp.policiesSold}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Base */}
                              <td className="px-4 py-3 text-right font-bold text-slate-700">₹{emp.baseSalary.toLocaleString()}</td>

                              {/* Absents */}
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={settings.baseWorkingDays}
                                    value={emp.absentDays}
                                    onChange={(e) => handleUpdatePayrollField(emp.id, "absentDays", Number(e.target.value))}
                                    className="w-10 border border-slate-200 rounded px-1 text-center font-bold focus:outline-none focus:border-[#0B2E4F]"
                                  />
                                  <span className="text-[9px] text-slate-400 block">(-₹{Math.round(emp.attendanceDeduction).toLocaleString()})</span>
                                </div>
                              </td>

                              {/* Lates (every 3 = 1 half day) */}
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={emp.lateDays}
                                    onChange={(e) => handleUpdatePayrollField(emp.id, "lateDays", Number(e.target.value))}
                                    className="w-10 border border-slate-200 rounded px-1 text-center font-bold focus:outline-none focus:border-[#0B2E4F]"
                                  />
                                  <span className="text-[9px] text-slate-400 block">(-₹{Math.round(emp.halfDayDeduction).toLocaleString()})</span>
                                </div>
                              </td>

                              {/* Score & Incentives */}
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={emp.performanceScore}
                                    onChange={(e) => handleUpdatePayrollField(emp.id, "performanceScore", Number(e.target.value))}
                                    className="w-12 border border-slate-200 rounded px-1 text-center font-bold focus:outline-none focus:border-[#0B2E4F]"
                                  />
                                  <span className="text-[9px] text-emerald-600 block">(+₹{emp.incentive.toLocaleString()})</span>
                                </div>
                              </td>

                              {/* Bonus override */}
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  value={emp.bonus}
                                  onChange={(e) => handleUpdatePayrollField(emp.id, "bonus", Number(e.target.value))}
                                  className="w-16 border border-slate-200 rounded px-1.5 py-0.5 text-center font-bold text-slate-700 focus:outline-none focus:border-[#0B2E4F]"
                                />
                              </td>

                              {/* PF Deduction */}
                              <td className="px-4 py-3 text-right text-rose-500 font-semibold">-₹{Math.round(emp.pfDeduction).toLocaleString()}</td>

                              {/* TDS Deduction */}
                              <td className="px-4 py-3 text-right text-rose-500 font-semibold">-₹{Math.round(emp.tdsDeduction).toLocaleString()}</td>

                              {/* Net Salary calculated */}
                              <td className="px-4 py-3 text-right font-extrabold text-indigo-800 bg-indigo-50/20">₹{emp.netSalary.toLocaleString()}</td>

                              {/* Accrued Earned (Day X) */}
                              <td className="px-4 py-3 text-right font-extrabold text-amber-850 bg-amber-50 border-l border-amber-100">₹{emp.proRataAccruedSalary.toLocaleString()}</td>

                              {/* Payslip utility */}
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => {
                                    setPayslipEmployeeId(emp.id);
                                    setIsPayslipModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-[#0B2E4F] hover:bg-[#164875] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  Payslip
                                </button>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 6: ADMINISTRATIVE GLOBAL SETTINGS                     */}
              {/* ========================================================= */}
              {currentTab === "Settings" && (
                <div className="space-y-6">
                  
                  {/* Settings blocks */}
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-3xl">
                    <div className="pb-4 border-b border-slate-100 mb-6">
                      <h2 className="text-base font-bold text-slate-800">Global Payroll Formula Configurations</h2>
                      <p className="text-[10px] text-slate-400 mt-1">Updates apply globally across all salaries and dynamic calculations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">Base Monthly Working Days</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            value={settingsBuffer.baseWorkingDays}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, baseWorkingDays: Number(e.target.value) }))}
                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-xs"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">Days</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">Provident Fund (PF) Contribution</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            value={settingsBuffer.pfPercentage}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, pfPercentage: Number(e.target.value) }))}
                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-xs"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">Professional Tax (PT) Deductions</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            value={settingsBuffer.ptAmount}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, ptAmount: Number(e.target.value) }))}
                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-xs"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">₹ Fixed</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">Tax Deducted at Source (TDS) rate</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={settingsBuffer.tdsPercentage}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, tdsPercentage: Number(e.target.value) }))}
                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-xs"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">% of Base</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Performance Incentives Brackets Rules</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Score &ge; 90</label>
                          <input
                            type="number"
                            value={settingsBuffer.incentiveBracket90}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, incentiveBracket90: Number(e.target.value) }))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-emerald-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Score 80 to 89</label>
                          <input
                            type="number"
                            value={settingsBuffer.incentiveBracket80}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, incentiveBracket80: Number(e.target.value) }))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-blue-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Score 70 to 79</label>
                          <input
                            type="number"
                            value={settingsBuffer.incentiveBracket70}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, incentiveBracket70: Number(e.target.value) }))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-amber-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Score &lt; 70</label>
                          <input
                            type="number"
                            value={settingsBuffer.incentiveBracketUnder70}
                            onChange={(e) => setSettingsBuffer(prev => ({ ...prev, incentiveBracketUnder70: Number(e.target.value) }))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-rose-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSettingsBuffer({ ...settings });
                          triggerToast("Reverted pending adjustments", "info");
                        }}
                        className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        className="px-5 py-2 bg-[#0B2E4F] hover:bg-[#164875] text-white font-bold rounded-xl text-xs"
                      >
                        Apply Global Override
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </main>

          </div>

          {/* ========================================================= */}
          {/* 3. MODAL: EMPLOYEE SLIDE-OVER DETAIL DRAWER               */}
          {/* ========================================================= */}
          {activeEmployeeDetail && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex justify-end">
              <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 overflow-y-auto">
                
                {/* Header detail */}
                <div className="bg-[#0B2E4F] text-white p-6 relative">
                  <button
                    onClick={() => setSelectedEmployeeId(null)}
                    className="absolute top-4 right-4 text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex gap-4 items-center">
                    <img src={activeEmployeeDetail.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#F5A623]" />
                    <div>
                      <h2 className="text-xl font-bold">{activeEmployeeDetail.name}</h2>
                      <p className="text-xs text-white/70 mt-0.5">{activeEmployeeDetail.designation} • {activeEmployeeDetail.department} Division</p>
                      <p className="text-[10px] text-white/50 mt-1 font-mono">{activeEmployeeDetail.id}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6 flex-1 text-slate-700">
                  
                  {/* Grid details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Salary</span>
                      <span className="font-bold text-sm">₹{activeEmployeeDetail.baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Joining Date</span>
                      <span className="font-semibold text-xs">{activeEmployeeDetail.joiningDate}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Attendance Rate</span>
                      <span className="font-bold text-xs text-emerald-600">{activeEmployeeDetail.attendancePercentage}%</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Supervisor</span>
                      <span className="font-semibold text-xs truncate block">{activeEmployeeDetail.orgHierarchy.manager}</span>
                    </div>
                  </div>

                  {/* Pro-Rata Accrual Comparer for activeEmployeeDetail */}
                  {(() => {
                    const registerRecord = payrollRegister.find(r => r.id === activeEmployeeDetail.id);
                    if (!registerRecord) return null;
                    return (
                      <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-4 shadow-sm flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-amber-800 uppercase block tracking-wider text-[9px]">Accrued Income (Day {currentDayOfMonth})</span>
                          <span className="text-[9px] text-slate-500 font-medium">Includes pro-rata shares & performance calibrations</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-amber-900 text-sm block">₹{registerRecord.proRataAccruedSalary.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 block font-bold">Full Month: ₹{registerRecord.netSalary.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Leave balance list */}
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase text-slate-500 mb-3 tracking-wider">Leave Balances</h3>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                        <span className="font-extrabold text-blue-700 text-lg block">{activeEmployeeDetail.leaveBalance.casual}</span>
                        <span className="text-[9px] text-blue-500 font-bold">Casual</span>
                      </div>
                      <div className="bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                        <span className="font-extrabold text-amber-700 text-lg block">{activeEmployeeDetail.leaveBalance.sick}</span>
                        <span className="text-[9px] text-amber-500 font-bold">Sick</span>
                      </div>
                      <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50">
                        <span className="font-extrabold text-emerald-700 text-lg block">{activeEmployeeDetail.leaveBalance.paid}</span>
                        <span className="text-[9px] text-emerald-500 font-bold">Paid</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-extrabold text-slate-700 text-lg block">{activeEmployeeDetail.leaveBalance.unpaid}</span>
                        <span className="text-[9px] text-slate-500 font-bold">Unpaid</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Attendance Calendar */}
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase text-slate-500 mb-3 tracking-wider">Attendance Calendar Preview</h3>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: settings.baseWorkingDays }).map((_, idx) => {
                        // Color coding based on indices
                        let bg = "bg-emerald-500 text-white";
                        let tooltip = "Present";
                        
                        if (idx < activeEmployeeDetail.absentDays) {
                          bg = "bg-rose-500 text-white";
                          tooltip = "Absent";
                        } else if (idx < activeEmployeeDetail.absentDays + activeEmployeeDetail.lateDays) {
                          bg = "bg-amber-500 text-white";
                          tooltip = "Late check-in";
                        } else if (idx < activeEmployeeDetail.absentDays + activeEmployeeDetail.lateDays + activeEmployeeDetail.halfDays) {
                          bg = "bg-indigo-500 text-white";
                          tooltip = "Half day";
                        }

                        return (
                          <div
                            key={idx}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-extrabold cursor-pointer hover:opacity-80 transition-all ${bg}`}
                            title={`Day ${idx + 1}: ${tooltip}`}
                          >
                            {idx + 1}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 mt-4 text-[10px] font-bold justify-center">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded" /> Present</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-500 rounded" /> Absent</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded" /> Late Arrival</div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-500 rounded" /> Half-Day</div>
                    </div>
                  </div>

                  {/* Performance Radar Map */}
                  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase text-slate-500 mb-3 tracking-wider">Performance Analytics Mapping</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                          { subject: "Target", A: activeEmployeeDetail.targetAchievement || 85, fullMark: 120 },
                          { subject: "CSAT", A: (activeEmployeeDetail.customerSatisfaction || 4) * 20, fullMark: 100 },
                          { subject: "Overall Rating", A: (activeEmployeeDetail.managerRating || 4) * 20, fullMark: 100 },
                          { subject: "Attendance", A: activeEmployeeDetail.attendancePercentage, fullMark: 100 },
                          { subject: "Compliance", A: activeEmployeeDetail.performanceScore, fullMark: 100 }
                        ]}>
                          <PolarGrid stroke="#cbd5e1" />
                          <PolarAngleAxis dataKey="subject" stroke="#64748b" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                          <Radar name={activeEmployeeDetail.name} dataKey="A" stroke="#0B2E4F" fill="#0B2E4F" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    {activeEmployeeDetail.feedback && (
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs mt-2 italic text-slate-600">
                        &ldquo;{activeEmployeeDetail.feedback}&rdquo;
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer action */}
                <div className="p-6 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                  <button
                    onClick={() => {
                      setPayslipEmployeeId(activeEmployeeDetail.id);
                      setSelectedEmployeeId(null);
                      setIsPayslipModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#0B2E4F] hover:bg-[#164875] text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    Generate Payslip Ledger
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. MODAL: ADD NEW EMPLOYEE FORM                           */}
          {/* ========================================================= */}
          {isNewEmployeeModalOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-[#0B2E4F] text-white p-5 flex justify-between items-center">
                  <span className="font-bold text-sm uppercase tracking-wide">Register New Employee</span>
                  <button onClick={() => setIsNewEmployeeModalOpen(false)} className="text-white/70 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateEmployee} className="p-6 space-y-4 text-xs text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="Rajesh Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="name@oasisinsurance.in"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department Division</label>
                      <select
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                      >
                        <option value="Sales">Sales</option>
                        <option value="Operations">Operations</option>
                        <option value="Claims">Claims</option>
                        <option value="Finance">Finance</option>
                        <option value="HR">HR</option>
                        <option value="IT">IT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Corporate Designation *</label>
                      <input
                        type="text"
                        required
                        value={newEmployee.designation}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, designation: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                        placeholder="Associate Manager"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base Monthly Salary (₹) *</label>
                      <input
                        type="number"
                        required
                        min={10000}
                        value={newEmployee.baseSalary}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, baseSalary: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Performance Score (0-100)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newEmployee.performanceScore}
                        onChange={(e) => setNewEmployee(prev => ({ ...prev, performanceScore: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNewEmployeeModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-500 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#F5A623] hover:bg-[#F7B644] text-[#0B2E4F] font-bold rounded-lg"
                    >
                      Create Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. MODAL: BEAUTIFUL CORP PAYSLIP POPUP                      */}
          {/* ========================================================= */}
          {isPayslipModalOpen && activePayslipDetail && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto p-4">
              <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-100">
                
                {/* Modal actions panel */}
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-600 uppercase">Verifiable Corporate Payslip Ledger</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 bg-[#0B2E4F] hover:bg-[#164875] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                    >
                      Print Ledger PDF
                    </button>
                    <button
                      onClick={() => setIsPayslipModalOpen(false)}
                      className="p-1.5 hover:bg-slate-200 text-slate-400 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* The Payslip Document Layout */}
                <div id="printable-payslip" className="p-8 space-y-6 text-slate-800 text-xs">
                  
                  {/* Header brand details */}
                  <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                    <div>
                      <img src="/logo.webp" alt="Oasis" className="h-10 object-contain max-w-[200px]" />
                      <h1 className="text-base font-extrabold text-[#0B2E4F] uppercase tracking-wide mt-2">OASIS Insurance Brokers Pvt. Ltd.</h1>
                      <p className="text-[10px] text-slate-400 font-medium">Corp Office: 402-405, Premium Corporate Towers, Bandra Kurla Complex, Mumbai - 400051</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-lg font-bold text-[#F5A623]">SALARY SLIP</h2>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">PAYROLL CYCLE: JULY 2026</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Status: Authorized Release</p>
                    </div>
                  </div>

                  {/* Personal details table grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 font-medium">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Employee ID</span>
                      <span className="font-bold text-slate-700">{activePayslipDetail.id}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Full Name</span>
                      <span className="font-bold text-slate-700">{activePayslipDetail.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Designation</span>
                      <span className="text-slate-600">{activePayslipDetail.designation}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Department</span>
                      <span className="text-slate-600">{activePayslipDetail.department}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">PF Number</span>
                      <span className="font-semibold text-slate-600 font-mono">MH/MUM/119283-A</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Bank Name</span>
                      <span className="text-slate-600">HDFC Bank Ltd.</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">A/C Number</span>
                      <span className="font-semibold text-slate-600 font-mono">50100239102839</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Tax PAN</span>
                      <span className="font-semibold text-slate-600 font-mono">ABCDE1234F</span>
                    </div>
                  </div>

                  {/* Ledgers comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Earnings Ledger */}
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <div className="bg-emerald-50 px-4 py-2 border-b border-slate-100 flex justify-between font-bold text-emerald-800 text-[10px] uppercase">
                        <span>Earnings Ledger</span>
                        <span>Amount</span>
                      </div>
                      <div className="divide-y divide-slate-50 px-4 py-1 text-slate-600">
                        <div className="flex justify-between py-2">
                          <span>Base Salary Structure</span>
                          <span className="font-semibold">₹{activePayslipDetail.baseSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 text-emerald-600">
                          <span>Performance Incentives</span>
                          <span className="font-semibold">₹{activePayslipDetail.incentive.toLocaleString()}</span>
                        </div>
                        {activePayslipDetail.bonus > 0 && (
                          <div className="flex justify-between py-2 text-emerald-600">
                            <span>Festive Bonus / Allowances</span>
                            <span className="font-semibold">₹{activePayslipDetail.bonus.toLocaleString()}</span>
                          </div>
                        )}
                        {activePayslipDetail.overtimePay > 0 && (
                          <div className="flex justify-between py-2">
                            <span>Overtime Pay ({activePayslipDetail.overtimeHours} hrs)</span>
                            <span className="font-semibold">₹{Math.round(activePayslipDetail.overtimePay).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between font-bold text-slate-700">
                        <span>Total Additions (A)</span>
                        <span>₹{(
                          activePayslipDetail.baseSalary +
                          activePayslipDetail.incentive +
                          activePayslipDetail.bonus +
                          activePayslipDetail.overtimePay
                        ).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Deductions Ledger */}
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <div className="bg-rose-50 px-4 py-2 border-b border-slate-100 flex justify-between font-bold text-rose-800 text-[10px] uppercase">
                        <span>Deductions Ledger</span>
                        <span>Amount</span>
                      </div>
                      <div className="divide-y divide-slate-50 px-4 py-1 text-slate-600">
                        <div className="flex justify-between py-2 text-rose-600">
                          <span>Provident Fund (PF - 12%)</span>
                          <span className="font-semibold">-₹{Math.round(activePayslipDetail.pfDeduction).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 text-rose-600">
                          <span>Tax Deducted at Source (TDS - 10%)</span>
                          <span className="font-semibold">-₹{Math.round(activePayslipDetail.tdsDeduction).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 text-rose-600">
                          <span>Professional Tax (PT Fixed)</span>
                          <span className="font-semibold">-₹{activePayslipDetail.ptDeduction.toLocaleString()}</span>
                        </div>
                        {activePayslipDetail.attendanceDeduction > 0 && (
                          <div className="flex justify-between py-2 text-rose-600">
                            <span>Absent Days ({activePayslipDetail.absentDays}) Deduction</span>
                            <span className="font-semibold">-₹{Math.round(activePayslipDetail.attendanceDeduction).toLocaleString()}</span>
                          </div>
                        )}
                        {activePayslipDetail.halfDayDeduction > 0 && (
                          <div className="flex justify-between py-2 text-rose-600">
                            <span>Lates / Half-day Deduction ({activePayslipDetail.totalHalfDays} half days)</span>
                            <span className="font-semibold">-₹{Math.round(activePayslipDetail.halfDayDeduction).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between font-bold text-slate-700">
                        <span>Total Deductions (B)</span>
                        <span>₹{Math.round(
                          activePayslipDetail.pfDeduction +
                          activePayslipDetail.tdsDeduction +
                          activePayslipDetail.ptDeduction +
                          activePayslipDetail.attendanceDeduction +
                          activePayslipDetail.halfDayDeduction
                        ).toLocaleString()}</span>
                      </div>
                    </div>

                  </div>

                  {/* Pro-Rata Accrual Comparison Ledger */}
                  <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-amber-900">
                    <div>
                      <h4 className="font-extrabold text-xs uppercase tracking-wide text-amber-800">Pro-Rata Accrual Summary</h4>
                      <p className="text-[10px] text-amber-700/85 mt-0.5">Accrued up to Day {currentDayOfMonth} of the 26-day working month cycle.</p>
                    </div>
                    <div className="flex gap-6 items-center">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">Full Month Target</span>
                        <span className="text-sm font-bold text-slate-700">₹{activePayslipDetail.netSalary.toLocaleString()}</span>
                      </div>
                      <div className="text-right border-l border-amber-200 pl-6">
                        <span className="text-[10px] font-extrabold text-amber-850 block uppercase">Accrued Balance Asset</span>
                        <span className="text-lg font-black text-amber-900">₹{activePayslipDetail.proRataAccruedSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net breakdown block */}
                  <div className="bg-[#0B2E4F] text-white p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-white/70">Take Home Net Payout (Full Month)</h3>
                      <p className="text-[10px] text-white/50 mt-0.5">Formula: Base Salary - Deductions + Additions</p>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="text-3xl font-extrabold text-[#F5A623]">₹{activePayslipDetail.netSalary.toLocaleString()}</span>
                      <span className="text-[10px] text-white/80 block mt-1 font-semibold">Rupees One Lakh Forty-Two Thousand Nine Hundred and Eighty Only</span>
                    </div>
                  </div>

                  {/* Signature details */}
                  <div className="pt-10 flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-slate-100">
                    <div className="text-center">
                      <div className="h-10 w-24 border-b border-slate-200 mx-auto" />
                      <span className="block mt-2">Employee Signature</span>
                    </div>
                    <div className="text-center">
                      <p className="italic text-slate-500 font-medium">Electronically system generated document.</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-mono">HASH: 2A1B8C3D9E4F5A6B7C8D</p>
                    </div>
                    <div className="text-center">
                      <div className="h-10 w-24 border-b border-slate-200 mx-auto flex items-center justify-center text-xs text-indigo-700 uppercase font-bold">OASIS FINANCE</div>
                      <span className="block mt-2">Director Finance Approval</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
