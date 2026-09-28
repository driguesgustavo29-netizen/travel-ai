import { Injectable } from '@nestjs/common';
import { RecommendationEngine, TripCombination, RecommendationResult } from '../../../domain/interfaces/recommendation.interface';

@Injectable()
export class ScoreBasedRecommendationEngine implements RecommendationEngine {
  recommend(combinations: TripCombination[], budget: number, tripType: string): RecommendationResult {
    if (combinations.length === 0) throw new Error('No combinations to recommend');

    let weightPrice = 0.4, weightRating = 0.3, weightProximity = 0.2, weightStars = 0.1;
    if (tripType === 'economia') { weightPrice = 0.7; weightRating = 0.15; weightProximity = 0.1; weightStars = 0.05; }
    if (tripType === 'romantica') { weightPrice = 0.2; weightRating = 0.4; weightProximity = 0.3; weightStars = 0.1; }
    if (tripType === 'familia') { weightPrice = 0.3; weightRating = 0.3; weightProximity = 0.2; weightStars = 0.2; }

    const prices = combinations.map(c => c.totalPrice);
    const ratings = combinations.map(c => c.hotel.rating || 0);
    const distances = combinations.map(c => c.hotel.distanceToBeach ?? 0);
    const stars = combinations.map(c => c.hotel.stars || 0);

    const minP = Math.min(...prices), maxP = Math.max(...prices), rangeP = maxP - minP || 1;
    const minR = Math.min(...ratings), maxR = Math.max(...ratings), rangeR = maxR - minR || 1;
    const minD = Math.min(...distances), maxD = Math.max(...distances), rangeD = maxD - minD || 1;
    const minS = Math.min(...stars), maxS = Math.max(...stars), rangeS = maxS - minS || 1;

    const scored = combinations.map(c => {
      const priceScore = 1 - (c.totalPrice - minP) / rangeP;
      const ratingScore = (c.hotel.rating - minR) / rangeR;
      const proxScore = c.hotel.distanceToBeach !== undefined ? 1 - (c.hotel.distanceToBeach - minD) / rangeD : 0.5;
      const starsScore = (c.hotel.stars - minS) / rangeS;
      const score = weightPrice * priceScore + weightRating * ratingScore + weightProximity * proxScore + weightStars * starsScore;
      return { combination: c, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const reasons: string[] = [];
    if (best.combination.totalPrice < budget) {
      const pct = Math.round(((budget - best.combination.totalPrice) / budget) * 100);
      reasons.push(`${pct}% abaixo do seu orçamento`);
    }
    if (best.combination.hotel.rating >= 8) reasons.push(`avaliação excelente (${best.combination.hotel.rating})`);
    if (best.combination.hotel.distanceToBeach !== undefined && best.combination.hotel.distanceToBeach < 10) {
      reasons.push(`próximo à praia (${best.combination.hotel.distanceToBeach}km)`);
    }
    if (best.combination.hotel.stars >= 4) reasons.push(`hotel ${best.combination.hotel.stars} estrelas`);

    const justification = reasons.length > 0
      ? `Escolhemos esta opção porque ${reasons.join(', ')}.`
      : 'Escolhemos esta opção por ter o melhor custo-benefício para o seu perfil.';

    return { combination: best.combination, score: best.score, justification };
  }
}
