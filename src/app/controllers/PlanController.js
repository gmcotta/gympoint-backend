import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const { page, perPage } = req.query;

    if (page === undefined && perPage === undefined) {
      const plans = await Plan.findAll();
      return res.json(plans);
    }

    const plans = await Plan.findAll({
      order: [['duration', 'ASC']],
      limit: perPage,
      offset: (page - 1) * perPage,
    });
    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const planExists = await Plan.findOne({ where: { title: req.body.title } });
    if (planExists) {
      return res.status(400).json({ error: 'This plan already exists.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);
    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }
    const { title } = req.body;

    const plan = await Plan.findByPk(req.params.plan_id);

    if (plan.title !== title) {
      const planExists = await Plan.findOne({ where: { title } });
      if (planExists) {
        return res.status(400).json({ error: 'This plan already exists.' });
      }
    }

    const { id, duration, price } = await plan.update(req.body);
    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.plan_id);

    await plan.destroy();
    return res.json({ ok: `Plan ${plan.title} has been deleted.` });
  }
}

export default new PlanController();
