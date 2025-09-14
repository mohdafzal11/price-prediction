import React from "react";
import {
  CategoriesContainerWrapper,
  CategoriesContainer,
  CategoryItem,
} from "./Categories.styled";

interface Category {
  name: string;
  keywords: string[];
}

interface CategoriesNavProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

const Categories = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoriesNavProps) => {

  const handleClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };


  return (
    <CategoriesContainerWrapper>
      <CategoriesContainer>
        {categories.map((category) => (
          <CategoryItem
            key={category.name}
            isActive={selectedCategory === category.name}
            onClick={() => handleClick(category.name)}
          >
            {category.name}
          </CategoryItem>
        ))}
      </CategoriesContainer>
    </CategoriesContainerWrapper>
  );
};

export default Categories;
