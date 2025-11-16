'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { createApiClient } from '@/src/lib/api-client';

export type EnergyLevel = 'low' | 'medium' | 'high';

export interface TaskWithMetadata {
  task: any;
  metadata?: {
    difficulty?: 'low' | 'medium' | 'high';
    durationEstimate?: number;
    energyRequired?: 'low' | 'medium' | 'high';
    importanceScore?: number;
    category?: string;
    streakImpact?: number;
  };
  urgencyScore?: number;
  importanceScore?: number;
  energyAlignment?: number;
  habitImpact?: number;
  difficultyPenalty?: number;
  totalScore?: number;
  reason?: string;
}

export interface RecommendationResult {
  recommendedTask: TaskWithMetadata | null;
  alternatives: TaskWithMetadata[];
  suggestedPomodoroMinutes?: number;
  reason: string;
}

export interface DailyPlan {
  tasks: TaskWithMetadata[];
  estimatedTotalTime: number;
  suggestedSequence: string[];
  energyDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface FocusProfile {
  userId: string;
  preferredWorkTimes: string[];
  peakEnergySlots: string[];
  defaultPomodoroMinutes: number;
  energyTrackingEnabled: boolean;
}

export interface DailyContext {
  userId: string;
  date: string;
  energy: EnergyLevel;
  availableMinutes: number;
  currentTimeBlock: string;
  lastUpdated: string;
}

export function useFocusCompass() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const api = createApiClient(() => getToken());

  // Get context
  const { data: context, isLoading: isLoadingContext } = useQuery({
    queryKey: ['focusCompass', 'context'],
    queryFn: async () => {
      return await api.focusCompass.getContext();
    },
  });

  // Get recommendation
  const getRecommendation = async (params?: {
    energy?: EnergyLevel;
    skipTaskIds?: string[];
    availableMinutes?: number;
  }) => {
    return await api.focusCompass.getRecommendation(params) as RecommendationResult;
  };

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (data: {
      taskId?: string;
      duration?: number;
      energy?: EnergyLevel;
    }) => {
      return await api.focusCompass.startSession(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusCompass'] });
      queryClient.invalidateQueries({ queryKey: ['pomodoro'] });
    },
  });

  // Update energy mutation
  const updateEnergyMutation = useMutation({
    mutationFn: async (energy: EnergyLevel) => {
      return await api.focusCompass.updateEnergy(energy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusCompass'] });
    },
  });

  // Update available time mutation
  const updateAvailableTimeMutation = useMutation({
    mutationFn: async (availableMinutes: number) => {
      return await api.focusCompass.updateAvailableTime(availableMinutes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusCompass'] });
    },
  });

  // Get daily plan
  const getDailyPlan = async (params?: {
    energy?: EnergyLevel;
    availableMinutes?: number;
  }) => {
    return await api.focusCompass.getDailyPlan(params) as DailyPlan;
  };

  // Get/Update profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['focusCompass', 'profile'],
    queryFn: async () => {
      return await api.focusCompass.getProfile() as FocusProfile;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<FocusProfile>) => {
      return await api.focusCompass.updateProfile(data) as FocusProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusCompass', 'profile'] });
    },
  });

  // Get daily context
  const { data: dailyContext, isLoading: isLoadingDailyContext } = useQuery({
    queryKey: ['focusCompass', 'dailyContext'],
    queryFn: async () => {
      return await api.focusCompass.getDailyContext() as DailyContext;
    },
  });

  // Task metadata
  const updateTaskMetadataMutation = useMutation({
    mutationFn: async ({ taskId, metadata }: { taskId: string; metadata: any }) => {
      return await api.focusCompass.updateTaskMetadata(taskId, metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focusCompass'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const getTaskMetadata = async (taskId: string) => {
    return await api.focusCompass.getTaskMetadata(taskId);
  };

  return {
    // Context
    context,
    isLoadingContext,
    
    // Recommendation
    getRecommendation,
    
    // Session
    startSession: startSessionMutation.mutateAsync,
    isStartingSession: startSessionMutation.isPending,
    
    // Energy
    updateEnergy: updateEnergyMutation.mutateAsync,
    isUpdatingEnergy: updateEnergyMutation.isPending,
    
    // Available time
    updateAvailableTime: updateAvailableTimeMutation.mutateAsync,
    isUpdatingAvailableTime: updateAvailableTimeMutation.isPending,
    
    // Daily plan
    getDailyPlan,
    
    // Profile
    profile,
    isLoadingProfile,
    updateProfile: updateProfileMutation.mutateAsync,
    
    // Daily context
    dailyContext,
    isLoadingDailyContext,
    
    // Task metadata
    updateTaskMetadata: updateTaskMetadataMutation.mutateAsync,
    getTaskMetadata,
  };
}

