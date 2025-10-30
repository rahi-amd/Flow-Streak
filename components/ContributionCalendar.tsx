import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, spacing } from '../theme';

interface CalendarDay {
  date: string;
  minutes: number;
  level: number;
}

interface ContributionCalendarProps {
  data: CalendarDay[];
}

interface DayCell {
  date: string;
  minutes: number;
  level: number;
  isCurrentMonth: boolean;
  isFutureDate: boolean;
  dayNumber: number;
}

interface DayDetails {
  date: string;
  minutes: number;
  level: number;
  dayName: string;
  formattedDate: string;
  isCurrentMonth: boolean;
}

const screenWidth = Dimensions.get('window').width;

export const ContributionCalendar: React.FC<ContributionCalendarProps> = ({ data }) => {
  const [selectedDay, setSelectedDay] = useState<DayDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Track which month we're viewing (offset from current month)
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month, +1 = next month

  // Check if a date is in the future
  const isFutureDate = (dateString: string): boolean => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateString > todayString;
  };

  // Generate proper calendar grid for a specific month
  const generateMonthGrid = (offset: number): DayCell[][] => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    // Get first and last day of target month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, 6 = Saturday)
    const startDayOfWeek = firstDay.getDay();
    
    // Get previous month info for filling
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthTotalDays = prevMonthLastDay.getDate();
    
    // Create weeks array (each week is an array of 7 days)
    const weeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    
    // Fill first week with previous month days if needed
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevMonthDay = prevMonthTotalDays - startDayOfWeek + i + 1;
      const cellDate = new Date(year, month - 1, prevMonthDay);
      const dateString = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      const dayData = data.find(d => d.date === dateString);
      
      currentWeek.push({
        date: dateString,
        minutes: dayData?.minutes || 0,
        level: dayData?.level || 0,
        isCurrentMonth: false,
        isFutureDate: isFutureDate(dateString),
        dayNumber: prevMonthDay,
      });
    }
    
    // Fill current month days
    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(year, month, day);
      const dateString = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
      const dayData = data.find(d => d.date === dateString);
      
      currentWeek.push({
        date: dateString,
        minutes: dayData?.minutes || 0,
        level: dayData?.level || 0,
        isCurrentMonth: true,
        isFutureDate: isFutureDate(dateString),
        dayNumber: day,
      });
      
      // If week is complete (7 days), start new week
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Fill last week with next month days if needed
    if (currentWeek.length > 0) {
      let nextMonthDay = 1;
      while (currentWeek.length < 7) {
        const cellDate = new Date(year, month + 1, nextMonthDay);
        const dateString = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
        const dayData = data.find(d => d.date === dateString);
        
        currentWeek.push({
          date: dateString,
          minutes: dayData?.minutes || 0,
          level: dayData?.level || 0,
          isCurrentMonth: false,
          isFutureDate: isFutureDate(dateString),
          dayNumber: nextMonthDay,
        });
        
        nextMonthDay++;
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // Get color based on activity level
  const getColorForLevel = (level: number, isCurrentMonth: boolean, isFuture: boolean): string => {
    // Future dates are always grey
    if (isFuture) {
      return colors.light.calendarEmpty;
    }
    
    // Other month dates are grey
    if (!isCurrentMonth) {
      return colors.light.calendarEmpty;
    }
    
    // Current month past/today dates show activity colors
    switch (level) {
      case 0: return colors.light.calendarEmpty;
      case 1: return colors.light.calendarLevel1;
      case 2: return colors.light.calendarLevel2;
      case 3: return colors.light.calendarLevel3;
      case 4: return colors.light.calendarLevel4;
      default: return colors.light.calendarEmpty;
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Get day name
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle day tap
  const handleDayPress = (day: DayCell) => {
    setSelectedDay({
      date: day.date,
      minutes: day.minutes,
      level: day.level,
      dayName: getDayName(day.date),
      formattedDate: formatDate(day.date),
      isCurrentMonth: day.isCurrentMonth,
    });
    setModalVisible(true);
  };

  // Get displayed month name
  const getDisplayedMonthYear = (): string => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return targetDate.toLocaleDateString('en-US', options);
  };

  // Calculate sessions count
  const getSessionsCount = (minutes: number): number => {
    return Math.ceil(minutes / 25);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (monthOffset > -12) {
      setMonthOffset(monthOffset - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (monthOffset < 12) {
      setMonthOffset(monthOffset + 1);
    }
  };

  // Swipe gesture for month navigation
  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      // Swipe left = next month
      if (event.velocityX < -500 && monthOffset < 12) {
        setMonthOffset(monthOffset + 1);
      }
      // Swipe right = previous month
      else if (event.velocityX > 500 && monthOffset > -12) {
        setMonthOffset(monthOffset - 1);
      }
    });

  const weeks = generateMonthGrid(monthOffset);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Month Header with Navigation */}
      <View style={styles.monthHeaderContainer}>
        <TouchableOpacity 
          onPress={goToPreviousMonth}
          disabled={monthOffset <= -12}
          style={[styles.navButton, monthOffset <= -12 && styles.navButtonDisabled]}
        >
          <Text style={[styles.navButtonText, monthOffset <= -12 && styles.navButtonTextDisabled]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.monthHeader}>{getDisplayedMonthYear()}</Text>

        <TouchableOpacity 
          onPress={goToNextMonth}
          disabled={monthOffset >= 12}
          style={[styles.navButton, monthOffset >= 12 && styles.navButtonDisabled]}
        >
          <Text style={[styles.navButtonText, monthOffset >= 12 && styles.navButtonTextDisabled]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day Labels Row */}
      <View style={styles.dayLabelsRow}>
        {dayLabels.map((label, index) => (
          <View key={index} style={styles.dayLabelCell}>
            <Text style={styles.dayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid with Swipe Gesture */}
      <GestureDetector gesture={swipeGesture}>
        <View style={styles.calendarGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((day, dayIndex) => (
                <TouchableOpacity
                  key={`${weekIndex}-${dayIndex}`}
                  style={[
                    styles.dayCell,
                    { 
                      backgroundColor: getColorForLevel(day.level, day.isCurrentMonth, day.isFutureDate),
                      opacity: (!day.isCurrentMonth || day.isFutureDate) ? 0.35 : 1,
                    }
                  ]}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dayNumber,
                    { opacity: (!day.isCurrentMonth || day.isFutureDate) ? 0.5 : 1 }
                  ]}>
                    {day.dayNumber}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </GestureDetector>

  

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.legendSquare,
              { backgroundColor: getColorForLevel(level, true, false) }
            ]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>

      {/* Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {selectedDay && (
              <>
                <Text style={styles.modalTitle}>{selectedDay.dayName}</Text>
                <Text style={styles.modalDate}>{selectedDay.formattedDate}</Text>
                
                {!selectedDay.isCurrentMonth && (
                  <Text style={styles.otherMonthText}>
                    (Different month)
                  </Text>
                )}
                
                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>
                      {selectedDay.minutes}
                    </Text>
                    <Text style={styles.modalStatLabel}>minutes</Text>
                  </View>
                  
                  <View style={styles.modalDivider} />
                  
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatValue}>
                      {getSessionsCount(selectedDay.minutes)}
                    </Text>
                    <Text style={styles.modalStatLabel}>sessions</Text>
                  </View>
                </View>

                {selectedDay.minutes === 0 && (
                  <Text style={styles.noActivityText}>
                    No activity on this day
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  monthHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
    flex: 1,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.light.primaryLight,
  },
  navButtonDisabled: {
    backgroundColor: colors.light.surface,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.primary,
  },
  navButtonTextDisabled: {
    color: colors.light.textSecondary,
    opacity: 0.3,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  dayLabelCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  calendarGrid: {
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  swipeHint: {
    fontSize: 11,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginHorizontal: 4,
  },
  legendSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  modalDate: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
  },
  otherMonthText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  modalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalStatItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: spacing.xs,
  },
  modalStatLabel: {
    fontSize: 12,
    color: colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.light.border,
  },
  noActivityText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  closeButton: {
    backgroundColor: colors.light.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    minWidth: 120,
    marginTop: spacing.sm,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});