import { log } from "../../config"
import { ExamStatusCache } from "../../types/status"

export class ExamAnalyticsStore {
  store: Map<string, ExamStatusCache>

  constructor() {
    this.store = new Map<string, ExamStatusCache>()
  }

  public getStore(): Map<string, ExamStatusCache> {
    return this.store
  }

  public setKey(k: string, v: ExamStatusCache): void {
    log.warn(`User Status: id - ${k} - status - ${v}`)
    this.store.set(k, v)
  }

  public updateKey(k: string, v: ExamStatusCache): void {
    if (this.store.has(k)) {
      log.warn(`User Status: id - ${k} - status - ${v}`)
      this.store.set(k, v)
      return
    }
  }

  public getValue(k: string): ExamStatusCache | undefined {
    return this.store.get(k)
  }

  public delKey(k: string): boolean {
    return this.store.delete(k)
  }
}
