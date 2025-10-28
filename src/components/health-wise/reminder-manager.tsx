"use client";

import { useEffect } from 'react';

type Reminder = {
  symptom: string;
  advice: string;
  lastShown: number;
};

const REMINDER_KEY = 'healthwise-reminder';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const showNotification = (reminder: Reminder) => {
  const notification = new Notification(`Daily Health Check-in: ${reminder.symptom}`, {
    body: `Time for your daily check-in. Remember: ${reminder.advice}. How are you feeling today?`,
    tag: REMINDER_KEY,
    renotify: true,
    actions: [
      { action: 'better', title: 'Feeling Better' },
      { action: 'same', title: 'Feeling the Same' },
      { action: 'worse', title: 'Feeling Worse' },
    ],
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  notification.onclose = () => {
    // This event can be used if needed
  };

  (notification as any).addEventListener('notificationclick', (event: any) => {
    const action = event.action;
    let followUpText = '';

    if (action === 'worse') {
      followUpText = `I'm sorry to hear you're feeling worse. It might be a good idea to consult a healthcare professional.`;
    } else if (action === 'better') {
      followUpText = `Great to hear you're feeling better! Keep up the good work.`;
    } else if (action === 'same') {
       followUpText = `Thanks for checking in. Consistency is key to feeling better.`;
    }

    if (followUpText) {
      setTimeout(() => {
        new Notification('HealthWise Follow-up', {
          body: followUpText,
          tag: 'healthwise-follow-up',
        });
      }, 1000);
    }
  });

};

const ReminderManager = () => {
  useEffect(() => {
    const checkReminder = () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const reminderData = localStorage.getItem(REMINDER_KEY);
        if (reminderData) {
          const reminder: Reminder = JSON.parse(reminderData);
          const now = Date.now();

          if (now - reminder.lastShown > TWENTY_FOUR_HOURS_MS) {
            showNotification(reminder);
            localStorage.setItem(
              REMINDER_KEY,
              JSON.stringify({ ...reminder, lastShown: now })
            );
          }
        }
      }
    };

    // Check immediately on load
    checkReminder();

    // Also check every hour
    const intervalId = setInterval(checkReminder, 60 * 60 * 1000);

    // This is a proxy to know when a reminder is set from another component
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === REMINDER_KEY) {
        checkReminder();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ReminderManager;
