# Monitoring & Alert System - Spurgeon Property

## Overview
Comprehensive monitoring and alerting system implemented for the Spurgeon Property platform. All notifications are sent to **malcolmgov24@gmail.com**.

## Features Implemented

### Real-Time Performance Monitoring
- **Response Time Tracking**: Monitors API response times with alerts for requests >2 seconds
- **Memory Usage Monitoring**: Tracks server memory usage with alerts at 80% threshold  
- **Error Rate Detection**: Monitors error spikes (>10 errors in 5 minutes triggers alert)
- **System Health Checks**: Continuous health monitoring with status reporting

### Business Analytics Tracking
- **Daily Analytics Reports**: Automated daily reports sent at 9:00 AM
- **Lead Generation Metrics**: Tracks new leads, conversion rates
- **Property Performance**: Most viewed properties, search analytics
- **Traffic Source Analysis**: Monitors visitor sources and engagement

### Alert System
- **Critical Error Alerts**: Immediate notifications for critical system errors
- **Performance Alerts**: Notifications for slow responses, high memory usage
- **Error Spike Detection**: Alerts when error rates exceed normal thresholds
- **Cooldown System**: 15-minute cooldown prevents alert spam

### Professional Email Templates
- **Styled HTML Emails**: Professional templates with color-coded severity levels
- **Detailed Metrics**: Comprehensive data in easy-to-read format
- **System Context**: Includes domain status, uptime, and actionable recommendations

## Monitoring Endpoints

### Health Check
```
GET /health
```
Returns current system health status, uptime, and performance metrics.

### Metrics API
```
GET /api/metrics
```
Real-time system metrics including response times, memory usage, error counts.

### Daily Analytics
```
GET /api/analytics/daily
```
Business metrics for the last 24 hours including leads, views, conversions.

### Test Alert
```
POST /api/monitoring/test-alert
```
Send test monitoring email to verify alert system functionality.

## Admin Dashboard Integration

### Monitoring Tab
New "Monitoring" section in admin sidebar provides:
- Real-time system health overview
- Performance metrics dashboard
- Business analytics visualization  
- Alert configuration panel
- Test alert functionality

### Key Metrics Displayed
- System status with color-coded health indicators
- Average response time and memory usage
- Recent error counts and system uptime
- New leads, property views, search queries
- Popular properties and traffic sources

## Alert Configuration

### Email Recipients
- **Primary**: malcolmgov24@gmail.com (Developer)
- **Backup**: System will log to console if email fails

### Alert Types
1. **Critical Errors**: Immediate notification for system failures
2. **Performance Alerts**: Response time >2s, memory >80%
3. **Error Spikes**: >10 errors in 5 minutes  
4. **Daily Reports**: Comprehensive analytics at 9:00 AM

### Alert Thresholds
- Response Time: 2000ms (High), 5000ms (Critical)
- Memory Usage: 80% (High), 90% (Critical)
- Error Rate: 5% threshold for alerts
- Slow Queries: 1000ms threshold

## Automated Reporting

### Daily Analytics Email (9:00 AM)
- Business metrics (leads, views, conversions)
- Popular properties list
- System health summary
- Traffic source breakdown
- Domain status confirmation

### Real-Time Alerts
- Immediate email for critical errors
- Performance degradation notifications
- System health status changes
- Professional HTML formatting with action items

## Implementation Details

### Monitoring Service
- `server/monitoring-service.ts`: Core monitoring logic
- `server/middleware/monitoring-middleware.ts`: Request tracking
- `server/routes/admin-monitoring.ts`: Admin API endpoints

### Frontend Components
- `client/src/pages/admin-monitoring.tsx`: Admin dashboard
- Integrated into existing admin sidebar navigation
- Real-time metrics with 30-second refresh intervals

### Email Integration
- Uses existing Gmail SMTP configuration
- Professional HTML templates with responsive design
- Error handling and fallback logging

## Testing

### Test Alert Function
Access admin monitoring dashboard and click "Test Alert" to verify:
- Email delivery to malcolmgov24@gmail.com
- Template formatting and content
- System integration functionality

### Manual Testing Commands
```bash
# Check system health
curl https://www.spurgeonproperty.co.za/health

# View metrics
curl https://www.spurgeonproperty.co.za/api/metrics

# Send test alert (admin access required)
curl -X POST https://www.spurgeonproperty.co.za/api/monitoring/test-alert
```

## Benefits for Malcolm

### Proactive Monitoring
- Early warning system for performance issues
- Immediate notification of critical errors
- Daily business intelligence reports

### Performance Insights
- Response time trends and optimization opportunities
- Memory usage patterns for scaling decisions
- Error tracking for debugging priorities

### Business Intelligence  
- Lead generation performance tracking
- Property popularity and engagement metrics
- Traffic source analysis for marketing optimization

### Professional Alerts
- Clean, actionable email notifications
- Color-coded severity levels for quick assessment
- Detailed metrics for troubleshooting

The monitoring system is now fully operational and will begin sending daily reports at 9:00 AM to malcolmgov24@gmail.com with comprehensive analytics and system health information.