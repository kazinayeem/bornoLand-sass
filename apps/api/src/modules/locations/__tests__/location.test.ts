import test from "node:test";
import assert from "node:assert/strict";
import {
  getDivisions,
  getDistricts,
  getUpazilas,
  getUnions,
  findDivision,
  findDistrict,
  findUpazila,
  validateLocationHierarchy,
  matchStoreDeliveryZone,
} from "../location.service.js";

test("Bangladesh Location Service - Divisions", () => {
  const divisions = getDivisions();
  assert.equal(divisions.length, 8, "Must contain all 8 divisions");

  const dhaka = divisions.find((d) => d.id === "dhaka");
  assert.ok(dhaka, "Dhaka division must exist");
  assert.equal(dhaka.name, "Dhaka");
  assert.equal(dhaka.nameBn, "ঢাকা");

  const ctg = findDivision("chattogram");
  assert.ok(ctg, "Chattogram division must be found by id");
  assert.equal(ctg.name, "Chattogram");

  // Bengali search
  const rajshahiBn = findDivision("রাজশাহী");
  assert.ok(rajshahiBn, "Rajshahi must be found by Bengali name");
  assert.equal(rajshahiBn.id, "rajshahi");
});

test("Bangladesh Location Service - Districts", () => {
  const allDistricts = getDistricts();
  assert.equal(allDistricts.length, 64, "Must contain all 64 districts");

  // Filtered by Division
  const dhakaDistricts = getDistricts("dhaka");
  assert.ok(dhakaDistricts.length >= 10, "Dhaka division should contain multiple districts");
  assert.ok(dhakaDistricts.some((d) => d.id === "gazipur"));
  assert.ok(dhakaDistricts.some((d) => d.id === "narayanganj"));

  // Finding district by English and Bengali
  const cox = findDistrict("Cox's Bazar");
  assert.ok(cox, "Cox's Bazar must be found by English name");
  assert.equal(cox.id, "coxs-bazar");

  const coxBn = findDistrict("কক্সবাজার");
  assert.ok(coxBn, "Cox's Bazar must be found by Bengali name");
  assert.equal(coxBn.id, "coxs-bazar");
});

test("Bangladesh Location Service - Upazilas & Thanas", () => {
  const dhakaUpazilas = getUpazilas("dhaka");
  assert.ok(dhakaUpazilas.length > 10, "Dhaka district must contain thanas/upazilas");
  assert.ok(dhakaUpazilas.some((u) => u.id === "dhanmondi"));
  assert.ok(dhakaUpazilas.some((u) => u.id === "gulshan"));
  assert.ok(dhakaUpazilas.some((u) => u.id === "savar"));

  // Bengali search
  const mirpur = findUpazila("মিরপুর");
  assert.ok(mirpur, "Mirpur must be found by Bengali name");
  assert.equal(mirpur.id, "mirpur");
});

test("Bangladesh Location Service - Hierarchy Validation", () => {
  // Valid hierarchy
  const valid = validateLocationHierarchy({
    divisionId: "dhaka",
    districtId: "dhaka",
    upazilaId: "dhanmondi",
  });
  assert.equal(valid.valid, true);

  // Invalid: District does not belong to Division
  const invalidDistrict = validateLocationHierarchy({
    divisionId: "chattogram",
    districtId: "gazipur", // gazipur is in Dhaka division
  });
  assert.equal(invalidDistrict.valid, false);
  assert.match(invalidDistrict.error || "", /does not belong/i);

  // Invalid: Upazila does not belong to District
  const invalidUpazila = validateLocationHierarchy({
    divisionId: "dhaka",
    districtId: "gazipur",
    upazilaId: "dhanmondi", // dhanmondi is in Dhaka district
  });
  assert.equal(invalidUpazila.valid, false);
  assert.match(invalidUpazila.error || "", /does not belong/i);
});

test("Bangladesh Location Service - Delivery Zone Fallback Matching", async () => {
  // Inside Dhaka matching fallback
  const insideDhakaMatch = await matchStoreDeliveryZone("dummy-store-id", {
    divisionId: "dhaka",
    districtId: "dhaka",
  });
  assert.equal(insideDhakaMatch.charge, 60, "Inside Dhaka default rate should be 60 BDT");

  // Outside Dhaka matching fallback
  const outsideDhakaMatch = await matchStoreDeliveryZone("dummy-store-id", {
    divisionId: "chattogram",
    districtId: "coxs-bazar",
  });
  assert.equal(outsideDhakaMatch.charge, 120, "Outside Dhaka default rate should be 120 BDT");
});
