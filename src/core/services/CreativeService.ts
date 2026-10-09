import { NormalizedOrder } from '../../types/order';
import { CreativeMetrics, ShowcaseProduct } from '../../types/analytics';

export class CreativeService {
  calculateMetrics(orders: NormalizedOrder[]): CreativeMetrics {
    if (!orders || orders.length === 0) {
      return this.getEmptyMetrics();
    }

    const scentMap = new Map<string, { units: number; revenue: number }>();
    let totalTrioQty = 0;
    let totalBottleQty = 0;

    for (const order of orders) {
      totalTrioQty += order.trioQty;
      totalBottleQty += (order.qty50ml + order.qty100ml);

      for (const item of order.fragrancesParsed) {
        if (!item.name) continue;
        const current = scentMap.get(item.name) || { units: 0, revenue: 0 };
        current.units += 1;
        current.revenue += item.size === '100ml' ? 22 : 16;
        scentMap.set(item.name, current);
      }
    }

    // Sort scents by volume
    const sortedScents = Array.from(scentMap.entries()).sort((a, b) => b[1].units - a[1].units);
    const totalVolume = sortedScents.reduce((acc, curr) => acc + curr[1].units, 0) || 1;

    // Hero product
    const heroEntry = sortedScents[0] || ['Visionary', { units: 1, revenue: 20 }];
    const heroProduct = {
      name: heroEntry[0],
      unitsSold: heroEntry[1].units,
      revenue: Math.round(heroEntry[1].revenue * 100) / 100,
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
        recommendedAsset: 'TikTok hook video featuring 100ml bottle uncapping macro shot.'
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
        revenue: Math.round(item[1].revenue * 100) / 100,
        visualHook: template.visualHook,
        recommendedAsset: template.recommendedAsset,
        badge: template.badge
      };
    });

    // Aesthetic trend (Trio vs Individual bottles)
    const combined = (totalTrioQty + totalBottleQty) || 1;
    const trioPercent = Math.round((totalTrioQty / combined) * 100);
    const bottlePercent = 100 - trioPercent;
    const note = trioPercent > 20
      ? 'Trio Sets represent over 20% of cart volume! Feature the 3-bottle gift box prominently in ad creatives.'
      : 'Individual 100ml & 50ml bottles dominate cart choice. Focus creative assets on solitary flagship bottles.';

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
