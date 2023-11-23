/* eslint-disable no-inner-declarations */
import { alertFile } from '../utils/yml-util.js';
import { fetchAlertStatus } from '../models/alert.js';

export async function showAlerts(req, res) {
  try {
    const { groups } = alertFile;
    const arr = [];

    async function addAlertStatus() {
      // eslint-disable-next-line no-restricted-syntax
      for (const group of groups) {
        // eslint-disable-next-line no-await-in-loop
        const alertStatus = await fetchAlertStatus(group);

        const [groupIsFiring] = alertStatus.filter((status) => status._field === 'isFiring');
        group.groupIsFiring = (groupIsFiring) ? groupIsFiring._value : undefined;

        const [groupStartTime] = alertStatus.filter((status) => status._field === 'startTime');
        group.groupStartTime = (groupStartTime) ? groupStartTime._value : undefined;

        arr.push(group);
      }
    }

    await addAlertStatus();
    console.log(arr);
    res.json(alertFile);
  } catch (error) {
    console.error(error);
  }
}

export default showAlerts;