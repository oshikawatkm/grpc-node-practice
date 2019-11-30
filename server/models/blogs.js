'use strict';
module.exports = (sequelize, DataTypes) => {
  const blogs = sequelize.define('blogs', {
    author: DataTypes.STRING,
    title: DataTypes.STRING,
    content: DataTypes.STRING
  }, {
    underscored: true,
  });
  blogs.associate = function(models) {
    // associations can be defined here
  };
  return blogs;
};