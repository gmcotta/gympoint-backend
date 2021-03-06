import { subDays, isSameDay, subHours } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async index(req, res) {
    const { student_id } = req.params;
    const { page } = req.query;
    const perPage = 8;

    const checkins = await Checkin.findAll({
      where: { student_id },
      attributes: ['id', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: perPage,
      offset: (page - 1) * perPage,
    });

    const count = await Checkin.count({
      where: { student_id },
    });

    return res.json({ checkins, count });
  }

  async store(req, res) {
    const { student_id } = req.params;
    const today = new Date();

    const { active } = await Enrollment.findOne({
      where: { student_id },
    });

    if (active === false) {
      return res.status(400).json({ error: 'Your enrollment is not active.' });
    }

    const weekCheckin = await Checkin.findAll({
      where: {
        student_id,
        createdAt: {
          [Op.between]: [subDays(today, 7), today],
        },
      },
    });

    if (weekCheckin.length >= 5) {
      return res
        .status(400)
        .json({ error: 'The week limit of check-ins was reached.' });
    }

    const todayCheckin = weekCheckin.filter(checkin =>
      isSameDay(subHours(checkin.createdAt, 3), today)
    );

    if (todayCheckin.length > 0) {
      return res
        .status(400)
        .json({ error: 'You already have made a check-in today.' });
    }

    const checkin = await Checkin.create({ student_id });
    return res.json(checkin);
  }
}

export default new CheckinController();
