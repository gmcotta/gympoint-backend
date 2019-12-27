import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class QuestionController {
  async index(req, res) {
    const { page, perPage } = req.query;

    if (page === undefined && perPage === undefined) {
      const helpOrder = await HelpOrder.findAll({
        where: { answer: null },
        include: [
          {
            model: Student,
            attributes: ['name'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      return res.json(helpOrder);
    }

    const helpOrder = await HelpOrder.findAll({
      where: { answer: null },
      include: [
        {
          model: Student,
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    return res.json(helpOrder);
  }

  async show(req, res) {
    const { student_id } = req.params;
    const { page = 1 } = req.query;
    const perPage = 2;

    const helpOrder = await HelpOrder.findAll({
      where: { student_id },
      include: [
        {
          model: Student,
          attributes: ['name'],
        },
      ],
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    return res.json(helpOrder);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id } = req.params;
    const { question } = req.body;
    const helpOrder = await HelpOrder.create({ student_id, question });
    return res.json(helpOrder);
  }
}

export default new QuestionController();
