import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import QuestionController from './app/controllers/QuestionController';
import AnswerController from './app/controllers/AnswerController';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello World' });
});

routes.get('/help-orders/:help_id', AnswerController.show);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.get('/students/:student_id', StudentController.show);

routes.post('/students/:student_id/checkins', CheckinController.store);
routes.get('/students/:student_id/checkins', CheckinController.index);

routes.post('/students/:student_id/help-orders', QuestionController.store);
routes.get('/students/:student_id/help-orders', QuestionController.show);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/students', StudentController.store);
routes.get('/students', StudentController.index);
routes.put('/students/:student_id', StudentController.update);
routes.delete('/students/:student_id', StudentController.delete);

routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.index);
routes.put('/plans/:plan_id', PlanController.update);
routes.delete('/plans/:plan_id', PlanController.delete);

routes.post('/enrollments', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.index);
routes.get('/enrollments/:enrollment_id', EnrollmentController.show);
routes.put('/enrollments/:enrollment_id', EnrollmentController.update);
routes.delete('/enrollments/:enrollment_id', EnrollmentController.delete);

routes.get('/help-orders', QuestionController.index);

routes.post('/help-orders/:help_id/answer', AnswerController.store);
routes.get('/help-orders', AnswerController.index);

export default routes;
