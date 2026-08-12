import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { LanguageSelector } from '../components/layout/LanguageSelector';
import { HealthcareSafetyNotice } from '../components/common/HealthcareSafetyNotice';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { Settings, Globe, Wifi, Shield, RefreshCw, HardDrive, Zap, Database, Smartphone, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useNotification();
  const { user } = useAuth();

  const [offlineSyncInterval, setOfflineSyncInterval] = useState('15');
  const [autoSyncOnConnect, setAutoSyncOnConnect] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(true);
  const [compressImages, setCompressImages] = useState(true);
  const [voiceGuidance, setVoiceGuidance] = useState(true);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              System Configuration
            </span>
            <span className="text-xs text-slate-500">• Rural Health Sub-Centre</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Preferences & Offline Sync</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage rural clinic connectivity modes, offline data storage, multi-lingual voice options, and health worker credentials.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<CheckCircle2 className="w-4 h-4" />}
          onClick={() =>
            addToast({
              title: 'Settings Saved',
              message: 'Local clinic preferences updated successfully.',
              type: 'success',
            })
          }
          className="bg-teal-700 hover:bg-teal-800 text-white font-bold shrink-0"
        >
          Save All Preferences
        </Button>
      </div>

      <HealthcareSafetyNotice compact />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language & Regional Settings */}
        <Card variant="default">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-teal-700" /> Regional & Language Preferences
            </CardTitle>
            <CardDescription className="text-xs">
              Select primary language dialect for health worker intake forms and AI translation.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-bold text-slate-900">Current Interface Dialect</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports English, Hindi, Bengali, Tamil, Telugu, and Marathi.
                </p>
              </div>
              <LanguageSelector />
            </div>

            <Checkbox
              label="Enable voice navigation & audio prompt readout"
              checked={voiceGuidance}
              onChange={(e) => setVoiceGuidance(e.target.checked)}
            />
          </CardContent>
        </Card>

        {/* Low-Bandwidth & 2G/3G Optimization */}
        {/* <Card variant="default">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-amber-600" /> Low-Bandwidth & Rural Data Saver
            </CardTitle>
            <CardDescription className="text-xs">
              Optimizations for Sub-Health Centres with unstable 2G/3G cellular links.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-950 block">Low-Bandwidth Mode Active</span>
                <p className="text-[11px] text-amber-800">
                  Defer heavy image syncs and compress telemetry payloads before transmission.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={lowBandwidthMode}
                  onChange={(e) => setLowBandwidthMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>

            <Checkbox
              label="Automatically compress medical document scans & photo attachments (saves 80% bandwidth)"
              checked={compressImages}
              onChange={(e) => setCompressImages(e.target.checked)}
            />
          </CardContent>
        </Card> */}

        {/* Offline Cache & Local Storage */}
        <Card variant="default">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-sky-700" /> Rural Offline Sync & Caching
            </CardTitle>
            <CardDescription className="text-xs">
              Manage local database queue and auto-synchronization rules.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <Checkbox
              label="Automatically sync queued records when satellite or cellular connection returns"
              checked={autoSyncOnConnect}
              onChange={(e) => setAutoSyncOnConnect(e.target.checked)}
            />

            <Select
              label="Background Sync Interval"
              value={offlineSyncInterval}
              onChange={(e) => setOfflineSyncInterval(e.target.value)}
              options={[
                { value: '5', label: 'Every 5 minutes' },
                { value: '15', label: 'Every 15 minutes (Recommended)' },
                { value: '30', label: 'Every 30 minutes' },
                { value: 'manual', label: 'Manual Sync Only' },
              ]}
            />

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-slate-500" /> Tablet Storage Cache
                </span>
                <span className="font-mono text-slate-600 font-bold">1.4 MB / 50 MB Used</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full w-[3%] rounded-full"></div>
              </div>
              <p className="text-[11px] text-slate-500">28 encrypted patient records cached locally.</p>
            </div>
          </CardContent>
        </Card>

        {/* User Profile & Centre Station Info */}
        <Card variant="default">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-indigo-700" /> Station & Health Worker Credentials
            </CardTitle>
            <CardDescription className="text-xs">
              Assigned healthcare station and digital signature certificate.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active User:</span>
                <strong className="text-slate-900">{user?.name || 'Anita Sharma'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role:</span>
                <Badge variant="info">{user?.role || 'HEALTH_WORKER'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Assigned Facility:</span>
                <strong className="text-teal-800">{user?.centerName || 'Sub-Health Centre Rampur'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">District Hub Link:</span>
                <span className="text-slate-700 font-medium">Surguja District Telemedicine Unit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
