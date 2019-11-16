import * as Yup from 'yup';
import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const students = await Student.findAll();
    return res.json(students);
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

    student.destroy();
    return res.json({ ok: `Student ${student.name} has been deleted.` });
  }
}

export default new StudentController();
