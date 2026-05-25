import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Plan } from "@/redux/api/store-api";

type PlanState = {
  plans: Plan[];
  selectedPlan: Plan | null;
};

const initialState: PlanState = {
  plans: [],
  selectedPlan: null
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlans(state, action: PayloadAction<Plan[]>) {
      state.plans = action.payload;
    },
    setSelectedPlan(state, action: PayloadAction<Plan | null>) {
      state.selectedPlan = action.payload;
    },
    clearPlanState() {
      return { ...initialState };
    }
  }
});

export const { setPlans, setSelectedPlan, clearPlanState } = planSlice.actions;
export const planReducer = planSlice.reducer;