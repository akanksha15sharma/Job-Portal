export const notificationEvent = 'job-portal-notification';
export function notify(message, type = 'success') {
  window.dispatchEvent(new CustomEvent(notificationEvent, { detail: { message, type } }));
}

export function getActionMessage(action, current, id, details = {}) {
  switch (action) {
    case 'save': return current.saved.includes(id) ? 'Job removed from your shortlist.' : 'Job saved to your shortlist.';
    case 'remove-saved': return 'Job removed from your shortlist.';
    case 'clear-saved': return 'Saved jobs cleared. Applications are unchanged.';
    case 'apply': return current.applied.includes(id) ? 'This application is already in your tracker.' : 'Demo application recorded. Follow it in Applications.';
    case 'remove-application': return 'Application removed. Saved jobs are unchanged.';
    case 'update-application': return details.status ? `Application moved to ${details.status}.` : 'Application notes saved.';
    default: return 'Changes saved.';
  }
}
