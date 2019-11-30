'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Blogs', [
      {
        author: 'John Doe',
        title: 'John blog title',
        content: 'First blog',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        author: 'Stephane Paulo',
        title: 'Stephane blog title',
        content: 'First blog',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        author: 'Jamse Smith',
        title: 'James blog title',
        content: 'First blog',
        created_at: new Date(),
        updated_at: new Date()
      },
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Blogs', null, {});
  }
};
