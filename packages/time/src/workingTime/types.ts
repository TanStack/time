export interface RecurrentWorkingInterval {
  weekdays: Array<number>;
  startTime: string;
  endTime: string;
}

export interface WorkingInterval {
  isWorking: boolean;
  recurrent?: RecurrentWorkingInterval;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

export interface WorkingCalendar {
  id: string;
  label?: string;
  parentId?: string;
  intervals: Array<WorkingInterval>;
}

export interface WorkingTimeRange {
  start: string;
  end: string;
}
