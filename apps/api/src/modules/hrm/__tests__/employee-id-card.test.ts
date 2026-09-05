import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import dotenvFlow from "dotenv-flow";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "../../../../");
const repoRoot = path.resolve(appDir, "../../");
dotenvFlow.config({ path: appDir, node_env: process.env.NODE_ENV ?? "development", silent: true });
dotenvFlow.config({ path: repoRoot, node_env: process.env.NODE_ENV ?? "development", silent: true });

import mongoose from "mongoose";
import { connectDatabase } from "../../../common/database/connection.js";
import { StoreModel } from "../../../models/store.model.js";
import { EmployeeModel } from "../employee.model.js";
import { DepartmentModel, DesignationModel } from "../organization.model.js";
import { ShiftModel } from "../shift.model.js";
import {
  getEmployeeIdCardAdminController,
  getMyEmployeeIdCardController,
  verifyEmployeePublicController,
} from "../employee-id-card.controller.js";

describe("HRM Employee ID Card & Verification Suite", () => {
  let storeId: mongoose.Types.ObjectId;
  let employeeUserId: mongoose.Types.ObjectId;
  let employeeId: mongoose.Types.ObjectId;
  let departmentId: mongoose.Types.ObjectId;
  let designationId: mongoose.Types.ObjectId;
  let verificationToken: string = "";

  const mockResponse = () => {
    const res: any = {};
    res.statusCode = 200;
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data: any) => {
      res.data = data;
      return res;
    };
    return res;
  };

  before(async () => {
    await connectDatabase();

    storeId = new mongoose.Types.ObjectId();
    employeeUserId = new mongoose.Types.ObjectId();
    departmentId = new mongoose.Types.ObjectId();
    designationId = new mongoose.Types.ObjectId();

    await StoreModel.create({
      _id: storeId,
      tenantId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      name: "Acme Superstore",
      slug: `acme-store-${Date.now()}`,
      currency: "BDT",
      plan: "business",
      billingStatus: "active",
      subscriptionStatus: "active",
      status: "active",
      branding: {
        brandColor: "#003399",
        accentColor: "#10b981",
        website: "https://acmestore.com",
      },
    });

    await DepartmentModel.create({
      _id: departmentId,
      storeId,
      name: "Information Technology",
      code: "IT",
    });

    await DesignationModel.create({
      _id: designationId,
      storeId,
      name: "Senior Software Engineer",
      code: "SSE",
      departmentId,
    });

    const emp = await EmployeeModel.create({
      storeId,
      userId: employeeUserId,
      firstName: "Tanvir",
      lastName: "Hasan",
      employeeCode: "EMP-CARD-001",
      email: "tanvir.hasan@acmestore.com",
      phone: "+8801811223344",
      bloodGroup: "A+",
      emergencyContact: {
        name: "Nasir Hasan",
        relation: "Father",
        phone: "+8801811223399",
      },
      departmentId,
      designationId,
      salaryStructure: {
        basic: 60000,
        houseRent: 24000,
        grossSalary: 93000,
      },
      bankInfo: {
        bankName: "City Bank PLC",
        accountNumber: "123456789012",
      },
      status: "active",
      joiningDate: new Date("2024-01-15"),
    });

    employeeId = emp._id as mongoose.Types.ObjectId;
  });

  after(async () => {
    await EmployeeModel.deleteMany({ storeId });
    await DepartmentModel.deleteMany({ storeId });
    await DesignationModel.deleteMany({ storeId });
    await StoreModel.deleteOne({ _id: storeId });
    await mongoose.disconnect();
  });

  it("1. Generates CR80 ID card payload for HR/Admin with QR code and safe attributes", async () => {
    const req: any = {
      storeContext: { storeId: String(storeId) },
      params: { employeeId: String(employeeId) },
      protocol: "https",
      get: () => "app.bornoland.com",
    };
    const res = mockResponse();

    await getEmployeeIdCardAdminController(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.ok, true);

    const card = res.data.data;
    assert.ok(card);

    // CR80 Specifications
    assert.equal(card.cardMeta.standard, "CR80");
    assert.equal(card.cardMeta.dimensions, "53.98mm × 85.60mm");
    assert.equal(card.cardMeta.aspectRatio, "1.586");
    assert.ok(card.cardMeta.issuedAt);
    assert.match(card.cardMeta.qrCodeDataUrl, /^data:image\/png;base64,/);
    assert.match(card.cardMeta.verificationUrl, /\/verify\/employee\/BL-VER-/);

    // Employee Attributes
    assert.equal(card.employee.fullName, "Tanvir Hasan");
    assert.equal(card.employee.employeeCode, "EMP-CARD-001");
    assert.equal(card.employee.designation, "Senior Software Engineer");
    assert.equal(card.employee.department, "Information Technology");
    assert.equal(card.employee.bloodGroup, "A+");
    assert.equal(card.employee.emergencyContact?.name, "Nasir Hasan");

    // Store Branding
    assert.equal(card.store.name, "Acme Superstore");
    assert.equal(card.store.brandColor, "#003399");

    // Security check: NO salary or banking information exposed
    assert.equal((card.employee as any).salaryStructure, undefined);
    assert.equal((card.employee as any).bankInfo, undefined);
    assert.equal((card.employee as any).password, undefined);

    // Save token for next public test
    verificationToken = card.employee.verificationToken;
    assert.ok(verificationToken);
    assert.match(verificationToken, /^BL-VER-/);
  });

  it("2. Logged-in employee can access their ID card via Self-Service", async () => {
    const req: any = {
      storeContext: { storeId: String(storeId) },
      user: { userId: String(employeeUserId) },
      protocol: "https",
      get: () => "app.bornoland.com",
    };
    const res = mockResponse();

    await getMyEmployeeIdCardController(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.ok, true);
    assert.equal(res.data.data.employee.employeeCode, "EMP-CARD-001");
    assert.equal(res.data.data.employee.verificationToken, verificationToken);
  });

  it("3. Public QR Verification endpoint validates genuine employee token", async () => {
    const req: any = {
      params: { token: verificationToken },
    };
    const res = mockResponse();

    await verifyEmployeePublicController(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.ok, true);

    const pub = res.data.data;
    assert.ok(pub.verifiedAt);
    assert.equal(pub.employee.fullName, "Tanvir Hasan");
    assert.equal(pub.employee.employeeCode, "EMP-CARD-001");
    assert.equal(pub.employee.designation, "Senior Software Engineer");
    assert.equal(pub.employee.department, "Information Technology");
    assert.equal(pub.store.name, "Acme Superstore");

    // Ensure zero leakage of sensitive fields to public
    assert.equal((pub.employee as any).salaryStructure, undefined);
    assert.equal((pub.employee as any).bankInfo, undefined);
    assert.equal((pub.employee as any).phone, undefined);
    assert.equal((pub.employee as any).email, undefined);
    assert.equal((pub.employee as any).emergencyContact, undefined);
  });

  it("4. Public QR Verification returns 404 for invalid or forged token", async () => {
    const req: any = {
      params: { token: "BL-VER-FORGED-FAKE-TOKEN" },
    };
    const res = mockResponse();

    await verifyEmployeePublicController(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.data.ok, false);
    assert.match(res.data.message, /Invalid or expired/i);
  });
});
