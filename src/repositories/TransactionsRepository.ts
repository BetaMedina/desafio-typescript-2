import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionInterface {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_id: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const { income, outcome } = transactions.reduce(
      (accumulator: Balance, transaction: Transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += Number(transaction.value);
            break;

          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;
          default:
            break;
        }
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );
    const total = income - outcome;
    return { income, outcome, total };
  }

  public async createNewTransaction({
    title,
    value,
    type,
    category_id,
  }: TransactionInterface): Promise<Transaction | undefined> {
    const transaction = this.create({
      title,
      value,
      type,
      category_id,
    });
    await this.save(transaction);
    return transaction;
  }

  public async getAllTransaction(): Promise<Transaction[]> {
    const transaction = await this.find();
    return transaction;
  }

  public async deleteTransaction(id: string): Promise<boolean> {
    const transaction = await this.findOne(id);
    if (transaction) {
      await this.remove(transaction);
      return true;
    }
    return false;
  }
}

export default TransactionsRepository;
