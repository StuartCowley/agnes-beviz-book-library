module.exports = (connection, DataTypes) => {
    const schema = {
        title: {
            type: DataTypes.STRING,
            allowNull:false,
            validate: { 
                notNull: true,
                notEmpty: true, 
            },
        },
        ISBN: {
            type: DataTypes.STRING,
        },
    };

    const BookModel = connection.define('Book', schema);
    return BookModel;
};