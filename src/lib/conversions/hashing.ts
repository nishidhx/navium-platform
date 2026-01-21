import bcrypt from "bcryptjs";

/**
 * @method _createHashStringPLT - hashes the user password to store it into db.
 * @param password - password entered by the user.
 * @param saltRounds - unqiure string added with the hashed.
 */
export const _createHashStringPLT = async (password: string, saltRounds?: number): Promise<string> => {
    const defaultSaltRounds = saltRounds ?? 10;
    const hashed_plt_password = await bcrypt.hash(password, defaultSaltRounds);
    return hashed_plt_password;
}

/**
 * @method _compareHashPLTpass - compare the hashed and entered password if it matched or not.
 * @param passwod 
 * @param hashed_plt_password 
 */
export const _compareHashPLTpass = async (passwod: string, hashed_plt_password: string): Promise<Boolean> => {
    const isMatch = await bcrypt.compare(passwod, hashed_plt_password);
    return isMatch;
}