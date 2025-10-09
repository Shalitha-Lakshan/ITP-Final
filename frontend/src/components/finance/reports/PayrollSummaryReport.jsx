import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  FileText,
  Percent,
  Wallet,
  TrendingDown,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { format, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
// Import jsPDF and autoTable with proper initialization
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Add autoTable to jsPDF prototype
jsPDF.autoTable = autoTable;

// Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

const PayrollSummaryReport = ({ dateRange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState({});
  const [stats, setStats] = useState({
    totalEmployees: 0,
    monthlyPayroll: 0,
    epfContributions: 0,
    overtimeHours: 0,
    etfContributions: 0
  });
  
  // Format currency helper function
  const formatCurrency = (amount) => {
    // Handle undefined, null, or non-numeric values
    const value = Number(amount) || 0;
    return `LKR ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Export to PDF function
  const exportToPDF = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a valid date range');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Load the logo as base64
    const loadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = window.location.origin + url;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    };
    
    // Wait for the logo to load
    const logo = await loadImage('/ecocycle-logo.png');
    
    // Professional color scheme
    const colors = {
      primary: '#0d9488',     // Teal - professional and ensures logo visibility
      secondary: '#2e7d32',   // Green
      accent: '#ff6f00',      // Orange
      lightBg: '#f8fafc',     // Light gray background
      textLight: '#ffffff',   // White text
      textDark: '#1e293b',    // Dark text
      border: '#e2e8f0'       // Light border
    };
    
    // Header with professional styling - full width
    doc.setFillColor(colors.primary);
    doc.rect(0, 0, 210, 30, 'F'); // Increased height from 20 to 30
    
    // Add logo to header (left side) with better spacing
    if (logo) {
      const logoWidth = 40; // Increased from 30
      const logoHeight = (logo.height * logoWidth) / logo.width;
      const logoX = 20; // More padding from left
      const logoY = 15 - (logoHeight / 2); // Centered vertically in taller header
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
    }
    
    // Company info (right side) with better spacing
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20); // Slightly larger
    doc.setTextColor(colors.textLight);
    doc.text('ECOCYCLE LANKA (PVT) LTD', 70, 15, { align: 'left' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Green Tech Park, Colombo 05, Sri Lanka', 70, 21, { align: 'left' });
    doc.text('Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com', 70, 26, { align: 'left' });
    
    // Header bottom border - full width with accent color
    doc.setDrawColor(colors.accent);
    doc.setLineWidth(0.8); // Slightly thicker line
    doc.line(15, 30, 195, 30);
    
    // Report title section with better spacing
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary);
    doc.text('PAYROLL SUMMARY REPORT', 105, 45, { align: 'center' });
    
    // Decorative line under title
    doc.setDrawColor(colors.accent);
    doc.setLineWidth(1);
    doc.line(60, 48, 150, 48);
    
    // Report period and generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Background for report info
    doc.setFillColor(colors.lightBg);
    doc.roundedRect(15, 55, 180, 12, 2, 2, 'F');
    
    // Report period with dot
    doc.setFillColor(colors.primary);
    doc.circle(25, 62, 2, 'F');
    doc.setTextColor(colors.textDark);
    doc.text(`Report Period: ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`, 30, 62);
    
    // Generated date with dot
    doc.setFillColor(colors.secondary);
    doc.circle(25, 72, 2, 'F');
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy hh:mm a')}`, 30, 72);
    
    // Add payroll summary cards with improved styling
    const cardWidth = 90; // Wider cards for better readability
    const cardHeight = 25; // More compact height
    const cardMargin = 10; // Increased margin
    const startY = 90; // Starting Y position for cards
    
    // Card data with professional color scheme
    const cards = [
      {
        title: 'TOTAL EMPLOYEES',
        value: stats.totalEmployees.toString(),
        color: [16, 86, 167], // Professional blue
        bgColor: [232, 240, 253], // Light blue background
        borderColor: [207, 226, 255], // Subtle border
        description: 'Total number of active employees'
      },
      {
        title: 'MONTHLY PAYROLL',
        value: formatCurrency(stats.monthlyPayroll),
        color: [0, 123, 92], // Professional green
        bgColor: [231, 251, 240], // Light green background
        borderColor: [199, 247, 220], // Subtle border
        description: 'Total monthly payroll amount'
      },
      {
        title: 'EPF CONTRIBUTIONS',
        value: formatCurrency(stats.epfContributions),
        color: [123, 36, 170], // Professional purple
        bgColor: [240, 235, 255], // Light purple background
        borderColor: [224, 214, 255], // Subtle border
        description: 'Total EPF contributions for the period'
      },
      {
        title: 'ETF CONTRIBUTIONS',
        value: formatCurrency(stats.etfContributions),
        color: [0, 172, 193], // Professional teal
        bgColor: [224, 247, 250], // Light teal background
        borderColor: [178, 235, 242], // Subtle border
        description: 'Total ETF contributions for the period'
      },
      {
        title: 'OVERTIME HOURS',
        value: stats.overtimeHours.toFixed(2),
        color: [255, 119, 0], // Professional orange
        bgColor: [255, 241, 230], // Light orange background
        borderColor: [255, 220, 198], // Subtle border
        description: 'Total overtime hours worked'
      }
    ];

    // Draw cards in 2x2 grid with improved styling
    cards.forEach((card, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 10 + (col * (cardWidth + cardMargin));
      const y = startY + (row * (cardHeight + cardMargin));
      
      // Card background with subtle shadow effect
      doc.setFillColor(...card.bgColor);
      doc.setDrawColor(...card.borderColor);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');
      
      // Add a subtle left border
      doc.setFillColor(...card.color);
      doc.rect(x, y, 4, cardHeight, 'F');
      
      // Card content
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont(undefined, 'bold');
      doc.text(card.title, x + 10, y + 8);
      
      // Value with improved typography
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...card.color);
      doc.text(card.value, x + 10, y + 18);
      
      // Description with ellipsis if too long
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(120, 120, 120);
      const desc = doc.splitTextToSize(card.description, cardWidth - 25);
      doc.text(desc, x + 10, y + 22);
    });

    // Calculate the position after cards (2 rows of cards + margins)
    const afterCardsY = startY + (cardHeight * 3) + (cardMargin * 4);
    
    // Add section divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, afterCardsY - 10, 190, afterCardsY - 10);
    
    // Department breakdown section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Department Breakdown', 20, afterCardsY);
    
    // Process department data for the table
    const departmentData = payrolls.reduce((acc, payroll) => {
      const dept = payroll.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          employeeCount: 0,
          totalPayroll: 0,
          totalOvertime: 0
        };
      }
      acc[dept].employeeCount++;
      acc[dept].totalPayroll += parseFloat(payroll.netPay) || 0;
      acc[dept].totalOvertime += parseFloat(payroll.overtimeHours) || 0;
      return acc;
    }, {});
    
    // Convert to array and calculate averages
    const departmentBreakdown = Object.entries(departmentData).map(([department, data]) => ({
      department,
      employeeCount: data.employeeCount,
      totalPayroll: data.totalPayroll,
      averageSalary: data.employeeCount > 0 ? data.totalPayroll / data.employeeCount : 0,
      totalOvertime: data.totalOvertime
    }));
    
    // Department breakdown table
    if (departmentBreakdown.length > 0) {
      autoTable(doc, {
        startY: afterCardsY + 10,
        head: [
          [
            'Department',
            'Employees',
            'Total Payroll',
            'Avg. Salary',
            'Overtime Hours'
          ]
        ],
        body: departmentBreakdown.map(dept => [
          dept.department,
          dept.employeeCount.toString(),
          formatCurrency(dept.totalPayroll),
          formatCurrency(dept.averageSalary),
          dept.totalOvertime.toFixed(2)
        ]),
        theme: 'grid',
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 9,
          cellPadding: 3,
          lineWidth: 0
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineWidth: 0.1,
          lineColor: [200, 200, 200],
          textColor: [51, 51, 51]
        },
        columnStyles: { 
          0: { cellWidth: 50, cellPadding: { left: 5 }, fontStyle: 'bold' },
          1: { cellWidth: 25, halign: 'center', fontStyle: 'normal' },
          2: { cellWidth: 35, halign: 'right', fontStyle: 'normal' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'normal' },
          4: { cellWidth: 25, halign: 'right', fontStyle: 'normal' }
        },
        margin: { top: 5, right: 14, bottom: 25, left: 14 },
        didDrawPage: function(data) {
          // Add footer on each page
          const pageCount = doc.internal.getNumberOfPages();
          const pageWidth = doc.internal.pageSize.getWidth();
          
          // Footer text
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount} • Generated on ${format(new Date(), 'MMM d, yyyy hh:mm a')}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
          
          // Add a subtle top border for the footer
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.2);
          doc.line(
            14,
            doc.internal.pageSize.getHeight() - 15,
            pageWidth - 14,
            doc.internal.pageSize.getHeight() - 15
          );
        }
      });
    }
    
    // Add watermark
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(60);
      doc.setTextColor(230, 230, 230);
      doc.setFont('helvetica', 'bold');
      doc.setGState(doc.GState({opacity: 0.1}));
      doc.text('ECOCYCLE', 105, 150, { angle: 45, align: 'center' });
    }

    // Save the PDF
    const fileName = `payroll-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      if (data.success) {
        const employeesMap = {};
        data.data.forEach(emp => {
          employeesMap[emp._id] = emp;
        });
        setEmployees(employeesMap);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employee data');
    }
    return [];
  };

  // Fetch payroll data
  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
      const [payrollsResponse, employeesData] = await Promise.all([
        fetch('http://localhost:5000/api/payroll', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetchEmployees()
      ]);

      if (!payrollsResponse.ok) {
        throw new Error('Failed to fetch payroll data');
      }

      const payrollsData = await payrollsResponse.json();
      setPayrolls(payrollsData.data || []);
      
      // Calculate stats
      calculatePayrollStats(payrollsData.data || [], employeesData);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate payroll statistics from payroll data
  const calculatePayrollStats = (payrollsData, employeesData) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = subMonths(new Date(), 1).toISOString().slice(0, 7);
    
    // Calculate current month stats
    const currentMonthPayrolls = payrollsData.filter(p => p.month?.startsWith(currentMonth));
    const lastMonthPayrolls = payrollsData.filter(p => p.month?.startsWith(lastMonth));
    
    const monthlyPayroll = currentMonthPayrolls.reduce((sum, p) => sum + (parseFloat(p.netPay) || 0), 0);
    const lastMonthPayroll = lastMonthPayrolls.reduce((sum, p) => sum + (parseFloat(p.netPay) || 0), 0);
    
    const epfContributions = currentMonthPayrolls.reduce(
      (sum, p) => sum + (parseFloat(p.epfEmployee) || 0) + (parseFloat(p.epfEmployer) || 0), 0
    );
    
    const lastMonthEpf = lastMonthPayrolls.reduce(
      (sum, p) => sum + (parseFloat(p.epfEmployee) || 0) + (parseFloat(p.epfEmployer) || 0), 0
    );
    
    const overtimeHours = currentMonthPayrolls.reduce((sum, p) => sum + (parseFloat(p.overtimeHours) || 0), 0);
    const lastMonthOvertime = lastMonthPayrolls.reduce((sum, p) => sum + (parseFloat(p.overtimeHours) || 0), 0);
    
    const etfContributions = currentMonthPayrolls.reduce(
      (sum, p) => sum + (parseFloat(p.etf) || 0), 0
    );
    
    setStats({
      totalEmployees: Object.keys(employeesData || {}).length,
      monthlyPayroll,
      monthlyPayrollTrend: calculateTrend(monthlyPayroll, lastMonthPayroll),
      epfContributions,
      epfTrend: calculateTrend(epfContributions, lastMonthEpf),
      overtimeHours,
      overtimeTrend: calculateTrend(overtimeHours, lastMonthOvertime),
      etfContributions,
      etfTrend: calculateTrend(etfContributions, lastMonthEpf * 0.25) // ETF is typically 3% of basic salary
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPayrolls();
  }, [dateRange]);

  // Format currency function is now defined at the top of the component

  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Format number with commas
  const formatNumber = (num) => {
    const value = Number(num) || 0;
    return value.toLocaleString('en-US');
  };
  
  // Process raw payroll data into summary format for UI display
  const processPayrollData = (payrolls) => {
    if (!Array.isArray(payrolls) || payrolls.length === 0) {
      return {
        departmentBreakdown: [],
        payrollHistory: []
      };
    }
    
    // Group by department for breakdown
    const departmentBreakdown = payrolls.reduce((acc, payroll) => {
      const dept = payroll.department || 'Unassigned';
      if (!acc[dept]) {
        acc[dept] = {
          department: dept,
          employeeCount: 0,
          totalPayroll: 0
        };
      }
      acc[dept].employeeCount++;
      acc[dept].totalPayroll += parseFloat(payroll.netPay) || 0;
      return acc;
    }, {});
    
    // Calculate department averages
    Object.values(departmentBreakdown).forEach(dept => {
      dept.averageSalary = dept.employeeCount > 0 ? dept.totalPayroll / dept.employeeCount : 0;
    });
    
    // Get recent payrolls for history
    const payrollHistory = [...payrolls]
      .sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt))
      .slice(0, 5)
      .map(p => ({
        ...p,
        totalPay: (parseFloat(p.basicSalary) || 0) + (parseFloat(p.allowances) || 0) + (parseFloat(p.overtimePay) || 0),
        totalDeductions: (parseFloat(p.epfEmployee) || 0) + (parseFloat(p.etfEmployer) || 0) + (parseFloat(p.otherDeductions) || 0)
      }));
    
    return {
      departmentBreakdown: Object.values(departmentBreakdown),
      payrollHistory
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching payroll data...');
        
        // Format dates for API
        const fromDate = dateRange.from ? new Date(dateRange.from).toISOString() : '';
        const toDate = dateRange.to ? new Date(dateRange.to).toISOString() : '';
        
        // Try to fetch from the payroll summary endpoint first
        let response = await fetch(`http://localhost:5000/api/payroll/summary?from=${fromDate}&to=${toDate}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        let result;
        
        // If 404, try the regular payroll endpoint
        if (response.status === 404) {
          console.log('Analytics endpoint not found, trying fallback...');
          response = await fetch(`http://localhost:5000/api/payroll?from=${fromDate}&to=${toDate}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
        }
        
        const responseData = await response.json();
        
        // Process the data based on the response format
        if (Array.isArray(responseData)) {
          // Handle array response (list of payrolls)
          const payrolls = responseData;
          
          // Calculate totals
          const totalSalary = payrolls.reduce((sum, p) => sum + (p.basicSalary || 0), 0);
          const totalEPF = payrolls.reduce((sum, p) => sum + (p.epfEmployee || 0), 0);
          const totalETF = payrolls.reduce((sum, p) => sum + (p.etfEmployer || 0), 0);
          const totalOvertime = payrolls.reduce((sum, p) => sum + (p.overtimePay || 0), 0);
          const totalNetPay = payrolls.reduce((sum, p) => sum + (p.netPay || 0), 0);
          
          // Group by department for breakdown
          const departmentBreakdown = payrolls.reduce((acc, payroll) => {
            const dept = payroll.department || 'Unassigned';
            if (!acc[dept]) {
              acc[dept] = {
                department: dept,
                employeeCount: 0,
                totalPayroll: 0
              };
            }
            acc[dept].employeeCount++;
            acc[dept].totalPayroll += payroll.netPay || 0;
            return acc;
          }, {});
          
          // Count statuses
          const statusCounts = payrolls.reduce((acc, payroll) => {
            const status = payroll.status?.toLowerCase() || 'pending';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          
          // Update the stats state with the processed data
          setStats({
            totalEmployees: new Set(payrolls.map(p => p.employeeId)).size,
            monthlyPayroll: totalSalary + totalEPF + totalETF + totalOvertime,
            epfContributions: totalEPF,
            etfContributions: totalETF,
            overtimeHours: totalOvertime
          });
          
          // Update the payrolls state with the processed data
          setPayrolls([...payrolls].sort((a, b) => 
            new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt)
          ));
        }
        
      } catch (error) {
        console.error('Error fetching payroll summary:', error);
        // Reset states on error
        setStats({
          totalEmployees: 0,
          monthlyPayroll: 0,
          epfContributions: 0,
          overtimeHours: 0,
          etfContributions: 0
        });
        setPayrolls([]);
        toast.error('Failed to fetch payroll data');
      } finally {
        setIsLoading(false);
      }
    };

    // Define exportToPDF function in component scope
    const exportToPDF = () => {
      if (!dateRange?.from || !dateRange?.to) {
        toast.error('Please select a valid date range');
        return;
      }
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Header with company info
        doc.setFillColor(0, 100, 180);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ECOCYCLE LANKA (PVT) LTD', 105, 15, { align: 'center' });
        doc.setFontSize(10);
        doc.text('123 Green Tech Park, Colombo 05, Sri Lanka', 105, 20, { align: 'center' });
        doc.text('Tel: +94 11 234 5678 | Email: ecocycle923@gmail.com', 105, 25, { align: 'center' });
        
        // Report title and date range
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Payroll Summary Report', 20, 45);
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const reportDateRange = dateRange?.from && dateRange?.to
          ? `Period: ${format(dateRange.from, 'MMM d, yyyy')} to ${format(dateRange.to, 'MMM d, yyyy')}`
          : 'All Payroll Data';
        doc.text(reportDateRange, 20, 52);
        doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy hh:mm a')}`, 20, 59);

        // Add payroll summary cards with improved styling
        const cardWidth = 90; // Wider cards for better readability
        const cardHeight = 25; // More compact height
        const cardMargin = 10; // Increased margin
        const startY = 70; // Starting Y position for cards
        
        // Card data with professional color scheme
        const cards = [
          {
            title: 'TOTAL EMPLOYEES',
            value: stats.totalEmployees.toString(),
            color: [16, 86, 167], // Professional blue
            bgColor: [232, 240, 253], // Light blue background
            borderColor: [207, 226, 255], // Subtle border
            description: 'Total number of active employees'
          },
          {
            title: 'MONTHLY PAYROLL',
            value: formatCurrency(stats.monthlyPayroll),
            color: [0, 123, 92], // Professional green
            bgColor: [231, 251, 240], // Light green background
            borderColor: [199, 247, 220], // Subtle border
            description: 'Total monthly payroll amount'
          },
          {
            title: 'EPF CONTRIBUTIONS',
            value: formatCurrency(stats.epfContributions),
            color: [123, 36, 170], // Professional purple
            bgColor: [240, 235, 255], // Light purple background
            borderColor: [224, 214, 255], // Subtle border
            description: 'Total EPF contributions for the period'
          },
          {
            title: 'ETF CONTRIBUTIONS',
            value: formatCurrency(stats.etfContributions),
            color: [0, 172, 193], // Professional teal
            bgColor: [224, 247, 250], // Light teal background
            borderColor: [178, 235, 242], // Subtle border
            description: 'Total ETF contributions for the period'
          }
        ];

        // Draw cards in 2x2 grid with improved styling
        cards.forEach((card, index) => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const x = 10 + (col * (cardWidth + cardMargin));
          const y = startY + (row * (cardHeight + cardMargin));
          
          // Card background with subtle shadow effect
          doc.setFillColor(...card.bgColor);
          doc.setDrawColor(...card.borderColor);
          doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');
          
          // Add a subtle left border
          doc.setFillColor(...card.color);
          doc.rect(x, y, 4, cardHeight, 'F');
          
          // Card content
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont(undefined, 'bold');
          doc.text(card.title, x + 10, y + 8);
          
          // Value with improved typography
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(...card.color);
          doc.text(card.value, x + 10, y + 18);
          
          // Description with ellipsis if too long
          doc.setFontSize(7);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(120, 120, 120);
          const desc = doc.splitTextToSize(card.description, cardWidth - 25);
          doc.text(desc, x + 10, y + 22);
        });
    
        // Calculate the position after cards (2 rows of cards + margins)
        const afterCardsY = startY + (cardHeight * 2) + (cardMargin * 3);
        
        // Add section divider
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, afterCardsY - 10, 190, afterCardsY - 10);
        
        // Department breakdown section
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Department Breakdown', 20, afterCardsY);
        
        // Process department data for the table
        const departmentData = payrolls.reduce((acc, payroll) => {
          const dept = payroll.department || 'Unassigned';
          if (!acc[dept]) {
            acc[dept] = {
              employeeCount: 0,
              totalPayroll: 0
            };
          }
          acc[dept].employeeCount++;
          acc[dept].totalPayroll += parseFloat(payroll.netPay) || 0;
          return acc;
        }, {});
        
        // Convert to array and calculate averages
        const departmentBreakdown = Object.entries(departmentData).map(([department, data]) => ({
          department,
          employeeCount: data.employeeCount,
          totalPayroll: data.totalPayroll,
          averageSalary: data.employeeCount > 0 ? data.totalPayroll / data.employeeCount : 0
        }));
        
        // Department breakdown table
        if (departmentBreakdown.length > 0) {
          doc.autoTable({
            startY: afterCardsY + 10,
            head: [
              [
                { content: 'Department', styles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' } },
                { content: 'Employees', styles: { fillColor: [59, 130, 246], textColor: 255, halign: 'center' } },
                { content: 'Total Payroll', styles: { fillColor: [59, 130, 246], textColor: 255, halign: 'right' } },
                { content: 'Avg. Salary', styles: { fillColor: [59, 130, 246], textColor: 255, halign: 'right' } }
              ]
            ],
            body: departmentBreakdown.map(dept => [
              { content: dept.department, styles: { fontStyle: 'bold' } },
              { content: dept.employeeCount.toString(), styles: { halign: 'center' } },
              { content: formatCurrency(dept.totalPayroll), styles: { halign: 'right' } },
              { content: formatCurrency(dept.averageSalary), styles: { halign: 'right' } }
            ]),
            theme: 'grid',
            headStyles: { 
              fillColor: [59, 130, 246],
              textColor: 255,
              fontSize: 9,
              cellPadding: 3,
              lineWidth: 0
            },
            styles: {
              fontSize: 9,
              cellPadding: 3,
              lineWidth: 0.1,
              lineColor: [200, 200, 200],
              textColor: [51, 51, 51]
            },
            columnStyles: { 
              0: { cellWidth: 70, cellPadding: { left: 5 }, fontStyle: 'bold' },
              1: { cellWidth: 30, halign: 'center', fontStyle: 'normal' },
              2: { cellWidth: 45, halign: 'right', fontStyle: 'normal' },
              3: { cellWidth: 35, halign: 'right', fontStyle: 'normal' }
            },
            margin: { top: 5, right: 14, bottom: 25, left: 14 },
            didDrawPage: function(data) {
              // Add footer on each page
              const pageCount = doc.internal.getNumberOfPages();
              const pageWidth = doc.internal.pageSize.getWidth();
              
              // Footer text
              doc.setFontSize(8);
              doc.setTextColor(100);
              doc.text(
                `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount} • Generated on ${format(new Date(), 'MMM d, yyyy hh:mm a')}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
              );
              
              // Add a subtle top border for the footer
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.2);
              doc.line(
                14,
                doc.internal.pageSize.getHeight() - 15,
                pageWidth - 14,
                doc.internal.pageSize.getHeight() - 15
              );
            }
          });
        }
        
        // Add watermark
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(60);
          doc.setTextColor(230, 230, 230);
          doc.setFont('helvetica', 'bold');
          doc.setGState(doc.GState({opacity: 0.1}));
          doc.text('ECOCYCLE', 105, 150, { angle: 45, align: 'center' });
        }

        // Save the PDF
        const fileName = `payroll-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        doc.save(fileName);
      };
      
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="space-y-6 w-full">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Summary</h2>
          <p className="text-muted-foreground">
            Overview of payroll activities from {format(dateRange.from, 'MMM d, yyyy')} to {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
        <Button onClick={exportToPDF} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Employees Card */}
        <Card className="border-l-4 border-blue-500">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-sm font-medium">Total Employees</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        {/* Monthly Payroll Card */}
        <Card className="border-l-4 border-green-500">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-sm font-medium">Monthly Payroll</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyPayroll)}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        {/* EPF Contributions Card */}
        <Card className="border-l-4 border-purple-500">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-sm font-medium">EPF Contributions</h3>
            <FileText className="h-5 w-5 text-purple-500" />
          </div>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(stats.epfContributions)}</div>
            <p className="text-xs text-muted-foreground">Employee + Employer</p>
          </CardContent>
        </Card>

        {/* Overtime Hours Card */}
        <Card className="border-l-4 border-orange-500">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-sm font-medium">Overtime Hours</h3>
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{Math.round(stats.overtimeHours)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        {/* Average Salary Card */}
        <Card className="border-l-4 border-purple-500">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-sm font-medium">Monthly Payroll</h3>
            <DollarSign className="h-5 w-5 text-purple-500" />
          </div>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyPayroll)}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {stats.monthlyPayrollTrend >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(stats.monthlyPayrollTrend).toFixed(1)}% vs last month
            </div>
          </CardContent>
        </Card>

        {/* EPF/ETF Contributions Card */}
        <Card className="border-l-4 border-amber-500">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-sm font-medium">EPF/ETF</h3>
            <FileText className="h-5 w-5 text-amber-500" />
          </div>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{formatCurrency(stats.epfContributions + stats.etfContributions)}</div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>EPF: {formatCurrency(stats.epfContributions)}</span>
              <span>ETF: {formatCurrency(stats.etfContributions)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold">{formatCurrency(stats.monthlyPayroll)}</p>
                  <span className={`flex items-center text-sm mb-1 ${stats.monthlyPayrollTrend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.monthlyPayrollTrend >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stats.monthlyPayrollTrend).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyPayroll / Math.max(1, stats.totalEmployees))}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">EPF/ETF Contributions</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.epfContributions + stats.etfContributions)}
                </p>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>EPF: {formatCurrency(stats.epfContributions)}</span>
                  <span>ETF: {formatCurrency(stats.etfContributions)}</span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="p-6 pb-2">
            <h3 className="text-lg font-semibold">Department Breakdown</h3>
            <p className="text-sm text-gray-500 mb-4">Payroll distribution across departments</p>
          </div>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {processPayrollData(payrolls).departmentBreakdown.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{dept.department}</div>
                    <div className="text-sm text-muted-foreground">
                      {dept.employeeCount} employees
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-muted-foreground">
                      Avg: LKR {dept.averageSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="font-medium">
                      LKR {dept.totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ 
                        width: `${(dept.totalPayroll / Math.max(1, stats.monthlyPayroll)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      
      </div>
    </div>
  );
};

export default PayrollSummaryReport;
