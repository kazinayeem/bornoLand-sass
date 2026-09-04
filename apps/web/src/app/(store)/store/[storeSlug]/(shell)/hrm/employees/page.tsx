"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useGetShiftsQuery,
} from "@/redux/api/hrm-api";
import { useLanguage } from "@/providers/language-provider";
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
  Clock,
  ShieldAlert,
  UserCheck,
  DollarSign,
  Loader2,
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
import { cn } from "@/lib/utils";

export default function EmployeesPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = false;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [basicSalary, setBasicSalary] = useState("25000");

  const hasAccess = useHasPermission("hrm:read");

  const { data: empData, isLoading, refetch, isError } = useGetEmployeesQuery(
    { storeId, page, limit: 50, search: search || undefined },
    { skip: !storeId }
  );

  const { data: deptsData } = useGetDepartmentsQuery(storeId, { skip: !storeId || !isModalOpen });
  const { data: desigsData } = useGetDesignationsQuery(storeId, { skip: !storeId || !isModalOpen });
  const { data: shiftsData } = useGetShiftsQuery(storeId, { skip: !storeId || !isModalOpen });

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast.error(isBn ? "কর্মীর নাম এবং ইমেইল লিখুন" : "First name and email are required");
      return;
    }

    try {
      await createEmployee({
        storeId,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          departmentId: departmentId || undefined,
          designationId: designationId || undefined,
          shiftId: shiftId || undefined,
          salaryStructure: {
            basic: Number(basicSalary) || 0,
            grossSalary: Number(basicSalary) || 0,
          },
        },
      }).unwrap();

      toast.success(isBn ? "কর্মী সফলভাবে তৈরি হয়েছে" : "Employee profile created successfully");
      setIsModalOpen(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setDepartmentId("");
      setDesignationId("");
      setShiftId("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create employee");
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-rose-500" />
        <h2 className="mt-4 text-lg font-bold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-xs text-zinc-500 mt-1">
          {isBn ? "কর্মী তালিকা দেখার অনুমতি নেই।" : "You do not have permission to view employees."}
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
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="gap-1.5 bg-[#003399] hover:bg-[#002B80] text-white text-xs font-bold shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </Button>
          </div>
        }
      />

      {/* ── Metric Summary ─────────────────────────────────────── */}
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
        {/* Search toolbar */}
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
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  className="bg-[#003399] text-white hover:bg-[#002B80] text-xs font-bold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Employee
                </Button>
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
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              Joined {new Date(emp.createdAt).toLocaleDateString()}
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
                          {emp.designationId?.name || (emp.designationId as any)?.title || "Staff"}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </StorePageCard>

      {/* ── Add Employee Dialog ───────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isBn ? "নতুন কর্মী যুক্ত করুন" : "Add New Employee"}</DialogTitle>
            <DialogDescription>
              {isBn
                ? "কর্মীর তথ্য, পদবী এবং প্রাথমিক বেতন কাঠামো পূরণ করুন।"
                : "Fill in the employee personal profile, department, and salary structure."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isBn ? "প্রথম নাম *" : "First Name *"}</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isBn ? "শেষ নাম" : "Last Name"}</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isBn ? "অফিসিয়াল ইমেইল *" : "Email Address *"}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@store.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{isBn ? "ফোন নম্বর" : "Phone Number"}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01700000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isBn ? "বিভাগ" : "Department"}</Label>
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
                <Label>{isBn ? "পদবী" : "Designation"}</Label>
                <Select value={designationId} onValueChange={setDesignationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name || (d as any).title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{isBn ? "শিফট" : "Shift"}</Label>
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
                <Label>{isBn ? "বেসিক বেতন (BDT)" : "Basic Salary (BDT)"}</Label>
                <Input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  placeholder="25000"
                />
              </div>
            </div>

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
        </DialogContent>
      </Dialog>
    </div>
  );
}
