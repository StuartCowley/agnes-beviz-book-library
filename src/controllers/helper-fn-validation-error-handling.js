const validationErrorHandling = (err) => {

    let errorMessage;

    switch (err.errors[0].message) {
        // readers
        case 'Validation len on password failed':
            errorMessage = { error: 'Please enter a password longer than 8 characters' };
            break;
        case 'Validation isEmail on email failed':
            errorMessage = { error: 'Please enter a valid email address' };
            break;
        case 'Validation notEmpty on name failed':
            errorMessage = { error: 'Please enter a name' };
            break;
        case 'Validation notEmpty on email failed':
            errorMessage = { error: 'Please enter an email address' };
            break;
        case 'Validation notEmpty on password failed':
            errorMessage = { error: 'Please enter a password' };
            break;

        // books
        case 'Validation notEmpty on title failed':
            errorMessage = { error: 'Please enter a book title' };
            break;
            
        // authors
        case 'Author.author cannot be null':
            errorMessage = { error: 'Please enter the author of the book' };
            break;
        case 'author must be unique':
            errorMessage = { error: 'There is already an entry for this author, please enter a new author or use the existing author entry' };
            break;
        case 'Validation notEmpty on author failed':
            errorMessage = { error: 'Please enter the author of the book' };
            break;

        // genres
        case 'Validation notEmpty on genre failed':
            errorMessage = { error: 'Please enter a genre' };
            break;
        case 'genre must be unique':
            errorMessage = { error: 'There is already an entry for this genre, please enter a new genre or use the existing genre entry' };
            break;
        default:
            errorMessage = { error: 'The request could not be completed' };
    };
    return errorMessage;
}; 

module.exports = validationErrorHandling