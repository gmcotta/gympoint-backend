import * as Yup from 'yup';
import { addMonths, parseISO, format } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Mail from '../../lib/Mail';
import Queue from '../../lib/Queue';
import EnrollmentMail from '../jobs/EnrollmentMail';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          attributes: ['title'],
        },
      ],
    });
    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { student_id, plan_id, start_date } = req.body;

    const enrollmentExists = await Enrollment.findOne({
      where: { student_id },
    });
    if (enrollmentExists) {
      return res.status(400).json({ error: 'Student is already enrolled.' });
    }

    const student = await Student.findByPk(student_id);
    const plan = await Plan.findByPk(plan_id);

    if (!student || !plan) {
      return res
        .status(400)
        .json({ error: 'Student and/or plan does not exist.' });
    }

    const end_date = addMonths(parseISO(start_date), plan.duration);
    const price = plan.price * plan.duration;

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });
    /*
    const formatPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Welcome to Gympoint',
      template: 'welcome',
      context: {
        student: student.name,
        plan: plan.title,
        start_date: format(parseISO(start_date), "MMMM dd', 'yyyy"),
        end_date: format(end_date, "MMMM dd', 'yyyy"),
        price: formatPrice.format(price),
      },
    });
*/

    await Queue.add(EnrollmentMail.key, {
      student,
      plan,
      start_date,
      end_date,
      price,
    });

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
