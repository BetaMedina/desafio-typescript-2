import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategorieRepositorie extends Repository<Category> {
  public async getCategorie(title: string): Promise<Category | undefined> {
    const categorie = await this.findOne({ where: { title } });
    return categorie;
  }

  public async createNewCategorie(title: string): Promise<Category | null> {
    const categorie = this.create({
      title,
    });
    await this.save(categorie);
    return categorie;
  }
}

export default CategorieRepositorie;
