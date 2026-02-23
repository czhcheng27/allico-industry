export type CategorySlug = string;

export type Subcategory = {
  slug: string;
  name: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  cardImage: string;
  icon: string;
  subcategories: Subcategory[];
};

export type ProductStatus = "In Stock" | "Low Stock";

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductDetailContent = {
  series: string;
  headline: string;
  description: string;
  features: string[];
  table: ProductSpec[];
  thumbImages: string[];
  relatedSlugs: string[];
};

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  subcategory?: string;
  sku: string;
  price: string;
  image: string;
  galleryImages?: string[];
  status: ProductStatus;
  listSpecs: ProductSpec[];
  badge?: string;
  detail?: ProductDetailContent;
};

const images = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-GxRg8Dqr_6u7A3G5pm12_PnAhGPryI_6hnX1gKsObjj35PdE9nArjKW7M5psJdErmUnnetsknSda2uNNMJOTaeWOeE8nUelCi8-_33R-7D_wYyRTDFIaDzT-tC6kG9krU-gd-P9X-ocDxgkP3BbMZiAezOb4qr7-48RD8FTSgAojnk03EYGpPPnVZlWoAtSEKJ4-xWUjA0fHdGllaDwm1-jmrgctOVWbDIz43yWSR6jAs1MDeN_nBRS5J5dP62uOWv13W6aHwHU",
  categoryTowing: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsqyaXfo0eqCTCLH56zCF0GnK6JnPzWqGJDxxrLyXAyq6KOEwsnAbJS3BiWdXO9Y4AsDtQMiGVAjX5E9_AL8a7WUFbG7c2qym7RT052VdHtRSQgZ0oZMMfN7OFoKCUp2Ko7wXWMdCC-oRyIsFlIsFMvcTf1xdi6KnsaKUkaknWulLnYVAe6AoHlCCODYqj2Wg1v1HYFxp833hL9QJePVK-2lcCSyR9PzxgQh1Yk6fDYWrbl3X_sYX4hNHpBzjTqYnq6JXPaxrFmrU",
  categoryCargo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCp3LPqWvF_CX0UQGSCg44BkDU-uIQZX_sVnv_Un2QX5OFZiCfqJuFkzBwPHtIHSMHzZrvQMAUziV9AznlXzN37PWFaNBHAAk4SEJ4C4scHmUttYJVGLMrwL7PTKz6e6cJfZVJ0AsMsc_UPY6aXf_pyZ-t9rnTMV2pMYDw4sfUatxkTn5c5ejWl06AzinTxDeiXontX-4S6B1AXpPXKf5NcR9woRL_ldmOihfVjYQQ4jcqBRV1g45qid976F30k2RY_hErrvFh2zdE",
  categoryIndustrial: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLORO5FRPV60rfzCe405lGTMjc4j3PFJq67X5qYN43nNK8KOu-mgIBMZOpSaHlvILeBdARiVGOiBif5fuIkbKrqt_NLYQlzvT9RTxOkrogIl0MdHhVyzFmGSgCGlTrWKLmanPHpeiGHfs4lDEVzbduyUp-_E0SPnLdWYGqbvB2pdvRXZ9HZkew80MKiw2pHMRfKg7NW-HGXnFQZmwjwupvxc0fRwSYY5NG_VBsLJBQROWByo5QY88fV_w_AvPw4y3doyEW-5WWL0c",
  categoryHooks: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjms7_7hv84DhP8tIemz30KhU9yGzOeVOxBMt-AKeUV_yPpleSgUl1I1qRx9DpDnbrgevS1LXty52D1SnCaLHSx8KTRZcgHqAfFqPVHZW1wSAxq7hxhy03U3aj3VjLDkxVQxp02d-1yMheF4E7jRutmZaiDLvpldPyEGfIYGNRQ9QkHOiHdKr8KsRkb8kSTm4om-D01BnjLlKRj9xnKlWWcKTL30dr-sGdHv84bvtVV4ns-KKuW9-GV4n-MAQB_l3f3MS6TqJqsk0",
  safety: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkRkvhvy4aLN5XDNtyXroGAxB5ord26I0nunSkz_4q6r81hVuQN0IUDqXCTWhLrjPwiQds2SjngeMrZihiv7kjrtiBmnQfTBfB4CUa9xN8vbYZzKyGQKS3Ld1anz6xcY3vf_QA2P3NMELKHZF48Q5AefD5g1ywmtA4rNLn8aiUoDnRlo9j4rulgN2wajlnIsyBFWq4n3eHYOCZmrH584Fo63YTNc_ZF6RvtP-4LU0AvOePPbnOrB0Lao-nEaR5ldxjYl2bEfeKxHQ",
  ratchetFeatured: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEjkO1qVsz71QmW8UHX9-29O3rP1Ia21Hl_Z_ZWkFzBcTRnggGt76Jb8dmKvWVL5Zc9iY1FoKy2-EJ3e8xUgWC0v-devM65d7NHYr27ak6ib7R4sJm0QXk9a1qGCCxVXStB7lnLdJd9RdK4hvxjAiaCVPIvvGFOf9XnffYRA8q0QRIKZL79l6Gm3XcXnEEgNiu346cIQkw0JInZ3btmyImwroiLJz7CjrGOh0vjHNMV5DjFz3aRJn_BsQPwTxDrHeXX23pF7PrH_I",
  axleStrap: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJEGXETw6LdLWTA3-sNAmyjs57s3C_SOHF45y62btg5t-DMLY5RiOZzwN3bRatsVNtrmmCJ-zorPgfPxvujqacT7QxCC41rHom59Pla7N_az7ezCDlhxk9vmmxmDioh8IPg8QKgjuWO-vPX2jmAHJ8iUfLIbJA9kS6YrH4bJ37fJR1t9NVF540EBREyp0di4Yhdd_EAOp0azY2LVL50yojjUMzd3fRwT8Yyp_Cza1W_I3DlK3powWnRZxqCEJYfAB6qdj5Q0XVCJw",
  towingChain: "https://lh3.googleusercontent.com/aida-public/AB6AXuADuwYXypvQWwLaAS1nkN4StaFmxqPE2VoD3sKrVU1ttFHTZkWP8WIR_P4H-YCP-91aMJVeSSBd4tO_Lzlwx6fRln2dVFn1OYsN_C68PBBJQr-Ydtaei-K1Jpi3BdfjsPQUobUNkpwvl2f5y7Z5qXJKbrnTC6ODexTWE6181yCIPUnR3TiI9x7QDzHKf9Z1B2moo3D-tIGK3Hfp5ZzYvkOcfFG4M6b-j1_5tXTx_HMmLFfUDp0fleIb8qEtRqmiCihLyTVVCp0jxbE",
  ratchetStrap: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXKHWdpwC1dLdR8tZ3awCMk8E3vgUYzvcZIFJGxWzNnAec0riWKq1SrSvsXQs2M65aicAtD-6I41o9GsDDG4lGBJlEm5YwXa3XhD93UWZNGBBk-d9Y0NEpd7PURdsi6ITs3kxcx-nBCJwtyindBJrxQfjFT2bJW9Xc6q3Z-5MuXJ-tgCjIJUMMiJG6LBa_2B4clmxRmy-iJJ0cY_HyRhVZrvoVmaIVsmw-RoFCCOAba3E4kSN5kqbcyLVeNh2iz3aRJklpx1AxdIM",
  winchCable: "https://lh3.googleusercontent.com/aida-public/AB6AXuAefcw5jrSi6IUudk8z-xdLUICdeHeJjUgkjiC3H-GxV_NuePD7LIgqHBL44WANDhWLaA88cBfiwxMqgrrqV5CRlqEPfGtm2T_szYRHhNFVMiv3JCgYaAX33jLWMAXkNMjdOmt7megSspEvVfJMaydnlyCCnZ6w-7mN06g89_bIrxpR3tRWi584zfX7O-KJh0_w4GuA8dn-xTNiHbKVuJ-glwa6DwZfPj1SakEQ8Brt_NFXDl0ATLJj3vJGvd4RwFuZvhc_Elz6DEg",
  snatchBlock: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7F8R1Ca7ds1798xj8HqKB2NjUtmDOBxMPdFoSbPFnxCLuuBTLzMMrO4pKZPaEWNu1v1eLa_yLPbuUVPzIElBzVBZpPQ4cP2ih3_BsxQNf-3X5lDDOj1taMXqhhGrTbx-KNJESidOMCx3yiGGGQsJNMJsUSmXHgmTshsV-j4ITfag-EDZITZ3DbDk78bg1Vi6EwLYp5oBvWPTqLI8kWq9SBGNGq4_GL1CErzV8F0sR9DWzgc_j20Ss9OptYTorOY0OYXSKo5EXwQI",
  vChain: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCxnhnmOTpneu0OQ_pPVjxvAzff1tG_2kEUY4INl9YS-d5DUyqRMKzpib-AAptvqK4X95D1tV3V5xiMr94T17JvTvfce63V_LfQHeeda2zUc2na8aeYRo3iGN-EF_yz5Q8sQJsTfn4YUBRp7ytEvcmj5hy7gyRGd4v0WGisrxxo80Ud8Z_WBuXun0zae_PVEmPBSesyiRJCH37ZydH6t1NeXtZj9C7dnvFVLXhXgjrHs6dZmMxzjxLxF-DOK5LXNZgkSQwxOVR1TE",
  towLight: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXUsv3bcPYEkeWoaBUKoEgehWYmvhcRjAx33iuoB7_Y7ueoop5IJ7-3gGzAjX775z7gWRq9QQRnRJsR64ZyM4MvCnJDvLT46hC_pKqRAmojmepGteHmG6TGO6QGqgarDiT1dRk4pybigcRCcCnhwk18AX7_kA2SohDpVoT_mZfv2KtEMPUYUkNVp4qJGilRCry0L_X9OUP9cVJJi3uUm5HV916RsgMYkA81Flj8sFC1aYJZ0lor9-qlBN2WG7k9WxVVg6CC43S70Y",
  g100Main: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYvBp1kgjhlT7vswHr_zy5ha8LqOfSuhY0uZJJjbd28Z5YA88SoQrbzrgAQBwOmRgneP5P8Tp0P0i1u1cldRT1o8RdTjy_Z0n9HCaFred63WG6BCJIwPcTrjDMcQxW5NdvR18a6_4FRfnrG8-Pzz2LJDVNuoWJMamHFdKElUVm6zCTu1B04IMn-CKd9hsI9YmFiFSjaPV8wn_LWXgBYEN793Q0Jiliufc9upA9C3_WhHFAUliBvtR7-duTgFiy4QwLhfzLEicXfVg",
  foundryHook: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ5wLzObL35897-rGWZhLg1f9NZSW-jt1Gcr_ap9KMda3aLlMR1GRTwehsrgYeYAKBPSRPwlb4U5MWcU0jyR_b37Fz8MacbIVLdkaipIPJKwoE3Cft-bs00jVADfFWfTq4dTW7VfFHkkKTUy8KGLtZIuQGqHZGJ7G4yIqm4KEPw1Xo_ovn2zSeoMHPtamxAEnsdtA3BxEMSF6JDpC9mL75JmgPu2Jb7m93Y60RIHsv23JThxfDf36OCNCP-2QOO95QkJVdHAv5vuI",
  shackle: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtRGBk7x7apT25bRKM08fY6HzSdCGXJ2DxSERuSlJJb7WpMdjF5MYZ5FnOucq3b3UnRJ7O7Ew7KBW3bL51CeoSn9eTAcq7t0E8JX5BnLV2mMXCitRNmSff8m1UFD3RGHqc9zZFwFsR6RdzcavCPf8rBB-JaleAPPGjm-j2Ukc8Zj8XjRtc43e4vKqcOqX__-xaFRjgMgiR0t9GN39UJ1xDN3wDqyWVLrGIw48mIZy2SymwoSy8NxTGVpAo21rsweC6UkD9Z_ePE1o",
  hammerlock: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxEVnquz9yqxu8DwGeewom3RI0M2FiHkzat1GM4tdNl0KVzCnY3FcXSyRw3AUVwV79Jz_FdicdJFWYoyg4-ZPIwnA5FQEspOQk9D9POtqkNXuWoIuHYA6Lq--bGDRFsEscf5wZvnzwOzwIcBixZPvTenTzAkNBOke_rHxwv1lBASoLKvuWv6HRNdcZ8dnMOGGHGAJt8UHeygJLNJvYrO3EtNg7WdPfFwu_sucGvBP7TF7uIOb1UoI4WmHrtrg1Mbh6VWIGMU34Bkw",
};

export const siteMedia = {
  heroImage: images.hero,
  safetyImage: images.safety,
};

const galleryPool = [
  images.ratchetFeatured,
  images.axleStrap,
  images.towingChain,
  images.ratchetStrap,
  images.winchCable,
  images.snatchBlock,
  images.vChain,
  images.towLight,
  images.g100Main,
  images.foundryHook,
  images.shackle,
  images.hammerlock,
];

export const featuredProductSlugs = [
  "retractable-ratchet-strap",
  "yoke-trigger-kit",
  "yoke-g100-foundry-hook",
  "heavy-duty-axle-strap",
  "g70-transport-chain",
];

export function getCategoryHref(category: CategorySlug) {
  return `/category/${category}`;
}

export function getSubcategoryHref(category: CategorySlug, subcategory: string) {
  return `${getCategoryHref(category)}?subcategory=${encodeURIComponent(subcategory)}`;
}

export function getProductHref(product: Product) {
  return `/category/${product.category}/product/${encodeURIComponent(product.sku)}`;
}

function toSeed(input: string) {
  let seed = 0;
  for (let index = 0; index < input.length; index += 1) {
    seed = (seed * 31 + input.charCodeAt(index)) % 2147483647;
  }
  return seed;
}

export function getProductGalleryImages(product: Product) {
  const fromProduct = product.galleryImages ?? [];
  const fromDetail = product.detail?.thumbImages ?? [];

  const base =
    fromProduct.length > 0
      ? fromProduct
      : fromDetail.length > 0
        ? fromDetail
        : [product.image];

  const uniqueBase = [...new Set(base)];
  const rotationIndex = toSeed(product.sku) % galleryPool.length;
  const rotatedPool = [
    ...galleryPool.slice(rotationIndex),
    ...galleryPool.slice(0, rotationIndex),
  ];

  const merged = [
    ...uniqueBase,
    ...rotatedPool.filter((image) => !uniqueBase.includes(image)),
  ];

  return merged.slice(0, 4);
}
