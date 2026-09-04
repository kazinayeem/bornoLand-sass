"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useProvisionEmployeeLoginMutation,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useGetShiftsQuery,
  type Employee,
  type EmployeeLoginAccount,
} from "@/redux/api/hrm-api";
import { useHasPermission } from "@/features/session/hooks";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  Building,
  ShieldAlert,
  UserCheck,
  DollarSign,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { StorePageCard } from "@/components/store-dashboard/store-page";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const ASSIGNABLE_ROLES = [
  { value: "employee", label: "Employee" },
  { value: "staff", label: "Staff" },
  { value: "cashier", label: "Cashier" },
  { value: "hr_staff", label: "HR Staff" },
  { value: "viewer", label: "Viewer" },
] as const;

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full time" },
  { value: "part_time", label: "Part time" },
  { value: "contractual", label: "Contractual" },
  { value: "intern", label: "Intern" },
  { value: "probation", label: "Probation" },
] as const;

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function roleLabel(role: string) {
  return ASSIGNABLE_ROLES.find((item) => item.value === role)?.label || role;
}

export default function EmployeesPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successState, setSuccessState] = useState<{
    employee: Employee;
    loginAccount: EmployeeLoginAccount;
  } | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [memberRole, setMemberRole] = useState("employee");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [joiningDate, setJoiningDate] = useState(todayIsoDate());
  const [basicSalary, setBasicSalary] = useState("25000");

  const hasAccess = useHasPermission("hrm:read");
  const canCreate = useHasPermission("hrm:create");

  const { data: empData, isLoading, refetch, isError } = useGetEmployeesQuery(
    { storeId, page: 1, limit: 50, search: search || undefined },
    { skip: !storeId }
  );

  const { data: deptsData } = useGetDepartmentsQuery(storeId, { skip: !storeId || !isModalOpen });
  const { data: desigsData } = useGetDesignationsQuery(storeId, { skip: !storeId || !isModalOpen });
  const { data: shiftsData } = useGetShiftsQuery(storeId, { skip: !storeId || !isModalOpen });

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [provisionLogin, { isLoading: isProvisioning }] = useProvisionEmployeeLoginMutation();

  const employees = empData?.data?.employees ?? [];
  const total = empData?.data?.total ?? employees.length;
  const departments = deptsData?.data?.departments ?? [];
  const designations = desigsData?.data?.designations ?? [];
  const shifts = shiftsData?.data?.shifts ?? [];

  const metrics = useMemo(() => {
    const activeCount = employees.filter((e) => e.status === "active").length;
    const totalPayroll = employees.reduce((sum, e) => sum + (e.salaryStructure?.grossSalary || e.salaryStructure?.basic || 0), 0);
    return { activeCount, totalPayroll };
  }, [employees]);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmployeeCode("");
    setEmail("");
    setPhone("");
    setDepartmentId("");
    setDesignationId("");
    setShiftId("");
    setMemberRole("employee");
    setEmploymentType("full_time");
    setJoiningDate(todayIsoDate());
    setBasicSalary("25000");
    setSuccessState(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast.error("First name and email are required");
      return;
    }
    if (phone.replace(/[^\d]/g, "").length < 8) {
      toast.error("A mobile number of at least 8 digits is required. It is used as the temporary login password.");
      return;
    }

    try {
      const result = await createEmployee({
        storeId,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          employeeCode: employeeCode.trim() || undefined,
          email: email.trim(),
          phone: phone.trim(),
          memberRole,
          employmentType,
          joiningDate,
          departmentId: departmentId || undefined,
          designationId: designationId || undefined,
          shiftId: shiftId || undefined,
          salaryStructure: {
            basic: Number(basicSalary) || 0,
            grossSalary: Number(basicSalary) || 0,
          },
        },
      }).unwrap();

      const created = result.data?.employee;
      const loginAccount = result.data?.loginAccount;
      if (created && loginAccount) {
        setSuccessState({ employee: created, loginAccount });
      } else {
        toast.success(result.message || "Employee created successfully");
        setIsModalOpen(false);
        resetForm();
      }
      refetch();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message || "Failed to create employee")
          : "Failed to create employee";
      toast.error(message);
    }
  };

  const handleProvision = async (employee: Employee) => {
    try {
      const result = await provisionLogin({ storeId, employeeId: employee._id }).unwrap();
      toast.success(result.message || "Login account created");
      refetch();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: { message?: string } }).data?.message || "Failed to create login account")
          : "Failed to create login account";
      toast.error(message);
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-bold">Access Denied</h2>
        <p className="text-xs text-zinc-500 mt-1">
          You do not have permission to view employees.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Employees Directory (HRM)"
        description="Manage organizational staff roster, roles, designations, shifts, and compensation structures."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "HRM" },
          { label: "Employees" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs font-semibold cursor-pointer">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
            {canCreate ? (
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                size="sm"
                className="gap-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold shadow-2xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Staff"
          value={total}
          subtitle="Registered employees"
          icon={Users}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />

        <MetricCard
          title="Active On Duty"
          value={metrics.activeCount}
          subtitle="In active standing"
          icon={UserCheck}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />

        <MetricCard
          title="Monthly Payroll Commitment (BDT)"
          value={`৳${metrics.totalPayroll.toLocaleString()}`}
          subtitle="Gross basic sum"
          icon={DollarSign}
          iconClassName="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      <StorePageCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, email..."
              className="h-9 pl-9 text-xs"
            />
          </div>
          <div className="text-xs text-zinc-500">
            {total} total records
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#003399]" />
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load employees"
              message="Check your connection"
              onRetry={refetch}
            />
          ) : employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees found"
              description="Add staff members to assign roles, track attendance, and process payroll."
              action={
                canCreate ? (
                  <Button
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(true);
                    }}
                    size="sm"
                    className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Employee
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Basic Salary</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  {employees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#003399] dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase">
                            {emp.firstName[0]}{emp.lastName?.[0] || ""}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Joined {new Date(emp.joiningDate || emp.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                          <Building className="h-3 w-3 text-zinc-400" />
                          {emp.departmentId?.name || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
                          <Briefcase className="h-3 w-3 text-zinc-400" />
                          {emp.designationId?.name || "Staff"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-zinc-400" />
                          {emp.email}
                        </p>
                        {emp.phone && (
                          <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-zinc-400" />
                            {emp.phone}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        ৳{(emp.salaryStructure?.grossSalary || emp.salaryStructure?.basic || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={emp.status === "active" ? "success" : "default"}>
                          {emp.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {emp.userId ? (
                          <Badge variant="success">Linked</Badge>
                        ) : canCreate ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isProvisioning}
                            className="h-7 text-[11px]"
                            onClick={() => handleProvision(emp)}
                          >
                            Create login
                          </Button>
                        ) : (
                          <span className="text-[11px] text-zinc-400">Not linked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </StorePageCard>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-xl">
          {successState ? (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <DialogTitle>Employee created successfully</DialogTitle>
                  <DialogDescription className="mt-1">
                    {successState.loginAccount.created
                      ? "Login account created. The employee can sign in at /login with their email."
                      : "Existing login account linked. The previous password was not changed."}
                  </DialogDescription>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 p-4 text-xs">
                <div>
                  <dt className="text-zinc-500">Name</dt>
                  <dd className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {successState.employee.firstName} {successState.employee.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Employee ID</dt>
                  <dd className="font-mono font-semibold">{successState.employee.employeeCode}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Login email</dt>
                  <dd className="font-semibold">{successState.loginAccount.email}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Store</dt>
                  <dd className="font-semibold">{store?.name || "Current store"}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Role</dt>
                  <dd className="font-semibold">{roleLabel(successState.loginAccount.role)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Login account</dt>
                  <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {successState.loginAccount.created ? "Created" : "Linked"}
                  </dd>
                </div>
              </dl>
              {successState.loginAccount.created ? (
                <p className="text-xs text-zinc-500 leading-relaxed">
                  The temporary password is the mobile number saved on this employee profile. It is not shown here.
                  The employee must create a new password on first sign-in.
                </p>
              ) : null}
              <DialogFooter>
                <Button
                  type="button"
                  className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Fill in the employee profile. A login account will be created automatically.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>First Name *</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Rahim"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Khan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Employee ID</Label>
                    <Input
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="Auto EMP-0001"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Store</Label>
                    <Input value={store?.name || storeSlug} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahim@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mobile *</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01712345678"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Role *</Label>
                    <Select value={memberRole} onValueChange={setMemberRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Employment type</Label>
                    <Select value={employmentType} onValueChange={setEmploymentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <Select value={departmentId} onValueChange={setDepartmentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Designation</Label>
                    <Select value={designationId} onValueChange={setDesignationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((d) => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Shift</Label>
                    <Select value={shiftId} onValueChange={setShiftId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name} ({s.startTime} - {s.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Joining date</Label>
                    <Input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Basic Salary (BDT)</Label>
                  <Input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    placeholder="25000"
                  />
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  A login account is created with this email. The temporary password is the mobile number on file.
                  It is hashed and never shown in this screen.
                </p>

                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
                  >
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                    <span>Create Employee</span>
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
