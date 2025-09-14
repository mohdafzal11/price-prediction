import styled from 'styled-components';


interface CategoryItemProps {
  isActive?: boolean;
}

export const CategoriesContainerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const CategoriesContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  align-items: center;
  margin: 10px 0px;
  max-width:1400px
`;

export const CategoryItem = styled.button<CategoryItemProps>`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 18px;
  font-weight: 300;
  white-space: nowrap;
  transition: color 0.2s ease, background-color 0.2s ease;
  cursor: pointer;
`;