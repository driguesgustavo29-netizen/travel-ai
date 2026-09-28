import { Module } from '@nestjs/common';
import { ScoreBasedRecommendationEngine } from './score-based.engine';

@Module({
  providers: [ScoreBasedRecommendationEngine],
  exports: [ScoreBasedRecommendationEngine],
})
export class RecommendationModule {}
