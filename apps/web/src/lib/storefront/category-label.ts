/** English category label — never uses nameBn or locale translation. */
export function getCategoryEnglishName(
  category:
    | {
        name?: string;
        nameEn?: string;
        nameBn?: string;
      }
    | null
    | undefined,
): string {
  if (!category) return "";
  return category.nameEn?.trim() || category.name?.trim() || "";
}
