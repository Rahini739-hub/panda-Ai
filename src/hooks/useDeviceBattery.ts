import { useState, useEffect } from 'react';
import { DeviceBatteryState } from '../types';

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

export function useDeviceBattery(): DeviceBatteryState {
  const [batteryState, setBatteryState] = useState<DeviceBatteryState>({
    supported: false,
    level: 100,
    charging: true,
    lowBatteryNotified: false,
  });

  useEffect(() => {
    let batteryManager: BatteryManager | null = null;

    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };

    if (typeof nav.getBattery === 'function') {
      nav
        .getBattery()
        .then((battery) => {
          batteryManager = battery;

          const updateBattery = () => {
            const levelPercent = Math.round(battery.level * 100);
            setBatteryState((prev) => ({
              supported: true,
              level: levelPercent,
              charging: battery.charging,
              lowBatteryNotified: levelPercent <= 20 && !battery.charging ? prev.lowBatteryNotified : false,
            }));
          };

          updateBattery();

          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingchange', updateBattery);
        })
        .catch(() => {
          setBatteryState((prev) => ({ ...prev, supported: false }));
        });
    } else {
      setBatteryState((prev) => ({ ...prev, supported: false }));
    }

    return () => {
      if (batteryManager) {
        // Cleanup listeners
      }
    };
  }, []);

  return batteryState;
}
