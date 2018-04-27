export class NullCheck {
    public static isDefinedOrNonNull<T>(subject: T| undefined| null): subject is T {
        return subject !== undefined && subject !== null;
    }

    public static isUndefinedOrNull<T>(subject: T | undefined | null): subject is undefined | null {
        return subject === undefined || subject === null;
    }

    public static isUndefinedNullOrEmpty(subject: string | undefined | null): subject is undefined | null {
        return !NullCheck.isDefinedOrNonNull(subject) || subject === '';
    }

    public static isDefinedNonNullAndNotEmpty(subject: string | undefined | null): subject is string {
        return NullCheck.isDefinedOrNonNull(subject) && subject !== '';
    }
}
