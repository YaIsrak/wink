'use client';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return 'denied';
}

export function showBrowserNotification(
  title: string,
  options?: NotificationOptions & { onClickUrl?: string }
) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options?.onClickUrl) {
        window.location.href = options.onClickUrl;
      }
    };
  } catch (err) {
    console.error('Failed to trigger browser notification:', err);
  }
}
