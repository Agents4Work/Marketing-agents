# Important Server Configuration Guide

## How the Application Works

This application uses a specific configuration that must be maintained to work properly in Replit:

1. **Server Implementation**: The application runs using the standard Express + TypeScript backend defined in `server/index.ts`

2. **Workflow Configuration**: The Replit workflow named "Start application" runs `npm run dev` which executes this command from package.json

3. **Port Configuration**: The server MUST run on port 5000 as this is what Replit expects

## ⚠️ Important: Avoiding Common Problems

To prevent the application from breaking:

1. **DO NOT** modify the workflow configuration 

2. **DO NOT** change the server port from 5000

3. **DO NOT** delete or modify the following critical files:
   - `server/index.ts` (main server file)
   - `package.json` (contains the npm scripts)
   - `.replit` (workflow configuration)

4. **DO NOT** use any scripts that kill processes on port 5000, as this will terminate your running application

## If You Need to Restart the Server

If the application stops working:

1. Use the Replit workflow restart button to restart the "Start application" workflow

2. Alternately, in the Replit Shell, run: `npm run dev`

3. Check for errors in the console logs

## Understanding Multiple Server Files

This project contains multiple server implementation files created during development:
- Various files like `unified-server.js`, `simple-server.js`, etc. were experimental implementations
- The ONLY file that matters for the running application is `server/index.ts`
- Other server files can be safely ignored (but don't delete them without testing)

## If the Application Shows a Blank Screen

1. Check if the server is running on port 5000
2. Check for JavaScript errors in the browser console
3. Restart the workflow as described above
4. If problems persist, revert any recent changes to server configuration files

Remember: In Replit, always use the configured workflow instead of manually running server scripts!