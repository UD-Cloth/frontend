// Promotion admin/public hooks. Re-exports from useMarketing.ts.
export {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useValidatePromoCode,
} from './useMarketing';
export type { Promotion, ValidatePromoResponse } from './useMarketing';
