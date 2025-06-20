import { performance } from 'perf_hooks';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: string;
  memoryUsage: NodeJS.MemoryUsage;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests

  logRequest(req: any, res: any, responseTime: number) {
    const metric: PerformanceMetrics = {
      endpoint: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage()
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.path} - ${responseTime}ms`);
    }
  }

  getMetrics() {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime: this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length,
      slowestRequest: Math.max(...this.metrics.map(m => m.responseTime)),
      fastestRequest: Math.min(...this.metrics.map(m => m.responseTime)),
      recentMetrics: this.metrics.slice(-10),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  getHealthStatus() {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    const recentMetrics = this.metrics.slice(-100);
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;

    return {
      status: heapUsedMB > 500 || avgResponseTime > 2000 ? 'warning' : 'healthy',
      memory: {
        heapUsed: `${heapUsedMB.toFixed(2)}MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`
      },
      performance: {
        averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
        totalRequests: this.metrics.length
      },
      uptime: `${(process.uptime() / 60).toFixed(2)} minutes`
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();