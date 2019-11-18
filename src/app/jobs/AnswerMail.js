import Mail from '../../lib/Mail';

class AnswerMail {
  get key() {
    return 'AnswerMail';
  }

  async handle({ data }) {
    const { student, question, answer } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Answer to your help order',
      template: 'answer',
      context: {
        student: student.name,
        question,
        answer,
      },
    });
  }
}

export default new AnswerMail();
