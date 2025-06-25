import { Request, Response, NextFunction } from 'express';
import { monitoringService } from '../monitoring-service';

export interface MonitoredRequest extends Request {
  startTime?: number;
}

// Performance monitoring middleware
export const performanceMonitoringMiddleware = (req: MonitoredRequest, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - (req.startTime || Date.now());
    
    // Record metrics
    monitoringService.recordMetric(
      responseTime,
      req.path,
      res.statusCode,
      req.get('User-Agent')
    );
    
    // Log slow requests
    if (responseTime > 1000) {
      console.log(`[SLOW REQUEST] ${req.method} ${req.path} - ${responseTime}ms`);
    }
    
    // Call original end
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Error monitoring middleware
export const errorMonitoringMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error with context
  monitoringService.logError(err, {
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

// Request tracking middleware
export const requestTrackingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Track API usage patterns
  const endpoint = req.path;
  const method = req.method;
  
  // Log API usage for analytics
  console.log(`[API] ${method} ${endpoint} - ${req.ip} - ${req.get('User-Agent')?.substring(0, 50)}`);
  
  next();
};

// Database query monitoring
export const queryMonitoringWrapper = (originalQuery: Function) => {
  return async function(...args: any[]) {
    const startTime = Date.now();
    
    try {
      const result = await originalQuery.apply(this, args);
      const queryTime = Date.now() - startTime;
      
      // Log slow queries
      if (queryTime > 500) {
        console.log(`[SLOW QUERY] ${queryTime}ms - ${JSON.stringify(args[0])?.substring(0, 100)}...`);
      }
      
      return result;
    } catch (error) {
      // Log database errors
      monitoringService.logError(error as Error, {
        query: JSON.stringify(args[0])?.substring(0, 200),
        queryTime: Date.now() - startTime
      });
      throw error;
    }
  };
};