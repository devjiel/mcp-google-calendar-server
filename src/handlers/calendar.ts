import { google } from 'googleapis';
import { loadAndAuthorize } from './auth.js';

/**
 * Lists events for a given time period in the user's primary calendar
 * @param auth Authorized OAuth2 client
 * @param startDate Start date in string format
 * @param endDate End date in string format
 * @returns Promise with events data
 */
export function listEvents(auth: any, startDate: string, endDate: string): Promise<any> {
    const calendar = google.calendar({ version: 'v3', auth });
    const startOfDay = new Date(startDate);
    const endOfDay = new Date(endDate);

    return new Promise((resolve, reject) => {
        calendar.events.list(
            {
                calendarId: 'primary',
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            },
            (err, res) => {
                if (err) {
                    console.error('L\'API a retourné une erreur : ' + err);
                    return reject(err);
                }
                
                const events = res?.data.items || [];
                const formattedEvents = events.map((event) => {
                    const start = event.start?.dateTime || event.start?.date;
                    return { 
                        start, 
                        summary: event.summary, 
                        description: event.description
                    };
                });
                
                resolve(formattedEvents);
            }
        );
    });
}
