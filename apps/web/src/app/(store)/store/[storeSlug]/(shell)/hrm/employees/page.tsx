"use client";

import { useState } from "react";
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
  Filter,
  RefreshCw,
  Mail,
  Phone,
  Briefcase,
  Building,
  Clock,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function EmployeesPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const { language } = useLanguage();
  const isBn = language === "bn";

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

  const { data: empData, isLoading, refetch } = useGetEmployeesQuery(
    { storeId, page, limit: 20, search: search || undefined },
    { skip: !storeId }
  );

  const { data: deptsData } = useGetDepartmentsQuery(storeId, { skip: !storeId || !isModalOpen });
  const { data: desigsData } = useGetDesignationsQuery(storeId, { skip: !storeId || !isModalOpen });
  const { data: shiftsData } = useGetShiftsQuery(storeId, { skip: !storeId || !isModalOpen });

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();

  const employees = empData?.data?.employees ?? [];
  const total = empData?.data?.total ?? 0;
  const departments = deptsData?.data?.departments ?? [];
  const designations = desigsData?.data?.designations ?? [];
  const shifts = shiftsData?.data?.shifts ?? [];

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
        <h2 className="mt-4 text-lg font-semibold">{isBn ? "অনুমতি নেই" : "Access Denied"}</h2>
        <p className="text-sm text-zinc-500 mt-1">
          {isBn ? "কর্মী তালিকা দেখার অনুমতি নেই।" : "You do not have permission to view employees."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <span>{isBn ? "কর্মকর্তা ও কর্মচারী মাস্টার (HRM)" : "Employees Directory"}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isBn
              ? "প্রতিষ্ঠানের সমস্ত কর্মীর প্রোফাইল, বিভাগ, পদবী, কাজের শিফট ও বেতন কাঠামো পরিচালনা করুন।"
              : "Manage organization staff, job designations, shifts, contact information, and salary structures."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? "নতুন কর্মী যুক্ত করুন" : "Add Employee"}</span>
          </Button>
        </div>
      </div>

      <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <CardHeader className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 max-w-sm w-full">
            <Search className="h-4 w-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBn ? "নাম, কোড বা ইমেইল দিয়ে খুঁজুন..." : "Search by name, code, email..."}
              className="h-9 text-xs"
            />
          </div>
          <div className="text-xs text-zinc-500">
            {isBn ? `মোট ${total} জন কর্মী` : `${total} total employees`}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">{isBn ? "আইডি কোড" : "Emp Code"}</th>
                  <th className="px-4 py-3">{isBn ? "কর্মী নাম" : "Employee"}</th>
                  <th className="px-4 py-3">{isBn ? "বিভাগ" : "Department"}</th>
                  <th className="px-4 py-3">{isBn ? "পদবী" : "Designation"}</th>
                  <th className="px-4 py-3">{isBn ? "যোগাযোগ" : "Contact"}</th>
                  <th className="px-4 py-3 text-right">{isBn ? "মূল বেতন" : "Basic Salary"}</th>
                  <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      {isBn ? "লোড হচ্ছে..." : "Loading employees..."}
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <Users className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm">{isBn ? "কোনো কর্মী পাওয়া যায়নি" : "No employees found"}</p>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-zinc-700 dark:text-zinc-300">
                        {emp.employeeCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-300">
                            {emp.firstName?.[0]}
                            {emp.lastName?.[0] || ""}
                          </div>
                          <div>
                            <div>{emp.firstName} {emp.lastName}</div>
                            <div className="text-[11px] text-zinc-400">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400">
                        {emp.departmentId?.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        {emp.designationId?.name || "Staff"}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {emp.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                        ৳{emp.salaryStructure?.basic?.toLocaleString() || "0"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                            emp.status === "active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                <span>{isBn ? "নতুন কর্মী প্রোফাইল তৈরি" : "Add New Employee"}</span>
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? "নতুন কর্মীর ব্যক্তিগত তথ্য, বিভাগ ও বেতন কাঠামো নির্ধারণ করুন।"
                  : "Onboard a new employee with designated department and base salary structure."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "নামের প্রথম অংশ *" : "First Name *"}</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Shakib"
                    required
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "নামের শেষ অংশ" : "Last Name"}</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Al Hasan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "ইমেইল *" : "Email *"}</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@company.com"
                    required
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "ফোন নম্বর" : "Phone Number"}</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "বিভাগ" : "Department"}</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder={isBn ? "বিভাগ বাছাই..." : "Select department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d: any) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "পদবী" : "Designation"}</Label>
                  <Select value={designationId} onValueChange={setDesignationId}>
                    <SelectTrigger>
                      <SelectValue placeholder={isBn ? "পদবী বাছাই..." : "Select designation"} />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((d: any) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 min-w-0">
                  <Label>{isBn ? "কাজের শিফট" : "Work Shift"}</Label>
                  <Select value={shiftId} onValueChange={setShiftId}>
                    <SelectTrigger>
                      <SelectValue placeholder={isBn ? "সাধারণ শিফট (9am-6pm)" : "General (9am-6pm)"} />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name} ({s.startTime} - {s.endTime})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{isBn ? "মূল বেতন (৳)" : "Basic Salary (৳)"}</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    placeholder="25000"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isCreating ? (isBn ? "তৈরি হচ্ছে..." : "Saving...") : isBn ? "কর্মী যুক্ত করুন" : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
