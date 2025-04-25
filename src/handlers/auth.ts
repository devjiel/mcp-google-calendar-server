import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_PATH = path.join(__dirname, '../token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

/**
 * Authorize the client with Google Calendar API
 * @param credentials OAuth2 credentials
 * @param callback Function to call after authorization
 */
export function authorize(credentials: any, callback: (auth: any) => void) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Vérifie si un token existe déjà
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        callback(oAuth2Client);
    });
}

/**
 * Get and store a new access token after prompting for user authorization
 * @param oAuth2Client The OAuth2 client to get token for
 * @param callback The callback to call with the authorized client
 */
function getAccessToken(oAuth2Client: any, callback: (auth: any) => void) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Autorise cette application en visitant ce lien :', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Entre le code obtenu après autorisation : ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err: any, token: any) => {
            if (err) return console.error('Erreur lors de la récupération du token :', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stocké dans', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Load client credentials from file and authorize
 * @param callback Function to call after authorization
 * @returns Promise that resolves with the callback result
 */
export function loadAndAuthorize<T>(callback: (auth: any) => T | Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        fs.readFile(CREDENTIALS_PATH, (err, content) => {
            if (err) {
                console.error('Erreur lors du chargement des identifiants :', err);
                return reject(err);
            }
            
            const doAuth = (auth: any) => {
                try {
                    const result = callback(auth);
                    if (result instanceof Promise) {
                        result.then(resolve).catch(reject);
                    } else {
                        resolve(result);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            authorize(JSON.parse(content.toString()), doAuth);
        });
    });
}
