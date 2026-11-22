import { createContext, useContext } from 'react';
export const JobAlertsContext = createContext(null);
export function useJobAlerts() {
  const context = useContext(JobAlertsContext);
  if (!context) throw new Error('useJobAlerts must be used inside JobAlertsProvider');
  return context;
}
