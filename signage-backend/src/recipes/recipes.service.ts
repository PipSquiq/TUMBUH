import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RecipeEntity } from 'src/entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UserEntity } from 'src/entities/user.entity';
import { IngredientEntity } from 'src/entities/ingredient.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(RecipeEntity)
    private recipesRepository: Repository<RecipeEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(IngredientEntity)
    private ingredientsRepository: Repository<IngredientEntity>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<RecipeEntity> {
    const { mainIngredientIds, ...recipeData } = createRecipeDto;
    const recipe = this.recipesRepository.create(recipeData);

    if (mainIngredientIds && mainIngredientIds.length > 0) {
      const ingredients = await this.ingredientsRepository.findBy({
        id: In(mainIngredientIds),
      });
      recipe.mainIngredients = ingredients;
    }

    return await this.recipesRepository.save(recipe);
  }

  async findAll(): Promise<RecipeEntity[]> {
    return await this.recipesRepository.find({
      relations: ['mainIngredients'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<RecipeEntity> {
    const recipe = await this.recipesRepository.findOne({ 
      where: { id },
      relations: ['mainIngredients'],
    });
    if (!recipe) throw new NotFoundException(`Recipe tidak ditemukan`);
    return recipe;
  }

  async update(id: string, updateRecipeDto: Partial<CreateRecipeDto>): Promise<RecipeEntity> {
    const { mainIngredientIds, ...recipeData } = updateRecipeDto;
    const recipe = await this.findOne(id);
    
    Object.assign(recipe, recipeData);

    if (mainIngredientIds) {
      const ingredients = await this.ingredientsRepository.findBy({
        id: In(mainIngredientIds),
      });
      recipe.mainIngredients = ingredients;
    }

    return await this.recipesRepository.save(recipe);
  }

  async toggleLike(recipeId: string, user: UserEntity): Promise<{ liked: boolean }> {
    const recipe = await this.findOne(recipeId);
    const userWithLikes = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['likedRecipes'],
    });

    if (!userWithLikes) throw new NotFoundException(`User tidak ditemukan`);

    const isLiked = userWithLikes.likedRecipes.some((r) => r.id === recipe.id);

    if (isLiked) {
      userWithLikes.likedRecipes = userWithLikes.likedRecipes.filter((r) => r.id !== recipe.id);
    } else {
      userWithLikes.likedRecipes.push(recipe);
    }

    await this.usersRepository.save(userWithLikes);
    return { liked: !isLiked };
  }

  async findLikedByUser(user: UserEntity): Promise<RecipeEntity[]> {
    const userWithLikes = await this.usersRepository.findOne({
      where: { id: user.id },
      relations: ['likedRecipes', 'likedRecipes.mainIngredients'],
    });
    return userWithLikes?.likedRecipes || [];
  }

  async remove(id: string): Promise<void> {
    const result = await this.recipesRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Gagal menghapus resep');
  }
}