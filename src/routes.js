import { Router } from 'express';
import Student from './app/models/Student';
import UserController from './app/controllers/UserController';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

routes.get('/test', async (req, res) => {
  const student = await Student.create({
    name: 'Test 2',
    email: 'test2@test.com',
    age: 25,
    weight: 97.8,
    height: 1.74,
  });

  return res.json(student);
});

routes.post('/users', UserController.store);

export default routes;
