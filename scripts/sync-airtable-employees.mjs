import { promises as fs } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Auto-load .env if present
try {
  const envContent = await fs.readFile(path.join(rootDir, ".env"), "utf8");
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
} catch { /* no .env file — rely on shell env */ }

const AIRTABLE_BASE_ID = String(process.env.AIRTABLE_BASE_ID || "").trim();
const AIRTABLE_TABLE_ID = String(process.env.AIRTABLE_EMPLOYEES_TABLE_ID || "").trim();
const AIRTABLE_TOKEN = String(process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || "").trim();

const EMPLOYEE_IMAGE_DIR = path.join(rootDir, "image", "employees");
const RUNTIME_SEEDS_PATH = path.join(rootDir, "assets", "js", "runtime-seeds.js");
const EMPLOYEES_DATA_PATH = path.join(rootDir, "assets", "js", "employees-data.js");

const DEFAULT_EMPLOYEE_AVATAR = "../image/logo.png";
const DEFAULT_ACCOUNT_AVATAR = "/image/logoweb.png";
const VIEWER_PERMISSIONS = Object.freeze({
  employees: { access: "view", scope: "all", departmentIds: [] },
  schedule: { access: "view", scope: "all", departmentIds: [] }
});

function ensureEnv() {
  const missing = [];

  if (!AIRTABLE_BASE_ID) {
    missing.push("AIRTABLE_BASE_ID");
  }

  if (!AIRTABLE_TABLE_ID) {
    missing.push("AIRTABLE_EMPLOYEES_TABLE_ID");
  }

  if (!AIRTABLE_TOKEN) {
    missing.push("AIRTABLE_PERSONAL_ACCESS_TOKEN");
  }

  if (missing.length) {
    throw new Error("Missing required environment variables: " + missing.join(", "));
  }
}

async function loadWindowScript(filePath, exportKey) {
  const source = await fs.readFile(filePath, "utf8");
  const sandbox = { window: {}, console };
  vm.runInNewContext(source, sandbox, { filename: filePath });

  if (exportKey && !sandbox.window[exportKey]) {
    throw new Error("Expected " + exportKey + " from " + filePath);
  }

  return exportKey ? sandbox.window[exportKey] : sandbox.window;
}

function toText(value) {
  return String(value ?? "").trim();
}

function hasText(value) {
  return toText(value) !== "";
}

function toLowerKey(value) {
  return toText(value).toLowerCase();
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function createEmptyDateParts() {
  return { year: "", month: "", day: "" };
}

function parseDateParts(value) {
  const raw = toText(value);

  if (!raw) {
    return createEmptyDateParts();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-");
    return { year, month, day };
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/");
    return {
      year,
      month: month.padStart(2, "0"),
      day: day.padStart(2, "0")
    };
  }

  return createEmptyDateParts();
}

function isFilledDateParts(value) {
  return Boolean(value && value.year && value.month && value.day);
}

function coalesceDateParts(primary, fallback) {
  return isFilledDateParts(primary) ? primary : isFilledDateParts(fallback) ? cloneValue(fallback) : createEmptyDateParts();
}

function mapSex(value, fallback) {
  const raw = toLowerKey(value);

  if (raw === "male" || raw === "男") {
    return "男";
  }

  if (raw === "female" || raw === "女") {
    return "女";
  }

  return toText(fallback);
}

function mapStatus(value, fallback) {
  const raw = toLowerKey(value);

  if (raw === "active" || raw === "在職") {
    return "在職";
  }

  if (raw === "inactive" || raw === "離職") {
    return "離職";
  }

  return hasText(fallback) ? toText(fallback) : "在職";
}

function mapPhoneCountryCode(phoneNumber, nationality, fallbackCountryCode) {
  const normalizedPhone = toText(phoneNumber).replace(/[^\d+]/g, "");
  const normalizedNationality = toLowerKey(nationality);

  if (normalizedPhone.startsWith("+886") || normalizedPhone.startsWith("886")) {
    return "台灣 +886";
  }

  if (normalizedPhone.startsWith("+853") || normalizedPhone.startsWith("853")) {
    return "澳門 +853";
  }

  if (normalizedPhone.startsWith("+852") || normalizedPhone.startsWith("852")) {
    return "香港 +852";
  }

  if (normalizedPhone.startsWith("+86") || normalizedPhone.startsWith("86")) {
    return "中國 +86";
  }

  if (normalizedPhone.startsWith("+82") || normalizedPhone.startsWith("82")) {
    return "韓國 +82";
  }

  if (normalizedPhone.startsWith("+81") || normalizedPhone.startsWith("81")) {
    return "日本 +81";
  }

  if (normalizedPhone.startsWith("+63") || normalizedPhone.startsWith("63")) {
    return "菲律賓 +63";
  }

  if (normalizedPhone.startsWith("+856") || normalizedPhone.startsWith("856")) {
    return "寮國 +856";
  }

  if (normalizedPhone.startsWith("+855") || normalizedPhone.startsWith("855")) {
    return "柬埔寨 +855";
  }

  if (normalizedPhone.startsWith("+60") || normalizedPhone.startsWith("60")) {
    return "馬來西亞 +60";
  }

  if (normalizedNationality.includes("taiwan") || normalizedNationality.includes("台灣")) {
    return "台灣 +886";
  }

  if (normalizedNationality.includes("macau") || normalizedNationality.includes("澳門")) {
    return "澳門 +853";
  }

  if (
    normalizedNationality.includes("china") ||
    normalizedNationality.includes("trung quốc") ||
    normalizedNationality.includes("中國")
  ) {
    return "中國 +86";
  }

  if (normalizedNationality.includes("hong kong") || normalizedNationality.includes("香港")) {
    return "香港 +852";
  }

  if (normalizedNationality.includes("korea") || normalizedNationality.includes("韓國")) {
    return "韓國 +82";
  }

  if (normalizedNationality.includes("japan") || normalizedNationality.includes("日本")) {
    return "日本 +81";
  }

  if (normalizedNationality.includes("philippines") || normalizedNationality.includes("菲律賓")) {
    return "菲律賓 +63";
  }

  if (normalizedNationality.includes("laos") || normalizedNationality.includes("寮國")) {
    return "寮國 +856";
  }

  if (normalizedNationality.includes("cambodia") || normalizedNationality.includes("柬埔寨")) {
    return "柬埔寨 +855";
  }

  if (normalizedNationality.includes("malaysia") || normalizedNationality.includes("馬來西亞")) {
    return "馬來西亞 +60";
  }

  return hasText(fallbackCountryCode) ? toText(fallbackCountryCode) : "越南 +84";
}

function makePresetOther(value, allowedOptions, fallbackValue) {
  const raw = toText(value);
  const fallback = fallbackValue && typeof fallbackValue === "object" ? fallbackValue : { preset: "", other: "" };

  if (!raw) {
    return {
      preset: toText(fallback.preset),
      other: toText(fallback.other)
    };
  }

  if (allowedOptions.includes(raw)) {
    return { preset: raw, other: "" };
  }

  return { preset: "其他", other: raw };
}

function makeRelationship(value, allowedOptions, fallbackValue) {
  const raw = toText(value);
  const fallback = fallbackValue && typeof fallbackValue === "object" ? fallbackValue : { preset: "其他", other: "" };

  if (!raw) {
    return {
      preset: toText(fallback.preset) || "其他",
      other: toText(fallback.other)
    };
  }

  if (allowedOptions.includes(raw)) {
    return { preset: raw, other: "" };
  }

  return { preset: "其他", other: raw };
}

function toAttachmentList(value) {
  const files = Array.isArray(value) ? value : [];

  return files.map(function (file, index) {
    return {
      id: toText(file.id) || "attachment-" + String(index + 1),
      name: toText(file.filename) || "Attachment " + String(index + 1),
      data: toText(file.url),
      size: Number(file.size || 0),
      type: toText(file.type)
    };
  }).filter(function (file) {
    return hasText(file.data);
  });
}

function slugify(value) {
  const cleaned = toLowerKey(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "employee";
}

function resolveImageExtension(attachment) {
  const filename = toText(attachment && attachment.filename);
  const extensionFromFilename = path.extname(filename).toLowerCase();

  if (extensionFromFilename) {
    return extensionFromFilename;
  }

  const mimeType = toLowerKey(attachment && attachment.type);

  if (mimeType === "image/jpeg") {
    return ".jpg";
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return ".png";
}

function isLocalEmployeeAvatar(value) {
  const raw = toText(value);
  return raw.startsWith("/image/employees/") || raw.startsWith("../image/employees/");
}

function toLocalEmployeeAvatarPath(value) {
  const raw = toText(value);

  if (raw.startsWith("/image/employees/")) {
    return raw;
  }

  if (raw.startsWith("../image/employees/")) {
    return "/image/employees/" + raw.slice("../image/employees/".length);
  }

  return "";
}

async function ensureDirectory(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

async function removeExistingAvatarVariants(baseName) {
  const entries = await fs.readdir(EMPLOYEE_IMAGE_DIR, { withFileTypes: true });

  await Promise.all(entries.map(async function (entry) {
    if (!entry.isFile()) {
      return;
    }

    const parsed = path.parse(entry.name);
    if (parsed.name !== baseName) {
      return;
    }

    await fs.unlink(path.join(EMPLOYEE_IMAGE_DIR, entry.name));
  }));
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

async function downloadAvatar(attachment, key, fallbackAvatarPath) {
  if (!attachment || !hasText(attachment.url)) {
    return isLocalEmployeeAvatar(fallbackAvatarPath) ? toLocalEmployeeAvatarPath(fallbackAvatarPath) : DEFAULT_EMPLOYEE_AVATAR;
  }

  const extension = resolveImageExtension(attachment);
  const baseName = slugify(key);
  const fileName = baseName + extension;
  const filePath = path.join(EMPLOYEE_IMAGE_DIR, fileName);
  const localAvatarPath = "/image/employees/" + fileName;
  const imageUrl = toText(attachment.thumbnails && attachment.thumbnails.large && attachment.thumbnails.large.url) || toText(attachment.url);

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Unable to download avatar for " + key + ": " + response.status);
    }

    const arrayBuffer = await response.arrayBuffer();
    await removeExistingAvatarVariants(baseName);
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    return localAvatarPath;
  } catch (error) {
    const fallbackLocalPath = toLocalEmployeeAvatarPath(fallbackAvatarPath);

    if (fallbackLocalPath) {
      const fallbackFilePath = path.join(rootDir, fallbackLocalPath.replace(/^\//, "").replace(/\//g, path.sep));
      if (await fileExists(fallbackFilePath)) {
        return fallbackLocalPath;
      }
    }

    console.warn(String(error && error.message || error));
    return DEFAULT_EMPLOYEE_AVATAR;
  }
}

function buildDepartmentIdLookup(defaultDepartments) {
  return defaultDepartments.reduce(function (result, department) {
    result[toLowerKey(department.name)] = department.id;
    return result;
  }, {});
}

function buildAge(dateParts) {
  if (!isFilledDateParts(dateParts)) {
    return "";
  }

  const birthday = new Date(Number(dateParts.year), Number(dateParts.month) - 1, Number(dateParts.day));

  if (Number.isNaN(birthday.getTime())) {
    return "";
  }

  const now = new Date();
  let age = now.getFullYear() - birthday.getFullYear();
  const monthOffset = now.getMonth() - birthday.getMonth();

  if (monthOffset < 0 || (monthOffset === 0 && now.getDate() < birthday.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "";
}

function createEmployeeRecord(record, index, context) {
  const fields = record.fields || {};
  const ydiId = toText(fields["YDI ID"]);
  const fallbackEmployee = ydiId ? context.previousEmployeesByYdi.get(toLowerKey(ydiId)) : null;
  const basicFallback = fallbackEmployee && fallbackEmployee.basic ? fallbackEmployee.basic : {};
  const contactFallback = fallbackEmployee && fallbackEmployee.contact ? fallbackEmployee.contact : {};
  const workFallback = fallbackEmployee && fallbackEmployee.work ? fallbackEmployee.work : {};
  const bankFallback = fallbackEmployee && fallbackEmployee.bank ? fallbackEmployee.bank : {};
  const otherFallback = fallbackEmployee && fallbackEmployee.other ? fallbackEmployee.other : {};
  const rawDepartment = toText(fields.Department) || toText(workFallback.department && workFallback.department.preset);
  const departmentId = context.departmentIdByName[toLowerKey(rawDepartment)] || toText(fallbackEmployee && fallbackEmployee.departmentId) || context.defaultDepartments[0].id;
  const status = mapStatus(fields.Status, workFallback.status);
  const dateOfBirth = coalesceDateParts(parseDateParts(fields["Date of birth"]), basicFallback.dateOfBirth);
  const onboardDate = coalesceDateParts(parseDateParts(fields["Onboard date"]), workFallback.onboardDate);
  const probationEndDate = coalesceDateParts(parseDateParts(fields["Prob End Date"]), workFallback.probEndDate);
  const officialDate = coalesceDateParts(parseDateParts(fields["Official date"]), workFallback.officialDate);
  const lastDay = status === "離職"
    ? coalesceDateParts(parseDateParts(fields["Last day"]), workFallback.lastDay)
    : createEmptyDateParts();
  const nationality = toText(fields.Religion) || toText(basicFallback.nationality);
  const phoneNumber = toText(fields["Whatsapp Number"]);
  const emergencyPhone = toText(fields["Emergency phone"]);
  const phoneCountryCode = mapPhoneCountryCode(phoneNumber, nationality || toText(fields["Place of origin"]), contactFallback.phoneNumber && contactFallback.phoneNumber.countryCode);
  const emergencyCountryCode = mapPhoneCountryCode(
    emergencyPhone,
    nationality || toText(fields["Place of origin"]),
    contactFallback.emergencyPhone && contactFallback.emergencyPhone.countryCode || phoneCountryCode
  );
  const engName = toText(fields["Eng Name"]) || toText(basicFallback.engName);
  const avatarPath = context.avatarPathsByRecordId.get(record.id) || DEFAULT_EMPLOYEE_AVATAR;
  const employeeId = ydiId ? "employee-" + slugify(ydiId) : "employee-" + slugify(record.id);

  return {
    id: employeeId,
    createdAt: index + 1,
    departmentId,
    avatarSrc: avatarPath,
    avatarChanged: avatarPath !== DEFAULT_EMPLOYEE_AVATAR,
    basic: {
      vieName: toText(fields["Real Name"]) || toText(basicFallback.vieName),
      engName,
      ydiId,
      haId: toText(fields["HA ID"]) || toText(basicFallback.haId),
      sex: mapSex(fields.Sex, basicFallback.sex),
      dateOfBirth,
      age: toText(fields.Age) || buildAge(dateOfBirth) || toText(basicFallback.age),
      zodiac: toText(fields["Zodiac Sign"]) || toText(basicFallback.zodiac),
      nationality,
      language: toText(basicFallback.language)
    },
    contact: {
      phoneNumber: {
        countryCode: phoneCountryCode,
        number: phoneNumber
      },
      emergencyPhone: {
        countryCode: emergencyCountryCode,
        number: emergencyPhone
      },
      emergencyRelationship: makeRelationship(fields["Emerg Relationship"], context.relationshipOptions, contactFallback.emergencyRelationship),
      email: toText(fields.Email) || toText(contactFallback.email),
      nationId: toText(fields["Country ID"]) || toText(contactFallback.nationId),
      placeOfOrigin: toText(fields["Place of origin"]) || toText(contactFallback.placeOfOrigin),
      placeOfResidence: toText(fields["Place of residence"]) || toText(contactFallback.placeOfResidence)
    },
    work: {
      department: makePresetOther(rawDepartment, context.departmentOptions, workFallback.department),
      position: toText(fields.Position) || toText(workFallback.position),
      titleJob: makePresetOther(fields["Title Job"], context.titleJobOptions, workFallback.titleJob),
      directBoss: toText(fields["Direct Boss"]) || toText(workFallback.directBoss),
      recruitmentDept: toText(fields["Recruitment Dept"]) || toText(workFallback.recruitmentDept),
      status,
      onboardDate,
      probationDays: toText(fields["Prob Days"]) || toText(workFallback.probationDays),
      probEndDate: probationEndDate,
      officialDate,
      roomNumber: {
        type: "員工宿舍",
        value: toText(fields["HA Room"]) || toText(workFallback.roomNumber && workFallback.roomNumber.value)
      },
      lastDay
    },
    bank: {
      bankNumber: toText(fields["Bank Number"]) || toText(bankFallback.bankNumber),
      bankName: toText(fields["Bank Name"]) || toText(bankFallback.bankName),
      probationSalary: toText(fields["Probation Salary"]) || toText(bankFallback.probationSalary),
      officialSalary: toText(fields["Official Salary"]) || toText(bankFallback.officialSalary)
    },
    other: {
      attachments: toAttachmentList(fields["Employee'file"]).length
        ? toAttachmentList(fields["Employee'file"])
        : Array.isArray(otherFallback.attachments) ? cloneValue(otherFallback.attachments) : [],
      remark: toText(fields.Remark) || toText(otherFallback.remark)
    }
  };
}

function buildAccounts(employees) {
  const countsByName = new Map();

  employees.forEach(function (employee) {
    const key = toLowerKey(employee.basic && employee.basic.engName);
    if (!key || !hasText(employee.basic && employee.basic.ydiId)) {
      return;
    }

    countsByName.set(key, (countsByName.get(key) || 0) + 1);
  });

  return employees
    .filter(function (employee) {
      return hasText(employee.basic && employee.basic.engName) && hasText(employee.basic && employee.basic.ydiId);
    })
    .map(function (employee) {
      const engName = toText(employee.basic.engName);
      const ydiId = toText(employee.basic.ydiId);
      const baseKey = toLowerKey(engName);
      const username = countsByName.get(baseKey) > 1 ? engName + "-" + ydiId : engName;

      return {
        username,
        password: ydiId,
        role: "viewer",
        displayName: engName,
        welcomeMessage: engName,
        avatarSrc: employee.avatarSrc !== DEFAULT_EMPLOYEE_AVATAR ? employee.avatarSrc : DEFAULT_ACCOUNT_AVATAR,
        createdAt: new Date().toISOString(),
        phoneNumber: toText(employee.contact && employee.contact.phoneNumber && employee.contact.phoneNumber.number),
        permissions: cloneValue(VIEWER_PERMISSIONS)
      };
    });
}

async function fetchAirtableRecords() {
  const records = [];
  let offset = "";

  do {
    const url = new URL("https://api.airtable.com/v0/" + AIRTABLE_BASE_ID + "/" + AIRTABLE_TABLE_ID);
    url.searchParams.set("pageSize", "100");

    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + AIRTABLE_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error("Airtable request failed: " + response.status + " " + await response.text());
    }

    const payload = await response.json();
    records.push(...(Array.isArray(payload.records) ? payload.records : []));
    offset = toText(payload.offset);
  } while (offset);

  return records;
}

function isMeaningfulRecord(record) {
  const fields = record && record.fields ? record.fields : {};

  return [
    fields["YDI ID"],
    fields["Eng Name"],
    fields["Real Name"]
  ].some(hasText);
}

async function buildAvatarMap(records, previousEmployeesByYdi) {
  await ensureDirectory(EMPLOYEE_IMAGE_DIR);

  const avatarPathsByRecordId = new Map();

  for (const record of records) {
    const fields = record.fields || {};
    const ydiId = toText(fields["YDI ID"]);
    const fallbackEmployee = ydiId ? previousEmployeesByYdi.get(toLowerKey(ydiId)) : null;
    const fallbackAvatarPath = fallbackEmployee ? fallbackEmployee.avatarSrc : "";
    const avatarAttachment = Array.isArray(fields.Avatar) && fields.Avatar.length ? fields.Avatar[0] : null;
    const avatarKey = ydiId || record.id;
    const avatarPath = await downloadAvatar(avatarAttachment, avatarKey, fallbackAvatarPath);

    avatarPathsByRecordId.set(record.id, avatarPath);
  }

  return avatarPathsByRecordId;
}

async function writeRuntimeSeeds(employees, accounts) {
  const payload = {
    generatedAt: new Date().toISOString(),
    employees,
    accounts
  };
  const source = "(function () {\n  window.YiDingRuntimeSeeds = " + JSON.stringify(payload, null, 2) + ";\n})();\n";
  await fs.writeFile(RUNTIME_SEEDS_PATH, source, "utf8");
}

async function main() {
  ensureEnv();

  const dataApi = await loadWindowScript(EMPLOYEES_DATA_PATH, "YiDingEmployeesData");
  const previousSeeds = await loadWindowScript(RUNTIME_SEEDS_PATH, "YiDingRuntimeSeeds");
  const previousEmployees = Array.isArray(previousSeeds.employees) ? previousSeeds.employees : [];
  const previousEmployeesByYdi = new Map();

  previousEmployees.forEach(function (employee) {
    const ydiId = toLowerKey(employee && employee.basic && employee.basic.ydiId);
    if (!ydiId) {
      return;
    }
    previousEmployeesByYdi.set(ydiId, employee);
  });

  const allRecords = await fetchAirtableRecords();
  const meaningfulRecords = allRecords.filter(isMeaningfulRecord);
  const avatarPathsByRecordId = await buildAvatarMap(meaningfulRecords, previousEmployeesByYdi);
  const context = {
    previousEmployeesByYdi,
    avatarPathsByRecordId,
    relationshipOptions: Array.isArray(dataApi.RELATIONSHIP_OPTIONS) ? dataApi.RELATIONSHIP_OPTIONS : [],
    departmentOptions: Array.isArray(dataApi.BASE_DEPARTMENT_OPTIONS) ? dataApi.BASE_DEPARTMENT_OPTIONS : [],
    titleJobOptions: Array.isArray(dataApi.TITLE_JOB_OPTIONS) ? dataApi.TITLE_JOB_OPTIONS : [],
    defaultDepartments: Array.isArray(dataApi.DEFAULT_DEPARTMENTS) ? dataApi.DEFAULT_DEPARTMENTS : [],
    departmentIdByName: buildDepartmentIdLookup(Array.isArray(dataApi.DEFAULT_DEPARTMENTS) ? dataApi.DEFAULT_DEPARTMENTS : [])
  };
  const employees = meaningfulRecords.map(function (record, index) {
    return createEmployeeRecord(record, index, context);
  });
  const accounts = buildAccounts(employees);

  await writeRuntimeSeeds(employees, accounts);

  console.log(JSON.stringify({
    employees: employees.length,
    accounts: accounts.length,
    avatarsLocalized: employees.filter(function (employee) {
      return employee.avatarSrc !== DEFAULT_EMPLOYEE_AVATAR;
    }).length,
    skippedRecords: allRecords.length - meaningfulRecords.length
  }, null, 2));
}

main().catch(function (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
