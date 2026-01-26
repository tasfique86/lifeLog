import { SqlitePlanRepository } from "@/services/plan/SqlitePlanRepository";
import { EntityId, Plan, PlanStatus } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const planRepo = new SqlitePlanRepository();

export function usePlans(date?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["plans", date];
  const statusesKey = ["plan_statuses"];

  // --- Queries ---

  const plansQuery = useQuery({
    queryKey,
    queryFn: () => planRepo.getPlans(date),
  });

  const statusesQuery = useQuery({
    queryKey: statusesKey,
    queryFn: () => planRepo.getStatuses(),
  });

  // --- Plan Mutations ---

  const createPlanMutation = useMutation({
    mutationFn: async (
      plan: Omit<Plan, "id" | "created_at" | "updated_at">,
    ) => {
      await planRepo.createPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: EntityId;
      updates: Partial<Plan>;
    }) => {
      await planRepo.updatePlan(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: EntityId) => {
      await planRepo.deletePlan(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  // --- Execution Mutations ---

  const startPlanMutation = useMutation({
    mutationFn: async ({
      planId,
      startTime,
    }: {
      planId: EntityId;
      startTime: string;
    }) => {
      return await planRepo.startPlan(planId, startTime);
    },
    onSuccess: () => {
      // Invalidate plans to potentially update status if we change it locally too?
      // Or just to refresh execution lists if we had them.
      // Also if starting a plan changes its status in the UI, we usually update plan status separately or here.
      // My implementation in Repo 'startPlan' only adds execution.
      // User probably expects 'Start' button to also move status to 'In Progress'.
      // I will let the UI handle calling updatePlan separately if needed, or composite it.
      // For now, simple invalidation.
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  const stopPlanMutation = useMutation({
    mutationFn: async ({
      executionId,
      endTime,
      focusLevel,
      distractionCount,
    }: {
      executionId: EntityId;
      endTime: string;
      focusLevel?: number;
      distractionCount?: number;
    }) => {
      await planRepo.stopPlan(
        executionId,
        endTime,
        focusLevel,
        distractionCount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  // --- Status Mutations ---

  const createStatusMutation = useMutation({
    mutationFn: async (
      status: Omit<PlanStatus, "id" | "created_at" | "updated_at">,
    ) => {
      await planRepo.createStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statusesKey });
    },
  });

  return {
    plans: plansQuery.data || [],
    services: {
      statuses: statusesQuery.data || [],
      isLoading: plansQuery.isLoading || statusesQuery.isLoading,
    },
    actions: {
      createPlan: createPlanMutation.mutate,
      updatePlan: updatePlanMutation.mutate,
      deletePlan: deletePlanMutation.mutate,
      startPlan: startPlanMutation.mutateAsync, // Async to get the execution ID back
      stopPlan: stopPlanMutation.mutate,
      createStatus: createStatusMutation.mutate,
    },
  };
}
