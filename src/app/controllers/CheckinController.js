import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';

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

    const weekCheckin = await Checkin.findAll({
      where: {
        student_id,
        createdAt: {
          [Op.between]: [startOfWeek(today), endOfWeek(today)],
        },
      },
    });

    if (weekCheckin.length >= 5) {
      res
        .status(400)
        .json({ error: 'The week limit of check-ins was reached.' });
    }

    const todayCheckin = weekCheckin.find(
      c =>
        format(c.createdAt, "y'-'MM'-'dd") === format(new Date(), "y'-'MM'-'dd")
    );

    if (todayCheckin) {
      res
        .status(400)
        .json({ error: 'You have already made a check-in today.' });
    }

    const checkin = await Checkin.create({ student_id });
    return res.json(checkin);

    // return res.json(weekCheckin);
  }
}

export default new CheckinController();
