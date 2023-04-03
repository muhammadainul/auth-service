'use strict'
// Survei schema
module.exports = (sequelize, DataTypes) => {
    const Survei = sequelize.define('Survei', 
        {
            user_id: DataTypes.UUID,
            survei_id: DataTypes.INTEGER,
            jawaban: DataTypes.ARRAY(DataTypes.INTEGER),
            status: DataTypes.BOOLEAN,
            saran: DataTypes.TEXT
        },
        { freezeTableName: true }
    );
    
    Survei.association = function (models) {
        Survei.belongsToMany(models.Users, {
            foreignKey: 'user_id',
            as: 'users'
        });
        models.Users.belongsToMany(Survei, {
            foreignKey: 'user_id',
            as: 'survei'
        });
        
        Survei.belongsTo(models.Master_survei, {
            foreignKey: 'survei_id',
            as: 'master_survei'
        });
    }

    return Survei;
};