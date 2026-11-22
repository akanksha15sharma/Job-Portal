import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { notificationEvent } from '@/lib/notifications';

const ToastNotifications = () => {
  const [toasts, setToasts] = useState([]);
  const sequence = useRef(0);
  const timers = useRef(new Map());
  useEffect(() => {
    const activeTimers = timers.current;
    const onNotification = ({ detail }) => {
      if (!detail || typeof detail.message !== 'string') return;
      const id = ++sequence.current;
      setToasts((current) => [...current.slice(-2), { id, ...detail }]);
      activeTimers.set(id, window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        activeTimers.delete(id);
      }, 7000));
    };
    window.addEventListener(notificationEvent, onNotification);
    return () => {
      window.removeEventListener(notificationEvent, onNotification);
      activeTimers.forEach(window.clearTimeout);
      activeTimers.clear();
    };
  }, []);
  return <div aria-label="Notifications" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:left-auto sm:w-96">
    <div role="status" aria-live="polite" aria-atomic="false" className="space-y-3">{toasts.map(({ id, message, type }) => <div key={id} className="toast pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl"><span className="mt-0.5 shrink-0 text-primary">{type === 'error' ? <CircleAlert aria-hidden="true" className="size-5" /> : <CheckCircle2 aria-hidden="true" className="size-5" />}</span><p className="flex-1 text-sm leading-6">{message}</p><button type="button" aria-label="Dismiss notification" onClick={() => { window.clearTimeout(timers.current.get(id)); timers.current.delete(id); setToasts((current) => current.filter((toast) => toast.id !== id)); }} className="-mr-1 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-accent"><X aria-hidden="true" className="size-4" /></button></div>)}</div>
  </div>;
};
export default ToastNotifications;
