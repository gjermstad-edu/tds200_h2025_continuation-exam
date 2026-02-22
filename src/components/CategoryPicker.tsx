import {
  convertCategoryToSingleWord,
  PostCategory,
} from "@/models/PostCategories";
import { View, Text } from "react-native";
import CheckBox from "./Checkbox";

type ChooseCategoriesProps = {
  selectedCategories: PostCategory[];
  onChangeSelectedCategories: (categories: PostCategory[]) => void;
};

export default function CategoryPicker({
  selectedCategories,
  onChangeSelectedCategories,
}: ChooseCategoriesProps) {
  const allCategories = Object.values(PostCategory);

  const handleToggleCategory = (category: PostCategory) => {
    const isSelected = selectedCategories.includes(category);

    let updatedSelection: PostCategory[];
    if (isSelected) {
      updatedSelection = selectedCategories.filter(
        (currentCategory) => currentCategory !== category,
      );
    } else {
      updatedSelection = [...selectedCategories, category];
    }

    onChangeSelectedCategories(updatedSelection);
    console.log(
      `ℹ️ Valgte kategorier: ${updatedSelection} [from ChooseCategoriesForm.tsx]`,
    );
  };

  return (
    <View className="md:flex-row">
      {allCategories.map((category) => {
        const isChecked = selectedCategories.includes(category);

        return (
          <View key={category} className="flex-row m-1 md:items-center">
            <CheckBox
              isChecked={isChecked}
              onPress={() => handleToggleCategory(category)}
              title={convertCategoryToSingleWord(category)}
            />
          </View>
        );
      })}
    </View>
  );
}
