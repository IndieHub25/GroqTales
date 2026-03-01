/**
 * Performance Monitoring Utilities for Animations
 * Use in development to track animation performance
 */

/**
 * FPS Monitor
 * Tracks frame rate and warns if it drops below 55fps
 */
export class FPSMonitor {
  private fps: number[] = [];
  private lastTime: number = performance.now();
  private rafId: number | null = null;
  private callback?: (fps: number) => void;

  constructor(callback?: (fps: number) => void) {
    this.callback = callback;
  }

  start() {
    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastTime;
      const currentFPS = 1000 / delta;
      
      this.fps.push(currentFPS);
      this.lastTime = now;

      // Calculate average every 60 frames
      if (this.fps.length >= 60) {
        const avgFPS = this.fps.reduce((a, b) => a + b, 0) / this.fps.length;
        
        if (this.callback) {
          this.callback(avgFPS);
        }

        // Log warning if FPS drops below 55
        if (avgFPS < 55) {
          console.warn(`⚠️ Low FPS detected: ${avgFPS.toFixed(1)} fps`);
        }

        this.fps = [];
      }

      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

/**
 * Animation Performance Observer
 * Uses Performance Observer API to track long tasks
 */
export class AnimationPerformanceObserver {
  private observer: PerformanceObserver | null = null;
  private longTasks: PerformanceEntry[] = [];

  start() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.longTasks.push(entry);
            console.warn(
              `🐌 Long task detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`
            );
          }
        }
      });

      // Observe long tasks, layout shifts, and paint timing
      this.observer.observe({
        entryTypes: ['longtask', 'layout-shift', 'paint', 'measure'],
      });
    } catch (error) {
      console.error('Failed to start PerformanceObserver:', error);
    }
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  getReport() {
    return {
      longTasks: this.longTasks.length,
      totalDuration: this.longTasks.reduce((sum, task) => sum + task.duration, 0),
      tasks: this.longTasks,
    };
  }
}

/**
 * Layout Shift Detector
 * Measures Cumulative Layout Shift (CLS)
 */
export class LayoutShiftDetector {
  private clsScore: number = 0;
  private observer: PerformanceObserver | null = null;

  start() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.clsScore += (entry as any).value;
            
            if ((entry as any).value > 0.1) {
              console.warn(
                `📏 Significant layout shift detected: ${((entry as any).value).toFixed(4)}`
              );
            }
          }
        }
      });

      this.observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Failed to start layout shift detection:', error);
    }
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  getScore() {
    return this.clsScore;
  }

  getGrade() {
    if (this.clsScore < 0.1) return 'Good';
    if (this.clsScore < 0.25) return 'Needs Improvement';
    return 'Poor';
  }
}

/**
 * Animation Jank Detector
 * Detects janky frames (> 16.67ms)
 */
export class JankDetector {
  private jankCount: number = 0;
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private rafId: number | null = null;

  start() {
    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastTime;

      this.frameCount++;

      // Frame took longer than 16.67ms (60fps threshold)
      if (delta > 16.67) {
        this.jankCount++;
        
        // Log severe jank (> 33ms = dropped frame)
        if (delta > 33) {
          console.warn(`🎯 Severe jank: ${delta.toFixed(2)}ms (dropped frame)`);
        }
      }

      // Report every 300 frames (~5 seconds at 60fps)
      if (this.frameCount % 300 === 0) {
        const jankPercentage = (this.jankCount / this.frameCount) * 100;
        console.log(
          `📊 Jank Report: ${jankPercentage.toFixed(1)}% janky frames (${this.jankCount}/${this.frameCount})`
        );

        if (jankPercentage > 5) {
          console.warn('⚠️ High jank percentage detected!');
        }
      }

      this.lastTime = now;
      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getStats() {
    return {
      jankCount: this.jankCount,
      frameCount: this.frameCount,
      jankPercentage: (this.jankCount / this.frameCount) * 100,
    };
  }
}

/**
 * All-in-one Performance Monitor
 * Combines all monitoring utilities
 */
export class PerformanceMonitor {
  private fpsMonitor: FPSMonitor;
  private perfObserver: AnimationPerformanceObserver;
  private clsDetector: LayoutShiftDetector;
  private jankDetector: JankDetector;

  constructor() {
    this.fpsMonitor = new FPSMonitor((fps) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📈 Average FPS: ${fps.toFixed(1)}`);
      }
    });
    this.perfObserver = new AnimationPerformanceObserver();
    this.clsDetector = new LayoutShiftDetector();
    this.jankDetector = new JankDetector();
  }

  start() {
    if (process.env.NODE_ENV !== 'development') {
      console.log('Performance monitoring only runs in development mode');
      return;
    }

    console.log('🚀 Starting performance monitoring...');
    this.fpsMonitor.start();
    this.perfObserver.start();
    this.clsDetector.start();
    this.jankDetector.start();
  }

  stop() {
    this.fpsMonitor.stop();
    this.perfObserver.stop();
    this.clsDetector.stop();
    this.jankDetector.stop();
  }

  getFullReport() {
    const perfReport = this.perfObserver.getReport();
    const jankStats = this.jankDetector.getStats();

    return {
      fps: 'See console for FPS logs',
      longTasks: perfReport,
      cls: {
        score: this.clsDetector.getScore(),
        grade: this.clsDetector.getGrade(),
      },
      jank: jankStats,
    };
  }

  logReport() {
    console.group('📊 Performance Report');
    console.log('CLS Score:', this.clsDetector.getScore().toFixed(4));
    console.log('CLS Grade:', this.clsDetector.getGrade());
    console.log('Jank Stats:', this.jankDetector.getStats());
    console.log('Long Tasks:', this.perfObserver.getReport());
    console.groupEnd();
  }
}

/**
 * React Hook for Performance Monitoring
 */
export function usePerformanceMonitoring(enabled: boolean = process.env.NODE_ENV === 'development') {
  if (typeof window === 'undefined') return;

  const monitor = new PerformanceMonitor();

  if (enabled) {
    monitor.start();

    // Log report every 10 seconds
    const interval = setInterval(() => {
      monitor.logReport();
    }, 10000);

    // Cleanup
    return () => {
      clearInterval(interval);
      monitor.stop();
    };
  }
}

/**
 * Lighthouse Performance Score Estimator
 * Provides rough estimate based on Core Web Vitals
 */
export function estimateLighthouseScore(): number {
  if (typeof window === 'undefined') return 0;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return 0;

  // Calculate key metrics
  const fcp = navigation.responseStart - navigation.fetchStart;
  const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0;
  const tti = navigation.domInteractive - navigation.fetchStart;

  // Rough scoring (simplified)
  let score = 100;

  if (fcp > 1800) score -= 10;
  if (fcp > 3000) score -= 15;
  
  if (lcp > 2500) score -= 15;
  if (lcp > 4000) score -= 20;
  
  if (tti > 3800) score -= 10;
  if (tti > 7300) score -= 15;

  return Math.max(0, score);
}
