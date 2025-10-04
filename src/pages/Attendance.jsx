import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Timer, 
  LogIn, 
  Pause, 
  LogOut, 
  Settings, 
  History, 
  AlertTriangle, 
  Smartphone, 
  Monitor,
  Eye
} from 'lucide-react';
import { attendanceAPI, leavesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { showClockOutConfirmDialog, showBreakConfirmDialog, showMobileBlockedDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';
import AttendanceDetailsModal from '../components/attendance/AttendanceDetailsModal';

const Attendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [isClockingOut, setIsClockingOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState('00:00:00');
  const [clockInTime, setClockInTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [baseWorkingSeconds, setBaseWorkingSeconds] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const queryClient = useQueryClient();

  // Mobile device detection
  const detectMobileDevice = useCallback(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Mobile patterns
    const mobilePatterns = [
      /Android.*Mobile/i,
      /iPhone/i,
      /iPod/i,
      /Windows Phone/i,
      /BlackBerry/i,
      /webOS/i,
      /Opera Mini/i,
      /IEMobile/i,
      /Mobile.*Firefox/i,
      /Mobile.*Safari/i,
      /iPad/i,
      /Android(?!.*Mobile)/i,
      /Tablet/i,
      /PlayBook/i,
      /Kindle/i
    ];

    // Check user agent
    const isMobileUA = mobilePatterns.some(pattern => pattern.test(userAgent));

    // Check screen size
    const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 1024;

    // Check touch capability
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check orientation API
    const hasOrientationAPI = 'orientation' in window;

    // Calculate mobile score
    let mobileScore = 0;
    if (isMobileUA) mobileScore += 40;
    if (isMobileScreen) mobileScore += 30;
    if (isTouchDevice) mobileScore += 20;
    if (hasOrientationAPI) mobileScore += 10;

    return mobileScore >= 50;
  }, []);

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.platform,
      navigator.cookieEnabled,
      navigator.doNotTrack
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  }, []);

  const handleViewAttendance = async (record) => {
    setIsModalLoading(true);
    setShowDetailsModal(true);
    try {
      // Use the admin details API to get attendance details for any user
      const response = await attendanceAPI.getAdminDetails(record.user.id, record.date);
      setSelectedAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance details', error);
      toast.error('Failed to load attendance details');
      setSelectedAttendance(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Initialize device detection
  useEffect(() => {
    const isMobile = detectMobileDevice();
    const fingerprint = generateDeviceFingerprint();

    setIsMobileDevice(isMobile);
    setDeviceFingerprint(fingerprint);

    if (isMobile) {
      showMobileBlockedDialog();
    }
  }, [detectMobileDevice, generateDeviceFingerprint]);

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', { search: searchTerm }],
    queryFn: () => attendanceAPI.getAll({
      search: searchTerm || undefined,
      show_all: 'true'  // Add this parameter to show all attendance records
    }),
    placeholderData: (previousData) => previousData,
  });

  // Get today's attendance status
  const { data: todayStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['attendance-status', new Date().toISOString().split('T')[0]],
    queryFn: () => attendanceAPI.getTodayStatus(),
    refetchInterval: 60000, // Refetch every 60 seconds (less frequent to prevent UI freezing)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
    staleTime: 60000, // Consider data stale after 60 seconds
    refetchIntervalInBackground: true, // Continue refetching in background
    notifyOnChangeProps: ['data', 'error'], // Only notify on data/error changes, not loading states
  });

  // Restore attendance state from server on component mount or status change
  useEffect(() => {
    if (todayStatus?.data) {
      const status = todayStatus.data;

      // Restore clock-in state
      if (status.is_clocked_in && status.current_session_start) {
        const sessionStart = new Date(status.current_session_start);
        setClockInTime(sessionStart);
        setSessionStartTime(sessionStart);
        setBaseWorkingSeconds(status.total_working_seconds || 0);

        // Set total break time from server
        setTotalBreakTime(status.total_break_seconds || 0);

        // If not on break, calculate and set current working time
        if (!status.is_on_break) {
          const now = new Date();
          const currentSessionElapsed = Math.floor((now - sessionStart) / 1000);
          const baseWorkingSeconds = status.total_working_seconds || 0;
          const totalWorkingSeconds = Math.max(0, baseWorkingSeconds + currentSessionElapsed);

          const hours = Math.floor(totalWorkingSeconds / 3600);
          const minutes = Math.floor((totalWorkingSeconds % 3600) / 60);
          const seconds = totalWorkingSeconds % 60;

          setWorkingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        // User is not clocked in
        setClockInTime(null);
        setSessionStartTime(null);
        setBaseWorkingSeconds(0);
        setWorkingTime('00:00:00');
        setTotalBreakTime(0);
      }
    }
  }, [todayStatus]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update working time based on clock-in time
  useEffect(() => {
    let workingTimeTimer;
    
    if (sessionStartTime && todayStatus?.data?.is_clocked_in) {
      const updateWorkingTime = () => {
        const now = new Date();
        
        // Calculate working time if clocked in and not on break
        if (!todayStatus.data.is_on_break) {
          const currentSessionElapsed = Math.floor((now - sessionStartTime) / 1000);
          // Calculate total: base time + current session time
          const totalWorkingSeconds = Math.max(0, baseWorkingSeconds + currentSessionElapsed);

          const hours = Math.floor(totalWorkingSeconds / 3600);
          const minutes = Math.floor((totalWorkingSeconds % 3600) / 60);
          const seconds = totalWorkingSeconds % 60;

          const newWorkingTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          setWorkingTime(newWorkingTime);
        }
        // When on break, we don't update the working time - it stays frozen at the value when break started
      };

      // Update immediately
      updateWorkingTime();
      
      // Update every second only if not on break
      if (!todayStatus.data.is_on_break) {
        workingTimeTimer = setInterval(updateWorkingTime, 1000);
      }
    } else if (!todayStatus?.data?.is_clocked_in && workingTime !== '00:00:00') {
      setWorkingTime('00:00:00');
    }
    
    // Cleanup function
    return () => {
      if (workingTimeTimer) {
        clearInterval(workingTimeTimer);
      }
    };
  }, [sessionStartTime, baseWorkingSeconds, todayStatus]);

  // Get today's leave status
  const { data: todayLeave } = useQuery({
    queryKey: ['leave-status', new Date().toISOString().split('T')[0]],
    queryFn: () => leavesAPI.getAll({
      date: new Date().toISOString().split('T')[0],
      user: user?.id
    }),
    enabled: !!user?.id,
  });

  // Check if user has approved leave today
  const getTodayLeaveStatus = useCallback(() => {
    if (!todayLeave?.data?.results) return null;

    const today = new Date().toISOString().split('T')[0];
    const leave = todayLeave.data.results.find(leave =>
      leave.status === 'approved' &&
      new Date(leave.start_date) <= new Date(today) &&
      new Date(leave.end_date) >= new Date(today)
    );

    return leave || null;
  }, [todayLeave]);

  // Validate shift timing
  const validateShiftTiming = useCallback((action = 'clock-in') => {
    const now = new Date();
    const currentHour = now.getHours();
    const userShift = user?.profile?.shift_time || "10-19";
    const [startHour, endHour] = userShift.split("-").map(Number);

    let isWithinShift = false;
    let shiftMessage = '';

    if (endHour < startHour) {
      // Overnight shift (e.g., 21-6)
      isWithinShift = (currentHour >= startHour && currentHour <= 23) ||
        (currentHour >= 0 && currentHour < endHour);
      shiftMessage = `${startHour}:00 - ${endHour}:00 (next day)`;
    } else {
      // Regular shift (e.g., 10-19)
      isWithinShift = currentHour >= startHour && currentHour < endHour;
      shiftMessage = `${startHour}:00 - ${endHour}:00`;
    }

    return { isWithinShift, shiftMessage, startHour, endHour };
  }, [user]);

  // Validate leave restrictions
  const validateLeaveRestrictions = useCallback((action = 'clock-in') => {
    const leave = getTodayLeaveStatus();
    if (!leave) return { isAllowed: true, message: '' };

    const now = new Date();
    const currentHour = now.getHours();

    switch (leave.leave_type) {
      case 'full':
        return {
          isAllowed: false,
          message: `Cannot ${action} on full day leave`
        };

      case 'first_half':
        // First half is 10 AM - 3 PM, can only work after 2 PM
        if (action === 'clock-in' && currentHour < 14) {
          return {
            isAllowed: false,
            message: `Cannot clock-in during first half leave period (10 AM - 3 PM)`
          };
        }
        break;

      case 'second_half':
        // Second half is 2 PM - 7 PM, can only work between 10 AM - 3 PM
        if (action === 'clock-in' && !(currentHour >= 10 && currentHour < 15)) {
          return {
            isAllowed: false,
            message: `For second half leave, you can only work between 10 AM - 3 PM`
          };
        }
        if (action === 'clock-out' && currentHour >= 15) {
          return {
            isAllowed: false,
            message: `For second half leave, you must clock out by 3 PM`
          };
        }
        break;
    }

    return { isAllowed: true, message: '' };
  }, [getTodayLeaveStatus]);

  // Clock In Mutation
  const clockInMutation = useMutation({
    mutationFn: attendanceAPI.clockIn,
    onMutate: () => setIsClockingIn(true),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      
      // Add a small delay to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 750));
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['attendance-status'] });
      queryClient.refetchQueries({ queryKey: ['attendance'] });
      
      toast.success('Clocked in successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    },
    onSettled: () => setIsClockingIn(false),
  });

  // Clock Out Mutation
  const clockOutMutation = useMutation({
    mutationFn: attendanceAPI.clockOut,
    onMutate: () => setIsClockingOut(true),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      
      // Add a small delay to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 750));
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['attendance-status'] });
      queryClient.refetchQueries({ queryKey: ['attendance'] });
      
      toast.success('Clocked out successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    },
    onSettled: () => setIsClockingOut(false),
  });

  // Break Mutation
  const breakMutation = useMutation({
    mutationFn: (action) => attendanceAPI.break({
      action,
      device_fingerprint: deviceFingerprint,
      timestamp: new Date().toISOString()
    }),
    onMutate: () => setIsClockingIn(true),
    onSuccess: async (response) => {
      const action = response.data.action;

      // Refresh attendance status to get updated server state
      queryClient.invalidateQueries({ queryKey: ['attendance-status'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      
      // Add a small delay to ensure backend processing is complete
      await new Promise(resolve => setTimeout(resolve, 750));
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['attendance-status'] });
      queryClient.refetchQueries({ queryKey: ['attendance'] });

      // Don't set local state - let server response drive the UI
      if (action === 'end') {
        toast.success('Break ended, back to work!');
      } else {
        toast.success('Break started');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update break status');
    },
    onSettled: () => setIsClockingIn(false),
  });

  const handleClockIn = async () => {
    // Mobile device check
    if (isMobileDevice) {
      await showMobileBlockedDialog();
      return;
    }

    // Shift timing validation
    const shiftValidation = validateShiftTiming('clock-in');
    if (!shiftValidation.isWithinShift) {
      toast.error(`Clock-in is only allowed during shift hours (${shiftValidation.shiftMessage})`);
      return;
    }

    // Leave restrictions validation
    const leaveValidation = validateLeaveRestrictions('clock-in');
    if (!leaveValidation.isAllowed) {
      toast.error(leaveValidation.message);
      return;
    }

    clockInMutation.mutate({
      device_fingerprint: deviceFingerprint,
      timestamp: new Date().toISOString()
    });
  };

  const handleClockOut = async () => {
    // Mobile device check
    if (isMobileDevice) {
      await showMobileBlockedDialog();
      return;
    }

    // Leave restrictions validation
    const leaveValidation = validateLeaveRestrictions('clock-out');
    if (!leaveValidation.isAllowed) {
      toast.error(leaveValidation.message);
      return;
    }

    try {
      const confirmed = await showClockOutConfirmDialog();
      if (confirmed) {
        clockOutMutation.mutate({
          device_fingerprint: deviceFingerprint,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error showing clock out confirmation dialog:', error);
      // Fallback: proceed with clock out even if dialog fails
      clockOutMutation.mutate({
        device_fingerprint: deviceFingerprint,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleBreak = async () => {
    // Mobile device check
    if (isMobileDevice) {
      await showMobileBlockedDialog();
      return;
    }

    const action = status.is_on_break ? 'end' : 'start';
    
    try {
      const confirmed = await showBreakConfirmDialog(action);
      
      if (confirmed) {
        breakMutation.mutate(action);
      }
    } catch (error) {
      console.error('Error showing break confirmation dialog:', error);
      // Fallback: proceed with the action even if dialog fails
      breakMutation.mutate(action);
    }
  };

  if (isLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const attendanceList = attendance?.data?.results || [];
  const status = todayStatus?.data || {};
  const isCurrentlyClocked = status.is_clocked_in || false; // Use server state only
  const currentLeave = getTodayLeaveStatus();

  // Calculate stats
  const presentToday = status.present_today || 0;
  const absentToday = status.absent_today || 0;
  const userShift = status.shift_time || user?.profile?.shift_time || "10-19";

  const getShiftDisplay = (shift) => {
    switch (shift) {
      case "10-19": return "10 AM - 7 PM";
      case "21-6": return "9 PM - 6 AM";
      default: return "10 AM - 7 PM";
    }
  };

  // Get current status for display
  const getCurrentStatus = () => {
    if (isMobileDevice) {
      return { text: 'Mobile Blocked', color: 'text-red-600', bgColor: 'bg-red-100', icon: Smartphone };
    }

    if (currentLeave?.leave_type === 'full') {
      return { text: 'On Leave', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Calendar };
    }

    // Use server data for break status
    if (status.is_on_break) {
      return { text: 'On Break', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Pause };
    }

    if (isCurrentlyClocked) {
      return { text: 'Working', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
    }

    return { text: 'Offline', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock };
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="space-y-6">
      {/* Leave and Shift Information */}
      {(currentLeave || isMobileDevice) && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentLeave ? 'bg-orange-100' : 'bg-red-100'
              }`}>
              {currentLeave ? (
                <Calendar className="h-5 w-5 text-orange-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              {currentLeave && (
                <div>
                  <h6 className="font-medium text-gray-900 mb-1">
                    {currentLeave.leave_type === 'full' ? 'Full Day Leave' :
                      currentLeave.leave_type === 'first_half' ? 'First Half Leave (10 AM - 3 PM)' :
                        'Second Half Leave (2 PM - 7 PM)'}
                  </h6>
                  <p className="text-sm text-gray-600 mb-2">{currentLeave.reason}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${currentLeave.status === 'approved' ? 'bg-green-100 text-green-800' :
                        currentLeave.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                      }`}>
                      {currentLeave.status.charAt(0).toUpperCase() + currentLeave.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(currentLeave.start_date).toLocaleDateString()} - {new Date(currentLeave.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  {currentLeave.leave_type !== 'full' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      <strong>Work Hours:</strong> {
                        currentLeave.leave_type === 'first_half'
                          ? 'You can work after 2:00 PM today'
                          : 'You can work from 10:00 AM to 3:00 PM today'
                      }
                    </div>
                  )}
                </div>
              )}
              {isMobileDevice && !currentLeave && (
                <div>
                  <h6 className="font-medium text-red-900 mb-1">Mobile Device Detected</h6>
                  <p className="text-sm text-red-600 mb-2">
                    For security reasons, attendance marking is restricted to desktop computers only.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <Monitor className="h-3 w-3" />
                    Please use a desktop or laptop computer to mark attendance
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && todayStatus?.data && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h6 className="font-medium text-gray-900 mb-2">Debug Info (Dev Only)</h6>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-medium">Is Clocked In:</span> {status.is_clocked_in ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Session Start:</span> {
                status.current_session_start
                  ? new Date(status.current_session_start).toLocaleTimeString()
                  : 'None'
              }
            </div>
            <div>
              <span className="font-medium">Working Seconds:</span> {status.total_working_seconds || 0}
            </div>
            <div>
              <span className="font-medium">Break Seconds:</span> {status.total_break_seconds || 0}
            </div>
            <div>
              <span className="font-medium">Sessions:</span> {status.session_count || 0}
            </div>
            <div>
              <span className="font-medium">Last Refresh:</span> {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Cards with Real-time Updates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Present Today</h6>
              <h4 className="text-2xl font-bold text-green-600">{presentToday}</h4>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Absent Today</h6>
              <h4 className="text-2xl font-bold text-red-600">{absentToday}</h4>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Your Shift</h6>
              <h5 className="text-lg font-bold text-blue-600">{getShiftDisplay(userShift)}</h5>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Status</h6>
              <h6 className={`font-bold ${currentStatus.color}`}>
                {currentStatus.text}
              </h6>
              <small className="text-gray-500">
                {isCurrentlyClocked && !status.is_on_break ? workingTime :
                  status.is_on_break ? 'Taking a break' :
                    currentLeave ? `${currentLeave.leave_type.replace('_', ' ')} leave` :
                      isMobileDevice ? 'Use desktop to clock in' :
                        'Ready to start'}
              </small>
              {/* Subtle last update indicator */}
              <div className="text-xs text-gray-400 mt-1">
                Updated: {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {currentLeave && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    {currentLeave.leave_type.replace('_', ' ')} leave
                  </span>
                </div>
              )}
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStatus.bgColor}`}>
              <currentStatus.icon className={`h-5 w-5 ${currentStatus.color}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Clock and Working Time */}
      {isCurrentlyClocked && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Current Time</div>
                <div className="text-2xl font-mono font-bold text-gray-900">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour12: true,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600">Working Time</div>
                <div className="text-2xl font-mono font-bold text-green-600">
                  {workingTime}
                </div>
              </div>
              {status.is_on_break && (
                <>
                  <div className="h-8 w-px bg-gray-300"></div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">On Break</div>
                    <div className="text-lg font-medium text-yellow-600 flex items-center gap-1">
                      <Pause className="h-4 w-4" />
                      Break Time
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Clocked in at: {
                  status.current_session_start
                    ? new Date(status.current_session_start).toLocaleTimeString('en-US', { hour12: true })
                    : status.first_clock_in
                      ? new Date(status.first_clock_in).toLocaleTimeString('en-US', { hour12: true })
                      : 'N/A'
                }
              </div>
              <div className="text-xs text-gray-500">
                Shift: {getShiftDisplay(userShift)}
              </div>
              {status.session_count > 1 && (
                <div className="text-xs text-gray-500">
                  Session {status.session_count} of the day
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Controls & Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Warning */}
              {isMobileDevice && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <Smartphone className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-700 font-medium">
                    Attendance is only available on desktop computers for security
                  </span>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              {!isMobileDevice && (
                <div className="flex items-center gap-3">
                  {/* Clock In Button */}
                  {!isCurrentlyClocked && (
                    <button
                      onClick={handleClockIn}
                      disabled={isClockingIn || currentLeave?.leave_type === 'full'}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title={currentLeave?.leave_type === 'full' ? 'Cannot clock in on full day leave' : 'Clock in to start your day'}
                    >
                      <LogIn className="h-5 w-5" />
                      <div className="text-left">
                        <small className="text-green-100">Start your day</small>
                      </div>
                    </button>
                  )}

                  {/* Break Button */}
                  {isCurrentlyClocked && !status.is_on_break && (
                    <button
                      onClick={handleBreak}
                      disabled={isClockingIn}
                      className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                    >
                      <Pause className="h-5 w-5" />
                      <div className="text-left">
                        <small className="text-yellow-100">Take a rest</small>
                      </div>
                    </button>
                  )}

                  {/* End Break Button */}
                  {isCurrentlyClocked && status.is_on_break && (
                    <button
                      onClick={handleBreak}
                      disabled={isClockingIn}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <div className="text-left">
                        <small className="text-blue-100">Resume work</small>
                      </div>
                    </button>
                  )}

                  {/* Clock Out Button */}
                  {isCurrentlyClocked && (
                    <button
                      onClick={handleClockOut}
                      disabled={isClockingOut}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <div className="text-left">
                        <small className="text-red-100">End your day</small>
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Quick Actions Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Settings className="h-4 w-4" />
                  Actions
                </button>
                {/* Dropdown menu would go here */}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First In</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Break</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceList.length > 0 ? (
                attendanceList.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <small className="text-gray-500">
                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </small>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {record.first_in ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          <LogIn className="h-3 w-3 mr-1" />
                          {new Date(record.first_in).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {record.last_out ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          <LogOut className="h-3 w-3 mr-1" />
                          {new Date(record.last_out).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.sessions?.length || 0}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.total_break_str || '00:00:00'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.total_hours_str || '00:00:00'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${record.sessions?.some(s => s.clock_in && !s.clock_out)
                          ? 'bg-green-100 text-green-800'
                          : record.sessions?.length > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {record.sessions?.some(s => s.clock_in && !s.clock_out)
                          ? 'Active'
                          : record.sessions?.length > 0
                            ? 'Completed'
                            : 'Absent'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleViewAttendance(record)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No attendance records found for the selected date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AttendanceDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        attendanceData={selectedAttendance}
      />
    </div>
  );
};

export default Attendance;
