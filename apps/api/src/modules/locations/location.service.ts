import mongoose from "mongoose";
import {
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS,
  BANGLADESH_UPAZILAS,
  DIVISION_MAP,
  DISTRICT_MAP,
  UPAZILA_MAP,
  type DivisionItem,
  type DistrictItem,
  type UpazilaItem,
} from "./bangladesh-data.js";
import { DeliveryZoneModel } from "../delivery/delivery-zone.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";

/** Normalize text for fuzzy/case-insensitive comparison */
export function normalizeLocationText(str: string | undefined | null): string {
  if (!str) return "";
  return str.toLowerCase().trim().replace(/[\s\-_]+/g, "");
}

/** Get all divisions in Bangladesh */
export function getDivisions(): DivisionItem[] {
  return BANGLADESH_DIVISIONS;
}

/** Get districts filtered by division (or all 64 districts if no divisionId) */
export function getDistricts(divisionId?: string): DistrictItem[] {
  if (!divisionId) return BANGLADESH_DISTRICTS;
  const norm = divisionId.toLowerCase().trim();
  return BANGLADESH_DISTRICTS.filter((d) => d.divisionId.toLowerCase() === norm);
}

/** Get upazilas/thanas filtered by district */
export function getUpazilas(districtId?: string): UpazilaItem[] {
  if (!districtId) return BANGLADESH_UPAZILAS;
  const norm = districtId.toLowerCase().trim();
  return BANGLADESH_UPAZILAS.filter((u) => u.districtId.toLowerCase() === norm);
}

/** Get unions/pourashavas for an upazila */
export function getUnions(upazilaId: string): Array<{ id: string; name: string; nameBn: string }> {
  const norm = upazilaId.toLowerCase().trim();
  const upazila = UPAZILA_MAP.get(norm);
  return upazila?.unions ?? [];
}

/** Find a single location item by ID or name */
export function findDivision(idOrName: string): DivisionItem | undefined {
  const norm = normalizeLocationText(idOrName);
  return BANGLADESH_DIVISIONS.find(
    (d) =>
      normalizeLocationText(d.id) === norm ||
      normalizeLocationText(d.name) === norm ||
      normalizeLocationText(d.nameBn) === norm
  );
}

export function findDistrict(idOrName: string): DistrictItem | undefined {
  const norm = normalizeLocationText(idOrName);
  return BANGLADESH_DISTRICTS.find(
    (d) =>
      normalizeLocationText(d.id) === norm ||
      normalizeLocationText(d.name) === norm ||
      normalizeLocationText(d.nameBn) === norm
  );
}

export function findUpazila(idOrName: string): UpazilaItem | undefined {
  const norm = normalizeLocationText(idOrName);
  return BANGLADESH_UPAZILAS.find(
    (u) =>
      normalizeLocationText(u.id) === norm ||
      normalizeLocationText(u.name) === norm ||
      normalizeLocationText(u.nameBn) === norm
  );
}

/**
 * Validate administrative location hierarchy consistency.
 * Prevents impossible combinations (e.g. Dhaka division with Chattogram district).
 */
export function validateLocationHierarchy(params: {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
}): { valid: boolean; error?: string } {
  const { divisionId, districtId, upazilaId, unionId } = params;

  if (divisionId) {
    const div = findDivision(divisionId);
    if (!div) {
      return { valid: false, error: `Unknown division: ${divisionId}` };
    }
  }

  if (districtId) {
    const dist = findDistrict(districtId);
    if (!dist) {
      return { valid: false, error: `Unknown district: ${districtId}` };
    }
    if (divisionId) {
      const div = findDivision(divisionId);
      if (div && dist.divisionId.toLowerCase() !== div.id.toLowerCase()) {
        return {
          valid: false,
          error: `District '${dist.name}' does not belong to Division '${div.name}'.`,
        };
      }
    }
  }

  if (upazilaId) {
    const upazila = findUpazila(upazilaId);
    if (!upazila) {
      return { valid: false, error: `Unknown upazila/thana: ${upazilaId}` };
    }
    if (districtId) {
      const dist = findDistrict(districtId);
      if (dist && upazila.districtId.toLowerCase() !== dist.id.toLowerCase()) {
        return {
          valid: false,
          error: `Upazila/thana '${upazila.name}' does not belong to District '${dist.name}'.`,
        };
      }
    }
    if (unionId && upazila.unions && upazila.unions.length > 0) {
      const unionFound = upazila.unions.some(
        (u) =>
          normalizeLocationText(u.id) === normalizeLocationText(unionId) ||
          normalizeLocationText(u.name) === normalizeLocationText(unionId)
      );
      if (!unionFound) {
        return {
          valid: false,
          error: `Union '${unionId}' not found in upazila '${upazila.name}'.`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Automatically match the store's delivery zone and shipping charge
 * based on selected administrative division, district, or upazila.
 */
export async function matchStoreDeliveryZone(
  storeId: string,
  location: {
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    divisionName?: string;
    districtName?: string;
  }
): Promise<{
  matched: boolean;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  charge: number;
  estimatedDays?: string;
}> {
  const isValidStoreId = mongoose.Types.ObjectId.isValid(storeId);
  const zones = isValidStoreId
    ? await DeliveryZoneModel.find({ storeId, enabled: true })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean()
    : [];

  const district = location.districtId ? findDistrict(location.districtId) : undefined;
  const division = location.divisionId ? findDivision(location.divisionId) : district ? findDivision(district.divisionId) : undefined;

  const districtKey = (district?.id || location.districtId || location.districtName || "").toLowerCase().trim();
  const divisionKey = (division?.id || location.divisionId || location.divisionName || "").toLowerCase().trim();

  const isDhakaDistrict = districtKey === "dhaka" || districtKey === "ঢাকা";

  if (zones.length > 0) {
    // A. Direct match by configured district or division array in zone model
    for (const z of zones) {
      const zDists = (z.districts || []).map((d: string) => d.toLowerCase().trim());
      const zDivs = (z.divisions || []).map((d: string) => d.toLowerCase().trim());

      if (districtKey && (zDists.includes(districtKey) || zDists.includes(district?.name.toLowerCase() || ""))) {
        return {
          matched: true,
          deliveryZoneId: String(z._id),
          deliveryZoneName: z.name,
          charge: z.charge,
          estimatedDays: z.estimatedDays || "2-3 Days",
        };
      }

      if (divisionKey && (zDivs.includes(divisionKey) || zDivs.includes(division?.name.toLowerCase() || ""))) {
        return {
          matched: true,
          deliveryZoneId: String(z._id),
          deliveryZoneName: z.name,
          charge: z.charge,
          estimatedDays: z.estimatedDays || "2-3 Days",
        };
      }
    }

    // B. Semantic name match (e.g. "Inside Dhaka", "Outside Dhaka", "Dhaka City", "Outside")
    if (isDhakaDistrict) {
      const insideDhakaZone = zones.find((z) => {
        const n = z.name.toLowerCase();
        return (
          n.includes("inside dhaka") ||
          n.includes("dhaka city") ||
          n.includes("inside") ||
          n.includes("ঢাকা সিটি") ||
          n.includes("ঢাকার ভিতরে") ||
          n.includes("ঢাকার ভেতরে")
        );
      });
      if (insideDhakaZone) {
        return {
          matched: true,
          deliveryZoneId: String(insideDhakaZone._id),
          deliveryZoneName: insideDhakaZone.name,
          charge: insideDhakaZone.charge,
          estimatedDays: insideDhakaZone.estimatedDays || "1-2 Days",
        };
      }
    } else if (districtKey) {
      const outsideDhakaZone = zones.find((z) => {
        const n = z.name.toLowerCase();
        return (
          n.includes("outside dhaka") ||
          n.includes("outside") ||
          n.includes("all over bangladesh") ||
          n.includes("ঢাকার বাইরে") ||
          n.includes("সারাদেশ")
        );
      });
      if (outsideDhakaZone) {
        return {
          matched: true,
          deliveryZoneId: String(outsideDhakaZone._id),
          deliveryZoneName: outsideDhakaZone.name,
          charge: outsideDhakaZone.charge,
          estimatedDays: outsideDhakaZone.estimatedDays || "3-5 Days",
        };
      }
    }

    // C. Fallback to first available enabled zone
    const defaultZone = zones[0];
    return {
      matched: true,
      deliveryZoneId: String(defaultZone._id),
      deliveryZoneName: defaultZone.name,
      charge: defaultZone.charge,
      estimatedDays: defaultZone.estimatedDays || "2-4 Days",
    };
  }

  // 2. Check store settings fallback deliveryZones
  const settings = isValidStoreId ? await StoreSettingsModel.findOne({ storeId }).lean() : null;
  const settingsZones = (settings as any)?.deliveryZones as Array<{
    id?: string;
    _id?: string;
    name: string;
    charge: number;
    estimatedDays?: string;
  }> | undefined;

  if (settingsZones && settingsZones.length > 0) {
    if (isDhakaDistrict) {
      const inside = settingsZones.find((z) => z.name.toLowerCase().includes("inside") || z.name.toLowerCase().includes("dhaka"));
      if (inside) {
        return {
          matched: true,
          deliveryZoneId: inside._id || inside.id || "inside-dhaka",
          deliveryZoneName: inside.name,
          charge: inside.charge,
          estimatedDays: inside.estimatedDays || "1-2 Days",
        };
      }
    } else {
      const outside = settingsZones.find((z) => z.name.toLowerCase().includes("outside") || !z.name.toLowerCase().includes("dhaka"));
      if (outside) {
        return {
          matched: true,
          deliveryZoneId: outside._id || outside.id || "outside-dhaka",
          deliveryZoneName: outside.name,
          charge: outside.charge,
          estimatedDays: outside.estimatedDays || "3-5 Days",
        };
      }
    }
    const first = settingsZones[0];
    return {
      matched: true,
      deliveryZoneId: first._id || first.id || "default",
      deliveryZoneName: first.name,
      charge: first.charge,
      estimatedDays: first.estimatedDays || "2-4 Days",
    };
  }

  // 3. Platform default (৳60 inside Dhaka, ৳120 outside)
  const isInside = isDhakaDistrict;
  return {
    matched: true,
    deliveryZoneName: isInside ? "Inside Dhaka" : "Outside Dhaka",
    charge: isInside ? 60 : 120,
    estimatedDays: isInside ? "1-2 Days" : "3-5 Days",
  };
}
