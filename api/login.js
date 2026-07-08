/**
 * ShiftPvP Admin Console Backend - Authentication Endpoint
 * POST /api/login
 * Validates admin credentials against hardcoded records inside data/admins.json.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
    // Enforce restrictive CORS and configuration policies
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, message: 'HTTP Execution Method Not Allowed.' });
        return;
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ success: false, message: 'Missing structural validation fields: username and password required.' });
            return;
        }

        // Construct absolute reference point targeting localized file storage bounds safely
        const dataPath = join(process.cwd(), 'data', 'admins.json');
        let adminsData;
        
        try {
            const fileContents = readFileSync(dataPath, 'utf8');
            adminsData = JSON.parse(fileContents);
        } catch (fileErr) {
            console.error("[Authentication Core Failure] Could not load local admin database profiles:", fileErr);
            res.status(500).json({ success: false, message: 'Internal Server Storage Configuration Fault.' });
            return;
        }

        const operatorsList = adminsData.admins || [];
        
        // Locate matching operator credentials explicitly mapping to structured rows
        const matchedOperator = operatorsList.find(op => 
            op.username.toLowerCase() === username.toLowerCase().trim()
        );

        if (!matchedOperator) {
            res.status(401).json({ success: false, message: 'Invalid operator identity credentials specified.' });
            return;
        }

        // Enforce plain text credential match verification checks against administrative access status logs
        if (matchedOperator.password !== password) {
            res.status(401).json({ success: false, message: 'Invalid operator identity credentials specified.' });
            return;
        }

        if (matchedOperator.status !== 'active') {
            res.status(403).json({ success: false, message: 'Operator identity matching record is systematically suspended.' });
            return;
        }

        // Drop passwords from internal network responses before forwarding upstream or across views
        const secureUserRecord = {
            username: matchedOperator.username,
            displayName: matchedOperator.displayName,
            role: matchedOperator.role
        };

        res.status(200).json({
            success: true,
            authenticated: true,
            user: secureUserRecord
        });

    } catch (globalError) {
        console.error("[Authentication Operational Pipeline Exception Raised]:", globalError);
        res.status(500).json({ success: false, message: 'Global runtime verification sub-loop exception thrown.' });
    }
}
