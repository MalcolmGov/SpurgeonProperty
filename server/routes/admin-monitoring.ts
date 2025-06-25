import { Request, Response } from 'express';
import { requireAdminAuth } from '../admin-auth';
import { monitoringService } from '../monitoring-service';

export function registerMonitoringRoutes(app: any) {
  // Admin monitoring dashboard endpoint
  app.get('/api/admin/monitoring/dashboard', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const healthStatus = monitoringService.getHealthStatus();
      const dailyMetrics = await monitoringService.generateDailyReport();
      
      res.json({
        health: healthStatus,
        business: dailyMetrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching monitoring dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch monitoring data' });
    }
  });

  // Send test monitoring email to Malcolm
  app.post('/api/admin/monitoring/test-email', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      // Force send a test analytics report
      await monitoringService.sendDailyAnalyticsReport();
      
      res.json({ 
        message: 'Test monitoring email sent successfully to malcolmgov24@gmail.com',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Get current monitoring configuration
  app.get('/api/admin/monitoring/config', requireAdminAuth, (req: Request, res: Response) => {
    res.json({
      alertRecipient: 'malcolmgov24@gmail.com',
      dailyReportTime: '09:00',
      enabledAlerts: {
        performance: true,
        errors: true,
        business: true,
        system: true
      },
      thresholds: {
        responseTime: 2000,
        memoryUsage: 80,
        errorRate: 5
      },
      reportFrequency: 'daily'
    });
  });
}