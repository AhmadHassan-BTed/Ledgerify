import * as stats from 'simple-statistics';
import { format, parseISO, differenceInDays, getDaysInMonth } from 'date-fns';

export interface LinearTrendResult {
  slope: number;
  intercept: number;
  rSquared: number;
  forecast: number; // Next period projected value
  direction: 'up' | 'down' | 'flat';
  growthRatePercent: number;
}

export interface QuantileDistribution {
  min: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  max: number;
  iqr: number;
  mean: number;
  standardDeviation: number;
}

export interface AssociationRuleScore {
  support: number; // P(A and B)
  confidence: number; // P(B|A)
  lift: number; // Confidence / P(B) - Lift > 1 indicates genuine positive affinity
  isSignificant: boolean;
}

export class StatisticalEngine {
  /**
   * Computes rigorous Ordinary Least Squares (OLS) Linear Regression
   */
  static calculateLinearTrend(points: [number, number][]): LinearTrendResult {
    if (!points || points.length < 2) {
      return {
        slope: 0,
        intercept: points?.[0]?.[1] || 0,
        rSquared: 0,
        forecast: points?.[0]?.[1] || 0,
        direction: 'flat',
        growthRatePercent: 0
      };
    }

    try {
      const line = stats.linearRegression(points);
      const lineFn = stats.linearRegressionLine(line);
      const rSquared = Math.max(0, Math.min(1, stats.rSquared(points, lineFn) || 0));

      const nextX = points[points.length - 1][0] + 1;
      const forecast = Math.max(0, lineFn(nextX));

      const firstY = points[0][1] || 1;
      const lastY = points[points.length - 1][1] || 1;
      const growthRatePercent = Math.round(((lastY - firstY) / Math.max(1, firstY)) * 1000) / 10;

      const direction: 'up' | 'down' | 'flat' =
        line.m > 0.05 ? 'up' : line.m < -0.05 ? 'down' : 'flat';

      return {
        slope: Math.round(line.m * 100) / 100,
        intercept: Math.round(line.b * 100) / 100,
        rSquared: Math.round(rSquared * 100) / 100,
        forecast: Math.round(forecast * 100) / 100,
        direction,
        growthRatePercent
      };
    } catch {
      return {
        slope: 0,
        intercept: 0,
        rSquared: 0,
        forecast: 0,
        direction: 'flat',
        growthRatePercent: 0
      };
    }
  }

  /**
   * Computes comprehensive quantile distribution, standard deviation, and IQR
   */
  static calculateDistribution(values: number[]): QuantileDistribution {
    if (!values || values.length === 0) {
      return {
        min: 0,
        p25: 0,
        median: 0,
        p75: 0,
        p90: 0,
        max: 0,
        iqr: 0,
        mean: 0,
        standardDeviation: 0
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = stats.mean(sorted);
    const median = stats.median(sorted);
    const p25 = stats.quantile(sorted, 0.25);
    const p75 = stats.quantile(sorted, 0.75);
    const p90 = stats.quantile(sorted, 0.90);
    const iqr = p75 - p25;
    const standardDeviation = sorted.length > 1 ? stats.standardDeviation(sorted) : 0;

    return {
      min: Math.round(min * 100) / 100,
      p25: Math.round(p25 * 100) / 100,
      median: Math.round(median * 100) / 100,
      p75: Math.round(p75 * 100) / 100,
      p90: Math.round(p90 * 100) / 100,
      max: Math.round(max * 100) / 100,
      iqr: Math.round(iqr * 100) / 100,
      mean: Math.round(mean * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100
    };
  }

  /**
   * Statistical outlier threshold using Turkey's Fence (Q3 + 1.5 * IQR)
   */
  static getOutlierThreshold(values: number[]): number {
    if (!values || values.length < 4) return Infinity;
    const sorted = [...values].sort((a, b) => a - b);
    const p75 = stats.quantile(sorted, 0.75);
    const p25 = stats.quantile(sorted, 0.25);
    const iqr = p75 - p25;
    return p75 + (1.5 * iqr);
  }

  /**
   * Association Rule Mining for Cross-Sell affinities (Support, Confidence, Lift)
   */
  static calculateAffinityScore(
    coOccurrence: number,
    itemACount: number,
    itemBCount: number,
    totalOrders: number
  ): AssociationRuleScore {
    if (totalOrders === 0 || itemACount === 0 || itemBCount === 0) {
      return { support: 0, confidence: 0, lift: 0, isSignificant: false };
    }

    const support = coOccurrence / totalOrders;
    const confidence = coOccurrence / itemACount;
    const probB = itemBCount / totalOrders;
    const lift = probB > 0 ? (confidence / probB) : 0;

    return {
      support: Math.round(support * 1000) / 10,
      confidence: Math.round(confidence * 1000) / 10,
      lift: Math.round(lift * 100) / 100,
      isSignificant: lift > 1.2 && coOccurrence >= 2
    };
  }

  /**
   * Realistic pacing projection using statistical Exponential Smoothing + Run Rate
   */
  static projectMonthEndPacing(
    dailySales: number[],
    targetMonth?: string
  ): { runRate: number; projectedTotal: number; confidenceScore: number } {
    if (!dailySales || dailySales.length === 0) {
      return { runRate: 0, projectedTotal: 0, confidenceScore: 0 };
    }

    const totalRevenue = stats.sum(dailySales);
    const daysSampled = dailySales.length;
    const meanDaily = totalRevenue / Math.max(1, daysSampled);

    // Exponential moving average for recent weighting
    let ema = dailySales[0];
    const alpha = 0.3;
    for (let i = 1; i < dailySales.length; i++) {
      ema = alpha * dailySales[i] + (1 - alpha) * ema;
    }

    // Blend standard mean (40%) and recent EMA (60%)
    const weightedDailyRunRate = (meanDaily * 0.4) + (ema * 0.6);

    let daysInMonth = 30;
    if (targetMonth && targetMonth.includes('-')) {
      try {
        const d = parseISO(`${targetMonth}-01`);
        daysInMonth = getDaysInMonth(d);
      } catch {
        daysInMonth = 30;
      }
    }

    const projectedTotal = Math.round(weightedDailyRunRate * daysInMonth);
    const stdDev = dailySales.length > 1 ? stats.standardDeviation(dailySales) : 0;
    const coeffVariation = meanDaily > 0 ? (stdDev / meanDaily) : 0;
    // Lower coefficient of variation means higher predictability
    const confidenceScore = Math.max(20, Math.min(98, Math.round((1 - Math.min(1, coeffVariation * 0.5)) * 100)));

    return {
      runRate: Math.round(weightedDailyRunRate),
      projectedTotal,
      confidenceScore
    };
  }
}
