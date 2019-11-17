class AnswerController {
  async index(req, res) {
    return res.json({ index: true });
  }

  async update(req, res) {
    return res.json({ update: true });
  }
}

export default new AnswerController();
