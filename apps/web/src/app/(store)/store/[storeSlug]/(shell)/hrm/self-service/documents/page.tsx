"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetStoreBySlugQuery } from "@/redux/api/store-api";
import {
  useGetMyDocumentsQuery,
  useGetMyIdCardQuery,
} from "@/redux/api/hrm-api";
import { EmployeeIdCardModal } from "@/components/hrm/employee-id-card-modal";
import { useLanguage } from "@/providers/language-provider";
import {
  FileText,
  ArrowLeft,
  Download,
  ExternalLink,
  Upload,
  Plus,
  Loader2,
  FileCheck,
  Calendar,
  IdCard,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { getApiUrl } from "@/lib/urls";

export default function MyDocumentsPage() {
  const params = useParams();
  const storeSlug = String(params.storeSlug);
  const { data: storeData } = useGetStoreBySlugQuery(storeSlug, { skip: !storeSlug });
  const store = storeData?.data?.store;
  const storeId = store?._id ?? "";

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docType, setDocType] = useState("certificate");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);

  const { data: docsData, isLoading, refetch } = useGetMyDocumentsQuery(storeId, {
    skip: !storeId,
  });
  const { data: idCardData, isLoading: isLoadingIdCard } = useGetMyIdCardQuery(storeId, {
    skip: !isIdCardOpen || !storeId,
  });

  const documents = docsData?.data?.documents ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error("Document size must be less than 15MB");
        return;
      }
      setSelectedFile(file);
      if (!docTitle) setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a document file to upload");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", docTitle || selectedFile.name);
      formData.append("documentType", docType);

      const res = await fetch(`${getApiUrl()}/stores/${storeId}/hrm/self-service/documents`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to upload document");

      toast.success("Document uploaded successfully!");
      setUploadModalOpen(false);
      setSelectedFile(null);
      setDocTitle("");
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div>
          <Link
            href={`/store/${storeSlug}/hrm/self-service`}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>My Workspace</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-[#003399]" />
            <span>My Documents</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Employment records, official appointment letters, certificates, and submitted files.
          </p>
        </div>

        <Button
          onClick={() => setUploadModalOpen(true)}
          size="sm"
          className="bg-[#003399] hover:bg-[#002B80] text-white gap-2 font-bold shadow-sm"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Featured Official Staff ID Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-800/60">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white border border-white/20 backdrop-blur-xs shrink-0">
            <IdCard className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Staff Identity Card (CR80)</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                Official
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Digital identification card with QR verification seal, physical CR80 dimensions, and print layout.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsIdCardOpen(true)}
          className="bg-white hover:bg-blue-50 text-blue-950 font-bold text-xs gap-2 shrink-0 shadow-sm"
        >
          <IdCard className="h-4 w-4 text-blue-900" />
          <span>View ID Card</span>
        </Button>
      </div>

      {/* Documents Grid / Table */}
      <Card className="border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
            Available Documents
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 mt-0.5">
            You can view or download documents assigned to your employee account.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : documents.length === 0 ? (
            <div className="p-16 text-center text-zinc-500 text-xs">
              <FileCheck className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">No documents found</p>
              <p className="text-zinc-400 mt-1">Official HR documents and certificates will be displayed here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 font-bold">Document Title</th>
                    <th className="py-3 px-4 font-bold">Type</th>
                    <th className="py-3 px-4 font-bold">Uploaded By</th>
                    <th className="py-3 px-4 font-bold">Upload Date</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {documents.map((doc: any) => (
                    <tr key={doc._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-[#003399] shrink-0" />
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {doc.title}
                            </span>
                            {doc.fileName && (
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {doc.fileName} • {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="default" className="capitalize">
                          {doc.documentType?.replace("_", " ") || "Document"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium text-zinc-600 dark:text-zinc-400">
                        {doc.uploadedBy === "hr_admin" ? "HR Department" : "You (Employee)"}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#003399] hover:underline px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View</span>
                          </a>
                          <a
                            href={doc.fileUrl}
                            download
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Document Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload certificates, identification, or supporting documents for your employee record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Document Title *</Label>
              <Input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. NID Copy / Degree Certificate"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Educational / Training Certificate</SelectItem>
                  <SelectItem value="id_proof">National ID / Passport</SelectItem>
                  <SelectItem value="tax_document">Tax / TIN Certificate</SelectItem>
                  <SelectItem value="resume">Resume / CV</SelectItem>
                  <SelectItem value="other">Other Supporting Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>File (PDF, JPEG, PNG, DOCX - max 15MB) *</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="bg-[#003399] hover:bg-[#002B80] text-white font-bold"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                <span>Upload</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <EmployeeIdCardModal
        open={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        cardData={idCardData?.data}
        isLoading={isLoadingIdCard}
        storeSlug={storeSlug}
      />
    </div>
  );
}
