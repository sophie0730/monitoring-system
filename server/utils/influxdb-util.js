import { findUp } from 'find-up';
import dotenv from 'dotenv';
import moment from 'moment';

const dotenvPath = await findUp('.env');
dotenv.config({ path: dotenvPath });

export const {
  INFLUXDB_URL, ORG, BUCKET, MEASUREMENT, ALERT_MEASUREMENT, TOKEN,
} = process.env;
export const WRITE_API_URL = `${process.env.INFLUXDB_URL}/api/v2/write?org=${process.env.ORG}&bucket=${process.env.BUCKET}&precision=ns`;
export const DB_START_DATE = moment('17/NOV/2023T20:00:00', 'DD/MMM/YYYYTHH:mm:ss').unix() * 1e6;
