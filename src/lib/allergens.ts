// 直接引入 JSON 数据
const allergensData: Allergen[] = require('../../public/data/allergens_list.json');

export interface AllergenName {
  sc: string[];
  tc: string[];
  eng: string[];
}

export interface Allergen {
  id: string;
  name: AllergenName;
}

/**
 * 获取所有过敏原列表
 * @returns Allergen[]
 */
export const getAllAllergens = (): Allergen[] => {
  return allergensData;
};

/**
 * 根据ID获取过敏原信息
 * @param id - 过敏原ID
 * @returns Allergen | undefined
 */
export const getAllergenById = (id: string): Allergen | undefined => {
  return allergensData.find(allergen => allergen.id === id);
};

/**
 * 根据关键词（模糊）匹配过敏原ID列表
 * @param keyword - 要搜索的关键词
 * @param lang - 可选，指定在哪个语言的名称中搜索 (sc, tc, eng)，默认为所有语言
 * @returns string[] - 匹配到的过敏原ID列表 (已去重)
 */
export const findAllergenIdsByKeyword = (keyword: string, lang?: keyof AllergenName): string[] => {
  const lowerKeyword = keyword.toLowerCase().trim();
  if (!lowerKeyword) return [];

  const matchedIds: Set<string> = new Set();

  for (const allergen of allergensData) {
    let namesToSearch: string[] = [];
    if (lang) {
      namesToSearch = allergen.name[lang] || [];
    } else {
      namesToSearch = [
        ...(allergen.name.sc || []),
        ...(allergen.name.tc || []),
        ...(allergen.name.eng || []),
      ];
    }

    for (const name of namesToSearch) {
      if (name.toLowerCase().includes(lowerKeyword)) {
        matchedIds.add(allergen.id);
        break; 
      }
    }
  }
  return Array.from(matchedIds);
};

/**
 * 根据ID列表获取过敏原完整信息列表
 * @param ids - 过敏原ID数组
 * @returns Allergen[]
 */
export const getAllergensByIds = (ids: string[]): Allergen[] => {
  if (!ids || ids.length === 0) return [];
  return allergensData.filter(allergen => ids.includes(allergen.id));
}; 