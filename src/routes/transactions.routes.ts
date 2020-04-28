import { Router } from 'express';

import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import multerConfig from '../config/multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import AppError from '../errors/AppError';

const transactionsRouter = Router();
const upload = multer(multerConfig);

transactionsRouter.get('/', async (req, res) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.getAllTransaction();
  const founds = await transactionsRepository.getBalance();
  if (transactions) {
    return res.json({ transactions, balance: founds });
  }
  throw new AppError('No transactions in database', 204);
});

transactionsRouter.post('/', async (req, res) => {
  const { title, value, type, category } = req.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });
  if (!transaction) {
    throw new AppError('Wrong tag');
  }
  return res.json(transaction);
});

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.deleteTransaction(id);
  if (transactions) {
    return res.json({ msg: 'transaction has been deleted' });
  }
  throw new AppError('Transaction not found', 400);
});

transactionsRouter.post('/import', upload.single('file'), async (req, res) => {
  const { file } = req;
  const importTransactionsService = new ImportTransactionsService();
  const response = await importTransactionsService.execute(file.path);
  return res.json({ response });
});

export default transactionsRouter;
