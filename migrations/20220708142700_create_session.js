module.exports = {
    up: async (queryInterface, Sequelize) =>
        await queryInterface.createTable("Session", {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'id'
                }
            },
            client_id: {
                type: Sequelize.STRING,
                allowNull: true
            },
            client_secret: {
                type: Sequelize.STRING,
                allowNull: true
            },
            access_token: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            refresh_token: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            expires: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }),
    down: async (queryInterface /* , Sequelize */) => await queryInterface.dropTable("Session"),
  }