import Student from '../models/Student';

class StudentController {
  async create(req, res) {
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
    const { id, email } = req.body;
    const student = await Student.findByPk(id);

    if (email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });
      if (studentExists) {
        return res.error(400).json({ error: 'Student already exists' });
      }
    }

    const { name, age, weight, height } = await student.update(req.body);

    return res.json({ id, name, email, age, weight, height });
  }
}

export default new StudentController();
