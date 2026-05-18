import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipeEntity } from '../entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';

describe('RecipesService', () => {
  let service: RecipesService;
  let repository: Repository<RecipeEntity>;

  const mockRecipe: RecipeEntity = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Nasi Goreng Spesial',
    description: 'Nasi goreng dengan bumbu khas dan lauk pauk lengkap',
    ingredients: '2 cangkir nasi, 2 telur, 100g udang',
    instructions: '1. Panaskan minyak. 2. Masukkan bawang hingga harum.',
    cookingTime: 15,
    servings: 2,
    caloriesValue: 206,
    imageUrl: 'http://localhost:3000/uploads/recipes/test.jpg',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createRecipeDto: CreateRecipeDto = {
    name: 'Nasi Goreng Spesial',
    description: 'Nasi goreng dengan bumbu khas dan lauk pauk lengkap',
    ingredients: '2 cangkir nasi, 2 telur, 100g udang',
    instructions: '1. Panaskan minyak. 2. Masukkan bawang hingga harum.',
    cookingTime: 15,
    servings: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getRepositoryToken(RecipeEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    repository = module.get<Repository<RecipeEntity>>(
      getRepositoryToken(RecipeEntity),
    );
  });

  describe('create', () => {
    it('should create a recipe successfully', async () => {
      jest.spyOn(repository, 'create').mockReturnValue(mockRecipe);
      jest.spyOn(repository, 'save').mockResolvedValue(mockRecipe);

      const result = await service.create(createRecipeDto);

      expect(result).toEqual(mockRecipe);
      expect(repository.create).toHaveBeenCalledWith(createRecipeDto);
      expect(repository.save).toHaveBeenCalledWith(mockRecipe);
    });
  });

  describe('findAll', () => {
    it('should return all recipes', async () => {
      const mockRecipes = [mockRecipe];
      jest.spyOn(repository, 'find').mockResolvedValue(mockRecipes);

      const result = await service.findAll();

      expect(result).toEqual(mockRecipes);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a recipe by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockRecipe);

      const result = await service.findOne(mockRecipe.id);

      expect(result).toEqual(mockRecipe);
    });

    it('should throw NotFoundException when recipe not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findRecipesByIngredient', () => {
    it('should find recipes by ingredient', async () => {
      const mockRecipes = [mockRecipe];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRecipes),
      };

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findRecipesByIngredient('nasi');

      expect(result).toEqual(mockRecipes);
    });
  });

  describe('update', () => {
    it('should update a recipe successfully', async () => {
      const updateDto: Partial<CreateRecipeDto> = {
        cookingTime: 20,
      };

      jest.spyOn(repository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockRecipe);

      const result = await service.update(mockRecipe.id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(mockRecipe.id, updateDto);
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('remove', () => {
    it('should delete a recipe successfully', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockRecipe.id);

      expect(repository.delete).toHaveBeenCalledWith(mockRecipe.id);
    });
  });
});