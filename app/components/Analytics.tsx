"use client";

import type { Submission } from "@/app/dashboard/page";

interface AnalyticsProps {
  submissions: Submission[];
}

const StatCard = ({ label, value, icon, colorClass }: { label: string; value: string | number; icon: React.ReactNode, colorClass: string }) => (
  <div className="bg-notion-bg rounded-lg border border-notion-border p-5">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${colorClass} bg-opacity-20`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-notion-text-light">{label}</p>
        <p className="text-2xl font-bold text-notion-text">{value}</p>
      </div>
    </div>
  </div>
);

export function Analytics({ submissions }: AnalyticsProps) {
  if (submissions.length === 0) {
    return null;
  }

  const totalSubmissions = submissions.length;
  const accepted = submissions.filter(s => s.status === "Accepted").length;
  const rejected = submissions.filter(s => s.status === "Rejected").length;
  
  const responseRate = totalSubmissions > 0 ? Math.round(((accepted + rejected) / totalSubmissions) * 100) : 0;
  const successRate = (accepted + rejected) > 0 ? Math.round((accepted / (accepted + rejected)) * 100) : 0;
  const totalFees = submissions.reduce((sum, sub) => sum + (sub.fee || 0), 0);
  
  const overdue = submissions.filter(s => {
    return s.deadline && new Date(s.deadline) < new Date() && s.status !== 'Accepted' && s.status !== 'Rejected';
  }).length;
  
  const upcoming = submissions.filter(s => {
    if (!s.deadline) return false;
    const deadlineDate = new Date(s.deadline);
    const today = new Date();
    const thirtyDays = new Date(today.setDate(today.getDate() + 30));
    return deadlineDate > new Date() && deadlineDate < thirtyDays && s.status !== 'Accepted' && s.status !== 'Rejected';
  }).length;

  const stats = [
    { label: "Total Submissions", value: totalSubmissions, icon: <IconDocument />, colorClass: "text-blue-500" },
    { label: "Response Rate", value: `${responseRate}%`, icon: <IconChart />, colorClass: "text-green-500" },
    { label: "Success Rate", value: `${successRate}%`, icon: <IconTrophy />, colorClass: "text-yellow-500" },
    { label: "Total Fees", value: `$${totalFees.toFixed(2)}`, icon: <IconDollar />, colorClass: "text-purple-500" },
  ];

  const alerts = [
    { condition: overdue > 0, label: `${overdue} Overdue`, description: "Past deadline with no response", icon: <IconAlert />, color: "red" },
    { condition: upcoming > 0, label: `${upcoming} Upcoming`, description: "Deadline in the next 30 days", icon: <IconClock />, color: "yellow" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alerts.map(alert => alert.condition && <AlertCard key={alert.label} {...alert} />)}
      </div>
    </div>
  );
}

const AlertCard = ({ label, description, icon, color }: { label: string; description: string; icon: React.ReactNode; color: 'red' | 'yellow' }) => {
  const colorClasses = {
    red: "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800"
  };

  return (
    <div className={`flex items-center p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="ml-3">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs">{description}</p>
      </div>
    </div>
  );
};

// SVG Icons
const IconDocument = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const IconChart = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconTrophy = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const IconDollar = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>;
const IconAlert = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>;
const IconClock = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; 