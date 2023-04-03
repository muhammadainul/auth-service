// USERS schema
module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        enabled: DataTypes.BOOLEAN,
        nip: DataTypes.STRING,
        nama_lengkap: DataTypes.STRING,
        email: DataTypes.STRING,
        telepon: DataTypes.STRING,
        alamat: DataTypes.STRING,
        gambar_id: {
            type: DataTypes.UUID,
			allowNull: true,
			references: {
				model: 'Gambar',
				key: 'id'
			}
        },
        kewenangan_id: DataTypes.INTEGER,
        satker_id: {
            type: DataTypes.UUID,
            references: {
                model: 'Satker',
                key: 'id'
            }
        },
        consumer_id: DataTypes.STRING,
        last_login: DataTypes.DATE
    },
    {}
    );

    return Users;
}