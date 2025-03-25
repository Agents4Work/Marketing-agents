# AI Marketing Platform Production Deployment Checklist

## Pre-Deployment Preparation

### Code and Configuration
- [ ] Remove all debugging console logs and commented-out code
- [ ] Set appropriate environment variables in `.env` file
- [ ] Ensure all API keys and secrets are properly secured
- [ ] Update API base URLs to production endpoints
- [ ] Configure appropriate CORS settings
- [ ] Set `NODE_ENV=production` for production build

### Testing and Quality Assurance
- [ ] Run all unit and integration tests
- [ ] Verify API endpoints with `test-health-endpoints.js`
- [ ] Run comprehensive health check with `monitor-health.js`
- [ ] Manually test critical user flows in a staging environment
- [ ] Test with multiple browsers and devices
- [ ] Verify all authentication flows

### Performance and Optimization
- [ ] Optimize all assets (images, JS, CSS)
- [ ] Enable caching where appropriate
- [ ] Run Lighthouse or similar performance audits
- [ ] Verify bundle size is optimized
- [ ] Check for memory leaks during extended usage

### Security
- [ ] Audit dependencies for vulnerabilities using `npm audit`
- [ ] Enforce HTTPS connections
- [ ] Set secure HTTP headers
- [ ] Implement rate limiting for API endpoints
- [ ] Validate all user inputs
- [ ] Ensure proper authorization checks on all endpoints

## Deployment Process

### Build and Packaging
- [ ] Run `npm run build` to create optimized production build
- [ ] Verify build output for any warnings or errors
- [ ] Check build size and optimize if necessary

### Database and Data
- [ ] Backup any existing production data
- [ ] Run any necessary database migrations
- [ ] Verify database connection from the deployment environment
- [ ] Check database query performance

### Deployment
- [ ] Update version numbers and changelog
- [ ] Run deployment script (`deploy.sh` or `deploy-to-replit.sh`)
- [ ] Verify application starts without errors
- [ ] Check server logs for any warnings or errors

## Post-Deployment Verification

### Functionality Check
- [ ] Verify all main pages load correctly
- [ ] Test critical user workflows
- [ ] Verify API endpoints are accessible
- [ ] Check authentication and authorization

### Monitoring and Logging
- [ ] Set up monitoring for server health
- [ ] Configure error logging and alerting
- [ ] Set up performance monitoring
- [ ] Verify logs are being properly captured

### Rollback Plan
- [ ] Document rollback procedures in case of deployment issues
- [ ] Ensure previous version can be quickly restored if needed
- [ ] Test rollback process in staging environment

## Specific Replit Deployment Checks

### Replit Environment
- [ ] Verify all required environment variables are set in Replit
- [ ] Check Replit-specific configurations 
- [ ] Ensure workflow configurations are correct
- [ ] Test the application URL with proper port settings
- [ ] Verify static file serving is working correctly

### Replit Performance
- [ ] Monitor resource usage (CPU, memory)
- [ ] Set up keep-alive pings if needed
- [ ] Test cold start performance
- [ ] Verify custom domain configuration (if applicable)

## Final Go-Live Checklist

- [ ] Perform one final health check with `monitor-health.js`
- [ ] Verify all endpoints with `test-health-endpoints.js`
- [ ] Send test requests to critical API endpoints
- [ ] Check for any console errors in the browser
- [ ] Verify analytics tracking is working
- [ ] Document deployment completion with timestamp and version

## Notes and Documentation
- Document any known issues or limitations
- Record deployment date and version number
- Update documentation with any configuration changes
- Notify team members of successful deployment