// Made with ♥️ by TheDanniCraft

import * as http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url'; // Import URL constructor

/**
 * @class Wiresense
 * @classdesc A class to create a sensor and send its data to a WebSocket server.
 */
export class Wiresense {
    static sensors: Wiresense[] = [];
    static server: http.Server | null = null;
    static wss: WebSocketServer | null = null;
    static configured: boolean = false;

    /**
     * Configures the Wiresense library with the specified options.
     * @param {Object} options - Configuration options.
     * @param {number} options.port - The port for the web server and WebSocket server.
     */
    static config(options: { port: number }) {
        if (!Wiresense.server) {
            Wiresense.server = http.createServer((req, res) => {
                const parsedUrl = new URL(req.url || '', `http://localhost:${options.port}`);
                const urlParts = parsedUrl.pathname.split('/');
                if (urlParts.length === 3 && urlParts[2] === 'data.csv') {
                    const encodedSensorKey = urlParts[1];
                    const sensorKey = decodeURIComponent(encodedSensorKey);
                    const sensor = Wiresense.sensors.find(s => s.name === sensorKey);
                    if (sensor) {
                        fs.readFile(sensor.csvFilePath, (err, data) => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Internal Server Error\n');
                            } else {
                                res.writeHead(200, {
                                    'Content-Type': 'text/csv',
                                    'Content-Disposition': `attachment; filename=${path.basename(sensor.csvFilePath || '')}`
                                });
                                res.end(data);
                            }
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Sensor not found\n');
                    }
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found\n');
                }
            });

            Wiresense.wss = new WebSocketServer({ server: Wiresense.server });

            Wiresense.wss.on('connection', (ws) => {
                console.log('Client connected');
            });

            Wiresense.server.listen(options.port, () => {
                console.log(`Server started on port ${options.port}`);
            });

            Wiresense.configured = true;
        }
    }

    name: string;
    execFunction: () => Record<string, any>;
    csvFilePath: string;

    /**
     * Initializes the Wiresense instance.
     * @param {string} name - The name/key of the sensor.
     * @param {Function} execFunction - The function that reads the sensor value and returns an object with key-value pairs.
     * @param {string} baseCsvFilePath - The base file path (without extension) for logging sensor data in CSV format.
     */
    constructor(name: string, execFunction: () => Record<string, any>, baseCsvFilePath: string) {
        if (!Wiresense.configured) {
            throw new Error('Wiresense is not configured. Call config() before creating instances.');
        }

        const existingSensor = Wiresense.sensors.find(sensor => sensor.name === name);
        if (existingSensor) {
            throw new Error(`Sensor with key "${name}" already exists.`);
        }

        this.name = name;
        this.execFunction = execFunction;

        const baseName = path.basename(baseCsvFilePath, path.extname(baseCsvFilePath));
        const dirName = path.dirname(baseCsvFilePath);
        this.csvFilePath = path.join(dirName, `${baseName}_${Date.now()}.csv`);

        Wiresense.sensors.push(this);

        const headers = ['timestamp', ...Object.keys(execFunction())].join(',');
        fs.writeFileSync(this.csvFilePath, `${headers}\n`);
    }

    /**
     * Runs the sensor's read function and sends the data to the WebSocket server.
     * Also logs the data to the specified CSV file.
     */
    execute() {
        if (!Wiresense.configured) {
            throw new Error('Wiresense is not configured. Call config() before executing.');
        }

        if (!Wiresense.wss) {
            throw new Error('WebSocket server is not defined.');
        }

        const data = this.execFunction();
        const timestamp = Date.now();
        const payload = {
            key: this.name,
            data: data
        };

        const values = [timestamp, ...Object.values(data)].join(',');
        fs.appendFileSync(this.csvFilePath, `${values}\n`);

        if (Wiresense.wss) {
            Wiresense.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(payload));
                }
            });
        }
    }
}
