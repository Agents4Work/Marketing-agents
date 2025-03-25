# Important Startup Timing Documentation

## Application Startup Process

This document outlines critical information about the application startup timing in the Replit environment.

### Key Timing Information

1. **Development Mode Initialization: 30-60 seconds**
   - The application running in developer mode requires 30-60 seconds to fully initialize
   - This delay is normal and expected behavior
   - Do NOT attempt to "fix" the initialization time with code changes - this will only cause issues

2. **Vite Connection Process**
   - Vite will show "connecting..." in console logs before it's ready
   - Once "connected" appears, the application will initialize shortly after
   - Connection timing is variable and dependent on Replit's environment

3. **Server vs. Frontend Timing**
   - The Express server starts almost immediately (visible in workflow logs)
   - The React frontend takes significantly longer to initialize
   - Direct API endpoints (non-React) are available before the frontend is ready

## Troubleshooting Notes

1. **When testing changes:**
   - Always wait at least 60 seconds after restarting the workflow
   - Check the console logs for "connected" messages from Vite
   - Verify server is running by checking workflow logs

2. **Do NOT:**
   - Restart workflows repeatedly without waiting for proper initialization
   - Make code changes to "fix" initialization timing
   - Attempt to bypass Vite initialization process

3. **DO:**
   - Be patient during the initialization process
   - Use the server-info endpoint to confirm server is running
   - Remember that API endpoints work before the frontend is fully loaded

## CSRF Implementation Notes

The CSRF token implementation requires proper initialization time. If you're testing CSRF token functionality, remember:

1. The `/api/csrf-token` endpoint works even before the frontend is fully initialized
2. The frontend CSRF context needs to wait for the full initialization 
3. Direct API tests can be performed via `/api-test` page before the React app is ready