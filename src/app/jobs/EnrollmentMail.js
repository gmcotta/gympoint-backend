import { parseISO, format } from 'date-fns';
import Mail from '../../lib/Mail';
import { formatPrice } from '../../util/forrmat';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { student, plan, start_date, end_date, price } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Welcome to Gympoint',
      template: 'welcome',
      context: {
        student: student.name,
        plan: plan.title,
        start_date: format(parseISO(start_date), "MMMM dd', 'yyyy"),
        end_date: format(parseISO(end_date), "MMMM dd', 'yyyy"),
        price: formatPrice(price),
      },
    });
  }
}

export default new EnrollmentMail();
