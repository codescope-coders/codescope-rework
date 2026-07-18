import ApiClient from "@/lib/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateEmployeeDto,
  EmployeeDto,
  SheetDto,
  SheetItemInput,
  UpdateEmployeeDto,
} from "@/services/payroll";

interface EmployeesResponse {
  message: string;
  payload: EmployeeDto[];
}
interface SheetsResponse {
  message: string;
  payload: SheetDto[];
}
interface IdsResponse {
  message: string;
  payload: number[];
}

const employeesApi = new ApiClient<unknown, EmployeesResponse>("/payroll");
const sheetsApi = new ApiClient<unknown, SheetsResponse>("/payroll/sheets");
const unpaidApi = new ApiClient<unknown, IdsResponse>("/payroll/unpaid-leaves");

/* ── Employees ─────────────────────────────────────────────────────────────*/
export const useEmployees = () =>
  useQuery({ queryFn: employeesApi.get, queryKey: ["payroll", "employees"] });

function useInvalidateEmployees() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["payroll", "employees"] });
    qc.invalidateQueries({ queryKey: ["ledger"] });
    qc.invalidateQueries({ queryKey: ["requests"] });
  };
}

export const useCreateEmployee = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) =>
      new ApiClient<CreateEmployeeDto, { message: string }>("/payroll").post(data),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};

export const useSaveEmployee = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDto }) =>
      new ApiClient<UpdateEmployeeDto, { message: string }>(`/payroll/${id}`).put(data),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};

export const useDeleteEmployee = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/payroll/${id}`).delete(),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};

export const usePayEmployee = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/payroll/${id}/pay`).post(),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};

/* ── Monthly sheets ────────────────────────────────────────────────────────*/
export const useSheets = () =>
  useQuery({ queryFn: sheetsApi.get, queryKey: ["payroll", "sheets"] });

export const useUnpaidLeaveUserIds = () =>
  useQuery({ queryFn: unpaidApi.get, queryKey: ["payroll", "unpaidLeaves"] });

function useInvalidateSheets() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["payroll", "sheets"] });
    qc.invalidateQueries({ queryKey: ["payroll", "employees"] });
    qc.invalidateQueries({ queryKey: ["ledger"] });
  };
}

export const useCreateSheet = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateSheets();
  return useMutation({
    mutationFn: (body: { items: SheetItemInput[]; month?: string }) =>
      new ApiClient<typeof body, { message: string }>("/payroll/sheets").post(body),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};

export const useSaveSheet = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateSheets();
  return useMutation({
    mutationFn: ({ id, items }: { id: number; items: SheetItemInput[] }) =>
      new ApiClient<{ items: SheetItemInput[] }, { message: string }>(
        `/payroll/sheets/${id}`,
      ).put({ items }),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};

export const useDecideSheet = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateSheets();
  return useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: "PAID" | "REJECTED" }) =>
      new ApiClient<{ decision: string }, { message: string }>(
        `/payroll/sheets/${id}`,
      ).put({ decision }),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};

export const useDeleteSheet = (scss?: (m: string) => void) => {
  const invalidate = useInvalidateSheets();
  return useMutation({
    mutationFn: (id: number) =>
      new ApiClient<unknown, { message: string }>(`/payroll/sheets/${id}`).delete(),
    onSuccess: (r) => {
      invalidate();
      scss?.(r?.message);
    },
  });
};
