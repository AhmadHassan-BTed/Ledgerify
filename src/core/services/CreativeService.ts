import { NormalizedOrder } from '../../types/order';
import { CreativeMetrics, ShowcaseProduct } from '../../types/analytics';

export class CreativeService {
  calculateMetrics(orders: NormalizedOrder[]): CreativeMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    const scentMap = new Map<string, { units: number }>();
    let multiFormatQty = 0;
    let singleFormatQty = 0;
    let totalRevenue = 0;
    let totalUnits = 0;

    for (const order of orders) {
      totalRevenue += order.orderValue;
      totalUnits += order.orderQuantity;

      // Dynamically count multi-item sets vs single formats
      const catQuantities = order.categoryQuantities || {};
      for (const [catName, qty] of Object.entries(catQuantities)) {
        const lower = catName.toLowerCase();
        if (lower.includes('set') || lower.includes('trio') || lower.includes('box') || lower.includes('kit') || lower.includes('discovery') || lower.includes('bundle')) {
          multiFormatQty += qty;
        } else {
          singleFormatQty += qty;
        }
      }

      // Track individual scents
      for (const item of (order.fragrancesParsed || [])) {
        if (!item.name) continue;
        const current = scentMap.get(item.name) || { units: 0 };
        current.units += 1;
        scentMap.set(item.name, current);
      }
    }

    const avgPrice = totalUnits > 0 ? (totalRevenue / totalUnits) : 25;

    // Sort scents by volume
    const sortedScents = Array.from(scentMap.entries()).sort((a, b) => b[1].units - a[1].units);
    const totalVolume = sortedScents.reduce((acc, curr) => acc + curr[1].units, 0) || 1;

    // Hero product
    const heroEntry = sortedScents[0] || ['Flagship Fragrance', { units: 1 }];
    const heroProduct = {
      name: heroEntry[0],
      unitsSold: heroEntry[1].units,
      revenue: Math.round(heroEntry[1].units * avgPrice * 100) / 100,
      sharePercentage: Math.round((heroEntry[1].units / totalVolume) * 100)
    };

    // Showcase Top 3
    const showcaseTemplates = [
      {
        badge: '👑 Flagship Bestseller',
        visualHook: 'Deep midnight obsidian silhouette with dramatic golden backlighting.',
        recommendedAsset: 'Full-bleed 1080x1350 Instagram Reel cover & Hero Landing Page banner.'
      },
      {
        badge: '⚡ High Momentum',
        visualHook: 'Warm amber tones, floating mist particle effect, high-contrast typography.',
        recommendedAsset: 'TikTok hook video featuring bottle uncapping macro shot.'
      },
      {
        badge: '💎 Cult Favorite',
        visualHook: 'Frosted glass reflection, minimal aesthetic on charcoal stone pedestal.',
        recommendedAsset: 'Email newsletter header image + Pinterest aesthetic lookbook.'
      }
    ];

    const showcaseProducts: ShowcaseProduct[] = sortedScents.slice(0, 3).map((item, idx) => {
      const template = showcaseTemplates[idx] || showcaseTemplates[0];
      return {
        rank: idx + 1,
        name: item[0],
        unitsSold: item[1].units,
        revenue: Math.round(item[1].units * avgPrice * 100) / 100,
        visualHook: template.visualHook,
        recommendedAsset: template.recommendedAsset,
        badge: template.badge
      };
    });

    // Dynamic Packaging format trend ratio
    const combined = (multiFormatQty + singleFormatQty) || 1;
    const trioPercent = Math.round((multiFormatQty / combined) * 100);
    const bottlePercent = 100 - trioPercent;
    const note = trioPercent > 20
      ? `Multi-item gift & discovery sets represent ${trioPercent}% of cart volume! Feature boxed packaging prominently in visual ads.`
      : `Individual bottle formats represent ${bottlePercent}% of cart choice. Focus creative assets on solitary flagship bottles.`;

    // Word cloud weights (normalized 1 to 5)
    const maxUnits = sortedScents[0] ? sortedScents[0][1].units : 1;
    const fragranceWordCloud = sortedScents.slice(0, 25).map(([name, data]) => ({
      text: name,
      count: data.units,
      weight: Math.max(1, Math.min(5, Math.ceil((data.units / maxUnits) * 5)))
    }));

    return {
      heroProduct,
      showcaseProducts,
      trioVsBottleRatio: {
        trioPercent,
        bottlePercent,
        note
      },
      fragranceWordCloud
    };
  }

  private getEmptyMetrics(): CreativeMetrics {
    return {
      heroProduct: { name: 'N/A', unitsSold: 0, revenue: 0, sharePercentage: 0 },
      showcaseProducts: [],
      trioVsBottleRatio: { trioPercent: 0, bottlePercent: 100, note: 'No data' },
      fragranceWordCloud: []
    };
  }
}
