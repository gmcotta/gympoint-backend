class QuestionController {
  async index(req, res) {
    return res.json({ index: true });
  }

  async store(req, res) {
    return res.json({ store: true });
  }
}

export default new QuestionController();
