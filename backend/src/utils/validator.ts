export const isValidUsername = (username: string) => {
    const regex = /^[a-z0-9._]{3,30}$/;
    return regex.test(username);
};