// Kewenangan schema
module.exports = (sequelize, DataTypes) => {
    const Kewenangan = sequelize.define('Kewenangan',
        {
            kewenangan: DataTypes.STRING
        },
        { freezeTableName: true }
    );
    return Kewenangan;
};
