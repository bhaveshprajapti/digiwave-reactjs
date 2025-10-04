"use client"
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { ChevronsUpDown, Calendar as CalendarIcon, Users, UserCheck, UserX, ArrowUp, ArrowDown, Search } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/Chart";
import { Button } from "../components/ui/Button";
import { attendanceAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const AttendancePage = () => {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ["attendanceStats"],
    queryFn: () => attendanceAPI.getStats(),
  });

  const { data: monthlyOverviewData, isLoading: isLoadingMonthlyOverview } = useQuery({
    queryKey: ["attendanceMonthlyOverview"],
    queryFn: () => attendanceAPI.getMonthlyOverview(), 
  });

  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", { search: searchTerm }],
    queryFn: () => attendanceAPI.getAll({ search: searchTerm || undefined }),
  });

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => attendanceAPI.getUsers(), 
  });

  const chartData = useMemo(() => {
    if (!monthlyOverviewData || !Array.isArray(monthlyOverviewData)) return [];
    return monthlyOverviewData.map(item => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      present: item.present,
      absent: item.absent,
    }));
  }, [monthlyOverviewData]);

  const filteredDailyLog = useMemo(() => {
    if (!attendanceData || !attendanceData.results) return [];
    let logs = attendanceData.results || [];
    if (selectedEmployee !== "all") {
      logs = logs.filter(log => log.user && log.user.id === parseInt(selectedEmployee));
    }
    return logs;
  }, [attendanceData, selectedEmployee]);

  if (isLoadingStats || isLoadingMonthlyOverview || isLoadingAttendance || isLoadingUsers) {
    return <LoadingSpinner />;
  }

  const totalEmployees = (usersData?.count && typeof usersData.count === 'number') ? usersData.count : 0;
  const presentToday = statsData?.present_today || 0;
  const onLeaveToday = statsData?.on_leave_today || 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Attendance Log Management</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily-log">Daily Log</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{presentToday}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{onLeaveToday}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Monthly Attendance Overview</CardTitle>
                <CardDescription>Present vs. Absent employees this month.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer className="h-[350px] w-full">
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis />
                      <RechartsTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="daily-log" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search by name..."
                  className="pl-8 w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {usersData?.results && Array.isArray(usersData.results) ? usersData.results.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  )) : []}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-md border">
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[100px]">Employee</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Clock In</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Clock Out</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredDailyLog.map(log => (
                    <tr key={log.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">{log.user.first_name} {log.user.last_name}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${log.first_in ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {log.first_in ? "Present" : "Absent"}
                        </div>
                      </td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{log.first_in ? new Date(log.first_in).toLocaleTimeString() : "-"}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{log.last_out ? new Date(log.last_out).toLocaleTimeString() : "-"}</td>
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">{log.total_hours_str || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendancePage;