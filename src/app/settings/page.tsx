'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/src/components/common/ThemeToggle';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  requestNotificationPermission,
} from '@/src/hooks/useReminders';
import { NotificationPreferences } from '@/src/lib/types';
import { TikkuChat } from '@/src/components/ai/TikkuChat';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    getNotificationPreferences()
  );
  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    saveNotificationPreferences(updated);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
    } else {
      setPermissionStatus('denied');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your preferences and account settings
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders for your tasks
                    </p>
                  </div>
                  <Checkbox
                    checked={preferences.enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('enabled', checked === true)
                    }
                  />
                </div>

                {preferences.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Browser Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Show desktop notifications
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {permissionStatus === 'default' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRequestPermission}
                          >
                            Request Permission
                          </Button>
                        )}
                        {permissionStatus === 'denied' && (
                          <span className="text-xs text-muted-foreground">
                            Permission denied
                          </span>
                        )}
                        {permissionStatus === 'granted' && (
                          <span className="text-xs text-green-600">Granted</span>
                        )}
                        <Checkbox
                          checked={preferences.browser}
                          disabled={permissionStatus !== 'granted'}
                          onCheckedChange={(checked) =>
                            handlePreferenceChange('browser', checked === true)
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sound</p>
                        <p className="text-sm text-muted-foreground">
                          Play sound when notification appears
                        </p>
                      </div>
                      <Checkbox
                        checked={preferences.sound}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange('sound', checked === true)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Desktop Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Show notifications on your desktop
                        </p>
                      </div>
                      <Checkbox
                        checked={preferences.desktop}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange('desktop', checked === true)
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <p className="text-sm text-muted-foreground">user@example.com</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Permanently delete your account and all of your data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TikkuChat />
    </div>
  );
}

