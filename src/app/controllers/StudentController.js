import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import Plan from '../models/Plan';

class StudentController {
  async index(req, res) {
    const { page, perPage, name: queryName } = req.query;

    if (page === undefined && perPage === undefined) {
      const students = await Student.findAll({
        where: {
          name: { [Op.like]: `%${queryName}%` },
        },
      });
      return res.json(students);
    }

    const students = await Student.findAll({
      where: {
        name: { [Op.like]: `%${queryName}%` },
      },
      limit: perPage,
      offset: (page - 1) * perPage,
    });

    return res.json(students);
  }

  async show(req, res) {
    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);
    const enrollment = await Enrollment.findOne({
      where: { student_id },
      include: [
        {
          model: Plan,
          attributes: ['title', 'duration'],
        },
      ],
    });
    if (!student) {
      return res.status(400).json({ error: 'No student found.' });
    }
    return res.json({ student, enrollment });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await Student.findOne({
      where: { email: req.body.email },
    });
    if (userExists) {
      return res.status(400).json({ error: 'Student already exists.' });
    }

    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;
    const student = await Student.findByPk(req.params.student_id);

    if (email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });
      if (studentExists) {
        return res.error(400).json({ error: 'Student already exists' });
      }
    }

    const { id, name, age, weight, height } = await student.update(req.body);

    return res.json({ id, name, email, age, weight, height });
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.student_id);

    await student.destroy();
    return res.json({ ok: `Student ${student.name} has been deleted.` });
  }
}

export default new StudentController();
