import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepositorie from '../repositories/TransactionsRepository';
import CategorieRepositorie from '../repositories/CategorieRepositorie';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction | undefined> {
    const transactionRepositorie = getCustomRepository(TransactionRepositorie);
    const categorieRepositorie = getCustomRepository(CategorieRepositorie);
    const categoryDB = await categorieRepositorie.getCategorie(category);

    const balance = await transactionRepositorie.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError(
        "You don't have enough money to do this transaction",
        400,
      );
    }

    if (categoryDB) {
      const createTransaction = await transactionRepositorie.createNewTransaction(
        {
          title,
          value,
          type,
          category_id: categoryDB.id,
        },
      );
      return createTransaction;
    }

    const newCategorie = await categorieRepositorie.createNewCategorie(
      category,
    );
    if (newCategorie) {
      const createTransaction = await transactionRepositorie.createNewTransaction(
        {
          title,
          value,
          type,
          category_id: newCategorie.id,
        },
      );
      return createTransaction;
    }
    throw new AppError('Categories doesnt has been created', 400);
  }
}

export default CreateTransactionService;
