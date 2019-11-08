module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('enrollments', 'price', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('enrollments', 'price');
  },
};
