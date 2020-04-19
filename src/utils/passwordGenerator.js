function getPassword(size = 8, alphanumeric) {
    const chars = (alphanumeric ? "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789" : "abcdefghijkmnpqrtuvwxyzABCDEFGHIJKLMNPQRTUVWXYZ2346789.@$#");
    let password = "";
    for (var i = 0; i < size; i++){
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    } 
    return password;
}

export default getPassword;