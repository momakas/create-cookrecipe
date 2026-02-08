import { useState, useEffect, useCallback } from "react";
import { dinnerRepository } from "../repositories/dinnerRepository";
import {
  DinnerHistory,
  CreateDinnerInput,
  UpdateDinnerInput,
} from "../types/database";

interface UseDinnerHistoryResult {
  readonly dinners: readonly DinnerHistory[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly addDinner: (input: CreateDinnerInput) => Promise<void>;
  readonly updateDinner: (
    id: string,
    input: UpdateDinnerInput
  ) => Promise<void>;
  readonly removeDinner: (id: string) => Promise<void>;
  readonly refresh: () => Promise<void>;
}

export function useDinnerHistory(): UseDinnerHistoryResult {
  const [dinners, setDinners] = useState<readonly DinnerHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDinners = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dinnerRepository.findAll();
      setDinners(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "晩御飯履歴の取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDinners();
  }, [fetchDinners]);

  const addDinner = useCallback(
    async (input: CreateDinnerInput) => {
      await dinnerRepository.create(input);
      await fetchDinners();
    },
    [fetchDinners]
  );

  const updateDinner = useCallback(
    async (id: string, input: UpdateDinnerInput) => {
      await dinnerRepository.update(id, input);
      await fetchDinners();
    },
    [fetchDinners]
  );

  const removeDinner = useCallback(
    async (id: string) => {
      await dinnerRepository.remove(id);
      await fetchDinners();
    },
    [fetchDinners]
  );

  return {
    dinners,
    isLoading,
    error,
    addDinner,
    updateDinner,
    removeDinner,
    refresh: fetchDinners,
  };
}
