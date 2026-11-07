import type { WorkerDetail } from '@/lib/types';

export interface TabProps {
  worker: WorkerDetail;
  onSaved: () => Promise<void>;
}
