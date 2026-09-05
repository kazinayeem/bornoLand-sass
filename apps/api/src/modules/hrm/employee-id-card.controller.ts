import type { Request, Response } from "express";
import crypto from "crypto";
import path from "path";
import QRCode from "qrcode";
import type { PermissionRequest } from "../../common/middleware/store-permission.middleware.js";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { connectDatabase } from "../../common/database/connection.js";
import { EmployeeModel } from "./employee.model.js";
import { StoreModel } from "../stores/store.model.js";
import { StoreSettingsModel } from "../stores/store-settings.model.js";
import { getStorageProvider } from "../media/providers/index.js";
import { resolveCurrentEmployee } from "./hrm-self-service.controller.js";

function getBaseAppUrl(): string {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

/**
 * Ensures an employee has a persistent, tamper-resistant verification token.
 */
function ensureVerificationToken(employee: any): string {
  if (employee.verificationToken && employee.verificationToken.trim()) {
    return employee.verificationToken;
  }
  const token = `BL-VER-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
  employee.verificationToken = token;
  return token;
}

/**
 * Generates structured Employee ID Card data including store branding and QR code.
 */
export async function buildEmployeeIdCardPayload(employeeDoc: any, storeDoc: any) {
  const token = ensureVerificationToken(employeeDoc);
  if (employeeDoc.isModified && employeeDoc.isModified("verificationToken")) {
    await employeeDoc.save();
  }

  const appUrl = getBaseAppUrl();
  const verificationUrl = `${appUrl}/verify/employee/${token}`;

  // Generate high-resolution QR code data URL
  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("[ID Card QR Error]", err);
  }

  const storeSettings = await StoreSettingsModel.findOne({ storeId: storeDoc._id }).lean();

  return {
    employee: {
      _id: String(employeeDoc._id),
      employeeCode: employeeDoc.employeeCode,
      firstName: employeeDoc.firstName,
      lastName: employeeDoc.lastName,
      fullName: `${employeeDoc.firstName} ${employeeDoc.lastName}`.trim(),
      email: employeeDoc.email,
      phone: employeeDoc.phone || "",
      photoUrl: employeeDoc.photoUrl || "",
      bloodGroup: employeeDoc.bloodGroup || "",
      gender: employeeDoc.gender || "male",
      employmentType: employeeDoc.employmentType || "full_time",
      status: employeeDoc.status || "active",
      joiningDate: employeeDoc.joiningDate || employeeDoc.createdAt,
      address: employeeDoc.address || "",
      emergencyContact: employeeDoc.emergencyContact || null,
      department: employeeDoc.departmentId?.name || "General",
      departmentCode: employeeDoc.departmentId?.code || "",
      designation: employeeDoc.designationId?.name || employeeDoc.designationId?.title || "Staff Member",
      verificationToken: token,
    },
    store: {
      _id: String(storeDoc._id),
      name: storeDoc.name || "BornoLand Merchant",
      slug: storeDoc.slug || "",
      logoUrl: storeDoc.logoUrl || "",
      brandColor: storeDoc.brandColor || "#003399",
      accentColor: storeDoc.accentColor || "#0f172a",
      website: storeDoc.customDomains?.[0] ? `https://${storeDoc.customDomains[0]}` : `${storeDoc.slug}.bornoland.com`,
      tagline: storeDoc.tagline || "Official Workspace",
      contactEmail: (storeSettings as any)?.lowStockAlertEmail || "",
      timezone: (storeSettings as any)?.timezone || "Asia/Dhaka",
    },
    cardMeta: {
      standard: "CR80",
      dimensions: "85.60mm × 53.98mm",
      aspectRatio: "1.586",
      issuedAt: employeeDoc.joiningDate || employeeDoc.createdAt,
      verificationUrl,
      qrCodeDataUrl,
    },
  };
}

// ── 1. Admin/HR: Get Employee ID Card Data ───────────────────────────────────
export async function getEmployeeIdCardAdminController(req: Request, res: Response) {
  try {
    await connectDatabase();
    const storeId = String(req.params.storeId || (req as any).storeContext?.storeId);
    const employeeId = String(req.params.employeeId);

    const employee = await EmployeeModel.findOne({ _id: employeeId, storeId })
      .populate("departmentId", "name code")
      .populate("designationId", "name title code")
      .populate("shiftId", "name startTime endTime");

    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee not found in this store" });
    }

    const store = await StoreModel.findById(storeId).lean();
    if (!store) {
      return res.status(404).json({ ok: false, message: "Store not found" });
    }

    const payload = await buildEmployeeIdCardPayload(employee, store);
    return res.json({ ok: true, data: payload });
  } catch (error: any) {
    console.error("[getEmployeeIdCardAdminController Error]", error);
    return res.status(500).json({ ok: false, message: error?.message || "Failed to load ID card data" });
  }
}

// ── 2. Self-Service: Get Logged-in Employee's Own ID Card ────────────────────
export async function getMyEmployeeIdCardController(req: PermissionRequest, res: Response) {
  try {
    await connectDatabase();
    const employee = await resolveCurrentEmployee(req);
    if (!employee) {
      return res.status(404).json({
        ok: false,
        message: "No active employee profile found linked to your account in this store",
      });
    }

    const store = await StoreModel.findById(employee.storeId).lean();
    if (!store) {
      return res.status(404).json({ ok: false, message: "Store not found" });
    }

    const payload = await buildEmployeeIdCardPayload(employee, store);
    return res.json({ ok: true, data: payload });
  } catch (error: any) {
    console.error("[getMyEmployeeIdCardController Error]", error);
    const status = error?.statusCode || 500;
    return res.status(status).json({ ok: false, message: error?.message || "Failed to load your ID card" });
  }
}

// ── 3. Public Verification Endpoint (via QR Code scan) ──────────────────────
export async function verifyEmployeePublicController(req: Request, res: Response) {
  try {
    await connectDatabase();
    const token = String(req.params.token || "").trim();
    if (!token) {
      return res.status(400).json({ ok: false, message: "Verification token is required" });
    }

    const employee: any = await EmployeeModel.findOne({ verificationToken: token })
      .populate("departmentId", "name code")
      .populate("designationId", "name title code")
      .lean();

    if (!employee) {
      return res.status(404).json({
        ok: false,
        verified: false,
        message: "Invalid or expired employee verification token",
      });
    }

    const store = await StoreModel.findById(employee.storeId)
      .select("name slug logoUrl brandColor published status")
      .lean();

    // Return STRICTLY safe public verification data — zero private HR info
    return res.json({
      ok: true,
      verified: true,
      data: {
        employee: {
          employeeCode: employee.employeeCode,
          fullName: `${employee.firstName} ${employee.lastName}`.trim(),
          photoUrl: employee.photoUrl || "",
          designation: employee.designationId?.name || employee.designationId?.title || "Staff Member",
          department: employee.departmentId?.name || "General",
          bloodGroup: employee.bloodGroup || "",
          status: employee.status, // "active", "on_leave", "suspended", "terminated"
          joiningDate: employee.joiningDate || employee.createdAt,
        },
        store: {
          name: (store as any)?.name || "BornoLand Store",
          slug: (store as any)?.slug || "",
          logoUrl: (store as any)?.logoUrl || "",
          brandColor: (store as any)?.brandColor || "#003399",
        },
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, message: error?.message || "Verification service error" });
  }
}

// ── 4. Admin Photo Upload for Employee ───────────────────────────────────────
export async function uploadEmployeePhotoAdminController(req: AuthRequest, res: Response) {
  try {
    await connectDatabase();
    const storeId = String(req.params.storeId || (req as any).storeContext?.storeId);
    const employeeId = String(req.params.employeeId);

    const employee = await EmployeeModel.findOne({ _id: employeeId, storeId });
    if (!employee) {
      return res.status(404).json({ ok: false, message: "Employee not found" });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ ok: false, message: "No photo file provided" });
    }

    const store = await StoreModel.findById(storeId).select("slug").lean();
    const storeSlug = (store as any)?.slug || "store";

    const provider = getStorageProvider();
    const ext = path.extname(file.originalname) || ".jpg";
    const storedName = `emp-${employee.employeeCode}-${Date.now()}${ext}`;

    const uploadResult = await provider.upload({
      storeSlug,
      folder: "employee-profiles",
      storedName,
      buffer: file.buffer,
      mimeType: file.mimetype,
    });

    employee.photoUrl = uploadResult.publicUrl;
    await employee.save();

    return res.json({
      ok: true,
      message: "Employee profile photo updated successfully",
      data: {
        photoUrl: uploadResult.publicUrl,
        employee,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ ok: false, message: error?.message || "Failed to upload photo" });
  }
}
