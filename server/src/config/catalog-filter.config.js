const CHAIN_SIZE_OPTIONS = [
  { value: "5-16", label: '5/16"' },
  { value: "3-8", label: '3/8"' },
  { value: "1-2", label: '1/2"' },
];

const CHAIN_LENGTH_OPTIONS = [
  { value: "16", label: "16'" },
  { value: "20", label: "20'" },
  { value: "25", label: "25'" },
];

const STRAP_WIDTH_OPTIONS = [
  { value: "1", label: '1"' },
  { value: "2", label: '2"' },
  { value: "3", label: '3"' },
  { value: "4", label: '4"' },
];

const STRAP_LENGTH_BUCKET_OPTIONS = [
  { value: "8-12", label: "8' to 12'" },
  { value: "14-18", label: "14' to 18'" },
  { value: "20-30", label: "20' to 30'" },
  { value: "40-50", label: "40' to 50'" },
];

const HOOK_WIDTH_OPTIONS = [
  { value: "1", label: '1"' },
  { value: "2", label: '2"' },
  { value: "3", label: '3"' },
  { value: "4", label: '4"' },
];

const HOOK_LENGTH_OPTIONS = [
  { value: "0.25", label: '1/4"' },
  { value: "0.3125", label: '5/16"' },
  { value: "0.375", label: '3/8"' },
  { value: "0.5", label: '1/2"' },
  { value: "2", label: '2"' },
  { value: "8", label: '8"' },
  { value: "15", label: '15"' },
];

const ATTRIBUTE_DEFINITIONS = {
  chainSizeCode: {
    key: "chainSizeCode",
    label: "Chain Size",
    input: "select",
    options: CHAIN_SIZE_OPTIONS,
    unit: "in",
  },
  chainLengthFt: {
    key: "chainLengthFt",
    label: "Chain Length",
    input: "select",
    options: CHAIN_LENGTH_OPTIONS,
    unit: "ft",
  },
  strapWidthIn: {
    key: "strapWidthIn",
    label: "Strap Width",
    input: "select",
    options: STRAP_WIDTH_OPTIONS,
    unit: "in",
  },
  strapLengthFt: {
    key: "strapLengthFt",
    label: "Strap Length",
    input: "number",
    options: [],
    unit: "ft",
  },
  hookSizeCode: {
    key: "hookSizeCode",
    label: "Hook Width",
    input: "select",
    options: HOOK_WIDTH_OPTIONS,
    unit: "in",
  },
  hookLengthIn: {
    key: "hookLengthIn",
    label: "Hook Length",
    input: "select",
    options: HOOK_LENGTH_OPTIONS,
    unit: "in",
  },
};

const FILTER_DEFINITIONS = {
  chainSize: {
    key: "chainSize",
    label: "Chain Size",
    attributeKey: "chainSizeCode",
    options: CHAIN_SIZE_OPTIONS,
  },
  chainLengthFt: {
    key: "chainLengthFt",
    label: "Chain Length",
    attributeKey: "chainLengthFt",
    options: CHAIN_LENGTH_OPTIONS,
  },
  strapWidthIn: {
    key: "strapWidthIn",
    label: "Strap Width",
    attributeKey: "strapWidthIn",
    options: STRAP_WIDTH_OPTIONS,
  },
  strapLengthBucket: {
    key: "strapLengthBucket",
    label: "Strap Length",
    attributeKey: "strapLengthBucket",
    options: STRAP_LENGTH_BUCKET_OPTIONS,
  },
  hookSize: {
    key: "hookSize",
    label: "Hook Width",
    attributeKey: "hookSizeCode",
    options: HOOK_WIDTH_OPTIONS,
  },
  hookLengthIn: {
    key: "hookLengthIn",
    label: "Hook Length",
    attributeKey: "hookLengthIn",
    options: HOOK_LENGTH_OPTIONS,
  },
};

const PROFILE_BY_SUBCATEGORY = new Map([
  [
    "cargo-control:binder-chains-transport-chain",
    {
      productTypes: [
        {
          value: "transport-chain",
          label: "Transport Chain",
          requiredFields: ["chainSizeCode", "chainLengthFt"],
          optionalFields: [],
        },
        {
          value: "bulk-chain",
          label: "Bulk Chain",
          requiredFields: ["chainSizeCode"],
          optionalFields: [],
        },
        {
          value: "binder",
          label: "Binder",
          requiredFields: ["chainSizeCode"],
          optionalFields: [],
        },
      ],
      filters: ["chainSize", "chainLengthFt"],
    },
  ],
  [
    "cargo-control:winch-and-ratchet-straps",
    {
      productTypes: [
        {
          value: "strap",
          label: "Strap",
          requiredFields: ["strapWidthIn", "strapLengthFt"],
          optionalFields: [],
        },
      ],
      filters: ["strapWidthIn", "strapLengthBucket"],
    },
  ],
  [
    "towing:towing-straps",
    {
      productTypes: [
        {
          value: "strap",
          label: "Strap",
          requiredFields: ["strapWidthIn", "strapLengthFt"],
          optionalFields: [],
        },
      ],
      filters: ["strapWidthIn", "strapLengthBucket"],
    },
  ],
  [
    "hooks-and-accessories:hooks",
    {
      productTypes: [
        {
          value: "hook",
          label: "Hook",
          requiredFields: ["hookSizeCode"],
          optionalFields: ["hookLengthIn"],
        },
      ],
      filters: ["hookSize", "hookLengthIn"],
    },
  ],
  [
    "towing:towing-accessories",
    {
      productTypes: [
        {
          value: "snatch-block",
          label: "Snatch Block",
          requiredFields: [],
          optionalFields: [],
        },
        {
          value: "ratchet",
          label: "Ratchet",
          requiredFields: [],
          optionalFields: [],
        },
        {
          value: "hook",
          label: "Hook",
          requiredFields: ["hookSizeCode"],
          optionalFields: ["hookLengthIn"],
        },
      ],
      filters: ["hookSize", "hookLengthIn"],
    },
  ],
]);

const MANAGED_SPEC_LABELS = new Set(["size", "chain size", "strap size", "hook size"]);
const PROFILE_CATEGORY_SLUGS = new Set(
  [...PROFILE_BY_SUBCATEGORY.keys()].map((key) => key.split(":")[0]),
);
const PROFILE_SUBCATEGORY_KEYS = new Set(PROFILE_BY_SUBCATEGORY.keys());

function toNormalizedKey(categorySlug, subcategorySlug) {
  return `${String(categorySlug || "").trim().toLowerCase()}:${String(subcategorySlug || "")
    .trim()
    .toLowerCase()}`;
}

function cloneOption(option) {
  return {
    value: String(option?.value || "").trim(),
    label: String(option?.label || "").trim(),
  };
}

function cloneAttributeDefinition(key, required = false) {
  const definition = ATTRIBUTE_DEFINITIONS[key];
  if (!definition) {
    return null;
  }

  return {
    key: definition.key,
    label: definition.label,
    input: definition.input,
    unit: definition.unit,
    required,
    options: Array.isArray(definition.options)
      ? definition.options.map(cloneOption)
      : [],
  };
}

function cloneFilterDefinition(key) {
  const definition = FILTER_DEFINITIONS[key];
  if (!definition) {
    return null;
  }

  return {
    key: definition.key,
    label: definition.label,
    attributeKey: definition.attributeKey,
    options: Array.isArray(definition.options)
      ? definition.options.map(cloneOption)
      : [],
  };
}

function normalizeOptionValue(value) {
  return String(value || "").trim();
}

function normalizeNumberValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }

  return normalized;
}

function isAllowedOption(value, options = []) {
  const normalized = normalizeOptionValue(value);
  if (!normalized) {
    return false;
  }

  return options.some((item) => normalizeOptionValue(item.value) === normalized);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return String(value);
}

export function getStrapLengthBucket(lengthFt) {
  const normalized = normalizeNumberValue(lengthFt);
  if (normalized === null) {
    return "";
  }

  if (normalized >= 8 && normalized <= 12) {
    return "8-12";
  }

  if (normalized >= 14 && normalized <= 18) {
    return "14-18";
  }

  if (normalized >= 20 && normalized <= 30) {
    return "20-30";
  }

  if (normalized >= 40 && normalized <= 50) {
    return "40-50";
  }

  return "";
}

export function getCatalogProfile(categorySlug, subcategorySlug) {
  const normalizedKey = toNormalizedKey(categorySlug, subcategorySlug);
  return PROFILE_BY_SUBCATEGORY.get(normalizedKey) || null;
}

export function getCategoryCatalogMetadata(categorySlug) {
  return {
    locked: PROFILE_CATEGORY_SLUGS.has(String(categorySlug || "").trim().toLowerCase()),
  };
}

export function getSubcategoryCatalogMetadata(categorySlug, subcategory) {
  const subcategorySlug = String(subcategory?.slug || "").trim();
  const profile = getCatalogProfile(categorySlug, subcategorySlug);

  return {
    slugLocked: PROFILE_SUBCATEGORY_KEYS.has(
      toNormalizedKey(categorySlug, subcategorySlug),
    ),
    supportsAdvancedFilters: Boolean(profile && profile.filters.length > 0),
    productTypes: profile
      ? profile.productTypes.map((productType) => ({
          value: productType.value,
          label: productType.label,
          fields: [
            ...productType.requiredFields.map((fieldKey) =>
              cloneAttributeDefinition(fieldKey, true),
            ),
            ...((productType.optionalFields || []).map((fieldKey) =>
              cloneAttributeDefinition(fieldKey, false),
            ) || []),
          ].filter(Boolean),
        }))
      : [],
    filters: profile
      ? profile.filters.map((filterKey) => cloneFilterDefinition(filterKey)).filter(Boolean)
      : [],
  };
}

export function decorateCategoryWithCatalogMetadata(category) {
  const plainCategory =
    category && typeof category.toObject === "function" ? category.toObject() : { ...category };
  const categorySlug = String(plainCategory?.slug || "").trim();
  const subcategories = Array.isArray(plainCategory?.subcategories)
    ? plainCategory.subcategories
    : [];

  return {
    ...plainCategory,
    catalogConfigLocked: getCategoryCatalogMetadata(categorySlug).locked,
    subcategories: subcategories.map((subcategory) => ({
      ...subcategory,
      catalogConfig: getSubcategoryCatalogMetadata(categorySlug, subcategory),
    })),
  };
}

export function isProtectedCategorySlug(slug) {
  return PROFILE_CATEGORY_SLUGS.has(String(slug || "").trim().toLowerCase());
}

export function isProtectedSubcategorySlug(categorySlug, subcategorySlug) {
  return PROFILE_SUBCATEGORY_KEYS.has(toNormalizedKey(categorySlug, subcategorySlug));
}

export function resolveProductType(categorySlug, subcategorySlug, productType) {
  const profile = getCatalogProfile(categorySlug, subcategorySlug);
  if (!profile) {
    return "";
  }

  const normalizedProductType = String(productType || "").trim().toLowerCase();
  if (normalizedProductType) {
    const matched = profile.productTypes.find((item) => item.value === normalizedProductType);
    return matched ? matched.value : "";
  }

  if (profile.productTypes.length === 1) {
    return profile.productTypes[0].value;
  }

  return "";
}

export function getProductTypeDefinitions(categorySlug, subcategorySlug) {
  const profile = getCatalogProfile(categorySlug, subcategorySlug);
  return profile ? [...profile.productTypes] : [];
}

function getProductTypeDefinition(categorySlug, subcategorySlug, productType) {
  const profile = getCatalogProfile(categorySlug, subcategorySlug);
  if (!profile) {
    return null;
  }

  return (
    profile.productTypes.find(
      (item) => item.value === String(productType || "").trim().toLowerCase(),
    ) || null
  );
}

export function normalizeFilterAttributes({
  categorySlug,
  subcategorySlug,
  productType,
  input,
}) {
  const normalizedProductType = resolveProductType(
    categorySlug,
    subcategorySlug,
    productType,
  );
  const productTypeDefinition = getProductTypeDefinition(
    categorySlug,
    subcategorySlug,
    normalizedProductType,
  );

  if (!productTypeDefinition) {
    return {
      productType: "",
      filterAttributes: null,
      error: "",
    };
  }

  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};

  const normalizedAttributes = {};

  if (productTypeDefinition.requiredFields.includes("chainSizeCode")) {
    const chainSizeCode = normalizeOptionValue(source.chainSizeCode);
    if (!isAllowedOption(chainSizeCode, CHAIN_SIZE_OPTIONS)) {
      return {
        productType: normalizedProductType,
        filterAttributes: null,
        error: "Chain size is required for the selected product type",
      };
    }

    normalizedAttributes.chainSizeCode = chainSizeCode;
  }

  if (productTypeDefinition.requiredFields.includes("chainLengthFt")) {
    const chainLengthFt = normalizeOptionValue(source.chainLengthFt);
    if (!isAllowedOption(chainLengthFt, CHAIN_LENGTH_OPTIONS)) {
      return {
        productType: normalizedProductType,
        filterAttributes: null,
        error: "Chain length must be one of 16, 20 or 25 feet",
      };
    }

    normalizedAttributes.chainLengthFt = Number(chainLengthFt);
  }

  if (productTypeDefinition.requiredFields.includes("strapWidthIn")) {
    const strapWidthIn = normalizeOptionValue(source.strapWidthIn);
    if (!isAllowedOption(strapWidthIn, STRAP_WIDTH_OPTIONS)) {
      return {
        productType: normalizedProductType,
        filterAttributes: null,
        error: "Strap width is required for the selected product type",
      };
    }

    normalizedAttributes.strapWidthIn = Number(strapWidthIn);
  }

  if (productTypeDefinition.requiredFields.includes("strapLengthFt")) {
    const strapLengthFt = normalizeNumberValue(source.strapLengthFt);
    if (strapLengthFt === null) {
      return {
        productType: normalizedProductType,
        filterAttributes: null,
        error: "Strap length is required for the selected product type",
      };
    }

    normalizedAttributes.strapLengthFt = strapLengthFt;
    normalizedAttributes.strapLengthBucket = getStrapLengthBucket(strapLengthFt) || "";
  }

  if (productTypeDefinition.requiredFields.includes("hookSizeCode")) {
    const hookSizeCode = normalizeOptionValue(source.hookSizeCode);
    if (!isAllowedOption(hookSizeCode, HOOK_WIDTH_OPTIONS)) {
      return {
        productType: normalizedProductType,
        filterAttributes: null,
        error: "Hook width is required for the selected product type",
      };
    }

    normalizedAttributes.hookSizeCode = hookSizeCode;
  }

  if (Object.prototype.hasOwnProperty.call(source, "hookLengthIn")) {
    const hookLengthIn = normalizeOptionValue(source.hookLengthIn);
    if (!hookLengthIn) {
      normalizedAttributes.hookLengthIn = null;
    } else if (!isAllowedOption(hookLengthIn, HOOK_LENGTH_OPTIONS)) {
      return {
        productType: normalizedProductType,
        filterAttributes: null,
        error: "Hook length must be one of the configured inch values",
      };
    } else {
      normalizedAttributes.hookLengthIn = Number(hookLengthIn);
    }
  } else if (normalizedProductType === "hook") {
    normalizedAttributes.hookLengthIn = null;
  }

  return {
    productType: normalizedProductType,
    filterAttributes: normalizedAttributes,
    error: "",
  };
}

function getLabelForOption(value, options = []) {
  const normalizedValue = normalizeOptionValue(value);
  const matched = options.find((item) => normalizeOptionValue(item.value) === normalizedValue);
  return matched ? matched.label : "";
}

export function buildManagedSizeSpec(productType, filterAttributes) {
  if (!filterAttributes || typeof filterAttributes !== "object") {
    return "";
  }

  if (productType === "transport-chain") {
    const sizeLabel = getLabelForOption(filterAttributes.chainSizeCode, CHAIN_SIZE_OPTIONS);
    const lengthFt = normalizeNumberValue(filterAttributes.chainLengthFt);
    return sizeLabel && lengthFt !== null ? `${sizeLabel} x ${formatNumber(lengthFt)}'` : "";
  }

  if (productType === "bulk-chain" || productType === "binder") {
    return getLabelForOption(filterAttributes.chainSizeCode, CHAIN_SIZE_OPTIONS);
  }

  if (productType === "strap") {
    const widthLabel = getLabelForOption(filterAttributes.strapWidthIn, STRAP_WIDTH_OPTIONS);
    const lengthFt = normalizeNumberValue(filterAttributes.strapLengthFt);
    return widthLabel && lengthFt !== null ? `${widthLabel} x ${formatNumber(lengthFt)}'` : "";
  }

  if (productType === "hook") {
    const widthLabel = getLabelForOption(filterAttributes.hookSizeCode, HOOK_WIDTH_OPTIONS);
    const lengthLabel = getLabelForOption(
      filterAttributes.hookLengthIn,
      HOOK_LENGTH_OPTIONS,
    );
    if (!widthLabel) {
      return "";
    }

    return lengthLabel ? `${widthLabel} x ${lengthLabel}` : widthLabel;
  }

  return "";
}

export function syncManagedListSpecs(specs, productType, filterAttributes) {
  const normalizedSpecs = Array.isArray(specs) ? specs : [];
  if (!String(productType || "").trim()) {
    return normalizedSpecs;
  }

  const nextSizeValue = buildManagedSizeSpec(productType, filterAttributes);
  const unmanagedSpecs = normalizedSpecs.filter((item) => {
    const label = String(item?.label || "").trim().toLowerCase();
    return label && !MANAGED_SPEC_LABELS.has(label);
  });

  if (!nextSizeValue) {
    return unmanagedSpecs;
  }

  return [{ label: "Size", value: nextSizeValue }, ...unmanagedSpecs];
}

export function getFilterOptionSets() {
  return {
    chainSize: CHAIN_SIZE_OPTIONS.map(cloneOption),
    chainLengthFt: CHAIN_LENGTH_OPTIONS.map(cloneOption),
    strapWidthIn: STRAP_WIDTH_OPTIONS.map(cloneOption),
    strapLengthBucket: STRAP_LENGTH_BUCKET_OPTIONS.map(cloneOption),
    hookSize: HOOK_WIDTH_OPTIONS.map(cloneOption),
    hookLengthIn: HOOK_LENGTH_OPTIONS.map(cloneOption),
  };
}
