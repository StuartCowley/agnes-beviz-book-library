module.exports = (connection, DataTypes) => {
    const schema = {
        name: {
            type: DataTypes.STRING,
            allowNull:false,
            validate: { 
                notNull: true,
                notEmpty: true, 
            },
        },
        email: { 
            type: DataTypes.STRING,
            allowNull:false,
            validate: { 
                notNull: true,
                notEmpty: true,
                isEmail: true, 
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull:false,
            validate: { 
                notNull: true,
                notEmpty: true, 
                len: [8,],
            },
        },
    };

    const ReaderModel = connection.define('Reader', schema);
    return ReaderModel;
};