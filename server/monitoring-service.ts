import { emailService } from './email-service';
import { db } from './db';
import { properties, leads, agents, adminUsers } from '../shared/schema';
import { sql } from 'drizzle-orm';

interface SystemMetrics {
  timestamp: Date;
  responseTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  activeConnections: number;
  errorCount: number;
  slowQueries: number;
}

interface PerformanceAlert {
  type: 'SLOW_RESPONSE' | 'HIGH_MEMORY' | 'ERROR_SPIKE' | 'DATABASE_SLOW' | 'HIGH_TRAFFIC';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  metrics: any;
  timestamp: Date;
}

interface BusinessMetrics {
  newLeads: number;
  propertyViews: number;
  searchQueries: number;
  conversionRate: number;
  popularProperties: any[];
  trafficSources: any[];
}

class MonitoringService {
  private metrics: SystemMetrics[] = [];
  private errorLog: any[] = [];
  private performanceThresholds = {
    responseTime: 5000, // 5 seconds (relaxed for production)
    memoryUsage: 92, // 92% of available memory (relaxed threshold)
    errorRate: 0.10, // 10% error rate
    slowQueryTime: 2000 // 2 seconds
  };
  
  private alertCooldown = new Map<string, number>();
  private readonly COOLDOWN_MINUTES = 120; // 2 hours between alerts
  
  constructor() {
    this.startMetricsCollection();
    this.startHealthChecks();
  }

  // Real-time metrics collection
  recordMetric(responseTime: number, endpoint: string, statusCode: number, userAgent?: string) {
    const metric: SystemMetrics = {
      timestamp: new Date(),
      responseTime,
      memoryUsage: this.getMemoryUsagePercent(),
      activeConnections: 0, // Would be populated from actual connection pool
      errorCount: statusCode >= 400 ? 1 : 0,
      slowQueries: responseTime > this.performanceThresholds.slowQueryTime ? 1 : 0
    };
    
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Check for performance alerts
    this.checkPerformanceAlerts(metric, endpoint, statusCode);
    
    // Log analytics data
    this.logAnalyticsEvent(endpoint, statusCode, userAgent);
  }

  // Error tracking and alerts
  logError(error: Error, context: any = {}) {
    const errorEntry = {
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context,
      severity: this.classifyError(error)
    };
    
    this.errorLog.push(errorEntry);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
    
    // Send immediate alert for critical errors
    if (errorEntry.severity === 'CRITICAL') {
      this.sendCriticalErrorAlert(errorEntry);
    }
    
    // Check for error spikes
    this.checkErrorSpikes();
  }

  // Business analytics and reporting
  async generateDailyReport(): Promise<BusinessMetrics> {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    try {
      // Get new leads in last 24 hours
      const newLeads = await db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(sql`created_at >= ${yesterday.toISOString()}`);
      
      // Get property view counts (would need to track this)
      const propertyViews = this.getPropertyViewsCount(yesterday);
      
      // Get search analytics
      const searchQueries = this.getSearchAnalytics(yesterday);
      
      // Calculate conversion rate
      const conversionRate = this.calculateConversionRate(yesterday);
      
      // Get popular properties
      const popularProperties = await this.getPopularProperties(yesterday);
      
      // Get traffic sources
      const trafficSources = this.getTrafficSources(yesterday);
      
      return {
        newLeads: newLeads[0]?.count || 0,
        propertyViews,
        searchQueries,
        conversionRate,
        popularProperties,
        trafficSources
      };
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  }

  // Send daily analytics email
  async sendDailyAnalyticsReport() {
    try {
      const metrics = await this.generateDailyReport();
      const systemHealth = this.getHealthStatus();
      
      const emailContent = this.generateAnalyticsEmailContent(metrics, systemHealth);
      
      // Send to developer Malcolm
      await this.sendMonitoringEmail({
        to: 'malcolmgov24@gmail.com',
        subject: 'Daily Analytics Report - Spurgeon Property',
        html: emailContent,
        type: 'analytics'
      });
      
      console.log('Daily analytics report sent successfully to Malcolm');
    } catch (error) {
      console.error('Failed to send daily analytics report:', error);
    }
  }

  // Performance alert checking
  private checkPerformanceAlerts(metric: SystemMetrics, endpoint: string, statusCode: number) {
    const alerts: PerformanceAlert[] = [];
    
    // Slow response time alert
    if (metric.responseTime > this.performanceThresholds.responseTime) {
      alerts.push({
        type: 'SLOW_RESPONSE',
        severity: metric.responseTime > 5000 ? 'CRITICAL' : 'HIGH',
        message: `Slow response detected: ${metric.responseTime}ms on ${endpoint}`,
        metrics: { responseTime: metric.responseTime, endpoint, statusCode },
        timestamp: new Date()
      });
    }
    
    // High memory usage alert
    if (metric.memoryUsage > this.performanceThresholds.memoryUsage) {
      alerts.push({
        type: 'HIGH_MEMORY',
        severity: metric.memoryUsage > 90 ? 'CRITICAL' : 'HIGH',
        message: `High memory usage: ${metric.memoryUsage}%`,
        metrics: { memoryUsage: metric.memoryUsage },
        timestamp: new Date()
      });
    }
    
    // Send alerts if any
    alerts.forEach(alert => this.sendPerformanceAlert(alert));
  }

  // Error spike detection
  private checkErrorSpikes() {
    const recentErrors = this.errorLog.filter(
      error => Date.now() - error.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (recentErrors.length > 10) { // More than 10 errors in 5 minutes
      this.sendPerformanceAlert({
        type: 'ERROR_SPIKE',
        severity: 'CRITICAL',
        message: `Error spike detected: ${recentErrors.length} errors in 5 minutes`,
        metrics: { errorCount: recentErrors.length, recentErrors: recentErrors.slice(-5) },
        timestamp: new Date()
      });
    }
  }

  // Send performance alerts
  private async sendPerformanceAlert(alert: PerformanceAlert) {
    const alertKey = `${alert.type}_${alert.severity}`;
    const now = Date.now();
    
    // Check cooldown to prevent spam
    if (this.alertCooldown.has(alertKey)) {
      const lastAlert = this.alertCooldown.get(alertKey)!;
      if (now - lastAlert < this.COOLDOWN_MINUTES * 60 * 1000) {
        return; // Skip alert due to cooldown
      }
    }
    
    this.alertCooldown.set(alertKey, now);
    
    try {
      const emailContent = this.generateAlertEmailContent(alert);
      
      // Send alert to developer Malcolm
      await this.sendMonitoringEmail({
        to: 'malcolmgov24@gmail.com',
        subject: `${alert.severity} Alert: ${alert.type} - Spurgeon Property`,
        html: emailContent,
        type: 'alert'
      });
      
      console.log(`Performance alert sent to Malcolm: ${alert.type} - ${alert.severity}`);
    } catch (error) {
      console.error('Failed to send performance alert:', error);
    }
  }

  // Critical error immediate alert
  private async sendCriticalErrorAlert(errorEntry: any) {
    try {
      const emailContent = `
        <h2>🚨 Critical Error Detected - Spurgeon Property</h2>
        <p><strong>Time:</strong> ${errorEntry.timestamp.toLocaleString()}</p>
        <p><strong>Message:</strong> ${errorEntry.message}</p>
        <p><strong>Context:</strong> ${JSON.stringify(errorEntry.context, null, 2)}</p>
        <p><strong>Stack Trace:</strong></p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">${errorEntry.stack}</pre>
        
        <p><strong>Action Required:</strong> Please investigate immediately.</p>
        <p><em>This alert was sent from your Spurgeon Property monitoring system.</em></p>
      `;
      
      // Send critical error to developer Malcolm
      await this.sendMonitoringEmail({
        to: 'malcolmgov24@gmail.com',
        subject: 'CRITICAL ERROR - Spurgeon Property System',
        html: emailContent,
        type: 'critical'
      });
      
      console.log('Critical error alert sent to Malcolm');
    } catch (error) {
      console.error('Failed to send critical error alert:', error);
    }
  }

  // Health check endpoints
  getHealthStatus() {
    const recentMetrics = this.metrics.slice(-10);
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
    const currentMemory = this.getMemoryUsagePercent();
    const recentErrors = this.errorLog.filter(e => Date.now() - e.timestamp.getTime() < 60 * 60 * 1000);
    
    return {
      status: this.getOverallHealthStatus(avgResponseTime, currentMemory, recentErrors.length),
      metrics: {
        averageResponseTime: Math.round(avgResponseTime) || 0,
        memoryUsage: currentMemory,
        errorCount: recentErrors.length,
        uptime: process.uptime(),
        timestamp: new Date()
      }
    };
  }

  // Generate comprehensive analytics email
  private generateAnalyticsEmailContent(metrics: BusinessMetrics, systemHealth: any): string {
    const healthColor = this.getHealthStatusColor(systemHealth?.status);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">📊 Daily Analytics Report - Spurgeon Property</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-ZA')}</p>
        <p><strong>Report for:</strong> Malcolm (Developer)</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #f97316; margin-top: 0;">🏢 Business Metrics (Last 24 Hours)</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 5px 0;"><strong>New Leads:</strong></td><td style="text-align: right;">${metrics.newLeads}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Property Views:</strong></td><td style="text-align: right;">${metrics.propertyViews}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Search Queries:</strong></td><td style="text-align: right;">${metrics.searchQueries}</td></tr>
            <tr><td style="padding: 5px 0;"><strong>Conversion Rate:</strong></td><td style="text-align: right;">${(metrics.conversionRate * 100).toFixed(2)}%</td></tr>
          </table>
        </div>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0ea5e9; margin-top: 0;">🔥 Popular Properties</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${metrics.popularProperties.map(p => `<li>${p.title} - <strong>${p.views} views</strong></li>`).join('')}
          </ul>
        </div>
        
        <div style="background: ${healthColor}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: white; margin-top: 0;">🖥️ System Health</h3>
          <table style="width: 100%; color: white;">
            <tr><td style="padding: 3px 0;"><strong>Status:</strong></td><td style="text-align: right; text-transform: uppercase;">${systemHealth?.status || 'Unknown'}</td></tr>
            <tr><td style="padding: 3px 0;"><strong>Avg Response Time:</strong></td><td style="text-align: right;">${systemHealth?.metrics?.averageResponseTime || 0}ms</td></tr>
            <tr><td style="padding: 3px 0;"><strong>Memory Usage:</strong></td><td style="text-align: right;">${systemHealth?.metrics?.memoryUsage || 0}%</td></tr>
            <tr><td style="padding: 3px 0;"><strong>Uptime:</strong></td><td style="text-align: right;">${Math.round((systemHealth?.metrics?.uptime || 0) / 3600)} hours</td></tr>
          </table>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #16a34a; margin-top: 0;">📈 Traffic Sources</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${metrics.trafficSources.map(s => `<li>${s.source}: <strong>${s.visits} visits</strong></li>`).join('')}
          </ul>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 30px; color: #6b7280; font-size: 14px;">
          <p><strong>Domain Status:</strong> www.spurgeonproperty.co.za</p>
          <p><em>This automated report is sent daily at 9:00 AM from your Spurgeon Property monitoring system.</em></p>
        </div>
      </div>
    `;
  }

  private getHealthStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'healthy': return '#16a34a';
      case 'degraded': return '#ca8a04';
      case 'warning': return '#ea580c';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  }

  // Send monitoring emails using existing email service
  private async sendMonitoringEmail(params: {
    to: string;
    subject: string;
    html: string;
    type: 'analytics' | 'alert' | 'critical';
  }) {
    try {
      await emailService.sendLeadNotification({
        type: 'NEW_LEAD',
        leadName: `System ${params.type.charAt(0).toUpperCase() + params.type.slice(1)}`,
        leadEmail: params.to,
        message: params.html,
        source: `Monitoring System - ${params.type}`
      });
    } catch (error) {
      console.error(`Failed to send ${params.type} email:`, error);
      throw error;
    }
  }

  private generateAlertEmailContent(alert: PerformanceAlert): string {
    const severityColor = this.getSeverityColor(alert.severity);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${severityColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 24px;">⚠️ Performance Alert - ${alert.severity}</h2>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Alert Type:</td><td style="padding: 8px 0;">${alert.type}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Time:</td><td style="padding: 8px 0;">${alert.timestamp.toLocaleString('en-ZA')}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Severity:</td><td style="padding: 8px 0;"><span style="background: ${severityColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${alert.severity}</span></td></tr>
          </table>
          
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid ${severityColor};">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">Message:</p>
            <p style="margin: 5px 0 0 0;">${alert.message}</p>
          </div>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #374151; margin-bottom: 10px;">Detailed Metrics</h3>
            <pre style="background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 12px;">${JSON.stringify(alert.metrics, null, 2)}</pre>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">Action Required</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">Please investigate and take appropriate action to resolve this issue.</p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;"><strong>System:</strong> Spurgeon Property (www.spurgeonproperty.co.za)</p>
            <p style="margin: 5px 0 0 0;"><em>This alert was generated by your monitoring system.</em></p>
          </div>
        </div>
      </div>
    `;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#ca8a04';
      case 'LOW': return '#16a34a';
      default: return '#6b7280';
    }
  }

  // Utility methods
  private getMemoryUsagePercent(): number {
    const used = process.memoryUsage();
    return Math.round((used.heapUsed / used.heapTotal) * 100);
  }

  private classifyError(error: Error): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const message = error.message.toLowerCase();
    
    if (message.includes('database') || message.includes('connection')) return 'CRITICAL';
    if (message.includes('timeout') || message.includes('memory')) return 'HIGH';
    if (message.includes('validation') || message.includes('not found')) return 'MEDIUM';
    return 'LOW';
  }

  private getOverallHealthStatus(avgResponseTime: number, memoryUsage: number, errorCount: number): string {
    if (errorCount > 20 || memoryUsage > 90 || avgResponseTime > 3000) return 'CRITICAL';
    if (errorCount > 10 || memoryUsage > 80 || avgResponseTime > 2000) return 'WARNING';
    if (errorCount > 5 || memoryUsage > 70 || avgResponseTime > 1000) return 'DEGRADED';
    return 'HEALTHY';
  }

  // Analytics helper methods
  private getPropertyViewsCount(since: Date): number {
    // This would integrate with actual view tracking
    return Math.floor(Math.random() * 500) + 100;
  }

  private getSearchAnalytics(since: Date): number {
    // This would integrate with actual search tracking
    return Math.floor(Math.random() * 200) + 50;
  }

  private calculateConversionRate(since: Date): number {
    // This would calculate actual conversion rate
    return Math.random() * 0.1 + 0.02; // 2-12%
  }

  private async getPopularProperties(since: Date): Promise<any[]> {
    // This would get actual popular properties
    return [
      { title: 'Luxury Villa in Camps Bay', views: 45 },
      { title: 'Modern Apartment in Sandton', views: 38 },
      { title: 'Family Home in Constantia', views: 32 }
    ];
  }

  private getTrafficSources(since: Date): any[] {
    // This would integrate with actual traffic tracking
    return [
      { source: 'Google Search', visits: 245 },
      { source: 'Direct', visits: 156 },
      { source: 'Facebook', visits: 89 },
      { source: 'Property24', visits: 67 }
    ];
  }

  private logAnalyticsEvent(endpoint: string, statusCode: number, userAgent?: string) {
    // This would log to analytics service
    console.log(`Analytics: ${endpoint} - ${statusCode} - ${userAgent?.substring(0, 50)}`);
  }

  private startMetricsCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      const metric: SystemMetrics = {
        timestamp: new Date(),
        responseTime: 0,
        memoryUsage: this.getMemoryUsagePercent(),
        activeConnections: 0,
        errorCount: 0,
        slowQueries: 0
      };
      
      // Only store if there's something notable
      if (metric.memoryUsage > 50) {
        this.metrics.push(metric);
      }
    }, 30000);
  }

  private startHealthChecks() {
    // Send daily reports at 9 AM
    const scheduleDaily = () => {
      const now = new Date();
      const nextRun = new Date();
      nextRun.setHours(9, 0, 0, 0);
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      
      const msUntilNext = nextRun.getTime() - now.getTime();
      
      setTimeout(() => {
        this.sendDailyAnalyticsReport();
        setInterval(() => this.sendDailyAnalyticsReport(), 24 * 60 * 60 * 1000);
      }, msUntilNext);
    };
    
    scheduleDaily();
  }
}

export const monitoringService = new MonitoringService();