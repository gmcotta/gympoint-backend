import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import AnswerMail from '../jobs/AnswerMail';

class AnswerController {
  async index(req, res) {
    const helpOrder = await HelpOrder.findAll({ where: { answer_at: null } });
    return res.json(helpOrder);
  }

  async show(req, res) {
    const { help_id } = req.params;
    const helpOrder = await HelpOrder.findByPk(help_id);
    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order not found' });
    }
    return res.json(helpOrder);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { help_id } = req.params;
    const helpOrder = await HelpOrder.findByPk(help_id);
    if (helpOrder.answer !== null) {
      return res.status(400).json({ error: 'Question has already answered.' });
    }

    const student = await Student.findOne({
      where: { id: helpOrder.student_id },
    });

    const { answer } = req.body;
    const answer_at = new Date();
    const helpAnswered = await helpOrder.update({ answer, answer_at });

    await Queue.add(AnswerMail.key, {
      student,
      question: helpOrder.question,
      answer,
    });

    return res.json(helpAnswered);
  }
}

export default new AnswerController();
