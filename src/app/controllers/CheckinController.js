import { parseISO, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async index(req, res) {
    const { student_id } = req.params;

    const checkins = await Checkin.findAll({
      where: { student_id },
      attributes: ['id', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return res.json(checkins);
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
          [Op.between]: [startOfWeek(today), endOfWeek(today)],
        },
      },
    });

    if (weekCheckin.length >= 5) {
      return res
        .status(400)
        .json({ error: 'The week limit of check-ins was reached.' });
    }

    const todayCheckin = weekCheckin.filter(checkin =>
      isSameDay(checkin.createdAt, today)
    );

    if (todayCheckin) {
      return res
        .status(400)
        .json({ error: 'You have already made a check-in today.' });
    }

    const checkin = await Checkin.create({ student_id });
    return res.json(checkin);
  }
}

export default new CheckinController();
