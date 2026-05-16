// Newsletter admin/public hooks. Re-exports from useMarketing.ts where the
// implementation lives, exposing the canonical names from the spec.
export {
  useSubscribers,
  useSubscribeNewsletter,
  useToggleSubscriber,
  useDeleteSubscriber,
} from './useMarketing';
export type { Subscriber } from './useMarketing';
