import * as Yup from 'yup';
import { addMonths, parseISO, isBefore, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Queue from '../../lib/Queue';
import EnrollmentMail from '../jobs/EnrollmentMail';

class EnrollmentController {
  async index(req, res) {
    const { page, perPage } = req.query;

    if (page === undefined && perPage === undefined) {
      const enrollments = await Enrollment.findAll({
        where: {
          student_id: {
            [Op.ne]: null,
          },
          plan_id: {
            [Op.ne]: null,
          },
        },
        attributes: [
          'id',
          'student_id',
          'plan_id',
          'start_date',
          'end_date',
          'price',
          'active',
        ],
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

    const enrollments = await Enrollment.findAll({
      where: {
        student_id: {
          [Op.ne]: null,
        },
        plan_id: {
          [Op.ne]: null,
        },
      },
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
        'active',
      ],
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
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    return res.json(enrollments);
  }

  async show(req, res) {
    const { enrollment_id } = req.params;
    const enrollment = await Enrollment.findByPk(enrollment_id, {
      attributes: [
        'id',
        ['student_id', 'student'],
        ['plan_id', 'plan'],
        'start_date',
        'end_date',
        'price',
        'active',
      ],
      include: [
        {
          model: Student,
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          attributes: ['title', 'duration'],
        },
      ],
    });
    if (!enrollment) {
      return res.status(400).json({ error: 'No enrollment available.' });
    }
    return res.json(enrollment);
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

    if (isBefore(parseISO(start_date), startOfDay(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not acceptable.' });
    }

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

    await Queue.add(EnrollmentMail.key, {
      student,
      plan,
      start_date,
      end_date,
      price,
    });

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    if (isBefore(parseISO(req.body.start_date), startOfDay(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not acceptable.' });
    }

    const enrollment = await Enrollment.findByPk(req.params.enrollment_id);

    const { student_id, plan_id, start_date } = await enrollment.update(
      req.body
    );
    return res.json({ student_id, plan_id, start_date });
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.enrollment_id);
    await enrollment.destroy();

    return res.json({ ok: `Enrollment #${enrollment.id} deleted` });
  }
}

export default new EnrollmentController();
