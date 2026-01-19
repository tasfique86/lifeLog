import { SqliteTodoRepository } from "./SqliteTodoRepository";

export class RecurringTaskService {
  private repo: SqliteTodoRepository;

  constructor() {
    this.repo = new SqliteTodoRepository();
  }

  async processDailyResets() {
    try {
      console.log("Checking for recurring daily tasks to reset...");
      // 1. Get all completed 'daily' tasks
      const completedDailies =
        await this.repo.getCompletedRecurringTasks("daily");

      if (completedDailies.length === 0) {
        console.log("No completed daily tasks found.");
        return;
      }

      const today = new Date();
      const idsToReset: string[] = [];

      // 2. Filter tasks that were NOT completed today (i.e., completed yesterday or earlier)
      for (const todo of completedDailies) {
        if (!todo.completed_at) continue;

        const completedDate = new Date(todo.completed_at);
        const isSameDay =
          completedDate.getFullYear() === today.getFullYear() &&
          completedDate.getMonth() === today.getMonth() &&
          completedDate.getDate() === today.getDate();

        if (!isSameDay) {
          // Completed on a different day -> Needs Reset
          idsToReset.push(todo.id);
        }
      }

      // 3. Reset them
      if (idsToReset.length > 0) {
        console.log(
          `Resetting ${idsToReset.length} daily tasks...`,
          idsToReset,
        );
        await this.repo.resetTasks(idsToReset);
        console.log("Daily tasks reset successfully.");
      } else {
        console.log("All daily tasks were completed today. No reset needed.");
      }
    } catch (e) {
      console.error("Failed to process recurring tasks:", e);
    }
  }
}
