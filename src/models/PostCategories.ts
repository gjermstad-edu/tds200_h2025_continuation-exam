// Kategorier for en post/innlegg

// TODO: Sett opp kategorier

// Nøkkel = string verdi
export enum PostCategory {
  Filter1 = 'filter1',
  Filter2 = 'filter2',
  Filter3 = 'filter3',
}

// TODO: Sett navn på kategoriene
// Returner navn på kategorien
export const convertCategoryToSingleWord = (category: PostCategory): string => {
  switch (category) {
    case PostCategory.Filter1:
      return 'Renhold';
    case PostCategory.Filter2:
      return 'Vedlikehold';
    case PostCategory.Filter3:
      return 'Innsamling';
    default:
      return 'Ukjent';
  }
};