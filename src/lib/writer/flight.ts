let inflight = 0;
const idleWaiters: Array<() => void> = [];

export function hasAgentFlight(): boolean {
  return inflight > 0;
}

export function whenAgentIdle(): Promise<void> {
  if (inflight === 0) return Promise.resolve();
  return new Promise((resolve) => idleWaiters.push(resolve));
}

export async function withAgentFlight<T>(fn: () => Promise<T>): Promise<T> {
  inflight += 1;
  try {
    return await fn();
  } finally {
    inflight = Math.max(0, inflight - 1);
    if (inflight === 0) {
      const waiters = idleWaiters.splice(0);
      for (const w of waiters) w();
    }
  }
}
