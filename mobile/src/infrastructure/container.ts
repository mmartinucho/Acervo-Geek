import { ActivityRepository } from '@/application/ports/activity-repository';
import { MatchRepository } from '@/application/ports/match-repository';

import { MockActivityRepository } from './repositories/mock-activity-repository';
import { MockMatchRepository } from './repositories/mock-match-repository';

// Ponto único de amarração das portas. Quando o backend Supabase entrar,
// só este arquivo troca de implementação.
export const repositories: {
  match: MatchRepository;
  activity: ActivityRepository;
} = {
  match: new MockMatchRepository(),
  activity: new MockActivityRepository(),
};
