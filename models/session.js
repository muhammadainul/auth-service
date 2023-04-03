// Session schema
module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        user_id: DataTypes.UUID,
        client_id: DataTypes.STRING,
        client_secret: DataTypes.STRING,
        access_token: DataTypes.STRING,
        refresh_token: DataTypes.STRING,
        expires: DataTypes.DATE
    },
    { freezeTableName: true }
    );

    Session.accociate = function (models) {
        Session.belongsTo(models.Users, {
            foreignKey: 'user_id',
            as: 'user'
        })
    }
    
    return Session;
}