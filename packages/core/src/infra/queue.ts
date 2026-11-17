// BullMQ kuyrukları (ADR-020). worker bu isimlerle Worker açar.
import { Queue } from "bullmq";
import type { Redis } from "ioredis";
import type { DeadlineJob } from "../context";

export const QUEUES = {
  /** iş verisi: AssignmentDeadlineData; jobId = assignmentId (aynı atama için ikinci iş eklenmez) */
  assignmentDeadline: "assignment-deadline",
  /** tekrarlayan: sweep-expired (dakikada bir), refresh-stats (5 dk'da bir) */
  maintenance: "maintenance",
} as const;

export interface AssignmentDeadlineData {
  assignmentId: string;
}

export function createDeadlineQueue(connection: Redis): Queue<AssignmentDeadlineData> {
  return new Queue<AssignmentDeadlineData>(QUEUES.assignmentDeadline, {
    connection,
    defaultJobOptions: { removeOnComplete: true, removeOnFail: 1000, attempts: 3, backoff: { type: "exponential", delay: 1000 } },
  });
}

/** delay = deadline - şimdi (dev ofseti dahil sunucu saatine göre). */
export async function scheduleDeadlines(queue: Queue<AssignmentDeadlineData>, jobs: DeadlineJob[], now: number): Promise<void> {
  await queue.addBulk(
    jobs.map((j) => ({
      name: QUEUES.assignmentDeadline,
      data: { assignmentId: j.assignmentId },
      opts: { jobId: j.assignmentId, delay: Math.max(0, j.deadline - now) },
    })),
  );
}
